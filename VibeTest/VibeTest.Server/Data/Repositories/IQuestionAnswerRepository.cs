using VibeTest.Server.Models.Entities;

namespace VibeTest.Server.Data.Repositories;

public interface IQuestionAnswerRepository
{
    Task<Question> FindOrCreateQuestionAsync(string text, CancellationToken cancellationToken = default);
    Task<Answer> FindOrCreateAnswerAsync(string text, CancellationToken cancellationToken = default);
}
