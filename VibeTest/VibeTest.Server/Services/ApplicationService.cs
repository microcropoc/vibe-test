using VibeTest.Server.Data.Repositories;
using VibeTest.Server.Exceptions;
using VibeTest.Server.Helpers;
using VibeTest.Server.Models.Entities;
using VibeTest.Server.Models.Requests;
using VibeTest.Server.Models.Responses;

namespace VibeTest.Server.Services;

public class ApplicationService(
    IApplicationRepository applications,
    ITestRepository tests,
    IResultRepository results,
    ILogger<ApplicationService> logger) : IApplicationService
{
    public async Task<ApplicationResponse> CreateApplication(int authorId, CreateApplicationRequest request)
    {
        logger.LogDebug(
            "CreateApplication author={AuthorId} test={TestId} participant={ParticipantName}",
            authorId,
            request.TestId,
            request.ParticipantName);

        var name = request.ParticipantName.Trim();
        if (string.IsNullOrWhiteSpace(name))
            throw new ValidationException("Укажите имя участника");

        var test = await tests.GetByIdAsync(request.TestId)
            ?? throw new NotFoundException("Тест не найден");

        if (test.AuthorId != authorId)
            throw new ForbiddenException("Доступ запрещён");

        if (test.IsPublic)
            throw new ValidationException("Заявки можно создавать только для непубличных тестов");

        var token = Guid.NewGuid();
        var application = new TestApplication
        {
            Token = token,
            AuthorId = authorId,
            TestId = test.Id,
            ParticipantName = name,
            HideResultsFromParticipant = request.HideResultsFromParticipant,
            CreatedAt = DateTime.UtcNow
        };

        await applications.AddAsync(application);
        await applications.SaveChangesAsync();

        logger.LogInformation(
            "Application created: {ApplicationId} token={Token} for test {TestId}",
            application.Id,
            token,
            test.Id);

        return MapResponse(application, test.Name);
    }

    public async Task<PagedResponse<ApplicationListItem>> GetMyApplications(int authorId, int page, int pageSize)
    {
        logger.LogDebug(
            "GetMyApplications author={AuthorId} page={Page} pageSize={PageSize}",
            authorId,
            page,
            pageSize);

        var normalizedPage = Math.Max(1, page);
        var normalizedSize = Math.Clamp(pageSize, 1, 100);
        var offset = (normalizedPage - 1) * normalizedSize;

        var totalCount = await applications.CountByAuthorAsync(authorId);
        var rows = await applications.GetByAuthorPageAsync(authorId, offset, normalizedSize);

        var items = rows.Select(row => new ApplicationListItem
        {
            Id = row.Id,
            Token = row.Token,
            ParticipantName = row.ParticipantName,
            TestId = row.TestId,
            TestName = row.TestName,
            CreatedAt = row.CreatedAt,
            IsCompleted = row.CompletedAt.HasValue,
            CorrectAnswers = row.CorrectAnswers,
            TotalQuestions = row.TotalQuestions,
            ScorePercent = row.ScorePercent,
            CompletedAt = row.CompletedAt,
            HideResultsFromParticipant = row.HideResultsFromParticipant,
            PlayUrl = BuildPlayUrl(row.Token)
        }).ToList();

        return PaginationHelper.Create(items, normalizedPage, normalizedSize, totalCount);
    }

    public async Task<ApplicationPlayResponse> GetApplicationPlayDetail(Guid token)
    {
        logger.LogDebug("GetApplicationPlayDetail token={Token}", token);

        var application = await applications.GetByTokenAsync(token)
            ?? throw new NotFoundException("Заявка не найдена");

        var testDetail = MapTestDetail(application.Test);

        return new ApplicationPlayResponse
        {
            ParticipantName = application.ParticipantName,
            HideResultsFromParticipant = application.HideResultsFromParticipant,
            IsCompleted = application.CompletedAt.HasValue,
            Id = testDetail.Id,
            Name = testDetail.Name,
            Description = testDetail.Description,
            AuthorName = testDetail.AuthorName,
            Questions = testDetail.Questions
        };
    }

    public async Task<SubmitResponse> SubmitAnswer(Guid token, SubmitAnswerRequest request)
    {
        logger.LogDebug(
            "SubmitAnswer application token={Token} question={QuestionOrder} answer={AnswerOrder}",
            token,
            request.QuestionOrder,
            request.SelectedAnswerOrder);

        var application = await applications.GetByTokenAsync(token)
            ?? throw new NotFoundException("Заявка не найдена");

        if (application.CompletedAt.HasValue)
            throw new ValidationException("Тест по этой заявке уже пройден");

        var testId = application.TestId;

        var selected = await results.GetTqaByOrdersAsync(testId, request.QuestionOrder, request.SelectedAnswerOrder)
            ?? throw new ValidationException("Неверный вопрос или ответ");

        var correctOrder = await results.GetCorrectAnswerOrderAsync(testId, request.QuestionOrder)
            ?? throw new ValidationException("Для вопроса не задан правильный ответ");

        var now = DateTime.UtcNow;
        await applications.UpsertAnswerAsync(new ApplicationResult
        {
            ApplicationId = application.Id,
            QuestionId = selected.QuestionId,
            AnswerId = selected.AnswerId,
            AnsweredAt = now
        });

        await applications.SaveChangesAsync();

        var totalQuestions = await applications.GetQuestionCountAsync(testId);
        var answerCount = await applications.GetAnswerCountAsync(application.Id);
        if (answerCount >= totalQuestions && totalQuestions > 0 && !application.CompletedAt.HasValue)
        {
            application.CompletedAt = now;
            await applications.SaveChangesAsync();
        }

        if (application.HideResultsFromParticipant)
            return new SubmitResponse { CorrectAnswerOrder = -1, Explanation = null };

        var explanation = await results.GetQuestionExplanationAsync(testId, request.QuestionOrder);

        return new SubmitResponse { CorrectAnswerOrder = correctOrder, Explanation = explanation };
    }

    public async Task<TestResultResponse> GetApplicationResult(Guid token)
    {
        logger.LogDebug("GetApplicationResult token={Token}", token);

        var application = await applications.GetByTokenAsync(token)
            ?? throw new NotFoundException("Заявка не найдена");

        if (application.HideResultsFromParticipant)
            throw new ForbiddenException("Результат недоступен");

        return await BuildResultResponse(application.Id);
    }

    public async Task<TestResultResponse> GetApplicationResultById(int applicationId, int authorId)
    {
        logger.LogDebug("GetApplicationResultById id={ApplicationId} author={AuthorId}", applicationId, authorId);

        _ = await applications.GetByIdForAuthorAsync(applicationId, authorId)
            ?? throw new NotFoundException("Заявка не найдена");

        return await BuildResultResponse(applicationId);
    }

    private async Task<TestResultResponse> BuildResultResponse(int applicationId)
    {
        var summary = await applications.GetResultSummaryAsync(applicationId)
            ?? throw new NotFoundException("Заявка не найдена");

        return new TestResultResponse
        {
            TestId = summary.TestId,
            TestName = summary.TestName,
            TotalQuestions = summary.TotalQuestions,
            CorrectAnswers = summary.CorrectAnswers,
            IncorrectAnswers = summary.IncorrectAnswers,
            StartedAt = summary.StartedAt,
            CompletedAt = summary.CompletedAt
        };
    }

    private static ApplicationResponse MapResponse(TestApplication application, string testName) => new()
    {
        Id = application.Id,
        Token = application.Token,
        ParticipantName = application.ParticipantName,
        TestId = application.TestId,
        TestName = testName,
        CreatedAt = application.CreatedAt,
        HideResultsFromParticipant = application.HideResultsFromParticipant,
        PlayUrl = BuildPlayUrl(application.Token)
    };

    private static TestDetailResponse MapTestDetail(Test test) => new()
    {
        Id = test.Id,
        Name = test.Name,
        Description = test.Description,
        AuthorName = test.Author.DisplayName,
        Questions = TqaGrouper.ToDetailQuestions(test.QuestionAnswers)
    };

    private static string BuildPlayUrl(Guid token) => $"/application/{token}";
}
