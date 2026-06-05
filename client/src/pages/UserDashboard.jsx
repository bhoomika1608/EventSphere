import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiCalendar, FiMapPin, FiX, FiClock } from 'react-icons/fi';
import { HiTicket } from 'react-icons/hi';
import { format } from 'date-fns';

const StatusBadge = ({ status }) => {
  const styles = {
    confirmed: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 ring-emerald-500/20',
    cancelled: 'text-red-500 bg-red-50 dark:bg-red-500/10 ring-red-500/20',
    waitlisted: 'text-amber-500 bg-amber-50 dark:bg-amber-500/10 ring-amber-500/20'
  };
  
  const labels = {
    confirmed: '✓ Confirmed',
    cancelled: '✗ Cancelled',
    waitlisted: '⏳ Waitlisted'
  };

  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ring-1 ring-inset ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

const UserDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    api.get('/bookings/my')
      .then(res => setBookings(res.data.bookings))
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    setCancelling(bookingId);
    try {
      await api.put(`/bookings/${bookingId}/cancel`);
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: 'cancelled' } : b));
      toast.success('Booking cancelled successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    } finally {
      setCancelling(null);
    }
  };

  const active = bookings.filter(b => b.status === 'confirmed');
  const waitlisted = bookings.filter(b => b.status === 'waitlisted');
  const cancelled = bookings.filter(b => b.status === 'cancelled');

  if (loading) return <LoadingSpinner text="Loading your bookings..." />;

  return (
    <div className="min-h-screen py-8 pb-16 bg-slate-50 dark:bg-[#0f0f19]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand-600 to-pink-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg shadow-brand-500/20">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-3xl font-heading font-bold text-slate-900 dark:text-white">My Dashboard</h1>
              <p className="text-slate-500 dark:text-slate-400">Welcome back, {user?.name}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl">
            {[
              { label: 'Active', count: active.length, textColor: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-400/10' },
              { label: 'Waitlisted', count: waitlisted.length, textColor: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-400/10' },
              { label: 'Cancelled', count: cancelled.length, textColor: 'text-red-600 dark:text-red-400', bg: 'bg-red-50 dark:bg-red-400/10' },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center border border-white/50 dark:border-white/5`}>
                <div className={`text-3xl font-heading font-bold ${s.textColor}`}>{s.count}</div>
                <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bookings */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-white">
            All Bookings <span className="text-brand-600 dark:text-brand-400 ml-2">({bookings.length})</span>
          </h2>
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-16 px-8 bg-white dark:bg-white/5 rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm">
            <HiTicket className="text-6xl text-slate-300 dark:text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-heading font-bold text-slate-800 dark:text-slate-300 mb-2">No bookings yet</h3>
            <p className="text-slate-500 dark:text-slate-400">Browse events and book your first ticket!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {bookings.map(booking => (
              <div key={booking._id} className="bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-2xl p-5 md:p-6 border border-slate-200 dark:border-white/10 shadow-sm flex flex-col md:flex-row md:items-center gap-5 transition-all hover:shadow-md hover:border-brand-500/30">
                {/* Event emoji/icon */}
                <div className="w-14 h-14 rounded-2xl shrink-0 bg-gradient-to-br from-brand-500/20 to-pink-500/20 flex items-center justify-center text-2xl border border-brand-500/20">
                  🎟️
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 truncate">
                    {booking.event?.title || 'Event Deleted'}
                  </h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                    {booking.event?.date && (
                      <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                        <FiCalendar className="text-brand-500" /> {format(new Date(booking.event.date), 'MMM d, yyyy')}
                      </span>
                    )}
                    {booking.event?.location && (
                      <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
                        <FiMapPin className="text-brand-500" /> {booking.event.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5 bg-brand-50 dark:bg-brand-500/10 px-2.5 py-1 rounded-md text-brand-700 dark:text-brand-400 font-medium">
                      <HiTicket /> {booking.tickets} ticket{booking.tickets > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Right section */}
                <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800 mt-2 md:mt-0">
                  <StatusBadge status={booking.status} />
                  
                  <div className="font-bold text-lg text-slate-900 dark:text-white">
                    ₹{booking.totalPrice}
                  </div>
                  
                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => handleCancel(booking._id)}
                      disabled={cancelling === booking._id}
                      className="flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FiX /> {cancelling === booking._id ? 'Cancelling...' : 'Cancel'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
