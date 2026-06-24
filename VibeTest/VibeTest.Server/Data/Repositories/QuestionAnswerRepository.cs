using Microsoft.EntityFrameworkCore;
using VibeTest.Server.Models.Entities;

namespace VibeTest.Server.Data.Repositories;

public class QuestionAnswerRepository(AppDbContext db) : IQuestionAnswerRepository
{
    public async Task<Question> FindOrCreateQuestionAsync(string text, CancellationToken cancellationToken = default)
    {
        var existing = await db.Questions.FirstOrDefaultAsync(q => q.Text == text, cancellationToken);
        if (existing is not null)
            return existing;

        var local = db.Questions.Local.FirstOrDefault(q => q.Text == text);
        if (local is not null)
            return local;

        var question = new Question { Text = text };
        db.Questions.Add(question);
        return question;
    }

    public async Task<Answer> FindOrCreateAnswerAsync(string text, CancellationToken cancellationToken = default)
    {
        var existing = await db.Answers.FirstOrDefaultAsync(a => a.Text == text, cancellationToken);
        if (existing is not null)
            return existing;

        var local = db.Answers.Local.FirstOrDefault(a => a.Text == text);
        if (local is not null)
            return local;

        var answer = new Answer { Text = text };
        db.Answers.Add(answer);
        return answer;
    }
}
