using VibeTest.Server.Exceptions;
using VibeTest.Server.Models.Requests;

namespace VibeTest.Tests.Integration;

public class ApplicationServiceTests
{
    [Fact]
    public async Task CreateApplication_succeeds_for_private_own_test()
    {
        using var fx = new ServiceFixture();
        var author = await fx.SeedUserAsync();
        var test = await fx.TestService.CreateTest(author.Id, ServiceFixture.SampleTestRequest());

        var app = await fx.ApplicationService.CreateApplication(author.Id, new CreateApplicationRequest
        {
            ParticipantName = "Bob",
            TestId = test.Id
        });

        Assert.NotEqual(Guid.Empty, app.Token);
        Assert.Equal("Bob", app.ParticipantName);
        Assert.Equal(test.Id, app.TestId);
        Assert.Equal("SQL Basics", app.TestName);
        Assert.Contains(app.Token.ToString(), app.PlayUrl);
    }

    [Fact]
    public async Task CreateApplication_rejects_public_test()
    {
        using var fx = new ServiceFixture();
        var author = await fx.SeedUserAsync();
        var test = await fx.TestService.CreateTest(author.Id, ServiceFixture.SampleTestRequest());
        await fx.TestService.PublishTest(test.Id, author.Id);

        await Assert.ThrowsAsync<ValidationException>(() =>
            fx.ApplicationService.CreateApplication(author.Id, new CreateApplicationRequest
            {
                ParticipantName = "Bob",
                TestId = test.Id
            }));
    }

    [Fact]
    public async Task CreateApplication_rejects_foreign_test()
    {
        using var fx = new ServiceFixture();
        var author = await fx.SeedUserAsync();
        var other = await fx.SeedUserAsync("other@test.com", "Other");
        var test = await fx.TestService.CreateTest(other.Id, ServiceFixture.SampleTestRequest());

        await Assert.ThrowsAsync<ForbiddenException>(() =>
            fx.ApplicationService.CreateApplication(author.Id, new CreateApplicationRequest
            {
                ParticipantName = "Bob",
                TestId = test.Id
            }));
    }

    [Fact]
    public async Task SubmitAnswer_and_result_work_via_token()
    {
        using var fx = new ServiceFixture();
        var author = await fx.SeedUserAsync();
        var test = await fx.TestService.CreateTest(author.Id, ServiceFixture.SampleTestRequest());
        var app = await fx.ApplicationService.CreateApplication(author.Id, new CreateApplicationRequest
        {
            ParticipantName = "Carol",
            TestId = test.Id
        });

        var wrong = await fx.ApplicationService.SubmitAnswer(app.Token, new SubmitAnswerRequest
        {
            QuestionOrder = 0,
            SelectedAnswerOrder = 1
        });
        Assert.Equal(0, wrong.CorrectAnswerOrder);

        await fx.ApplicationService.SubmitAnswer(app.Token, new SubmitAnswerRequest
        {
            QuestionOrder = 0,
            SelectedAnswerOrder = 0
        });
        await fx.ApplicationService.SubmitAnswer(app.Token, new SubmitAnswerRequest
        {
            QuestionOrder = 1,
            SelectedAnswerOrder = 0
        });

        var result = await fx.ApplicationService.GetApplicationResult(app.Token);
        Assert.Equal(2, result.CorrectAnswers);
        Assert.Equal(2, result.TotalQuestions);
        Assert.NotNull(result.CompletedAt);

        var list = await fx.ApplicationService.GetMyApplications(author.Id, 1, 10);
        Assert.Single(list.Items);
        Assert.True(list.Items[0].IsCompleted);
        Assert.Equal(100, list.Items[0].ScorePercent);
    }

    [Fact]
    public async Task GetApplicationPlayDetail_returns_test_for_anonymous_token()
    {
        using var fx = new ServiceFixture();
        var author = await fx.SeedUserAsync();
        var test = await fx.TestService.CreateTest(author.Id, ServiceFixture.SampleTestRequest());
        var app = await fx.ApplicationService.CreateApplication(author.Id, new CreateApplicationRequest
        {
            ParticipantName = "Dave",
            TestId = test.Id
        });

        var detail = await fx.ApplicationService.GetApplicationPlayDetail(app.Token);
        Assert.Equal(test.Id, detail.Id);
        Assert.Equal(2, detail.Questions.Count);
        Assert.Equal("Dave", detail.ParticipantName);
        Assert.False(detail.HideResultsFromParticipant);
        Assert.False(detail.IsCompleted);
    }

    [Fact]
    public async Task CreateApplication_with_hideResults_flag()
    {
        using var fx = new ServiceFixture();
        var author = await fx.SeedUserAsync();
        var test = await fx.TestService.CreateTest(author.Id, ServiceFixture.SampleTestRequest());

        var app = await fx.ApplicationService.CreateApplication(author.Id, new CreateApplicationRequest
        {
            ParticipantName = "Frank",
            TestId = test.Id,
            HideResultsFromParticipant = true
        });

        Assert.True(app.HideResultsFromParticipant);

        var list = await fx.ApplicationService.GetMyApplications(author.Id, 1, 10);
        Assert.True(list.Items[0].HideResultsFromParticipant);
    }

    [Fact]
    public async Task SubmitAnswer_after_completed_throws()
    {
        using var fx = new ServiceFixture();
        var author = await fx.SeedUserAsync();
        var test = await fx.TestService.CreateTest(author.Id, ServiceFixture.SampleTestRequest());
        var app = await fx.ApplicationService.CreateApplication(author.Id, new CreateApplicationRequest
        {
            ParticipantName = "Grace",
            TestId = test.Id
        });

        await fx.ApplicationService.SubmitAnswer(app.Token, new SubmitAnswerRequest
        {
            QuestionOrder = 0,
            SelectedAnswerOrder = 0
        });
        await fx.ApplicationService.SubmitAnswer(app.Token, new SubmitAnswerRequest
        {
            QuestionOrder = 1,
            SelectedAnswerOrder = 0
        });

        await Assert.ThrowsAsync<ValidationException>(() =>
            fx.ApplicationService.SubmitAnswer(app.Token, new SubmitAnswerRequest
            {
                QuestionOrder = 0,
                SelectedAnswerOrder = 0
            }));
    }

    [Fact]
    public async Task SubmitAnswer_hideResults_omits_feedback()
    {
        using var fx = new ServiceFixture();
        var author = await fx.SeedUserAsync();
        var test = await fx.TestService.CreateTest(author.Id, ServiceFixture.SampleTestRequest());
        var app = await fx.ApplicationService.CreateApplication(author.Id, new CreateApplicationRequest
        {
            ParticipantName = "Helen",
            TestId = test.Id,
            HideResultsFromParticipant = true
        });

        var response = await fx.ApplicationService.SubmitAnswer(app.Token, new SubmitAnswerRequest
        {
            QuestionOrder = 0,
            SelectedAnswerOrder = 0
        });

        Assert.Equal(-1, response.CorrectAnswerOrder);
        Assert.Null(response.Explanation);
    }

    [Fact]
    public async Task GetApplicationResult_hideResults_forbidden()
    {
        using var fx = new ServiceFixture();
        var author = await fx.SeedUserAsync();
        var test = await fx.TestService.CreateTest(author.Id, ServiceFixture.SampleTestRequest());
        var app = await fx.ApplicationService.CreateApplication(author.Id, new CreateApplicationRequest
        {
            ParticipantName = "Ivan",
            TestId = test.Id,
            HideResultsFromParticipant = true
        });

        await fx.ApplicationService.SubmitAnswer(app.Token, new SubmitAnswerRequest
        {
            QuestionOrder = 0,
            SelectedAnswerOrder = 0
        });

        await Assert.ThrowsAsync<ForbiddenException>(() =>
            fx.ApplicationService.GetApplicationResult(app.Token));
    }
}
