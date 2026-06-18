using VibeTest.Server.Data.Queries;
using VibeTest.Server.Models.Entities;

namespace VibeTest.Server.Data.Repositories;

public interface ITestRepository
{
    Task<Test?> GetByIdAsync(int testId, CancellationToken cancellationToken = default);
    Task<Test?> GetByIdWithStructureAsync(int testId, CancellationToken cancellationToken = default);
    Task AddAsync(Test test, CancellationToken cancellationToken = default);
    Task DeleteAsync(Test test, CancellationToken cancellationToken = default);
    Task<int> GetMaxQuestionOrderAsync(int testId, CancellationToken cancellationToken = default);
    Task<int> CountPublicTestsAsync(CancellationToken cancellationToken = default);
    Task<List<TestListItemRow>> GetPublicTestsPageAsync(int offset, int pageSize, CancellationToken cancellationToken = default);
    Task<int> CountMyTestsAsync(int authorId, string filter, CancellationToken cancellationToken = default);
    Task<List<TestListItemRow>> GetMyTestsPageAsync(int authorId, string filter, int offset, int pageSize, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
