using System.Net;
using System.Net.Http.Json;
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
            ParticipantName = "Eve",
            TestId = createdTest!.Id
        });
        Assert.Equal(HttpStatusCode.OK, createApp.StatusCode);
        var application = await createApp.Content.ReadFromJsonAsync<ApplicationResponse>(_factory.JsonOptions);
        Assert.NotNull(application);
        Assert.Equal("Eve", application.ParticipantName);

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
            ParticipantName = "Hidden",
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
            ParticipantName = "No Auth",
            TestId = 1
        });
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
