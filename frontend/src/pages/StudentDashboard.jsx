import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, Clock, MessageSquare, ThumbsUp, Calendar as CalendarIcon, LayoutDashboard, List, PlusCircle, CheckSquare } from 'lucide-react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format, startOfDay, addDays, subDays } from 'date-fns';
import toast, { Toaster } from 'react-hot-toast';
import api from '../services/api';

const StudentDashboard = () => {
    const [logs, setLogs] = useState([]);
    const [allLogs, setAllLogs] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('Internship');
    const [status, setStatus] = useState('pending');
    const [logDate, setLogDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [editingLog, setEditingLog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('all_activity');

    const fetchAllLogs = async () => {
        try {
            const res = await api.get('/logs/mylogs');
            setAllLogs(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchLogsForDate = async (date) => {
        try {
            setLoading(true);
            const formattedDate = format(date, 'yyyy-MM-dd');
            const res = await api.get(`/logs/mylogs?date=${formattedDate}`);
            setLogs(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllLogs();
    }, []);

    useEffect(() => {
        fetchLogsForDate(selectedDate);
    }, [selectedDate]);

    const isDateAllowed = (dateString) => {
        const today = startOfDay(new Date());
        const target = startOfDay(new Date(dateString));
        const diff = Math.round((target - today) / (1000 * 60 * 60 * 24));
        return diff >= -1 && diff <= 1;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isDateAllowed(logDate)) {
            toast.error('You can only add logs for Yesterday, Today, or Tomorrow.');
            return;
        }

        try {
            if (editingLog) {
                await api.put(`/logs/${editingLog.id}`, { title, description, category, status, date: logDate });
                toast.success('Log updated successfully');
            } else {
                await api.post('/logs', { title, description, category, status, date: logDate });
                toast.success('Log added successfully');
            }
            setTitle('');
            setDescription('');
            setCategory('Internship');
            setStatus('pending');
            setLogDate(format(new Date(), 'yyyy-MM-dd'));
            setEditingLog(null);
            fetchAllLogs();
            fetchLogsForDate(selectedDate);
            setActiveTab('all_activity'); // Redirect to all activity after submitting
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Error saving log');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this log?')) {
            try {
                await api.delete(`/logs/${id}`);
                toast.success('Log deleted');
                fetchAllLogs();
                fetchLogsForDate(selectedDate);
            } catch (err) {
                console.error(err);
                toast.error('Error deleting log');
            }
        }
    };

    const handleEdit = (log) => {
        const logDateStr = log.log_date ? new Date(log.log_date).toISOString().split('T')[0] : new Date(log.created_at).toISOString().split('T')[0];
        if (!isDateAllowed(logDateStr)) {
            toast.error('You cannot edit logs older than yesterday or beyond tomorrow.');
            return;
        }
        setEditingLog(log);
        setTitle(log.title);
        setDescription(log.description);
        setCategory(log.category || 'Internship');
        setStatus(log.status);
        setLogDate(logDateStr);
        setActiveTab('add_log'); // Automatically switch to the Add Log tab
    };

    const tileClassName = ({ date, view }) => {
        if (view === 'month') {
            const dateString = format(date, 'yyyy-MM-dd');
            const hasLog = allLogs.some(log => {
                const lDate = log.log_date ? new Date(log.log_date).toISOString().split('T')[0] : new Date(log.created_at).toISOString().split('T')[0];
                return lDate === dateString;
            });
            if (hasLog) return 'highlight-date';
        }
        return null;
    };

    const minDateStr = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    const maxDateStr = format(addDays(new Date(), 1), 'yyyy-MM-dd');

    const renderLogItem = (log) => (
        <div key={log.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md transition-all duration-300">
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h4 className="text-lg font-bold text-gray-800 dark:text-white">{log.title}</h4>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {log.log_date ? new Date(log.log_date).toLocaleDateString() : new Date(log.created_at).toLocaleDateString()}</span>
                        <span className="px-2 py-1 rounded-full font-medium bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300">
                            {log.category || 'General'}
                        </span>
                        <span className={`px-2 py-1 rounded-full font-medium ${
                            log.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            log.status === 'in_progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                            {log.status.replace('_', ' ').toUpperCase()}
                        </span>
                    </div>
                </div>
                <div className="flex space-x-2">
                    <button onClick={() => handleEdit(log)} className="p-2 text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-lg transition">
                        <Edit2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(log.id)} className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-slate-700 rounded-lg transition">
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4">{log.description}</p>
            
            {(log.comments?.length > 0 || log.reactions?.length > 0) && (
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                    {log.reactions?.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                            {log.reactions.map(r => (
                                <span key={r.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200">
                                    {r.reaction_type} <span className="ml-1 text-gray-500 dark:text-gray-400">- {r.admin_name}</span>
                                </span>
                            ))}
                        </div>
                    )}
                    {log.comments?.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase flex items-center"><MessageSquare className="h-3 w-3 mr-1"/> Admin Comments</p>
                            {log.comments.map(c => (
                                <div key={c.id} className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded-lg text-sm border border-gray-100 dark:border-slate-600">
                                    <span className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">{c.admin_name}</span>
                                    <span className="text-gray-600 dark:text-gray-400">{c.comment}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    const renderLogsList = (logsToRender, emptyMessage) => (
        <div className="space-y-4 animate-fade-in-up">
            {logsToRender.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 p-8 text-center rounded-xl border border-dashed border-gray-300 dark:border-slate-600 text-gray-500 dark:text-gray-400 transition-colors duration-300">
                    {emptyMessage}
                </div>
            ) : (
                logsToRender.map(renderLogItem)
            )}
        </div>
    );

    return (
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-100px)] gap-6 text-slate-800 dark:text-slate-100">
            <Toaster position="top-right" />
            
            {/* Sidebar Navigation */}
            <div className="w-full lg:w-64 flex-shrink-0 bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors duration-300 h-fit lg:sticky lg:top-24">
                <div className="flex items-center space-x-2 mb-8">
                    <LayoutDashboard className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">My Dashboard</h2>
                </div>

                <div className="space-y-2">
                    <button 
                        onClick={() => setActiveTab('add_log')} 
                        className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${activeTab === 'add_log' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 shadow-sm' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-slate-700/50'}`}
                    >
                        <PlusCircle className="w-5 h-5 mr-3" /> Add Log
                    </button>
                    <button 
                        onClick={() => setActiveTab('all_activity')} 
                        className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${activeTab === 'all_activity' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 shadow-sm' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-slate-700/50'}`}
                    >
                        <List className="w-5 h-5 mr-3" /> All Activity
                    </button>
                    <button 
                        onClick={() => setActiveTab('calendar')} 
                        className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${activeTab === 'calendar' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 shadow-sm' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-slate-700/50'}`}
                    >
                        <CalendarIcon className="w-5 h-5 mr-3" /> Activity Calendar
                    </button>
                    <button 
                        onClick={() => setActiveTab('pending')} 
                        className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${activeTab === 'pending' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 shadow-sm' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-slate-700/50'}`}
                    >
                        <Clock className="w-5 h-5 mr-3" /> Pending
                    </button>
                    <button 
                        onClick={() => setActiveTab('reviewed')} 
                        className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${activeTab === 'reviewed' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 shadow-sm' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-slate-700/50'}`}
                    >
                        <CheckSquare className="w-5 h-5 mr-3" /> Reviewed
                    </button>
                </div>

                <div className="mt-8 p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-md">
                    <p className="text-xs font-semibold uppercase tracking-wider opacity-90 mb-1">Total Logs</p>
                    <p className="text-3xl font-bold">{allLogs.length}</p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0 pb-10">
                
                {/* Add Log Tab */}
                {activeTab === 'add_log' && (
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors duration-300 animate-fade-in-up max-w-2xl">
                        <h3 className="text-2xl font-bold mb-6 flex items-center text-gray-800 dark:text-white">
                            <Plus className="h-6 w-6 mr-3 text-indigo-500" />
                            {editingLog ? 'Edit Activity' : 'Add New Activity'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Date</label>
                                <input 
                                    type="date" 
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-gray-50 dark:bg-slate-700/50 text-gray-900 dark:text-white transition-all duration-300" 
                                    value={logDate} 
                                    onChange={(e) => setLogDate(e.target.value)} 
                                    min={minDateStr}
                                    max={maxDateStr}
                                    required 
                                />
                                <p className="text-xs text-gray-500 mt-1">You can log activities for yesterday, today, or tomorrow.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Title</label>
                                <input 
                                    type="text" 
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-gray-50 dark:bg-slate-700/50 text-gray-900 dark:text-white transition-all duration-300" 
                                    value={title} onChange={(e) => setTitle(e.target.value)} 
                                    placeholder="What did you work on?"
                                    required 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                                <textarea 
                                    className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-gray-50 dark:bg-slate-700/50 text-gray-900 dark:text-white transition-all duration-300 h-32 resize-none" 
                                    value={description} onChange={(e) => setDescription(e.target.value)} 
                                    placeholder="Provide details about your task, challenges faced, or what you learned..."
                                    required 
                                ></textarea>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Category</label>
                                    <select 
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-gray-50 dark:bg-slate-700/50 text-gray-900 dark:text-white transition-all duration-300" 
                                        value={category} onChange={(e) => setCategory(e.target.value)}
                                    >
                                        <option value="Internship">Internship</option>
                                        <option value="Project">Project</option>
                                        <option value="Workshop">Workshop</option>
                                        <option value="Certification">Certification</option>
                                        <option value="Hackathon">Hackathon</option>
                                        <option value="Coding Practice">Coding Practice</option>
                                        <option value="Placement Preparation">Placement Preparation</option>
                                        <option value="Technical Event">Technical Event</option>
                                        <option value="Achievement">Achievement</option>
                                        <option value="Volunteer Work">Volunteer Work</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Status</label>
                                    <select 
                                        className="w-full px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-gray-50 dark:bg-slate-700/50 text-gray-900 dark:text-white transition-all duration-300" 
                                        value={status} onChange={(e) => setStatus(e.target.value)}
                                    >
                                        <option value="pending">Pending</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="completed">Completed</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex space-x-3 pt-4">
                                <button type="submit" className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all duration-300 transform active:scale-[0.98]">
                                    {editingLog ? 'Update Activity' : 'Submit Activity'}
                                </button>
                                {editingLog && (
                                    <button 
                                        type="button" 
                                        className="flex-1 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 py-3 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-slate-600 transition-all duration-300"
                                        onClick={() => {
                                            setEditingLog(null);
                                            setTitle(''); setDescription(''); setCategory('Internship'); setStatus('pending');
                                            setLogDate(format(new Date(), 'yyyy-MM-dd'));
                                            setActiveTab('all_activity');
                                        }}
                                    >
                                        Cancel Edit
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                )}

                {/* All Activity Tab */}
                {activeTab === 'all_activity' && (
                    <div>
                        <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-3">All Activity Logs</h3>
                        {renderLogsList(allLogs, "You haven't submitted any logs yet.")}
                    </div>
                )}

                {/* Calendar Tab */}
                {activeTab === 'calendar' && (
                    <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 animate-fade-in-up">
                        <div className="xl:col-span-2">
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors duration-300">
                                <h3 className="text-xl font-bold mb-6 flex items-center text-gray-800 dark:text-white">
                                    <CalendarIcon className="h-5 w-5 mr-2 text-indigo-500" />
                                    Select Date
                                </h3>
                                <div className="flex justify-center calendar-container w-full">
                                    <Calendar 
                                        onChange={setSelectedDate} 
                                        value={selectedDate} 
                                        tileClassName={tileClassName}
                                        className="border-0 rounded-xl shadow-sm w-full"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="xl:col-span-3">
                            <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white flex items-center justify-between">
                                Logs for {format(selectedDate, 'MMMM do, yyyy')}
                            </h3>
                            {loading ? (
                                <div className="text-center py-10 text-gray-500 dark:text-gray-400 animate-pulse bg-white dark:bg-slate-800 rounded-xl">Loading logs...</div>
                            ) : (
                                renderLogsList(logs, "No logs found for this specific date.")
                            )}
                        </div>
                    </div>
                )}

                {/* Pending Tab */}
                {activeTab === 'pending' && (
                    <div>
                        <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-3 flex items-center">
                            <Clock className="w-6 h-6 mr-3 text-yellow-500" /> Pending Activities
                        </h3>
                        {renderLogsList(
                            allLogs.filter(l => l.status === 'pending'), 
                            "Great job! You have no pending activities."
                        )}
                    </div>
                )}

                {/* Reviewed Tab */}
                {activeTab === 'reviewed' && (
                    <div>
                        <h3 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white border-b border-gray-200 dark:border-slate-700 pb-3 flex items-center">
                            <CheckSquare className="w-6 h-6 mr-3 text-green-500" /> Reviewed Activities
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Logs that have received an admin comment or reaction.</p>
                        {renderLogsList(
                            allLogs.filter(l => l.comments?.length > 0 || l.reactions?.length > 0), 
                            "None of your logs have been reviewed yet."
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentDashboard;
