using VibeTest.Server.Data.Queries;
using VibeTest.Server.Models.Entities;

namespace VibeTest.Server.Data.Repositories;

public interface IResultRepository
{
    Task<List<Result>> GetByUserAndTestAsync(int userId, int testId, CancellationToken cancellationToken = default);
    Task<TestQuestionAnswer?> GetTqaByOrdersAsync(int testId, int questionOrder, int answerOrder, CancellationToken cancellationToken = default);
    Task<int?> GetCorrectAnswerOrderAsync(int testId, int questionOrder, CancellationToken cancellationToken = default);
    Task<TestResultSummaryRow?> GetTestResultSummaryAsync(int userId, int testId, CancellationToken cancellationToken = default);
    Task UpsertAsync(Result result, CancellationToken cancellationToken = default);
    Task DeleteByUserAndTestAsync(int userId, int testId, CancellationToken cancellationToken = default);
    Task<int> CountUserHistoryAsync(int userId, CancellationToken cancellationToken = default);
    Task<List<TestHistoryRow>> GetUserHistoryPageAsync(int userId, string sortBy, string order, int offset, int pageSize, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
