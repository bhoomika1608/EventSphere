import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { FiCalendar, FiMapPin, FiUsers, FiTag, FiDollarSign, FiClock, FiArrowLeft, FiCheck } from 'react-icons/fi';
import { HiSparkles, HiLightningBolt } from 'react-icons/hi';
import { format } from 'date-fns';

const CATEGORY_EMOJI = { Tech: '💻', Music: '🎵', Sports: '⚽', Art: '🎨', Food: '🍽️', Business: '💼', Health: '🏥', Education: '📚', Other: '✨' };

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [event, setEvent] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [tickets, setTickets] = useState(1);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/events/${id}`);
        setEvent(res.data.event);
        setAnalytics(res.data.analytics);
      } catch {
        toast.error('Event not found');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, navigate]);

  const handleBook = async () => {
    if (!isAuthenticated) { toast.error('Please login to book'); navigate('/login'); return; }
    if (user.role === 'organizer') { toast.error('Organizers cannot book events'); return; }

    setBooking(true);
    try {
      const res = await api.post('/bookings', { eventId: id, tickets });
      if (res.data.isWaitlisted) {
        toast.success('Added to waitlist! You\'ll be notified when seats open.', { duration: 5000 });
      } else {
        toast.success(`🎉 Booking confirmed for ${tickets} ticket${tickets > 1 ? 's' : ''}!`);
      }
      setEvent(prev => ({ ...prev, availableSeats: Math.max(0, prev.availableSeats - (res.data.isWaitlisted ? 0 : tickets)) }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading event details..." fullHeight={true} />;

  const isSoldOut = event.availableSeats === 0;
  const isPast = new Date(event.date) < new Date();
  const bookingPercent = Math.round(((event.totalSeats - event.availableSeats) / event.totalSeats) * 100);

  return (
    <div className="min-h-screen pb-20">
      
      {/* Top Bar Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-4">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 bg-transparent border-none text-slate-500 hover:text-brand-500 dark:text-slate-400 dark:hover:text-brand-400 font-medium text-sm transition-colors"
        >
          <FiArrowLeft /> Back to experiences
        </button>
      </div>

      {/* Hero Banner */}
      <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden bg-gradient-to-br from-brand-600/50 via-pink-600/40 to-cyan-500/30">
        {event.imageUrl && (
          <img 
            src={event.imageUrl} 
            alt={event.title} 
            className="w-full h-full object-cover mix-blend-overlay opacity-60" 
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 via-slate-50/20 dark:from-slate-900 dark:via-slate-900/40 to-transparent" />

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-7xl md:text-8xl drop-shadow-2xl">
          {CATEGORY_EMOJI[event.category] || '✨'}
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-20 sm:-mt-24 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pl-1 pr-1 lg:pl-0 lg:pr-0">
          
          {/* Left Column: Details */}
          <div className="lg:col-span-7 xl:col-span-8 flex flex-col pt-4">
            
            <div className="mb-4">
              <span className="inline-flex items-center rounded-full bg-brand-100 px-3.5 py-1 text-xs font-bold text-brand-700 border border-brand-200 dark:bg-brand-500/20 dark:text-brand-300 dark:border-brand-500/30 backdrop-blur-sm shadow-sm">
                {event.category}
              </span>
            </div>

            <h1 className="font-heading font-black text-3xl sm:text-4xl md:text-5xl text-slate-900 dark:text-white leading-tight mb-8">
              {event.title}
            </h1>

            {/* Meta Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4 mb-10">
              <div className="flex items-start gap-4 text-slate-700 dark:text-slate-300">
                <div className="p-3 rounded-2xl bg-brand-50 dark:bg-brand-900/30 text-brand-500">
                  <FiCalendar className="text-xl" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">Date</p>
                  <p className="font-medium">{format(new Date(event.date), 'EEEE, MMMM d, yyyy')}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 text-slate-700 dark:text-slate-300">
                <div className="p-3 rounded-2xl bg-pink-50 dark:bg-pink-900/30 text-pink-500">
                  <FiClock className="text-xl" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">Time</p>
                  <p className="font-medium">{format(new Date(event.date), 'h:mm a')}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 text-slate-700 dark:text-slate-300">
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-900/30 text-amber-500">
                  <FiMapPin className="text-xl" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">Location</p>
                  <p className="font-medium break-words pr-2">{event.location}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 text-slate-700 dark:text-slate-300">
                <div className="p-3 rounded-2xl bg-cyan-50 dark:bg-cyan-900/30 text-cyan-500">
                  <FiUsers className="text-xl" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-1">Availability</p>
                  <p className="font-medium">{event.availableSeats} of {event.totalSeats} seats</p>
                </div>
              </div>
            </div>

            {/* Seat Progress */}
            <div className="mb-10 p-5 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-slate-800/30">
              <div className="flex justify-between items-end mb-3">
                <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">Capacity filled</span>
                <span className="text-lg font-heading text-brand-600 dark:text-brand-400 font-bold">{bookingPercent}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-700/50 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ease-out ${bookingPercent >= 90 ? 'bg-gradient-to-r from-rose-500 to-red-500' : 'bg-gradient-to-r from-brand-600 to-pink-500'}`}
                  style={{ width: `${bookingPercent}%` }}
                />
              </div>
              {bookingPercent >= 90 && !isSoldOut && (
                <p className="text-xs text-rose-500 mt-2 font-medium flex items-center gap-1"><FiAlertCircle /> Selling out fast!</p>
              )}
            </div>

            {/* Description Area */}
            <div className="mb-10">
              <h2 className="font-heading font-bold text-2xl text-slate-900 dark:text-white mb-4">About this experience</h2>
              <div className="glass-card rounded-2xl p-6 sm:p-8">
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-[1.05rem] whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            </div>

            {/* Organizer Details */}
            <div className="flex items-center gap-4 py-6 border-t border-slate-200 dark:border-white/10">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-500 to-pink-500 flex items-center justify-center text-white text-xl font-bold shadow-md">
                {event.organizer?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-semibold mb-1">Event Organizer</p>
                <p className="font-heading font-bold text-lg text-slate-900 dark:text-slate-100">{event.organizer?.name}</p>
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Booking Widget */}
          <div className="lg:col-span-5 xl:col-span-4 lg:pt-4">
            <div className="sticky top-28 glass-card rounded-3xl p-6 sm:p-8 shadow-xl shadow-brand-500/5 border border-white/40 dark:border-white/10">
              
              <div className="flex items-baseline gap-2 mb-8">
                <span className="font-heading font-black text-4xl sm:text-5xl text-slate-900 dark:text-white tracking-tight">
                  {event.price === 0 ? 'FREE' : `₹${event.price}`}
                </span>
                {event.price > 0 && <span className="text-slate-500 font-medium">/ ticket</span>}
              </div>

              {analytics && (
                <div className="flex gap-4 mb-8">
                  <div className="flex-1 bg-brand-50 dark:bg-brand-500/10 rounded-2xl p-4">
                    <p className="font-heading text-2xl font-bold text-brand-600 dark:text-brand-400 mb-0.5">{analytics.totalBookings}</p>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Bookings</p>
                  </div>
                  <div className="flex-1 bg-pink-50 dark:bg-pink-500/10 rounded-2xl p-4">
                    <p className="font-heading text-2xl font-bold text-pink-600 dark:text-pink-400 mb-0.5">₹{analytics.revenue}</p>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Revenue</p>
                  </div>
                </div>
              )}

              {!isPast && !event.isCancelled ? (
                <>
                  {!isSoldOut && (
                    <div className="mb-6">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                        Select Quantity
                      </label>
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={() => setTickets(t => Math.max(1, t - 1))}
                          className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xl font-medium"
                        >−</button>
                        <span className="font-heading font-bold text-2xl text-slate-900 dark:text-white w-8 text-center">{tickets}</span>
                        <button 
                          onClick={() => setTickets(t => Math.min(Math.min(10, event.availableSeats), t + 1))}
                          className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xl font-medium"
                        >+</button>
                      </div>
                      
                      {event.price > 0 && (
                        <div className="mt-6 flex justify-between items-center py-4 border-t border-b border-slate-100 dark:border-white/5">
                          <span className="font-medium text-slate-600 dark:text-slate-400">Total Price</span>
                          <span className="font-heading font-bold text-xl text-brand-600 dark:text-brand-400">₹{event.price * tickets}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={handleBook} 
                    disabled={booking}
                    className={`w-full flex items-center justify-center gap-2 py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${
                      isSoldOut 
                        ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:shadow-xl' 
                        : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/25 hover:shadow-brand-500/40 hover:-translate-y-0.5'
                    }`}
                  >
                    {booking ? 'Processing...' : isSoldOut ? (
                      <><HiLightningBolt className="text-xl" /> Join Waitlist</>
                    ) : (
                      <><FiCheck className="text-xl" /> Reserve {tickets} Ticket{tickets > 1 ? 's' : ''}</>
                    )}
                  </button>

                  {isSoldOut && (
                    <p className="text-center text-sm font-medium text-slate-500 mt-4">
                      All seats booked! Join the waitlist to be notified of openings.
                    </p>
                  )}
                </>
              ) : (
                <div className={`text-center p-4 rounded-2xl font-bold flex flex-col items-center gap-2 ${
                  isPast 
                    ? 'bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-400' 
                    : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                }`}>
                  <span className="text-2xl">{isPast ? '⏰' : '❌'}</span>
                  <span>{isPast ? 'This event has concluded' : 'This event was cancelled'}</span>
                </div>
              )}

              {/* Trust badges */}
              <div className="mt-8 space-y-3">
                {['Instant digital ticket confirmation', 'Risk-free secure checkout', '24/7 dedicated support'].map(feature => (
                  <div key={feature} className="flex items-center gap-3 text-sm font-medium text-slate-500 dark:text-slate-400">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <FiCheck className="text-[10px] sm:text-xs" />
                    </div>
                    {feature}
                  </div>
                ))}
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default EventDetail;
