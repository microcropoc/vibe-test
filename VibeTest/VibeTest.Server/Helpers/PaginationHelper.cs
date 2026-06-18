using VibeTest.Server.Models.Responses;

namespace VibeTest.Server.Helpers;

public static class PaginationHelper
{
    public static PagedResponse<T> Create<T>(IReadOnlyList<T> items, int page, int pageSize, int totalCount)
    {
        var totalPages = pageSize > 0 ? (int)Math.Ceiling(totalCount / (double)pageSize) : 0;

        return new PagedResponse<T>
        {
            Items = items.ToList(),
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount,
            TotalPages = totalPages,
            HasNextPage = page < totalPages,
            HasPreviousPage = page > 1
        };
    }
}
