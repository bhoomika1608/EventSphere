import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      if (res.data.user.role === 'admin') navigate('/admin');
      else if (res.data.user.role === 'organizer') navigate('/organizer');
      else navigate(from);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-slate-50 dark:bg-[#0f0f19]">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-brand-600/10 via-brand-600/5 to-transparent blur-3xl -z-10 pointer-events-none" />

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl mx-auto mb-4 bg-gradient-to-br from-brand-600 to-pink-600 flex items-center justify-center shadow-lg shadow-brand-500/30">
            <HiSparkles className="text-white text-3xl" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Welcome back
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Sign in to your EventSphere account</p>
        </div>

        {/* Form Card */}
        <div className="glass-card rounded-3xl p-8 shadow-xl shadow-brand-500/5 border border-white/50 dark:border-white/10">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input
                  type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder="you@example.com" required
                  className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg" />
                <input
                  type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                  placeholder="••••••••" required
                  className="w-full bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-xl py-3.5 pl-11 pr-12 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500 outline-none transition-all"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  {showPass ? <FiEyeOff className="text-lg" /> : <FiEye className="text-lg" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full mt-2 bg-brand-600 hover:bg-brand-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-brand-500/25 transition-all focus:ring-4 focus:ring-brand-500/20 disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="h-px bg-slate-200 dark:bg-white/10 flex-1" />
            <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider">or</span>
            <div className="h-px bg-slate-200 dark:bg-white/10 flex-1" />
          </div>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
              Create one →
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
