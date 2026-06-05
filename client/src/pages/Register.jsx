import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';

const Register = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const res = await api.post('/auth/signup', form);
      login(res.data.token, res.data.user);
      toast.success('Account created! Welcome to EventSphere 🎉');
      if (res.data.user.role === 'organizer') navigate('/organizer');
      else navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-slate-50 dark:bg-[#0f0f19] pt-24 pb-12">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-pink-600/10 via-brand-600/5 to-transparent blur-3xl -z-10 pointer-events-none" />

      <div className="w-full max-w-[28rem] relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 bg-gradient-to-br from-pink-500 to-brand-600 flex items-center justify-center shadow-lg shadow-pink-500/30">
            <HiSparkles className="text-white text-3xl" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Create account
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Join thousands using EventSphere</p>
        </div>

        <div className="glass-card rounded-3xl p-8 shadow-xl shadow-brand-500/5 border border-white/50 dark:border-white/10">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Full Name</label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input type="text" name="name" value={form.name} onChange={handleChange}
                  placeholder="Your full name" required minLength={2}
                  className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none transition-all" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder="you@example.com" required
                  className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none transition-all" />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Password</label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                  placeholder="Min. 6 characters" required minLength={6}
                  className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-11 pr-12 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none transition-all" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  {showPass ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
                </button>
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">I want to</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'user', label: '🎟️ Attend Events' },
                  { value: 'organizer', label: '🎪 Host Events' },
                ].map(opt => (
                  <button 
                    key={opt.value} 
                    type="button" 
                    onClick={() => setForm({ ...form, role: opt.value })}
                    className={`py-3 px-2 rounded-xl font-semibold text-sm transition-all border ${
                      form.role === opt.value 
                        ? 'border-pink-500 bg-pink-50 text-pink-700 dark:border-pink-500/50 dark:bg-pink-500/20 dark:text-pink-300 shadow-sm' 
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900/50 dark:text-slate-400 dark:hover:bg-slate-800'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full mt-2 bg-gradient-to-r from-brand-600 to-pink-600 hover:from-brand-500 hover:to-pink-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-pink-500/25 transition-all focus:ring-4 focus:ring-pink-500/20 disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="h-px bg-slate-200 dark:bg-white/10 flex-1" />
            <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">or</span>
            <div className="h-px bg-slate-200 dark:bg-white/10 flex-1" />
          </div>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-pink-600 dark:text-pink-400 hover:underline">
              Sign in →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
