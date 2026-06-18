using VibeTest.Server.Models.Requests;
using VibeTest.Server.Models.Responses;

namespace VibeTest.Server.Services;

public interface ITestService
{
    Task<PagedResponse<TestListItem>> GetPublicTests(int page, int pageSize);
    Task<TestDetailResponse> GetTestDetail(int testId);

    Task<TestResponse> CreateTest(int authorId, CreateTestRequest request);
    Task<TestResponse> AppendQuestions(int testId, int authorId, AddQuestionsRequest request);
    Task<TestResponse> UpdateTestInfo(int testId, int authorId, UpdateTestInfoRequest request);
    Task<TestResponse> ForkTest(int testId, int authorId);
    Task PublishTest(int testId, int authorId);
    Task UnpublishTest(int testId, int authorId);
    Task DeleteTest(int testId, int authorId);

    Task<PagedResponse<TestListItem>> GetMyTests(int authorId, int page, int pageSize, string filter);
    Task<TestFullResponse> GetTestFull(int testId, int authorId);
}
