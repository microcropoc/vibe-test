using VibeTest.Server.Models.Requests;
using VibeTest.Server.Models.Responses;

namespace VibeTest.Server.Services;

public class TestService : ITestService
{
    public Task<PagedResponse<TestListItem>> GetPublicTests(int page, int pageSize) =>
        throw new NotImplementedException();

    public Task<TestDetailResponse> GetTestDetail(int testId) =>
        throw new NotImplementedException();

    public Task<TestResponse> CreateTest(int authorId, CreateTestRequest request) =>
        throw new NotImplementedException();

    public Task<TestResponse> AppendQuestions(int testId, int authorId, AddQuestionsRequest request) =>
        throw new NotImplementedException();

    public Task<TestResponse> UpdateTestInfo(int testId, int authorId, UpdateTestInfoRequest request) =>
        throw new NotImplementedException();

    public Task<TestResponse> ForkTest(int testId, int authorId) =>
        throw new NotImplementedException();

    public Task PublishTest(int testId, int authorId) =>
        throw new NotImplementedException();

    public Task UnpublishTest(int testId, int authorId) =>
        throw new NotImplementedException();

    public Task DeleteTest(int testId, int authorId) =>
        throw new NotImplementedException();

    public Task<PagedResponse<TestListItem>> GetMyTests(int authorId, int page, int pageSize, string filter) =>
        throw new NotImplementedException();

    public Task<TestFullResponse> GetTestFull(int testId, int authorId) =>
        throw new NotImplementedException();
}
