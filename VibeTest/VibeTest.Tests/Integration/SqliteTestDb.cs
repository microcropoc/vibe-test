using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using VibeTest.Server.Data;

namespace VibeTest.Tests.Integration;

public sealed class SqliteTestDb : IDisposable
{
    private readonly SqliteConnection _connection;

    public SqliteTestDb()
    {
        _connection = new SqliteConnection("DataSource=:memory:");
        _connection.Open();

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseSqlite(_connection)
            .Options;

        Db = new AppDbContext(options);
        Db.Database.EnsureCreated();
    }

    public AppDbContext Db { get; }

    public void Dispose()
    {
        Db.Dispose();
        _connection.Dispose();
    }
}
