import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiPlus, FiEdit2, FiTrash2, FiCalendar, FiUsers, FiDollarSign, FiBarChart2 } from 'react-icons/fi';
import { format } from 'date-fns';

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    api.get('/events/organizer/my')
      .then(res => setEvents(res.data.events))
      .catch(() => toast.error('Failed to load events'))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (eventId) => {
    if (!window.confirm('Delete this event? This action cannot be undone.')) return;
    setDeleting(eventId);
    try {
      await api.delete(`/events/${eventId}`);
      setEvents(prev => prev.filter(e => e._id !== eventId));
      toast.success('Event deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete event');
    } finally {
      setDeleting(null);
    }
  };

  const totalRevenue = events.reduce((sum, e) => sum + (e.analytics?.revenue || 0), 0);
  const totalBookings = events.reduce((sum, e) => sum + (e.analytics?.totalBookings || 0), 0);

  if (loading) return <LoadingSpinner text="Loading your events..." />;

  return (
    <div className="min-h-screen py-8 pb-16 bg-slate-50 dark:bg-[#0f0f19]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-slate-900 dark:text-white">Organizer Dashboard</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Manage your events and track performance</p>
          </div>
          <Link to="/organizer/create" className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 px-5 rounded-xl shadow-lg shadow-brand-500/25 transition-all">
            <FiPlus /> Create Event
          </Link>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {[
            { icon: <FiCalendar />, label: 'Total Events', value: events.length, textColor: 'text-brand-600 dark:text-brand-400', bg: 'bg-brand-50 dark:bg-brand-500/10', border: 'border-brand-500/20' },
            { icon: <FiUsers />, label: 'Total Bookings', value: totalBookings, textColor: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-500/10', border: 'border-cyan-500/20' },
            { icon: <FiDollarSign />, label: 'Total Revenue', value: `₹${totalRevenue}`, textColor: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-500/20' },
            { icon: <FiBarChart2 />, label: 'Avg. per Event', value: events.length ? `₹${Math.round(totalRevenue / events.length)}` : '₹0', textColor: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-500/10', border: 'border-pink-500/20' },
          ].map(stat => (
            <div key={stat.label} className={`${stat.bg} ${stat.border} border rounded-2xl p-5 flex flex-col items-start transition-transform hover:-translate-y-1`}>
              <div className={`${stat.textColor} text-xl mb-3 p-2 bg-white/50 dark:bg-slate-900/50 rounded-lg shadow-sm border border-white/50 dark:border-white/5`}>
                {stat.icon}
              </div>
              <div className="text-3xl font-heading font-bold text-slate-900 dark:text-white mb-1">{stat.value}</div>
              <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Events table */}
        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-2xl md:rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
          <div className="p-5 md:p-6 border-b border-slate-200 dark:border-white/10">
            <h2 className="text-lg font-heading font-bold text-slate-900 dark:text-white">
              Your Events <span className="text-brand-600 dark:text-brand-400 ml-2">({events.length})</span>
            </h2>
          </div>

          {events.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="text-6xl mb-4">🎪</div>
              <h3 className="text-xl font-heading font-bold text-slate-800 dark:text-slate-300 mb-2">No events yet</h3>
              <p className="text-slate-500 dark:text-slate-400 mb-6">Create your first event to get started</p>
              <Link to="/organizer/create" className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2.5 px-5 rounded-xl transition-all">
                <FiPlus /> Create Event
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-white/5 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-white/10">
                    <th className="p-4 md:p-5 whitespace-nowrap">Event</th>
                    <th className="p-4 md:p-5 whitespace-nowrap">Date</th>
                    <th className="p-4 md:p-5 whitespace-nowrap">Seats</th>
                    <th className="p-4 md:p-5 whitespace-nowrap">Bookings</th>
                    <th className="p-4 md:p-5 whitespace-nowrap">Revenue</th>
                    <th className="p-4 md:p-5 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {events.map((event) => (
                    <tr key={event._id} className="transition-colors hover:bg-slate-50 dark:hover:bg-white/5">
                      <td className="p-4 md:p-5 max-w-[200px] md:max-w-[250px]">
                        <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {event.title}
                        </div>
                        <div className="text-xs text-brand-600 dark:text-brand-400 mt-1 font-medium">{event.category}</div>
                      </td>
                      <td className="p-4 md:p-5 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                        {format(new Date(event.date), 'MMM d, yyyy')}
                      </td>
                      <td className="p-4 md:p-5 text-sm">
                        <span className={`font-semibold ${event.availableSeats === 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                          {event.availableSeats}/{event.totalSeats}
                        </span>
                      </td>
                      <td className="p-4 md:p-5 text-sm font-bold text-cyan-600 dark:text-cyan-400">
                        {event.analytics?.totalBookings || 0}
                      </td>
                      <td className="p-4 md:p-5 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        ₹{event.analytics?.revenue || 0}
                      </td>
                      <td className="p-4 md:p-5">
                        <div className="flex gap-2">
                          <Link to={`/organizer/edit/${event._id}`} className="w-8 h-8 rounded-lg flex items-center justify-center text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 hover:bg-brand-100 dark:hover:bg-brand-500/20 border border-brand-500/20 transition-colors">
                            <FiEdit2 size={14} />
                          </Link>
                          <button onClick={() => handleDelete(event._id)} disabled={deleting === event._id} className="w-8 h-8 rounded-lg flex items-center justify-center text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-500/20 transition-colors disabled:opacity-50">
                            <FiTrash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizerDashboard;
