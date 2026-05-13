import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Activity } from 'lucide-react';

const Navbar = () => {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user'));

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav className="bg-indigo-600 text-white shadow-md">
            <div className="container mx-auto px-4 py-3 flex justify-between items-center">
                <Link to={user?.role === 'admin' ? '/admin' : '/student'} className="flex items-center space-x-2 text-xl font-bold tracking-wider hover:text-indigo-200 transition">
                    <Activity className="h-6 w-6" />
                    <span>LogTracker</span>
                </Link>
                <div>
                    {user ? (
                        <div className="flex items-center space-x-6">
                            <span className="text-sm font-medium">Hello, {user.name} ({user.role})</span>
                            <button 
                                onClick={handleLogout}
                                className="flex items-center space-x-1 bg-indigo-700 hover:bg-indigo-800 px-3 py-2 rounded-md text-sm font-medium transition"
                            >
                                <LogOut className="h-4 w-4" />
                                <span>Logout</span>
                            </button>
                        </div>
                    ) : (
                        <div className="space-x-4">
                            <Link to="/login" className="hover:text-indigo-200 font-medium transition">Login</Link>
                            <Link to="/register" className="bg-white text-indigo-600 hover:bg-indigo-50 px-4 py-2 rounded-md font-medium transition shadow-sm">Register</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
