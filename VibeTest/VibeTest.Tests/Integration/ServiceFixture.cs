using VibeTest.Server.Data;
using VibeTest.Server.Data.Repositories;
using VibeTest.Server.Models.Entities;
using VibeTest.Server.Models.Requests;
using VibeTest.Server.Services;

namespace VibeTest.Tests.Integration;

public sealed class ServiceFixture : IDisposable
{
    private readonly SqliteTestDb _db = new();

    public ServiceFixture()
    {
        TestRepository = new TestRepository(_db.Db);
        QuestionAnswerRepository = new QuestionAnswerRepository(_db.Db);
        ResultRepository = new ResultRepository(_db.Db);
        UserRepository = new UserRepository(_db.Db);

        TestService = new TestService(TestRepository, QuestionAnswerRepository);
        ResultService = new ResultService(TestRepository, ResultRepository, UserRepository);
        UserService = new UserService(UserRepository);
    }

    public AppDbContext Db => _db.Db;
    public ITestRepository TestRepository { get; }
    public IQuestionAnswerRepository QuestionAnswerRepository { get; }
    public IResultRepository ResultRepository { get; }
    public IUserRepository UserRepository { get; }
    public ITestService TestService { get; }
    public IResultService ResultService { get; }
    public IUserService UserService { get; }

    public async Task<User> SeedUserAsync(string email = "alice@test.com", string name = "Alice")
    {
        var user = new User
        {
            DisplayName = name,
            Email = email,
            PasswordHash = "hash",
            CreatedAt = DateTime.UtcNow
        };
        Db.Users.Add(user);
        await Db.SaveChangesAsync();
        return user;
    }

    public static CreateTestRequest SampleTestRequest() => new()
    {
        Name = "SQL Basics",
        Description = "Intro",
        Questions =
        [
            new QuestionInput
            {
                Text = "What is SQL?",
                Answers = ["Structured Query Language", "Simple Query Logic"],
                Correct = 0
            },
            new QuestionInput
            {
                Text = "SELECT is?",
                Answers = ["DML", "DDL", "DCL"],
                Correct = 0
            }
        ]
    };

    public void Dispose() => _db.Dispose();
}
