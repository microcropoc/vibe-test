using VibeTest.Server.Data;
using VibeTest.Server.Data.Repositories;
using VibeTest.Server.Services;

namespace VibeTest.Tests.Integration;

public class TestServiceTests
{
    [Fact]
    public void Fixture_creates_in_memory_database()
    {
        using var fixture = new SqliteTestDb();
        Assert.NotNull(fixture.Db);
        Assert.True(fixture.Db.Database.CanConnect());
    }

    // TODO Этап 1: CreateTest, AppendQuestions, Fork, GetTestDetail vs GetTestFull
}
