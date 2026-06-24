using VibeTest.Server.Data.Repositories;
using VibeTest.Server.Exceptions;
using VibeTest.Server.Models.Entities;
using VibeTest.Server.Models.Requests;
using VibeTest.Server.Models.Responses;

namespace VibeTest.Server.Services;

public class ResultService(
    ITestRepository tests,
    IResultRepository results,
    IUserRepository users) : IResultService
{
    public async Task<SubmitResponse> SubmitAnswer(int userId, int testId, SubmitAnswerRequest request)
    {
        if (!await users.ExistsAsync(userId))
            throw new NotFoundException("Пользователь не найден");

        var test = await tests.GetByIdAsync(testId)
            ?? throw new NotFoundException("Тест не найден");

        var selected = await results.GetTqaByOrdersAsync(testId, request.QuestionOrder, request.SelectedAnswerOrder)
            ?? throw new ValidationException("Неверный вопрос или ответ");

        var correctOrder = await results.GetCorrectAnswerOrderAsync(testId, request.QuestionOrder)
            ?? throw new ValidationException("Для вопроса не задан правильный ответ");

        await results.UpsertAsync(new Result
        {
            UserId = userId,
            TestId = testId,
            QuestionId = selected.QuestionId,
            AnswerId = selected.AnswerId,
            AnsweredAt = DateTime.UtcNow
        });
        await results.SaveChangesAsync();

        var explanation = await results.GetQuestionExplanationAsync(testId, request.QuestionOrder);

        return new SubmitResponse { CorrectAnswerOrder = correctOrder, Explanation = explanation };
    }

    public async Task<TestResultResponse> GetResult(int userId, int testId)
    {
        var summary = await results.GetTestResultSummaryAsync(userId, testId)
            ?? throw new NotFoundException("Тест не найден");

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

    public async Task DeleteResult(int userId, int testId)
    {
        _ = await tests.GetByIdAsync(testId)
            ?? throw new NotFoundException("Тест не найден");

        await results.DeleteByUserAndTestAsync(userId, testId);
        await results.SaveChangesAsync();
    }

    public async Task<PagedResponse<TestHistoryItem>> GetUserResults(
        int userId,
        int page,
        int pageSize,
        string sortBy,
        string order)
    {
        var normalizedPage = Math.Max(1, page);
        var normalizedSize = Math.Clamp(pageSize, 1, 100);
        var offset = (normalizedPage - 1) * normalizedSize;
        var normalizedSort = sortBy == "score" ? "score" : "date";
        var normalizedOrder = order == "asc" ? "asc" : "desc";

        var totalCount = await results.CountUserHistoryAsync(userId);
        var rows = await results.GetUserHistoryPageAsync(userId, normalizedSort, normalizedOrder, offset, normalizedSize);

        var items = rows.Select(row => new TestHistoryItem
        {
            TestId = row.TestId,
            TestName = row.TestName,
            TotalQuestions = row.TotalQuestions,
            CorrectAnswers = row.CorrectAnswers,
            ScorePercent = row.ScorePercent,
            CompletedAt = row.CompletedAt
        }).ToList();

        return Helpers.PaginationHelper.Create(items, normalizedPage, normalizedSize, totalCount);
    }
}
