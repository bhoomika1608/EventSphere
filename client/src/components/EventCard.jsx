import { Link } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiTag, FiUsers } from 'react-icons/fi';
import { format } from 'date-fns';

const CATEGORY_COLORS = {
  Tech: { bg: 'bg-cyan-500/15', color: 'text-cyan-400', border: 'border-cyan-400/30' },
  Music: { bg: 'bg-pink-500/15', color: 'text-pink-400', border: 'border-pink-400/30' },
  Sports: { bg: 'bg-emerald-500/15', color: 'text-emerald-400', border: 'border-emerald-400/30' },
  Art: { bg: 'bg-amber-500/15', color: 'text-amber-400', border: 'border-amber-400/30' },
  Food: { bg: 'bg-red-500/15', color: 'text-red-400', border: 'border-red-400/30' },
  Business: { bg: 'bg-brand-500/15', color: 'text-brand-400', border: 'border-brand-400/30' },
  Health: { bg: 'bg-teal-500/15', color: 'text-teal-400', border: 'border-teal-400/30' },
  Education: { bg: 'bg-indigo-500/15', color: 'text-indigo-400', border: 'border-indigo-400/30' },
  Other: { bg: 'bg-slate-500/15', color: 'text-slate-400', border: 'border-slate-400/30' },
};

const CATEGORY_ICONS = {
  Tech: '💻', Music: '🎵', Sports: '⚽', Art: '🎨', Food: '🍽️', Business: '💼', Health: '🏥', Education: '📚', Other: '✨'
};

const EventCard = ({ event }) => {
  const { bg, color, border } = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.Other;
  const isSoldOut = event.availableSeats === 0;
  const isAlmostFull = !isSoldOut && event.availableSeats <= Math.ceil(event.totalSeats * 0.1);

  return (
    <Link to={`/events/${event._id}`} className="block h-full decoration-transparent group">
      <div className="glass-card h-full flex flex-col rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300">
        
        {/* Banner Image */}
        <div className="h-48 relative overflow-hidden bg-gradient-to-br from-brand-600/40 to-pink-600/30">
          {event.imageUrl ? (
            <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand-600/50 via-pink-600/40 to-cyan-500/30 flex items-center justify-center text-5xl group-hover:scale-110 transition-transform duration-500">
              {CATEGORY_ICONS[event.category] || CATEGORY_ICONS.Other}
            </div>
          )}

          {/* Category badge */}
          <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border shadow-sm ${bg} ${color} ${border}`}>
            {event.category}
          </div>

          {/* Status Overlay */}
          {isSoldOut && (
            <div className="absolute top-3 right-3 bg-rose-500/90 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
              SOLD OUT
            </div>
          )}
          {isAlmostFull && !isSoldOut && (
            <div className="absolute top-3 right-3 bg-amber-500/90 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
              ALMOST FULL
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col flex-1 gap-3">
          <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-slate-100 leading-tight line-clamp-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
            {event.title}
          </h3>

          <div className="flex flex-col gap-2 mt-auto">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <FiCalendar className="text-brand-500 dark:text-brand-400 shrink-0" />
              <span>{format(new Date(event.date), 'MMM d, yyyy • h:mm a')}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <FiMapPin className="text-pink-500 dark:text-pink-400 shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <FiUsers className="text-cyan-500 dark:text-cyan-400 shrink-0" />
              <span>{isSoldOut ? 'No seats left' : `${event.availableSeats} of ${event.totalSeats} seats left`}</span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px w-full bg-slate-200 dark:bg-white/10 my-1"></div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-1">
            <span className="font-heading font-bold text-lg text-brand-700 dark:text-brand-400">
              {event.price === 0 ? 'FREE' : `₹${event.price}`}
            </span>
            <span className="px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors bg-brand-50 border-brand-200 text-brand-700 hover:bg-brand-100 dark:bg-brand-500/10 dark:border-brand-500/30 dark:text-brand-300 dark:group-hover:bg-brand-500/20">
              {isSoldOut ? 'Waitlist' : 'Book Now'}
            </span>
          </div>
        </div>
        
      </div>
    </Link>
  );
};

export default EventCard;
