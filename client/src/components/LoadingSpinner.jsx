const LoadingSpinner = ({ text = 'Loading...', fullHeight = false }) => (
  <div className={`flex flex-col items-center justify-center gap-4 ${fullHeight ? 'min-h-[60vh]' : 'py-12'}`}>
    <div className="w-10 h-10 border-4 border-brand-200 dark:border-brand-900 border-t-brand-600 dark:border-t-brand-500 rounded-full animate-spin"></div>
    {text && <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{text}</p>}
  </div>
);

export default LoadingSpinner;
