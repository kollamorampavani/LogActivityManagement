import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Mail, Lock, CheckCircle, ArrowLeft } from 'lucide-react';
import api from '../services/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState({ text: '', type: '' });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });

        if (newPassword !== confirmPassword) {
            return setMessage({ text: 'Passwords do not match', type: 'error' });
        }

        try {
            const res = await api.post('/auth/forgot-password', { email, newPassword });
            setMessage({ text: res.data.message || 'Password reset successfully!', type: 'success' });
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Password reset failed', type: 'error' });
        }
    };

    return (
        <div className="flex-grow flex items-center justify-center py-12 animate-fade-in-up">
            <div className="w-full max-w-md bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 transition-colors duration-300">
                <div className="flex flex-col items-center mb-8">
                    <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-xl text-indigo-600 dark:text-indigo-400 mb-4 transition-colors duration-300">
                        <Activity className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Reset Password</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Enter your email and new password</p>
                </div>

                {message.text && (
                    <div className={`p-4 rounded-lg mb-6 text-sm font-medium flex items-center ${message.type === 'error' ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400'}`}>
                        {message.type === 'success' && <CheckCircle className="h-5 w-5 mr-2" />}
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input 
                                type="email" 
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-colors duration-300"
                                placeholder="you@example.com" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input 
                                type="password" 
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-colors duration-300"
                                placeholder="••••••••" 
                                value={newPassword} 
                                onChange={(e) => setNewPassword(e.target.value)} 
                                required 
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                            <input 
                                type="password" 
                                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-colors duration-300"
                                placeholder="••••••••" 
                                value={confirmPassword} 
                                onChange={(e) => setConfirmPassword(e.target.value)} 
                                required 
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-sm"
                    >
                        Reset Password
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link to="/login" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 inline-flex items-center transition">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
