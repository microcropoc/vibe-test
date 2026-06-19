interface PaginationProps {
  page: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  totalPages,
  hasPreviousPage,
  hasNextPage,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="vt-pagination">
      <button
        type="button"
        className="vt-btn vt-btn--ghost"
        disabled={!hasPreviousPage}
        onClick={() => onPageChange(page - 1)}
      >
        Назад
      </button>
      <span className="vt-muted">
        Стр. {page} из {totalPages}
      </span>
      <button
        type="button"
        className="vt-btn vt-btn--ghost"
        disabled={!hasNextPage}
        onClick={() => onPageChange(page + 1)}
      >
        Вперёд
      </button>
    </div>
  );
}
