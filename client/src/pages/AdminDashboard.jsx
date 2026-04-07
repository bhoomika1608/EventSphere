import { useState, useEffect } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiUsers, FiCalendar, FiDollarSign, FiTrash2, FiEdit2, FiShield } from 'react-icons/fi';
import { format } from 'date-fns';

const ROLES = ['user', 'organizer', 'admin'];

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [updatingRole, setUpdatingRole] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [deletingEvent, setDeletingEvent] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, usersRes, eventsRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get('/admin/users'),
          api.get('/admin/events'),
        ]);
        setStats(statsRes.data.stats);
        setUsers(usersRes.data.users);
        setEvents(eventsRes.data.events);
      } catch {
        toast.error('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingRole(userId);
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, role: newRole } : u));
      toast.success('Role updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role');
    } finally {
      setUpdatingRole(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Delete this user?')) return;
    setDeletingUser(userId);
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u._id !== userId));
      toast.success('User deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    } finally {
      setDeletingUser(null);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Force delete this event?')) return;
    setDeletingEvent(eventId);
    try {
      await api.delete(`/admin/events/${eventId}`);
      setEvents(prev => prev.filter(e => e._id !== eventId));
      toast.success('Event deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    } finally {
      setDeletingEvent(null);
    }
  };

  if (loading) return <LoadingSpinner text="Loading admin data..." />;

  const getRoleClasses = (role) => {
    if (role === 'admin') return 'bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20';
    if (role === 'organizer') return 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
    return 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
  };

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'users', label: `👥 Users (${users.length})` },
    { id: 'events', label: `🗓️ Events (${events.length})` },
  ];

  return (
    <div className="min-h-screen py-8 pb-16 bg-slate-50 dark:bg-[#0f0f19]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-red-100 dark:bg-red-500/20 flex items-center justify-center text-red-600 dark:text-red-500">
              <FiShield className="text-2xl" />
            </div>
            <h1 className="text-3xl font-heading font-bold text-slate-900 dark:text-white">Admin Panel</h1>
          </div>
          <p className="text-slate-500 dark:text-slate-400">Platform-wide management & analytics</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-slate-200 dark:border-white/10 overflow-x-auto scroolbar-hide">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`
              px-5 py-3 text-sm font-semibold whitespace-nowrap transition-all border-b-2 
              ${activeTab === tab.id 
                ? 'border-brand-500 text-brand-600 dark:border-brand-400 dark:text-brand-400' 
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300 dark:hover:border-white/20'}
            `}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: <FiUsers />, label: 'Total Users', value: stats.totalUsers, textColor: 'text-brand-600 dark:text-brand-400', bg: 'bg-brand-50 dark:bg-brand-500/10', border: 'border-brand-500/20' },
              { icon: <FiCalendar />, label: 'Total Events', value: stats.totalEvents, textColor: 'text-cyan-600 dark:text-cyan-400', bg: 'bg-cyan-50 dark:bg-cyan-500/10', border: 'border-cyan-500/20' },
              { icon: '🎟️', label: 'Total Bookings', value: stats.totalBookings, textColor: 'text-pink-600 dark:text-pink-400', bg: 'bg-pink-50 dark:bg-pink-500/10', border: 'border-pink-500/20' },
              { icon: <FiDollarSign />, label: 'Total Revenue', value: `₹${stats.totalRevenue}`, textColor: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-500/20' },
            ].map(stat => (
              <div key={stat.label} className={`${stat.bg} ${stat.border} border rounded-2xl p-6 flex flex-col items-start transition-transform hover:-translate-y-1 shadow-sm`}>
                <div className={`${stat.textColor} text-2xl mb-4`}>
                  {stat.icon}
                </div>
                <div className="text-4xl font-heading font-bold text-slate-900 dark:text-white mb-2">{stat.value}</div>
                <div className="text-sm font-semibold text-slate-500 dark:text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-2xl md:rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-white/5 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-white/10">
                    <th className="p-4 md:p-5 whitespace-nowrap">User</th>
                    <th className="p-4 md:p-5 whitespace-nowrap">Email</th>
                    <th className="p-4 md:p-5 whitespace-nowrap">Role</th>
                    <th className="p-4 md:p-5 whitespace-nowrap">Joined</th>
                    <th className="p-4 md:p-5 whitespace-nowrap text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {users.map((u) => (
                    <tr key={u._id} className="transition-colors hover:bg-slate-50 dark:hover:bg-white/5">
                      <td className="p-4 md:p-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-600 to-pink-600 flex flex-shrink-0 items-center justify-center text-sm font-bold text-white shadow-sm">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-bold text-sm text-slate-900 dark:text-white">{u.name}</span>
                        </div>
                      </td>
                      <td className="p-4 md:p-5 text-sm text-slate-600 dark:text-slate-400">{u.email}</td>
                      <td className="p-4 md:p-5">
                        <select 
                          value={u.role} 
                          onChange={e => handleRoleChange(u._id, e.target.value)}
                          disabled={updatingRole === u._id}
                          className={`appearance-none border text-xs font-bold rounded-full px-3 py-1 outline-none cursor-pointer disabled:opacity-50 transition-colors ${getRoleClasses(u.role)}`}
                        >
                          {ROLES.map(r => <option key={r} value={r} className="bg-white text-slate-900 dark:bg-[#1e1e2e] dark:text-slate-200">{r}</option>)}
                        </select>
                      </td>
                      <td className="p-4 md:p-5 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {format(new Date(u.createdAt), 'MMM d, yyyy')}
                      </td>
                      <td className="p-4 md:p-5 text-right">
                        <button 
                          onClick={() => handleDeleteUser(u._id)} 
                          disabled={deletingUser === u._id}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-500/20 transition-colors disabled:opacity-50"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-2xl md:rounded-3xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-white/5 text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-white/10">
                    <th className="p-4 md:p-5 whitespace-nowrap">Event</th>
                    <th className="p-4 md:p-5 whitespace-nowrap">Organizer</th>
                    <th className="p-4 md:p-5 whitespace-nowrap">Category</th>
                    <th className="p-4 md:p-5 whitespace-nowrap">Date</th>
                    <th className="p-4 md:p-5 whitespace-nowrap">Seats</th>
                    <th className="p-4 md:p-5 whitespace-nowrap">Price</th>
                    <th className="p-4 md:p-5 whitespace-nowrap text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {events.map((ev) => (
                    <tr key={ev._id} className="transition-colors hover:bg-slate-50 dark:hover:bg-white/5">
                      <td className="p-4 md:p-5 max-w-[200px]">
                        <div className="font-bold text-sm text-slate-900 dark:text-white truncate">
                          {ev.title}
                        </div>
                      </td>
                      <td className="p-4 md:p-5 text-sm text-slate-600 dark:text-slate-400 truncate max-w-[150px]">{ev.organizer?.name}</td>
                      <td className="p-4 md:p-5">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400 border border-brand-500/20">
                          {ev.category}
                        </span>
                      </td>
                      <td className="p-4 md:p-5 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {format(new Date(ev.date), 'MMM d, yyyy')}
                      </td>
                      <td className="p-4 md:p-5 text-sm">
                        <span className={`font-semibold ${ev.availableSeats === 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                          {ev.availableSeats}/{ev.totalSeats}
                        </span>
                      </td>
                      <td className="p-4 md:p-5 text-sm font-bold text-brand-600 dark:text-brand-400">
                        {ev.price === 0 ? 'FREE' : `₹${ev.price}`}
                      </td>
                      <td className="p-4 md:p-5 text-right">
                        <button 
                          onClick={() => handleDeleteEvent(ev._id)} 
                          disabled={deletingEvent === ev._id}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 border border-red-500/20 transition-colors disabled:opacity-50"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
