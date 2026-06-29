using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using VibeTest.Server.Extensions;
using VibeTest.Server.Models.Requests;
using VibeTest.Server.Models.Responses;
using VibeTest.Server.Services;

namespace VibeTest.Server.Controllers;

[ApiController]
[Route("api/applications")]
public class ApplicationsController(IApplicationService applicationService) : ControllerBase
{
    [HttpPost]
    [Authorize]
    public Task<ApplicationResponse> Create([FromBody] CreateApplicationRequest request) =>
        applicationService.CreateApplication(User.GetUserId(), request);

    [HttpGet]
    [Authorize]
    public Task<PagedResponse<ApplicationListItem>> GetMy(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10) =>
        applicationService.GetMyApplications(User.GetUserId(), page, pageSize);

    [HttpGet("{token:guid}")]
    [AllowAnonymous]
    public Task<ApplicationPlayResponse> GetDetail(Guid token) =>
        applicationService.GetApplicationPlayDetail(token);

    [HttpPost("{token:guid}/submit")]
    [AllowAnonymous]
    public Task<SubmitResponse> SubmitAnswer(Guid token, [FromBody] SubmitAnswerRequest request) =>
        applicationService.SubmitAnswer(token, request);

    [HttpGet("{token:guid}/result")]
    [AllowAnonymous]
    public Task<TestResultResponse> GetResult(Guid token) =>
        applicationService.GetApplicationResult(token);
}
