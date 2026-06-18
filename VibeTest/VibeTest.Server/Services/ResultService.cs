using VibeTest.Server.Models.Requests;
using VibeTest.Server.Models.Responses;

namespace VibeTest.Server.Services;

public class ResultService : IResultService
{
    public Task<SubmitResponse> SubmitAnswer(int userId, int testId, SubmitAnswerRequest request) =>
        throw new NotImplementedException();

    public Task<TestResultResponse> GetResult(int userId, int testId) =>
        throw new NotImplementedException();

    public Task DeleteResult(int userId, int testId) =>
        throw new NotImplementedException();

    public Task<PagedResponse<TestHistoryItem>> GetUserResults(int userId, int page, int pageSize, string sortBy, string order) =>
        throw new NotImplementedException();
}
