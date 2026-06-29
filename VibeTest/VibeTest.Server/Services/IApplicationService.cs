using VibeTest.Server.Models.Requests;
using VibeTest.Server.Models.Responses;

namespace VibeTest.Server.Services;

public interface IApplicationService
{
    Task<ApplicationResponse> CreateApplication(int authorId, CreateApplicationRequest request);
    Task<PagedResponse<ApplicationListItem>> GetMyApplications(int authorId, int page, int pageSize);
    Task<ApplicationPlayResponse> GetApplicationPlayDetail(Guid token);
    Task<SubmitResponse> SubmitAnswer(Guid token, SubmitAnswerRequest request);
    Task<TestResultResponse> GetApplicationResult(Guid token);
    Task<TestResultResponse> GetApplicationResultById(int applicationId, int authorId);
}
