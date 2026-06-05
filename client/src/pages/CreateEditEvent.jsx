import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FiArrowLeft, FiSave } from 'react-icons/fi';

const CATEGORIES = ['Tech', 'Music', 'Sports', 'Art', 'Food', 'Business', 'Health', 'Education', 'Other'];

const DEFAULT_FORM = {
  title: '', description: '', category: 'Tech',
  date: '', location: '', price: '', totalSeats: '', imageUrl: '',
};

const CreateEditEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isEditing) return;
    api.get(`/events/${id}`)
      .then(res => {
        const ev = res.data.event;
        setForm({
          title: ev.title, description: ev.description, category: ev.category,
          date: ev.date ? new Date(ev.date).toISOString().slice(0, 16) : '',
          location: ev.location, price: ev.price, totalSeats: ev.totalSeats, imageUrl: ev.imageUrl || '',
        });
      })
      .catch(() => { toast.error('Event not found'); navigate('/organizer'); })
      .finally(() => setLoading(false));
  }, [id, isEditing, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.date || !form.location || form.price === '' || !form.totalSeats) {
      return toast.error('Please fill in all required fields');
    }
    if (Number(form.price) < 0) return toast.error('Price cannot be negative');
    if (Number(form.totalSeats) < 1) return toast.error('Total seats must be at least 1');

    setSubmitting(true);
    try {
      if (isEditing) {
        await api.put(`/events/${id}`, form);
        toast.success('Event updated!');
      } else {
        await api.post('/events', form);
        toast.success('Event created! 🎉');
      }
      navigate('/organizer');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save event');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-[60vh] text-slate-500 font-medium">Loading...</div>;

  const fields = [
    { label: 'Event Title *', name: 'title', type: 'text', placeholder: 'e.g. React Conf 2024', required: true, className: "col-span-full md:col-span-2" },
    { label: 'Location *', name: 'location', type: 'text', placeholder: 'e.g. Mumbai, Maharashtra', required: true, className: "col-span-full md:col-span-2" },
    { label: 'Date & Time *', name: 'date', type: 'datetime-local', required: true, className: "col-span-1" },
    { label: 'Price (₹) *', name: 'price', type: 'number', placeholder: '0 for free events', required: true, min: 0, className: "col-span-1" },
    { label: 'Total Seats *', name: 'totalSeats', type: 'number', placeholder: 'e.g. 100', required: true, min: 1, className: "col-span-1" },
    { label: 'Image URL (optional)', name: 'imageUrl', type: 'url', placeholder: 'https://example.com/image.jpg', className: "col-span-full md:col-span-2" },
  ];

  return (
    <div className="min-h-screen py-8 pb-16 bg-slate-50 dark:bg-[#0f0f19]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back */}
        <button 
          onClick={() => navigate('/organizer')} 
          className="flex items-center gap-2 text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 font-medium transition-colors mb-8"
        >
          <FiArrowLeft /> Back to dashboard
        </button>

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-slate-900 dark:text-white mb-2">
            {isEditing ? '✏️ Edit Event' : '🎪 Create Event'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            {isEditing ? 'Update event details' : 'Fill in the details to create a new event'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900/50 backdrop-blur-md rounded-2xl md:rounded-3xl p-6 md:p-8 border border-slate-200 dark:border-white/10 shadow-xl shadow-brand-500/5">
          <div className="flex flex-col gap-6">
            
            {/* Grid for inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {fields.map(f => (
                <div key={f.name} className={f.className}>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    {f.label}
                  </label>
                  <input
                    type={f.type} name={f.name} value={form[f.name]}
                    onChange={handleChange} placeholder={f.placeholder}
                    required={f.required} min={f.min}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none transition-all"
                  />
                </div>
              ))}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                Category *
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button 
                    key={cat} 
                    type="button" 
                    onClick={() => setForm({ ...form, category: cat })}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all border ${
                      form.category === cat 
                        ? 'border-brand-500 bg-brand-50 text-brand-700 dark:border-brand-500/50 dark:bg-brand-500/20 dark:text-brand-300 shadow-sm' 
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-400 dark:hover:bg-slate-800'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Description *
              </label>
              <textarea
                name="description" value={form.description} onChange={handleChange}
                placeholder="Describe your event in detail..." required rows={6}
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none transition-all resize-y"
              />
            </div>

            {/* Submit */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
              <button 
                type="submit" 
                disabled={submitting} 
                className="flex-1 flex justify-center items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-brand-500/25 transition-all focus:ring-4 focus:ring-brand-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <FiSave /> {submitting ? 'Saving...' : isEditing ? 'Update Event' : 'Create Event'}
              </button>
              <button 
                type="button" 
                onClick={() => navigate('/organizer')} 
                className="flex justify-center items-center font-semibold py-3.5 px-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 transition-colors"
              >
                Cancel
              </button>
            </div>
            
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEditEvent;
