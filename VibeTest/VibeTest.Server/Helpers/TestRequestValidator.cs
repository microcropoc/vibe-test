using VibeTest.Server.Exceptions;
using VibeTest.Server.Models.Entities;
using VibeTest.Server.Models.Requests;

namespace VibeTest.Server.Helpers;

public static class TestRequestValidator
{
    public static void ValidateCreateTest(CreateTestRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            throw new ValidationException("Название теста обязательно");

        ValidateDifficulty(request.Difficulty);
        ValidateQuestions(request.Questions);
    }

    public static void ValidateQuestions(IReadOnlyList<QuestionInput> questions)
    {
        if (questions.Count == 0)
            throw new ValidationException("Нужен минимум один вопрос");

        for (var i = 0; i < questions.Count; i++)
        {
            var question = questions[i];
            if (string.IsNullOrWhiteSpace(question.Text))
                throw new ValidationException($"Вопрос {i + 1}: текст обязателен");

            if (question.Answers.Count < 2)
                throw new ValidationException($"Вопрос {i + 1}: минимум 2 ответа");

            if (question.Correct < 0 || question.Correct >= question.Answers.Count)
                throw new ValidationException($"Вопрос {i + 1}: неверный индекс correct");

            for (var j = 0; j < question.Answers.Count; j++)
            {
                if (string.IsNullOrWhiteSpace(question.Answers[j]))
                    throw new ValidationException($"Вопрос {i + 1}, ответ {j + 1}: текст обязателен");
            }
        }
    }

    public static void ValidateUpdateInfo(UpdateTestInfoRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            throw new ValidationException("Название теста обязательно");

        ValidateDifficulty(request.Difficulty);
    }

    private static void ValidateDifficulty(TestDifficulty? difficulty)
    {
        if (difficulty is null)
            return;

        if (!Enum.IsDefined(difficulty.Value))
            throw new ValidationException("Неверная сложность теста");
    }
}
