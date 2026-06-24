using VibeTest.Server.Models.Entities;
using VibeTest.Server.Models.Responses;

namespace VibeTest.Server.Helpers;

public static class TqaGrouper
{
    public static List<QuestionDetailDto> ToDetailQuestions(IEnumerable<TestQuestionAnswer> rows) =>
        Group(rows)
            .Select(q => new QuestionDetailDto
            {
                Order = q.Order,
                Text = q.Text,
                Answers = q.Answers.Select(a => new AnswerDetailDto
                {
                    Order = a.Order,
                    Text = a.Text
                }).ToList()
            })
            .ToList();

    public static List<QuestionFullDto> ToFullQuestions(IEnumerable<TestQuestionAnswer> rows) =>
        Group(rows)
            .Select(q =>
            {
                var correctIndex = q.Answers.FindIndex(a => a.IsCorrect);
                return new QuestionFullDto
                {
                    Order = q.Order,
                    Text = q.Text,
                    Answers = q.Answers.Select(a => a.Text).ToList(),
                    Correct = correctIndex < 0 ? 0 : correctIndex,
                    Explanation = q.Explanation
                };
            })
            .ToList();

    public static int CountQuestions(IEnumerable<TestQuestionAnswer> rows) =>
        rows.Select(r => r.QuestionOrder).Distinct().Count();

    private static IEnumerable<GroupedQuestion> Group(IEnumerable<TestQuestionAnswer> rows) =>
        rows
            .GroupBy(r => r.QuestionOrder)
            .OrderBy(g => g.Key)
            .Select(g => new GroupedQuestion(
                g.Key,
                g.First().Question.Text,
                g.OrderBy(r => r.AnswerOrder).First().Explanation,
                g.OrderBy(r => r.AnswerOrder)
                    .Select(r => new GroupedAnswer(r.AnswerOrder, r.Answer.Text, r.IsCorrect))
                    .ToList()));

    private sealed record GroupedQuestion(int Order, string Text, string? Explanation, List<GroupedAnswer> Answers);

    private sealed record GroupedAnswer(int Order, string Text, bool IsCorrect);
}
