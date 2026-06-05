import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import EventCard from '../components/EventCard';
import SkeletonCard from '../components/SkeletonCard';
import Pagination from '../components/Pagination';
import { FiSearch, FiFilter, FiX, FiCalendar } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';

const CATEGORIES = ['Tech', 'Music', 'Sports', 'Art', 'Food', 'Business', 'Health', 'Education', 'Other'];

const Home = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    minPrice: '',
    maxPrice: '',
    sort: '-createdAt',
  });
  const [appliedFilters, setAppliedFilters] = useState(filters);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 9, ...appliedFilters };
      // Remove empty params
      Object.keys(params).forEach(k => !params[k] && delete params[k]);
      const res = await api.get('/events', { params });
      setEvents(res.data.events);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, appliedFilters]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    setPage(1);
    setAppliedFilters({ ...filters });
  };

  const clearFilters = () => {
    const reset = { search: '', category: '', minPrice: '', maxPrice: '', sort: '-createdAt' };
    setFilters(reset);
    setAppliedFilters(reset);
    setPage(1);
  };

  const hasFilters = appliedFilters.search || appliedFilters.category || appliedFilters.minPrice || appliedFilters.maxPrice;

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative pt-20 pb-16 px-6 lg:px-8 text-center bg-transparent overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-radial from-brand-500/20 via-pink-500/5 to-transparent blur-3xl -z-10 pointer-events-none" />
        
        <div className="flex items-center justify-center gap-2 mb-6">
          <HiSparkles className="text-brand-500 dark:text-brand-400 text-xl" />
          <span className="text-brand-700 dark:text-brand-300 text-sm font-semibold tracking-widest uppercase">
            Discover Amazing Events
          </span>
        </div>
        
        <h1 className="font-heading text-4xl sm:text-5xl lg:text-7xl font-bold text-slate-900 dark:text-slate-50 mb-6 leading-tight">
          Find Your Next <br className="hidden sm:block" />
          <span className="text-gradient-primary">Experience</span>
        </h1>
        
        <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-12">
          Book tickets for tech conferences, concerts, sports events, and more — all in one unified platform.
        </p>

        {/* Search bar */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8 relative z-10">
          <div className="flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative w-full">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
              <input
                type="text" 
                value={filters.search} 
                onChange={e => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search events, venues, organizers..."
                className="w-full bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none shadow-sm transition-all"
              />
            </div>
            <button type="submit" className="w-full sm:w-auto bg-slate-900 dark:bg-brand-600 text-white hover:bg-slate-800 dark:hover:bg-brand-500 px-8 py-3.5 rounded-xl font-semibold shadow-lg shadow-slate-900/10 dark:shadow-brand-500/20 transition-all shrink-0">
              Search
            </button>
          </div>
        </form>
      </div>

      {/* Filters + Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        
        {/* Filter bar */}
        <div className="glass-card mb-10 p-4 sm:p-5 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-sm">
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mr-2">
              <FiFilter /> Filters
            </div>

            {/* Category */}
            <select 
              value={filters.category} 
              onChange={e => setFilters({ ...filters, category: e.target.value })}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-brand-500 outline-none"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>

            {/* Price range */}
            <div className="flex items-center gap-2">
              <input 
                type="number" 
                value={filters.minPrice} 
                onChange={e => setFilters({ ...filters, minPrice: e.target.value })}
                placeholder="Min ₹" 
                className="w-24 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-brand-500 outline-none" 
                min={0} 
              />
              <span className="text-slate-400">-</span>
              <input 
                type="number" 
                value={filters.maxPrice} 
                onChange={e => setFilters({ ...filters, maxPrice: e.target.value })}
                placeholder="Max ₹" 
                className="w-24 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-brand-500 outline-none" 
                min={0} 
              />
            </div>

            {/* Sort */}
            <select 
              value={filters.sort} 
              onChange={e => setFilters({ ...filters, sort: e.target.value })}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-brand-500 outline-none"
            >
              <option value="-createdAt">Latest Details</option>
              <option value="price_asc">Price: Low → High</option>
              <option value="price_desc">Price: High → Low</option>
              <option value="date_asc">Date: Soonest</option>
            </select>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end mt-2 md:mt-0">
            {hasFilters && (
              <button 
                onClick={clearFilters} 
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors"
              >
                <FiX /> Clear
              </button>
            )}
            <button 
              onClick={handleSearch} 
              className="px-4 py-2 rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300 font-semibold text-sm hover:bg-brand-100 dark:hover:bg-brand-500/30 transition-colors"
            >
              Apply Map
            </button>
            <span className="text-slate-500 text-sm font-medium pl-3 border-l border-slate-200 dark:border-white/10">
              {total} event{total !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {/* Events Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(9).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : events.length === 0 ? (
          <div className="glass flex flex-col items-center justify-center p-16 rounded-3xl text-center shadow-sm">
            <div className="text-6xl mb-4 opacity-50">🔍</div>
            <h3 className="font-heading text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
              No events found
            </h3>
            <p className="text-slate-500 dark:text-slate-400 max-w-md">
              We couldn't find any events matching your current filters or search terms.
            </p>
            {hasFilters && (
              <button 
                onClick={clearFilters} 
                className="mt-6 px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-medium shadow-sm hover:-translate-y-0.5 transition-transform"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map(event => <EventCard key={event._id} event={event} />)}
            </div>
            {pages > 1 && (
              <Pagination currentPage={page} totalPages={pages} onPageChange={setPage} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
