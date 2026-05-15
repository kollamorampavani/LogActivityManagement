import { useState, useEffect } from 'react';
import api from '../services/api';
import { User, Mail, Calendar, Shield, Edit2, X } from 'lucide-react';

const Profile = () => {
    const [profile, setProfile] = useState(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });
    
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingEmail, setIsEditingEmail] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await api.get('/auth/profile');
                setProfile(res.data);
                setName(res.data.name);
                setEmail(res.data.email);
            } catch (err) {
                console.error(err);
                setMessage({ text: 'Failed to load profile', type: 'error' });
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: '', type: '' });
        try {
            const res = await api.put('/auth/profile', { name, email });
            setProfile({ ...profile, name: res.data.name, email: res.data.email });
            
            // Update local storage user to reflect changes everywhere immediately
            const localUser = JSON.parse(localStorage.getItem('user'));
            if(localUser) {
                localUser.name = res.data.name;
                localUser.email = res.data.email;
                localStorage.setItem('user', JSON.stringify(localUser));
            }

            setMessage({ text: 'Profile updated successfully', type: 'success' });
            setIsEditingName(false);
            setIsEditingEmail(false);
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        } catch (err) {
            setMessage({ text: err.response?.data?.message || 'Update failed', type: 'error' });
        }
    };

    if (loading) return <div className="text-center py-20 text-gray-500 dark:text-gray-400 animate-pulse font-medium">Loading profile...</div>;

    return (
        <div className="max-w-2xl mx-auto space-y-8 animate-fade-in-up">
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors duration-300">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6 flex items-center">
                    <User className="mr-3 h-6 w-6 text-indigo-500" />
                    My Profile
                </h2>

                {message.text && (
                    <div className={`p-4 rounded-lg mb-6 text-sm font-medium ${message.type === 'error' ? 'bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400' : 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400'}`}>
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    <div className="flex items-center p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl transition-colors duration-300">
                        <Shield className="h-8 w-8 text-indigo-400 mr-4" />
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider">Role</p>
                            <p className="text-lg font-medium text-gray-900 dark:text-white capitalize">{profile?.role}</p>
                        </div>
                    </div>
                    <div className="flex items-center p-4 bg-gray-50 dark:bg-slate-700/50 rounded-xl transition-colors duration-300">
                        <Calendar className="h-8 w-8 text-indigo-400 mr-4" />
                        <div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider">Joined Date</p>
                            <p className="text-lg font-medium text-gray-900 dark:text-white">
                                {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                        {isEditingName ? (
                            <div className="flex space-x-2">
                                <div className="relative flex-grow">
                                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                    <input 
                                        type="text" 
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-colors duration-300"
                                        value={name} 
                                        onChange={(e) => setName(e.target.value)} 
                                        required 
                                        autoFocus
                                    />
                                </div>
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setName(profile.name);
                                        setIsEditingName(false);
                                    }} 
                                    className="px-4 py-3 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition flex items-center justify-center"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex justify-between items-center bg-gray-50 dark:bg-slate-700/50 p-4 rounded-xl border border-transparent dark:border-slate-600">
                                <div className="flex items-center text-gray-900 dark:text-white">
                                    <User className="text-gray-400 h-5 w-5 mr-3" />
                                    <span className="font-medium text-lg">{name}</span>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={() => setIsEditingName(true)} 
                                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-600 transition"
                                >
                                    <Edit2 className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                        {isEditingEmail ? (
                            <div className="flex space-x-2">
                                <div className="relative flex-grow">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                    <input 
                                        type="email" 
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-colors duration-300"
                                        value={email} 
                                        onChange={(e) => setEmail(e.target.value)} 
                                        required 
                                        autoFocus
                                    />
                                </div>
                                <button 
                                    type="button" 
                                    onClick={() => {
                                        setEmail(profile.email);
                                        setIsEditingEmail(false);
                                    }} 
                                    className="px-4 py-3 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition flex items-center justify-center"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>
                        ) : (
                            <div className="flex justify-between items-center bg-gray-50 dark:bg-slate-700/50 p-4 rounded-xl border border-transparent dark:border-slate-600">
                                <div className="flex items-center text-gray-900 dark:text-white">
                                    <Mail className="text-gray-400 h-5 w-5 mr-3" />
                                    <span className="font-medium text-lg">{email}</span>
                                </div>
                                <button 
                                    type="button" 
                                    onClick={() => setIsEditingEmail(true)} 
                                    className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 p-2 rounded-lg hover:bg-indigo-50 dark:hover:bg-slate-600 transition"
                                >
                                    <Edit2 className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>

                    {(isEditingName || isEditingEmail) && (
                        <button 
                            type="submit" 
                            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-sm animate-fade-in-up"
                        >
                            Save Changes
                        </button>
                    )}
                </form>
            </div>
        </div>
    );
};

export default Profile;
