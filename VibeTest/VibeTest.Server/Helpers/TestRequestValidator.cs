using VibeTest.Server.Exceptions;
using VibeTest.Server.Models.Requests;

namespace VibeTest.Server.Helpers;

public static class TestRequestValidator
{
    public static void ValidateCreateTest(CreateTestRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            throw new ValidationException("Название теста обязательно");

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

            var correctCount = question.Answers.Count(a => a.IsCorrect);
            if (correctCount != 1)
                throw new ValidationException($"Вопрос {i + 1}: ровно один правильный ответ");

            for (var j = 0; j < question.Answers.Count; j++)
            {
                if (string.IsNullOrWhiteSpace(question.Answers[j].Text))
                    throw new ValidationException($"Вопрос {i + 1}, ответ {j + 1}: текст обязателен");
            }
        }
    }

    public static void ValidateUpdateInfo(UpdateTestInfoRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            throw new ValidationException("Название теста обязательно");
    }
}
