import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Activity, Moon, Sun, User } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));
    const { isDarkMode, toggleTheme } = useTheme();

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav className="bg-indigo-600 dark:bg-slate-800 text-white shadow-md transition-colors duration-300">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <Link to={user?.role === 'admin' ? '/admin' : (user ? '/student' : '/')} className="flex items-center space-x-2 text-xl font-bold tracking-wider hover:text-indigo-200 dark:hover:text-indigo-400 transition">
                    <Activity className="h-6 w-6" />
                    <span>LogTracker</span>
                </Link>
                <div className="flex items-center space-x-4">
                    <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-white/10 transition" title="Toggle Theme">
                        {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    </button>
                    {user ? (
                        <div className="flex items-center space-x-4">
                            <span className="text-sm font-medium hidden sm:block">Hello, {user.name}</span>
                            <Link to="/profile" className="flex items-center space-x-1 hover:text-indigo-200 dark:hover:text-indigo-400 transition">
                                <User className="h-5 w-5" />
                                <span className="hidden sm:block">Profile</span>
                            </Link>
                            <button 
                                onClick={handleLogout}
                                className="flex items-center space-x-1 bg-indigo-700 dark:bg-slate-700 hover:bg-indigo-800 dark:hover:bg-slate-600 px-3 py-2 rounded-md text-sm font-medium transition"
                            >
                                <LogOut className="h-4 w-4" />
                                <span className="hidden sm:block">Logout</span>
                            </button>
                        </div>
                    ) : (
                        <div className="space-x-4">
                            <Link to="/login" className="hover:text-indigo-200 dark:hover:text-indigo-400 font-medium transition">Login</Link>
                            <Link to="/register" className="bg-white text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-md font-medium transition shadow-sm">Register</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
