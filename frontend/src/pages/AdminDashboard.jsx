import { useState, useEffect } from 'react';
import { Search, Filter, MessageSquare, ThumbsUp, Users, FileText, Calendar as CalendarIcon, X, PieChart as PieChartIcon, User, LayoutDashboard, List } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { format } from 'date-fns';
import api from '../services/api';

const AdminDashboard = () => {
    const [allLogs, setAllLogs] = useState([]);
    const [logs, setLogs] = useState([]);
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [pendingActionFilter, setPendingActionFilter] = useState(false);
    
    // New state for layout
    const [activeTab, setActiveTab] = useState('overview');

    // Comment & Reaction states
    const [commentInputs, setCommentInputs] = useState({});
    
    const reactionsList = ['👍 Good', '⭐ Excellent', '✅ Completed', '🔥 Active'];

    const fetchAllData = async () => {
        try {
            const [logsRes, studentsRes] = await Promise.all([
                api.get('/admin/logs'),
                api.get('/admin/students')
            ]);
            setAllLogs(logsRes.data);
            setStudents(studentsRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchFilteredLogs = async () => {
        try {
            let query = '';
            if (selectedDate || selectedStudentId) {
                const params = new URLSearchParams();
                if (selectedDate) params.append('date', format(selectedDate, 'yyyy-MM-dd'));
                if (selectedStudentId) params.append('student_id', selectedStudentId);
                query = `?${params.toString()}`;
            }
            const res = await api.get(`/admin/logs${query}`);
            setLogs(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    useEffect(() => {
        fetchFilteredLogs();
    }, [selectedDate, selectedStudentId]);

    const handleAddComment = async (logId) => {
        const comment = commentInputs[logId];
        if (!comment || !comment.trim()) return;
        try {
            await api.post('/admin/comment', { log_id: logId, comment });
            setCommentInputs({ ...commentInputs, [logId]: '' });
            fetchAllData();
            fetchFilteredLogs();
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddReaction = async (logId, reactionType) => {
        try {
            await api.post('/admin/reaction', { log_id: logId, reaction_type: reactionType });
            fetchAllData();
            fetchFilteredLogs();
        } catch (err) {
            console.error(err);
        }
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              log.student_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || log.status === filterStatus;
        const matchesPending = pendingActionFilter ? (!log.comments || log.comments.length === 0) && (!log.reactions || log.reactions.length === 0) : true;
        return matchesSearch && matchesFilter && matchesPending;
    });

    // Chart Calculations
    const pieData = [
        { name: 'Completed', value: filteredLogs.filter(l => l.status === 'completed').length },
        { name: 'Undone', value: filteredLogs.filter(l => l.status !== 'completed').length },
    ];
    const COLORS = ['#4f46e5', '#f472b6'];

    const categories = [...new Set(filteredLogs.map(l => l.category || 'Internship'))];
    const barData = categories.map(cat => {
        const catLogs = filteredLogs.filter(l => (l.category || 'Internship') === cat);
        return {
            name: cat,
            Completed: catLogs.filter(l => l.status === 'completed').length,
            Undone: catLogs.filter(l => l.status !== 'completed').length,
            total: catLogs.length
        };
    });

    const tileClassName = ({ date, view }) => {
        if (view === 'month') {
            const dateString = format(date, 'yyyy-MM-dd');
            const logsToCheck = selectedStudentId ? allLogs.filter(l => l.student_id === selectedStudentId) : allLogs;
            
            const hasLog = logsToCheck.some(log => {
                const lDate = log.log_date ? new Date(log.log_date).toISOString().split('T')[0] : new Date(log.created_at).toISOString().split('T')[0];
                return lDate === dateString;
            });
            if (hasLog) return 'highlight-date';
        }
        return null;
    };

    const renderLogItem = (log) => (
        <div key={log.id} className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md transition-all duration-300 mb-4">
            <div className="flex flex-col md:flex-row md:justify-between gap-4">
                <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-bold text-gray-800 dark:text-white">{log.title}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            log.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                            log.status === 'in_progress' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                            {log.status.replace('_', ' ').toUpperCase()}
                        </span>
                    </div>
                    <p className="text-sm font-medium text-indigo-600 dark:text-indigo-400 mb-2">
                        {log.student_name} ({log.student_email})
                        <span className="ml-2 px-2 py-0.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded text-xs font-semibold">{log.category || 'Internship'}</span>
                        <span className="ml-2 text-gray-400 text-xs">{log.log_date ? new Date(log.log_date).toLocaleDateString() : new Date(log.created_at).toLocaleDateString()}</span>
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{log.description}</p>
                    
                    {log.comments?.length > 0 && (
                        <div className="mb-4 space-y-2">
                            {log.comments.map(c => (
                                <div key={c.id} className="bg-gray-50 dark:bg-slate-700/50 p-3 rounded-lg text-sm border border-gray-200 dark:border-slate-600">
                                    <span className="font-semibold text-gray-700 dark:text-gray-300 mr-2">{c.admin_name}:</span>
                                    <span className="text-gray-600 dark:text-gray-400">{c.comment}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="flex-1 flex space-x-2">
                            <input 
                                type="text" 
                                placeholder="Add a comment..." 
                                className="flex-1 px-3 py-1.5 border border-gray-200 dark:border-slate-600 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-colors duration-300"
                                value={commentInputs[log.id] || ''}
                                onChange={(e) => setCommentInputs({...commentInputs, [log.id]: e.target.value})}
                                onKeyPress={(e) => e.key === 'Enter' && handleAddComment(log.id)}
                            />
                            <button 
                                onClick={() => handleAddComment(log.id)}
                                className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition"
                            >
                                Post
                            </button>
                        </div>
                        <div className="flex gap-2">
                            {reactionsList.map(reaction => (
                                <button 
                                    key={reaction}
                                    onClick={() => handleAddReaction(log.id, reaction)}
                                    className="px-2 py-1.5 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-800 dark:text-gray-200 rounded-lg text-sm transition"
                                    title={reaction}
                                >
                                    {reaction.split(' ')[0]}
                                </button>
                            ))}
                        </div>
                    </div>
                    {log.reactions?.length > 0 && (
                        <div className="mt-3 flex gap-2">
                            {log.reactions.map(r => (
                                <span key={r.id} className="text-xs bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded-md text-gray-600 dark:text-gray-300">
                                    {r.reaction_type}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    const renderLogsFilterHeader = (title) => (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 mb-6 p-6 transition-colors duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white">
                {title}
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input 
                        type="text" 
                        placeholder="Search logs..." 
                        className="pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm w-full sm:w-64 bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-colors duration-300"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <select 
                        className="pl-10 pr-8 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm appearance-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white w-full sm:w-auto transition-colors duration-300"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
                <label className="flex items-center space-x-2 text-sm text-gray-700 dark:text-gray-300 font-medium cursor-pointer bg-gray-50 dark:bg-slate-700/50 px-3 py-2 rounded-lg border border-gray-200 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-600 transition">
                    <input 
                        type="checkbox" 
                        className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600"
                        checked={pendingActionFilter}
                        onChange={(e) => setPendingActionFilter(e.target.checked)}
                    />
                    <span>Needs Action</span>
                </label>
            </div>
        </div>
    );

    const renderLogsList = () => (
        <div>
            {filteredLogs.length === 0 ? (
                <div className="p-8 text-center bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 text-gray-500 dark:text-gray-400">No logs match your criteria.</div>
            ) : (
                filteredLogs.map(log => renderLogItem(log))
            )}
        </div>
    );

    const renderOverview = () => (
        <div className="space-y-6 animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center space-x-4 transition-colors duration-300">
                    <div className="bg-blue-100 dark:bg-blue-900/50 p-4 rounded-xl text-blue-600 dark:text-blue-400">
                        <Users className="h-10 w-10" />
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">Total Students</p>
                        <p className="text-4xl font-bold text-gray-800 dark:text-white">{students.length}</p>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 flex items-center space-x-4 transition-colors duration-300">
                    <div className="bg-indigo-100 dark:bg-indigo-900/50 p-4 rounded-xl text-indigo-600 dark:text-indigo-400">
                        <FileText className="h-10 w-10" />
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">Total Logs</p>
                        <p className="text-4xl font-bold text-gray-800 dark:text-white">{allLogs.length}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors duration-300">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 uppercase tracking-wider">
                    Overall Task Statistics
                </h3>
                    
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Data Table */}
                    <div className="overflow-x-auto flex items-center justify-center">
                        <table className="w-full max-w-xs text-sm text-left text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-slate-700 transition-colors duration-300">
                            <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-slate-700/50 border-b border-gray-200 dark:border-slate-700 text-center">
                                <tr>
                                    <th className="px-4 py-3 border-r dark:border-slate-700">Work Tasks</th>
                                    <th className="px-4 py-3 border-r dark:border-slate-700">Completed</th>
                                    <th className="px-4 py-3">Undone</th>
                                </tr>
                            </thead>
                            <tbody>
                                {barData.map((stat, idx) => (
                                    <tr key={idx} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 text-center hover:bg-gray-50 dark:hover:bg-slate-700/50 transition">
                                        <td className="px-4 py-2 border-r dark:border-slate-700 font-medium text-gray-900 dark:text-white">{stat.name}</td>
                                        <td className="px-4 py-2 border-r dark:border-slate-700 text-indigo-600 dark:text-indigo-400 font-bold">{stat.Completed}</td>
                                        <td className="px-4 py-2 text-pink-500 font-bold">{stat.Undone}</td>
                                    </tr>
                                ))}
                                <tr className="bg-gray-50 dark:bg-slate-700/50 font-bold text-center">
                                    <td className="px-4 py-2 border-r dark:border-slate-700 text-gray-900 dark:text-white">All</td>
                                    <td className="px-4 py-2 border-r dark:border-slate-700 text-indigo-600 dark:text-indigo-400">{pieData[0].value}</td>
                                    <td className="px-4 py-2 text-pink-500">{pieData[1].value}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Pie Chart */}
                    <div className="flex flex-col items-center justify-center">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Total Task Completion</h4>
                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={0} outerRadius={60} dataKey="value" stroke="none">
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <RechartsTooltip />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Bar Chart */}
                    <div className="flex flex-col items-center justify-center">
                        <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Category Completion</h4>
                        <div className="h-48 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={barData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis dataKey="name" tick={{fontSize: 10}} stroke="#888888" />
                                    <YAxis tick={{fontSize: 10}} stroke="#888888" />
                                    <RechartsTooltip cursor={{fill: 'transparent'}} />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                                    <Bar dataKey="Undone" stackId="a" fill="#f472b6" barSize={30} radius={[0,0,4,4]} />
                                    <Bar dataKey="Completed" stackId="a" fill="#4f46e5" barSize={30} radius={[4,4,0,0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
            
            {renderLogsFilterHeader('Recent Logs')}
            {renderLogsList()}
        </div>
    );

    const renderCalendarView = () => (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fade-in-up">
            <div className="xl:col-span-1">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold flex items-center text-gray-800 dark:text-white">
                            <CalendarIcon className="h-5 w-5 mr-2 text-indigo-500" />
                            Filter by Date
                        </h3>
                        {selectedDate && (
                            <button onClick={() => setSelectedDate(null)} className="text-gray-400 hover:text-red-500 transition" title="Clear Date">
                                <X className="h-5 w-5" />
                            </button>
                        )}
                    </div>
                    <div className="flex justify-center calendar-container">
                        <Calendar 
                            onChange={setSelectedDate} 
                            value={selectedDate} 
                            tileClassName={tileClassName}
                            className="border-0 rounded-lg shadow-sm"
                        />
                    </div>
                </div>
            </div>
            <div className="xl:col-span-2">
                {renderLogsFilterHeader(selectedDate ? `Logs for ${format(selectedDate, 'MMM do, yyyy')}` : 'Logs by Date')}
                {renderLogsList()}
            </div>
        </div>
    );

    const renderStudentView = () => {
        const student = students.find(s => s.id === selectedStudentId);
        return (
            <div className="animate-fade-in-up">
                {student && (
                    <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-6 mb-6 text-white flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold">{student.name}</h2>
                            <p className="opacity-80">{student.email}</p>
                        </div>
                        <div className="bg-white/20 px-4 py-2 rounded-lg backdrop-blur-sm text-center">
                            <p className="text-sm font-medium uppercase tracking-wider opacity-80">Total Logs</p>
                            <p className="text-3xl font-bold">{allLogs.filter(l => l.student_id === student.id).length}</p>
                        </div>
                    </div>
                )}
                {renderLogsFilterHeader(student ? `${student.name}'s Logs` : 'Student Logs')}
                {renderLogsList()}
            </div>
        );
    };

    return (
        <div className="flex flex-col lg:flex-row min-h-[calc(100vh-100px)] gap-6 text-slate-800 dark:text-slate-100">
            {/* Sidebar */}
            <div className="w-full lg:w-64 flex-shrink-0 bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 transition-colors duration-300 h-fit lg:sticky lg:top-24">
                <div className="flex items-center space-x-2 mb-6">
                    <LayoutDashboard className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Dashboard</h2>
                </div>

                <div className="space-y-1 mb-8">
                    <button 
                        onClick={() => {setActiveTab('overview'); setSelectedStudentId(null); setSelectedDate(null);}} 
                        className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${activeTab === 'overview' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 shadow-sm' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-slate-700/50'}`}
                    >
                        <PieChartIcon className="w-5 h-5 mr-3" /> Overview
                    </button>
                    <button 
                        onClick={() => {setActiveTab('logs'); setSelectedStudentId(null); setSelectedDate(null);}} 
                        className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${activeTab === 'logs' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 shadow-sm' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-slate-700/50'}`}
                    >
                        <List className="w-5 h-5 mr-3" /> All Logs
                    </button>
                    <button 
                        onClick={() => {setActiveTab('calendar'); setSelectedStudentId(null);}} 
                        className={`w-full flex items-center px-4 py-3 text-sm font-semibold rounded-xl transition-all duration-200 ${activeTab === 'calendar' ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400 shadow-sm' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-slate-700/50'}`}
                    >
                        <CalendarIcon className="w-5 h-5 mr-3" /> Calendar
                    </button>
                </div>

                <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">Students</h3>
                    <div className="space-y-1 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                        {students.map(student => (
                            <button 
                                key={student.id} 
                                onClick={() => {setActiveTab('student'); setSelectedStudentId(student.id); setSelectedDate(null);}} 
                                className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${activeTab === 'student' && selectedStudentId === student.id ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-md' : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-slate-700/50'}`}
                            >
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 text-xs font-bold ${activeTab === 'student' && selectedStudentId === student.id ? 'bg-white/20' : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400'}`}>
                                    {student.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="truncate">{student.name}</span>
                            </button>
                        ))}
                        {students.length === 0 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 px-2">No students found.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-w-0 pb-10">
                {activeTab === 'overview' && renderOverview()}
                {activeTab === 'logs' && (
                    <div className="animate-fade-in-up">
                        {renderLogsFilterHeader('All Logs')}
                        {renderLogsList()}
                    </div>
                )}
                {activeTab === 'calendar' && renderCalendarView()}
                {activeTab === 'student' && renderStudentView()}
            </div>
        </div>
    );
};

export default AdminDashboard;
