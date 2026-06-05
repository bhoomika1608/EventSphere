const SkeletonCard = () => (
  <div className="glass-card flex flex-col h-full rounded-2xl overflow-hidden animate-pulse">
    <div className="h-48 bg-slate-200 dark:bg-slate-800" />
    <div className="p-5 flex flex-col flex-1 gap-4">
      <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-md w-3/4" />
      <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-md w-1/2" />
      
      <div className="flex flex-col gap-2 mt-auto">
        {[1, 2, 3].map(i => (
          <div key={i} className={`h-3 bg-slate-200 dark:bg-slate-700 rounded w-${4 - i}/5`} />
        ))}
      </div>
      
      <div className="flex justify-between items-center mt-3 pt-2 w-full">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded-md w-1/4" />
        <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded-full w-1/3" />
      </div>
    </div>
  </div>
);

export default SkeletonCard;
