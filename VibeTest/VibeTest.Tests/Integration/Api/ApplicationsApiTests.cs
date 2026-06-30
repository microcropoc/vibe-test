using System.Net;
using System.Net.Http.Json;
using VibeTest.Server.Models.Entities;
using VibeTest.Server.Models.Requests;
using VibeTest.Server.Models.Responses;
using VibeTest.Tests.Integration;

namespace VibeTest.Tests.Integration.Api;

public class ApplicationsApiTests : IClassFixture<ApiFixture>
{
    private readonly ApiWebApplicationFactory _factory;

    public ApplicationsApiTests(ApiFixture fixture) => _factory = fixture.Factory;

    [Fact]
    public async Task Create_list_and_anonymous_play_flow()
    {
        var client = _factory.CreateClient();
        var token = await _factory.RegisterAndGetTokenAsync(client);
        _factory.Authorize(client, token);

        var test = await client.PostAsJsonAsync("/api/tests", ServiceFixture.SampleTestRequest());
        Assert.Equal(HttpStatusCode.OK, test.StatusCode);
        var createdTest = await test.Content.ReadFromJsonAsync<TestResponse>(_factory.JsonOptions);

        var createApp = await client.PostAsJsonAsync("/api/applications", new CreateApplicationRequest
        {
            Title = "Eve",
            TestId = createdTest!.Id
        });
        Assert.Equal(HttpStatusCode.OK, createApp.StatusCode);
        var application = await createApp.Content.ReadFromJsonAsync<ApplicationResponse>(_factory.JsonOptions);
        Assert.NotNull(application);
        Assert.Equal("Eve", application.Title);
        Assert.Equal(ApplicationType.Link, application.Type);

        var list = await client.GetAsync("/api/applications?page=1&pageSize=10");
        Assert.Equal(HttpStatusCode.OK, list.StatusCode);
        var page = await list.Content.ReadFromJsonAsync<PagedResponse<ApplicationListItem>>(_factory.JsonOptions);
        Assert.Contains(page!.Items, a => a.Id == application.Id);

        client.DefaultRequestHeaders.Authorization = null;

        var detail = await client.GetAsync($"/api/applications/{application.Token}");
        Assert.Equal(HttpStatusCode.OK, detail.StatusCode);
        var detailBody = await detail.Content.ReadFromJsonAsync<ApplicationPlayResponse>(_factory.JsonOptions);
        Assert.Equal(2, detailBody!.Questions.Count);
        Assert.False(detailBody.HideResultsFromParticipant);
        Assert.False(detailBody.IsCompleted);

        var submit = await client.PostAsJsonAsync(
            $"/api/applications/{application.Token}/submit",
            new SubmitAnswerRequest { QuestionOrder = 0, SelectedAnswerOrder = 0 });
        Assert.Equal(HttpStatusCode.OK, submit.StatusCode);

        var result = await client.GetAsync($"/api/applications/{application.Token}/result");
        Assert.Equal(HttpStatusCode.OK, result.StatusCode);
        var resultBody = await result.Content.ReadFromJsonAsync<TestResultResponse>(_factory.JsonOptions);
        Assert.Equal(1, resultBody!.CorrectAnswers);
    }

    [Fact]
    public async Task Create_with_hideResults_returns_flag_in_play_response()
    {
        var client = _factory.CreateClient();
        var token = await _factory.RegisterAndGetTokenAsync(client);
        _factory.Authorize(client, token);

        var test = await client.PostAsJsonAsync("/api/tests", ServiceFixture.SampleTestRequest());
        var createdTest = await test.Content.ReadFromJsonAsync<TestResponse>(_factory.JsonOptions);

        var createApp = await client.PostAsJsonAsync("/api/applications", new CreateApplicationRequest
        {
            Title = "Hidden",
            TestId = createdTest!.Id,
            HideResultsFromParticipant = true
        });
        Assert.Equal(HttpStatusCode.OK, createApp.StatusCode);
        var application = await createApp.Content.ReadFromJsonAsync<ApplicationResponse>(_factory.JsonOptions);
        Assert.True(application!.HideResultsFromParticipant);

        client.DefaultRequestHeaders.Authorization = null;

        var detail = await client.GetAsync($"/api/applications/{application.Token}");
        var detailBody = await detail.Content.ReadFromJsonAsync<ApplicationPlayResponse>(_factory.JsonOptions);
        Assert.True(detailBody!.HideResultsFromParticipant);
        Assert.False(detailBody.IsCompleted);
    }

    [Fact]
    public async Task Create_application_requires_auth()
    {
        var client = _factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/applications", new CreateApplicationRequest
        {
            Title = "No Auth",
            TestId = 1
        });
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Search_create_internal_and_get_incoming()
    {
        var authorClient = _factory.CreateClient();
        var authorToken = await RegisterUserAsync(authorClient, "author@test.com", "Author");
        _factory.Authorize(authorClient, authorToken);

        var recipientClient = _factory.CreateClient();
        var recipientToken = await RegisterUserAsync(recipientClient, "recipient@test.com", "Recipient");

        var search = await authorClient.GetAsync("/api/users/search?q=reci");
        Assert.Equal(HttpStatusCode.OK, search.StatusCode);
        var users = await search.Content.ReadFromJsonAsync<List<UserSearchResult>>(_factory.JsonOptions);
        Assert.Contains(users!, u => u.DisplayName == "Recipient");

        var test = await authorClient.PostAsJsonAsync("/api/tests", ServiceFixture.SampleTestRequest());
        var createdTest = await test.Content.ReadFromJsonAsync<TestResponse>(_factory.JsonOptions);

        var recipientId = users!.First(u => u.DisplayName == "Recipient").Id;
        var createApp = await authorClient.PostAsJsonAsync("/api/applications", new CreateApplicationRequest
        {
            Title = "Quarterly review",
            Type = ApplicationType.InternalUser,
            TestId = createdTest!.Id,
            RecipientUserId = recipientId
        });
        Assert.Equal(HttpStatusCode.OK, createApp.StatusCode);
        var application = await createApp.Content.ReadFromJsonAsync<ApplicationResponse>(_factory.JsonOptions);
        Assert.Equal("Quarterly review", application!.Title);
        Assert.Equal(ApplicationType.InternalUser, application.Type);
        Assert.Equal(string.Empty, application.PlayUrl);

        _factory.Authorize(recipientClient, recipientToken);
        var incoming = await recipientClient.GetAsync("/api/applications/incoming?page=1&pageSize=10");
        Assert.Equal(HttpStatusCode.OK, incoming.StatusCode);
        var page = await incoming.Content.ReadFromJsonAsync<PagedResponse<IncomingApplicationListItem>>(
            _factory.JsonOptions);
        Assert.Contains(page!.Items, a => a.Id == application.Id);
        Assert.Equal("Quarterly review", page.Items.First(a => a.Id == application.Id).Title);
        Assert.Equal("Author", page.Items.First(a => a.Id == application.Id).AuthorName);
    }

    [Fact]
    public async Task Internal_play_forbidden_without_jwt()
    {
        var authorClient = _factory.CreateClient();
        var authorToken = await RegisterUserAsync(authorClient, "author2@test.com", "Author2");
        _factory.Authorize(authorClient, authorToken);

        await RegisterUserAsync(_factory.CreateClient(), "recipient2@test.com", "Recipient2");

        var search = await authorClient.GetAsync("/api/users/search?q=reci");
        var users = await search.Content.ReadFromJsonAsync<List<UserSearchResult>>(_factory.JsonOptions);
        var recipientId = users!.First(u => u.DisplayName == "Recipient2").Id;

        var test = await authorClient.PostAsJsonAsync("/api/tests", ServiceFixture.SampleTestRequest());
        var createdTest = await test.Content.ReadFromJsonAsync<TestResponse>(_factory.JsonOptions);

        var createApp = await authorClient.PostAsJsonAsync("/api/applications", new CreateApplicationRequest
        {
            Title = "Internal only",
            Type = ApplicationType.InternalUser,
            TestId = createdTest!.Id,
            RecipientUserId = recipientId
        });
        var application = await createApp.Content.ReadFromJsonAsync<ApplicationResponse>(_factory.JsonOptions);

        var anonClient = _factory.CreateClient();
        var detail = await anonClient.GetAsync($"/api/applications/{application!.Token}");
        Assert.Equal(HttpStatusCode.Forbidden, detail.StatusCode);
    }

    private async Task<string> RegisterUserAsync(HttpClient client, string email, string displayName)
    {
        var response = await client.PostAsJsonAsync("/api/auth/register", new RegisterRequest
        {
            Email = email,
            Password = "password123",
            DisplayName = displayName
        });
        response.EnsureSuccessStatusCode();
        var auth = await response.Content.ReadFromJsonAsync<AuthResponse>(_factory.JsonOptions);
        return auth!.AccessToken;
    }
}
