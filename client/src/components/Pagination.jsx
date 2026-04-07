import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="flex items-center justify-center gap-2 py-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-200 ${
          currentPage === 1 
            ? 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-600 cursor-not-allowed' 
            : 'bg-brand-50 dark:bg-brand-500/10 border-brand-200 dark:border-brand-500/20 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-500/20 cursor-pointer'
        }`}
      >
        <FiChevronLeft className="text-lg" />
      </button>

      {pages.map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200 text-sm ${
            page === currentPage 
              ? 'bg-gradient-to-br from-brand-600 to-pink-600 text-white font-bold shadow-md shadow-brand-500/20 border-transparent' 
              : 'bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/10 font-medium'
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-200 ${
          currentPage === totalPages 
            ? 'bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-400 dark:text-slate-600 cursor-not-allowed' 
            : 'bg-brand-50 dark:bg-brand-500/10 border-brand-200 dark:border-brand-500/20 text-brand-600 dark:text-brand-400 hover:bg-brand-100 dark:hover:bg-brand-500/20 cursor-pointer'
        }`}
      >
        <FiChevronRight className="text-lg" />
      </button>
    </div>
  );
};

export default Pagination;
