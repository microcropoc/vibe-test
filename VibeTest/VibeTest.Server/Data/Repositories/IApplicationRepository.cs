using VibeTest.Server.Data.Queries;
using VibeTest.Server.Models.Entities;

namespace VibeTest.Server.Data.Repositories;

public interface IApplicationRepository
{
    Task AddAsync(TestApplication application, CancellationToken cancellationToken = default);
    Task<TestApplication?> GetPlayDetailByTokenAsync(Guid token, CancellationToken cancellationToken = default);
    Task<TestApplication?> GetByTokenForAccessAsync(Guid token, CancellationToken cancellationToken = default);
    Task<TestApplication?> GetByIdForAuthorAsync(int id, int authorId, CancellationToken cancellationToken = default);
    Task<int> CountByAuthorAsync(int authorId, CancellationToken cancellationToken = default);
    Task<List<ApplicationListItemRow>> GetByAuthorPageAsync(
        int authorId,
        int offset,
        int pageSize,
        CancellationToken cancellationToken = default);
    Task<int> CountIncomingAsync(int recipientUserId, CancellationToken cancellationToken = default);
    Task<List<IncomingApplicationListItemRow>> GetIncomingPageAsync(
        int recipientUserId,
        int offset,
        int pageSize,
        CancellationToken cancellationToken = default);
    Task<ApplicationSubmitStatus> SubmitAnswerAsync(
        int applicationId,
        int testId,
        int questionId,
        int answerId,
        DateTime answeredAt,
        CancellationToken cancellationToken = default);
    Task<List<AnsweredQuestionRow>> GetAnsweredQuestionsAsync(int applicationId, CancellationToken cancellationToken = default);
    Task<ApplicationResultSummaryRow?> GetResultSummaryAsync(int applicationId, CancellationToken cancellationToken = default);
    Task SaveChangesAsync(CancellationToken cancellationToken = default);
}
