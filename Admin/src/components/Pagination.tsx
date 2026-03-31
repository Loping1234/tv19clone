import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'react-feather';
import './Pagination.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  startIdx: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  startIdx,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 0 || totalItems === 0) return null;

  const endIdx = Math.min(startIdx + itemsPerPage, totalItems);

  // Build page number array with ellipsis
  const getPages = (): (number | '...')[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: (number | '...')[] = [1];
    if (currentPage > 3) pages.push('...');
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="pagination-bar">
      <span className="pagination-info">
        Showing <strong>{startIdx + 1}</strong> to <strong>{endIdx}</strong> of <strong>{totalItems}</strong> entries
      </span>
      <div className="pagination-controls">
        <button
          className="pg-btn pg-nav"
          disabled={currentPage === 1}
          onClick={() => onPageChange(1)}
          title="First"
        >
          <ChevronsLeft size={14} />
        </button>
        <button
          className="pg-btn pg-nav"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
          title="Previous"
        >
          <ChevronLeft size={14} />
        </button>

        {getPages().map((page, i) =>
          page === '...' ? (
            <span key={`ellipsis-${i}`} className="pg-ellipsis">…</span>
          ) : (
            <button
              key={page}
              className={`pg-btn pg-num ${currentPage === page ? 'active' : ''}`}
              onClick={() => onPageChange(page as number)}
            >
              {page}
            </button>
          )
        )}

        <button
          className="pg-btn pg-nav"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          title="Next"
        >
          <ChevronRight size={14} />
        </button>
        <button
          className="pg-btn pg-nav"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(totalPages)}
          title="Last"
        >
          <ChevronsRight size={14} />
        </button>
      </div>
    </div>
  );
}
