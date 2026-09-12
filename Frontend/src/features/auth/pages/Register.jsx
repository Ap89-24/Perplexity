import React, { useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import ThemeToggle from '../../../components/ThemeToggle';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router';


const Register = () => {
    const { isDark } = useTheme();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const { handleRegister } = useAuth();
    const navigate = useNavigate();

    const calculatePasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z\d]/.test(password)) strength++;
        return strength;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === 'password') {
            setPasswordStrength(calculatePasswordStrength(value));
        }

        if (error) setError('');
        if (success) setSuccess('');
    };

    const validateForm = () => {
        if (!formData.username.trim()) {
            setError('Username is required');
            return false;
        }
        if (formData.username.length < 3) {
            setError('Username must be at least 3 characters');
            return false;
        }
        if (!formData.email) {
            setError('Email is required');
            return false;
        }
        if (formData.password.length < 8) {
            setError('Password must be at least 8 characters');
            return false;
        }
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }
        const response = await handleRegister(formData);
        navigate("/login");
        
        if (response.ok) {
            setSuccess('Registration successful! Please check your email to verify your account.');
            setFormData({
                username: '',
                email: '',
                password: '',
                confirmPassword: '',
            });
            setPasswordStrength(0);
            // Redirect to login after 2 seconds
            setTimeout(() => {
                // navigate('/login');
            }, 2000);
        }
            
    };
    

    const getPasswordStrengthColor = () => {
        if (passwordStrength === 0) return isDark ? 'bg-slate-600' : 'bg-slate-300';
        if (passwordStrength <= 2) return 'bg-red-500';
        if (passwordStrength <= 3) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getPasswordStrengthText = () => {
        if (passwordStrength === 0) return '';
        if (passwordStrength <= 2) return 'Weak';
        if (passwordStrength <= 3) return 'Fair';
        return 'Strong';
    };

    return (
        <div className="auth-shell relative flex min-h-screen items-center justify-center px-4 py-10">
            <div className="w-full max-w-[400px]">
                <div className="auth-card rounded-2xl shadow-sm">
                    <div className="border-b chat-border px-8 pt-8 pb-6 text-center">
                        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--chat-accent)] text-white">
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-semibold tracking-tight">Create account</h2>
                        <p className="mt-2 text-sm chat-text-secondary">
                            Join Nexora and explore amazing features
                        </p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="px-6 sm:px-8 py-8 space-y-4">
                        {/* Error Message */}
                        {error && (
                            <div className={`p-4 rounded-lg border-l-4 transition-colors duration-300 ${isDark
                                ? 'bg-red-900/30 border-red-500 text-red-200'
                                : 'bg-red-50 border-red-500 text-red-700'
                                }`}>
                                <p className="text-sm font-medium">{error}</p>
                            </div>
                        )}

                        {/* Success Message */}
                        {success && (
                            <div className={`p-4 rounded-lg border-l-4 transition-colors duration-300 ${isDark
                                ? 'bg-green-900/30 border-green-500 text-green-200'
                                : 'bg-green-50 border-green-500 text-green-700'
                                }`}>
                                <p className="text-sm font-medium">{success}</p>
                            </div>
                        )}

                        {/* Username Field */}
                        <div>
                            <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'
                                }`}>
                                Username
                            </label>
                            <input
                                type="text"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                placeholder="Choose a username"
                                required
                                className={`w-full px-4 py-3 rounded-lg transition-all duration-300 border outline-none focus:ring-2 ${isDark
                                    ? 'bg-slate-700/50 border-slate-600 text-white placeholder-slate-500 focus:border-purple-500 focus:ring-purple-500/20'
                                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500/20'
                                    }`}
                            />
                            <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-500'}`}>
                                3-20 characters, letters and numbers only
                            </p>
                        </div>

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
                                    ? 'bg-slate-700/50 border-slate-600 text-white placeholder-slate-500 focus:border-purple-500 focus:ring-purple-500/20'
                                    : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-purple-500 focus:ring-purple-500/20'
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

                            {/* Password Strength Indicator */}
                            {formData.password && (
                                <div className="mt-2">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'
                                            }`}>
                                            Password Strength
                                        </span>
                                        <span className={`text-xs font-bold ${passwordStrength <= 2 ? 'text-red-500' :
                                            passwordStrength <= 3 ? 'text-yellow-500' :
                                                'text-green-500'
                                            }`}>
                                            {getPasswordStrengthText()}
                                        </span>
                                    </div>
                                    <div className={`flex gap-1 h-1.5 rounded-full overflow-hidden ${isDark ? 'bg-slate-700' : 'bg-slate-300'
                                        }`}>
                                        {[...Array(5)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={`flex-1 rounded-full transition-all duration-300 ${i < passwordStrength ? getPasswordStrengthColor() : isDark ? 'bg-slate-700' : 'bg-slate-300'
                                                    }`}
                                            ></div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password Field */}
                        <div>
                            <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-700'
                                }`}>
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
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
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className={`absolute right-3 top-3 transition-colors duration-300 ${isDark ? 'text-slate-400 hover:text-slate-300' : 'text-slate-500 hover:text-slate-700'
                                        }`}
                                >
                                    {showConfirmPassword ? (
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

                        {/* Terms Checkbox */}
                        <label className="flex items-start cursor-pointer mt-4">
                            <input
                                type="checkbox"
                                required
                                className={`w-4 h-4 mt-1 rounded border-2 transition-colors duration-300 ${isDark
                                    ? 'border-slate-600 bg-slate-700 accent-violet-500'
                                    : 'border-slate-300 bg-white accent-violet-500'
                                    }`}
                            />
                            <span className={`ml-2 text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                                I agree to the Terms of Service and Privacy Policy
                            </span>
                        </label>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex w-full items-center justify-center gap-2 rounded-lg py-3 font-semibold text-white transition-all mt-6 ${loading
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
                                    Creating Account...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </button>

                    </form>

                    {/* Footer */}
                    <div className="border-t chat-border px-8 py-5 text-center">
                        <p className="text-sm chat-text-secondary">
                            Already have an account?{' '}
                            <Link to="/login" className="font-semibold text-[var(--chat-accent)] hover:opacity-80">
                                Log in
                            </Link>
                        </p>
                    </div>
                </div>

                <p className="mt-5 text-center text-xs chat-text-muted">
                    We'll never share your data with third parties
                </p>
            </div>
        </div>
    );
};

export default Register;
