using VibeTest.Server.Data.Repositories;
using VibeTest.Server.Exceptions;
using VibeTest.Server.Helpers;
using VibeTest.Server.Models.Entities;
using VibeTest.Server.Models.Requests;
using VibeTest.Server.Models.Responses;

namespace VibeTest.Server.Services;

public class TestService(
    ITestRepository tests,
    IQuestionAnswerRepository questionAnswers) : ITestService
{
    public async Task<PagedResponse<TestListItem>> GetPublicTests(int page, int pageSize)
    {
        var (normalizedPage, normalizedSize, offset) = NormalizePagination(page, pageSize);
        var totalCount = await tests.CountPublicTestsAsync();
        var rows = await tests.GetPublicTestsPageAsync(offset, normalizedSize);
        var items = rows.Select(MapListItem).ToList();
        return PaginationHelper.Create(items, normalizedPage, normalizedSize, totalCount);
    }

    public async Task<TestDetailResponse> GetTestDetail(int testId)
    {
        var test = await tests.GetByIdWithStructureAsync(testId)
            ?? throw new NotFoundException("Тест не найден");

        if (!test.IsPublic)
            throw new NotFoundException("Тест не найден");

        return MapDetail(test);
    }

    public async Task<TestResponse> CreateTest(int authorId, CreateTestRequest request)
    {
        TestRequestValidator.ValidateCreateTest(request);

        var now = DateTime.UtcNow;
        var test = new Test
        {
            AuthorId = authorId,
            Name = request.Name.Trim(),
            Description = request.Description?.Trim(),
            IsPublic = false,
            CreatedAt = now,
            UpdatedAt = now
        };

        await AddQuestionsAsync(test, request.Questions, startQuestionOrder: 0);
        await tests.AddAsync(test);
        await tests.SaveChangesAsync();

        return MapResponse(test);
    }

    public async Task<TestResponse> AppendQuestions(int testId, int authorId, AddQuestionsRequest request)
    {
        TestRequestValidator.ValidateQuestions(request.Questions);

        var test = await tests.GetByIdWithStructureAsync(testId)
            ?? throw new NotFoundException("Тест не найден");

        EnsureAuthor(test, authorId);

        var maxOrder = await tests.GetMaxQuestionOrderAsync(testId);
        await AddQuestionsAsync(test, request.Questions, startQuestionOrder: maxOrder + 1);
        test.UpdatedAt = DateTime.UtcNow;
        await tests.SaveChangesAsync();

        return MapResponse(test);
    }

    public async Task<TestResponse> UpdateTestInfo(int testId, int authorId, UpdateTestInfoRequest request)
    {
        TestRequestValidator.ValidateUpdateInfo(request);

        var test = await tests.GetByIdAsync(testId)
            ?? throw new NotFoundException("Тест не найден");

        EnsureAuthor(test, authorId);

        test.Name = request.Name.Trim();
        test.Description = request.Description?.Trim();
        test.UpdatedAt = DateTime.UtcNow;
        await tests.SaveChangesAsync();

        return MapResponse(test);
    }

    public async Task<TestResponse> ForkTest(int testId, int authorId)
    {
        var source = await tests.GetByIdWithStructureAsync(testId)
            ?? throw new NotFoundException("Тест не найден");

        EnsureAuthor(source, authorId);

        var now = DateTime.UtcNow;
        var fork = new Test
        {
            AuthorId = authorId,
            Name = $"{source.Name} (copy)",
            Description = source.Description,
            IsPublic = false,
            CreatedAt = now,
            UpdatedAt = now
        };

        foreach (var row in source.QuestionAnswers)
        {
            fork.QuestionAnswers.Add(new TestQuestionAnswer
            {
                QuestionId = row.QuestionId,
                AnswerId = row.AnswerId,
                QuestionOrder = row.QuestionOrder,
                AnswerOrder = row.AnswerOrder,
                IsCorrect = row.IsCorrect
            });
        }

        await tests.AddAsync(fork);
        await tests.SaveChangesAsync();

        return MapResponse(fork);
    }

    public async Task PublishTest(int testId, int authorId)
    {
        var test = await tests.GetByIdAsync(testId)
            ?? throw new NotFoundException("Тест не найден");

        EnsureAuthor(test, authorId);

        test.IsPublic = true;
        test.UpdatedAt = DateTime.UtcNow;
        await tests.SaveChangesAsync();
    }

    public async Task UnpublishTest(int testId, int authorId)
    {
        var test = await tests.GetByIdAsync(testId)
            ?? throw new NotFoundException("Тест не найден");

        EnsureAuthor(test, authorId);

        test.IsPublic = false;
        test.UpdatedAt = DateTime.UtcNow;
        await tests.SaveChangesAsync();
    }

    public async Task DeleteTest(int testId, int authorId)
    {
        var test = await tests.GetByIdAsync(testId)
            ?? throw new NotFoundException("Тест не найден");

        EnsureAuthor(test, authorId);

        await tests.DeleteAsync(test);
        await tests.SaveChangesAsync();
    }

    public async Task<PagedResponse<TestListItem>> GetMyTests(int authorId, int page, int pageSize, string filter)
    {
        var normalizedFilter = NormalizeFilter(filter);
        var (normalizedPage, normalizedSize, offset) = NormalizePagination(page, pageSize);
        var totalCount = await tests.CountMyTestsAsync(authorId, normalizedFilter);
        var rows = await tests.GetMyTestsPageAsync(authorId, normalizedFilter, offset, normalizedSize);
        var items = rows.Select(MapListItem).ToList();
        return PaginationHelper.Create(items, normalizedPage, normalizedSize, totalCount);
    }

    public async Task<TestFullResponse> GetTestFull(int testId, int authorId)
    {
        var test = await tests.GetByIdWithStructureAsync(testId)
            ?? throw new NotFoundException("Тест не найден");

        EnsureAuthor(test, authorId);

        return new TestFullResponse
        {
            Id = test.Id,
            Name = test.Name,
            Description = test.Description,
            IsPublic = test.IsPublic,
            Questions = TqaGrouper.ToFullQuestions(test.QuestionAnswers)
        };
    }

    private async Task AddQuestionsAsync(Test test, IReadOnlyList<QuestionInput> questions, int startQuestionOrder)
    {
        for (var qi = 0; qi < questions.Count; qi++)
        {
            var questionInput = questions[qi];
            var question = await questionAnswers.FindOrCreateQuestionAsync(questionInput.Text.Trim());

            for (var ai = 0; ai < questionInput.Answers.Count; ai++)
            {
                var answerInput = questionInput.Answers[ai];
                var answer = await questionAnswers.FindOrCreateAnswerAsync(answerInput.Text.Trim());

                test.QuestionAnswers.Add(new TestQuestionAnswer
                {
                    Test = test,
                    Question = question,
                    Answer = answer,
                    QuestionOrder = startQuestionOrder + qi,
                    AnswerOrder = ai,
                    IsCorrect = answerInput.IsCorrect
                });
            }
        }
    }

    private static void EnsureAuthor(Test test, int authorId)
    {
        if (test.AuthorId != authorId)
            throw new ForbiddenException("Доступ запрещён");
    }

    private static (int Page, int PageSize, int Offset) NormalizePagination(int page, int pageSize)
    {
        var normalizedPage = Math.Max(1, page);
        var normalizedSize = Math.Clamp(pageSize, 1, 100);
        return (normalizedPage, normalizedSize, (normalizedPage - 1) * normalizedSize);
    }

    private static string NormalizeFilter(string filter) =>
        filter switch
        {
            "published" => "published",
            "private" => "private",
            _ => "all"
        };

    private static TestListItem MapListItem(Data.Queries.TestListItemRow row) => new()
    {
        Id = row.Id,
        Name = row.Name,
        Description = row.Description,
        AuthorName = row.AuthorName,
        QuestionsCount = row.QuestionsCount,
        CreatedAt = row.CreatedAt
    };

    private static TestDetailResponse MapDetail(Test test) => new()
    {
        Id = test.Id,
        Name = test.Name,
        Description = test.Description,
        AuthorName = test.Author.DisplayName,
        Questions = TqaGrouper.ToDetailQuestions(test.QuestionAnswers)
    };

    private static TestResponse MapResponse(Test test) => new()
    {
        Id = test.Id,
        Name = test.Name,
        Description = test.Description,
        IsPublic = test.IsPublic,
        QuestionsCount = TqaGrouper.CountQuestions(test.QuestionAnswers),
        CreatedAt = test.CreatedAt
    };
}
