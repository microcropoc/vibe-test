using VibeTest.Server.Models.Requests;
using VibeTest.Server.Models.Responses;

namespace VibeTest.Server.Services;

public interface IResultService
{
    Task<SubmitResponse> SubmitAnswer(int userId, int testId, SubmitAnswerRequest request);
    Task<TestResultResponse> GetResult(int userId, int testId);
    Task<AnsweredQuestionsResponse> GetAnsweredQuestions(int userId, int testId);
    Task DeleteResult(int userId, int testId);
    Task<PagedResponse<TestHistoryItem>> GetUserResults(int userId, int page, int pageSize, string sortBy, string order);
}
