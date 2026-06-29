using VibeTest.Server.Data.Queries;
using VibeTest.Server.Models.Entities;

namespace VibeTest.Server.Data.Repositories;

public interface IApplicationRepository
{
    Task AddAsync(TestApplication application, CancellationToken cancellationToken = default);
    Task<TestApplication?> GetByTokenAsync(Guid token, CancellationToken cancellationToken = default);
    Task<TestApplication?> GetByIdForAuthorAsync(int id, int authorId, CancellationToken cancellationToken = default);
    Task<int> CountByAuthorAsync(int authorId, CancellationToken cancellationToken = default);
    Task<List<ApplicationListItemRow>> GetByAuthorPageAsync(
        int authorId,
        int offset,
        int pageSize,
        CancellationToken cancellationToken = default);
    Task UpsertAnswerAsync(ApplicationResult result, CancellationToken cancellationToken = default);
    Task<ApplicationResultSummaryRow?> GetResultSummaryAsync(int applicationId, CancellationToken cancellationToken = default);
    Task<int> GetQuestionCountAsync(int testId, CancellationToken cancellationToken = default);
    Task<int> GetAnswerCountAsync(int applicationId, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
