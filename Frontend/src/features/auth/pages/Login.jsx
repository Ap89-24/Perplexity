import React, { useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import ThemeToggle from '../../../components/ThemeToggle';
import { Link } from 'react-router-dom';
import { Navigate, useNavigate } from 'react-router';
import { useAuth } from '../hooks/useAuth.js';
import { useSelector } from 'react-redux';


const Login = () => {
    const { isDark } = useTheme(); // used for error/checkbox styling
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { handleLogin } = useAuth();
    const navigate = useNavigate();
    const user = useSelector(state => state.auth.user);
    const loadings = useSelector(state => state.auth.loading);

    if (!loadings && user) {
        return <Navigate to="/" replace />
    }

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
        await handleLogin(formData);
        navigate("/");
        if(error) setError("First verify your account")

      
    };

    return (
        <div className="auth-shell relative flex min-h-screen items-center justify-center px-4">
            <div className="w-full max-w-[400px]">
                <div className="auth-card rounded-2xl shadow-sm">
                    <div className="border-b chat-border px-8 pt-8 pb-6 text-center">
                        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--chat-accent)] text-white">
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-semibold tracking-tight">Welcome back</h2>
                        <p className="mt-2 text-sm chat-text-secondary">
                            Registration successful! Please check your email to verify your account.
                        </p>
                        <p className="mt-1 text-sm chat-text-secondary">
                            Then log in to your Nexora account
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
                            <label className="mb-2 block text-sm font-medium chat-text-secondary">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="you@example.com"
                                required
                                className="auth-input w-full rounded-lg px-4 py-3 text-sm transition-colors"
                            />
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="mb-2 block text-sm font-medium chat-text-secondary">
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
                                    className="auth-input w-full rounded-lg px-4 py-3 pr-12 text-sm transition-colors"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 chat-text-muted transition-opacity hover:opacity-70"
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
                                    className="h-4 w-4 rounded border chat-border accent-[var(--chat-accent)]"
                                />
                                <span className="ml-2 chat-text-secondary">
                                    Remember me
                                </span>
                            </label>
                            <a href="#" className="font-medium text-[var(--chat-accent)] hover:opacity-80 transition-opacity">
                                Forgot password?
                            </a>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex w-full items-center justify-center gap-2 rounded-lg py-3 font-semibold text-white transition-all ${loading
                                ? 'cursor-not-allowed bg-[var(--chat-text-muted)]'
                                : 'bg-[var(--chat-accent)] hover:opacity-90 active:scale-[0.98]'
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
                    <div className="border-t chat-border px-8 py-5 text-center">
                        <p className="text-sm chat-text-secondary">
                            Don't have an account?{' '}
                            <Link to="/register" className="font-semibold text-[var(--chat-accent)] hover:opacity-80">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="mt-5 text-center text-xs chat-text-muted">
                    By logging in, you agree to our Terms of Service and Privacy Policy
                </p>
            </div>
        </div>
    );
};

export default Login;
