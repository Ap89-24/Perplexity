import React, { useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { Link } from 'react-router-dom';

const Login = () => {
    const { isDark, toggleTheme } = useTheme();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Simulate API call
            console.log('Login attempt with:', formData);

            // Replace with actual API endpoint
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                // Handle successful login
                localStorage.setItem('token', data.token);
                console.log('Login successful:', data);
                // Redirect to dashboard or home page
                // navigate('/dashboard');
            } else {
                setError(data.message || 'Login failed. Please try again.');
            }
        } catch (err) {
            setError('Network error. Please check your connection.');
            console.error('Login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${isDark
            ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'
            : 'bg-gradient-to-br from-purple-50 via-fuchsia-50 to-purple-100'
            }`}>
            {/* Background animated elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute -top-40 -right-40 w-80 h-80 rounded-full blur-3xl transition-colors duration-300 ${isDark
                    ? 'bg-fuchsia-500/20'
                    : 'bg-fuchsia-400/30'
                    }`}></div>
                <div className={`absolute -bottom-40 -left-40 w-80 h-80 rounded-full blur-3xl transition-colors duration-300 ${isDark
                    ? 'bg-purple-500/20'
                    : 'bg-purple-400/30'
                    }`}></div>
            </div>

            {/* Theme Toggle Button */}
            <button
                onClick={toggleTheme}
                className={`absolute top-4 right-4 sm:top-6 sm:right-6 p-2 rounded-full transition-all duration-300 ${isDark
                    ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700'
                    : 'bg-white text-slate-700 hover:bg-slate-100 shadow-lg'
                    }`}
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
                {isDark ? (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.707.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zm5.657-9.193a1 1 0 00-1.414 0l-.707.707A1 1 0 005.05 6.464l.707-.707a1 1 0 001.414-1.414zM5 8a1 1 0 100-2H4a1 1 0 100 2h1z" clipRule="evenodd" />
                    </svg>
                ) : (
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                )}
            </button>

            {/* Login Card */}
            <div className="relative z-10 w-full max-w-md px-6 sm:px-8">
                <div className={`rounded-2xl backdrop-blur-xl transition-all duration-300 ${isDark
                    ? 'bg-slate-800/50 border border-slate-700/50 shadow-2xl shadow-slate-900/50'
                    : 'bg-white/80 border border-white/60 shadow-2xl shadow-purple-500/10'
                    }`}>
                    {/* Header */}
                    <div className="px-6 sm:px-8 pt-8 pb-6 text-center border-b border-opacity-20 border-slate-400">
                        <div className={`w-12 h-12 mx-auto mb-4 rounded-xl bg-gradient-to-br from-fuchsia-400 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/50`}>
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-slate-900'
                            }`}>Welcome Back</h2>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            Login to your Nexora account
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-8 space-y-5">
                        {/* Error Message */}
                        {error && (
                            <div className={`p-4 rounded-lg border-l-4 transition-colors duration-300 ${isDark
                                ? 'bg-red-900/30 border-red-500 text-red-200'
                                : 'bg-red-50 border-red-500 text-red-700'
                                }`}>
                                <p className="text-sm font-medium">{error}</p>
                            </div>
                        )}

                        {/* Email Field */}
                        <div>
                            <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'
                                }`}>
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                required
                                className={`w-full px-4 py-3 rounded-lg transition-all duration-300 border outline-none focus:ring-2 ${isDark
                                    ? 'bg-slate-700/50 border-slate-600 text-white placeholder-slate-500 focus:border-fuchsia-500 focus:ring-fuchsia-500/20'
                                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-fuchsia-500 focus:ring-fuchsia-500/20'
                                    }`}
                            />
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'
                                }`}>
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    required
                                    className={`w-full px-4 py-3 rounded-lg transition-all duration-300 border outline-none focus:ring-2 pr-12 ${isDark
                                        ? 'bg-slate-700/50 border-slate-600 text-white placeholder-slate-500 focus:border-purple-500 focus:ring-purple-500/20'
                                        : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500/20'
                                        }`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className={`absolute right-3 top-3 transition-colors duration-300 ${isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14zM10 12a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className={`w-4 h-4 rounded border-2 transition-colors duration-300 ${isDark
                                        ? 'border-slate-600 bg-slate-700 accent-fuchsia-500'
                                        : 'border-slate-300 bg-white accent-fuchsia-500'
                                        }`}
                                />
                                <span className={`ml-2 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                    Remember me
                                </span>
                            </label>
                            <a href="#" className="text-fuchsia-500 hover:text-fuchsia-400 font-medium transition-colors duration-300">
                                Forgot password?
                            </a>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 rounded-lg font-bold text-white transition-all duration-300 flex items-center justify-center gap-2 ${loading
                                ? 'bg-slate-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-fuchsia-500 to-purple-500 hover:shadow-lg hover:shadow-fuchsia-500/30 active:scale-95'
                                }`}
                        >
                            {loading ? (
                                <>
                                    <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Logging in...
                                </>
                            ) : (
                                'Login'
                            )}
                        </button>

                    </form>

                    {/* Footer */}
                    <div className={`px-6 sm:px-8 py-6 border-t border-opacity-20 border-slate-400 text-center ${isDark ? 'bg-slate-900/30' : 'bg-slate-50/50'
                        }`}>
                        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                            Don't have an account?{' '}
                            <Link
                                to="/register"
                                className="text-fuchsia-500 hover:text-fuchsia-400 font-bold transition-colors duration-300"
                            >
                                Sign up here
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Bottom text */}
                <p className={`text-center mt-6 text-xs ${isDark ? 'text-slate-500' : 'text-slate-600'}`}>
                    By logging in, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </div>
    );
};

export default Login;
