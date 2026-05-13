import { useState, useEffect } from 'react';
import { Search, Filter, MessageSquare, ThumbsUp, Users, FileText } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import api from '../services/api';

const AdminDashboard = () => {
    const [logs, setLogs] = useState([]);
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [pendingActionFilter, setPendingActionFilter] = useState(false);
    
    // Comment & Reaction states
    const [commentInputs, setCommentInputs] = useState({});
    
    const reactionsList = ['👍 Good', '⭐ Excellent', '✅ Completed', '🔥 Active'];

    const fetchData = async () => {
        try {
            const [logsRes, studentsRes] = await Promise.all([
                api.get('/admin/logs'),
                api.get('/admin/students')
            ]);
            setLogs(logsRes.data);
            setStudents(studentsRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleAddComment = async (logId) => {
        const comment = commentInputs[logId];
        if (!comment || !comment.trim()) return;
        try {
            await api.post('/admin/comment', { log_id: logId, comment });
            setCommentInputs({ ...commentInputs, [logId]: '' });
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddReaction = async (logId, reactionType) => {
        try {
            await api.post('/admin/reaction', { log_id: logId, reaction_type: reactionType });
            fetchData();
        } catch (err) {
            console.error(err);
        }
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              log.student_name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'all' || log.status === filterStatus;
        const matchesStudent = selectedStudentId === null || log.student_id === selectedStudentId;
        const matchesPending = pendingActionFilter ? (!log.comments || log.comments.length === 0) && (!log.reactions || log.reactions.length === 0) : true;
        return matchesSearch && matchesFilter && matchesStudent && matchesPending;
    });

    // Chart Calculations
    const pieData = [
        { name: 'Completed', value: filteredLogs.filter(l => l.status === 'completed').length },
        { name: 'Undone', value: filteredLogs.filter(l => l.status !== 'completed').length },
    ];
    const COLORS = ['#4f46e5', '#f472b6'];

    const categories = [...new Set(filteredLogs.map(l => l.category || 'General'))];
    const barData = categories.map(cat => {
        const catLogs = filteredLogs.filter(l => (l.category || 'General') === cat);
        return {
            name: cat,
            Completed: catLogs.filter(l => l.status === 'completed').length,
            Undone: catLogs.filter(l => l.status !== 'completed').length,
            total: catLogs.length
        };
    });

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
                        <Users className="h-8 w-8" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Total Students</p>
                        <p className="text-3xl font-bold text-gray-800">{students.length}</p>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="bg-indigo-100 p-3 rounded-lg text-indigo-600">
                        <FileText className="h-8 w-8" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Total Logs</p>
                        <p className="text-3xl font-bold text-gray-800">{logs.length}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Students</h3>
                <div className="flex flex-wrap gap-2">
                    <button 
                        onClick={() => setSelectedStudentId(null)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition ${selectedStudentId === null ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                        All Students
                    </button>
                    {students.map(student => (
                        <button 
                            key={student.id}
                            onClick={() => setSelectedStudentId(student.id)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${selectedStudentId === student.id ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                        >
                            {student.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6 text-center uppercase tracking-wider text-indigo-600">
                    {selectedStudentId ? 'Student Task Statistics' : 'Overall Task Statistics'}
                </h3>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Data Table */}
                        <div className="overflow-x-auto flex items-center justify-center">
                            <table className="w-full max-w-xs text-sm text-left text-gray-500 border border-gray-200">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200 text-center">
                                    <tr>
                                        <th className="px-4 py-3 border-r">Work Tasks</th>
                                        <th className="px-4 py-3 border-r">Completed</th>
                                        <th className="px-4 py-3">Undone</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {barData.map((stat, idx) => (
                                        <tr key={idx} className="bg-white border-b text-center">
                                            <td className="px-4 py-2 border-r font-medium text-gray-900">{stat.name}</td>
                                            <td className="px-4 py-2 border-r text-indigo-600 font-bold">{stat.Completed}</td>
                                            <td className="px-4 py-2 text-pink-500 font-bold">{stat.Undone}</td>
                                        </tr>
                                    ))}
                                    <tr className="bg-gray-50 font-bold text-center">
                                        <td className="px-4 py-2 border-r text-gray-900">All</td>
                                        <td className="px-4 py-2 border-r text-indigo-600">{pieData[0].value}</td>
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
                                        <Legend iconType="square" wrapperStyle={{ fontSize: '12px' }}/>
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
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" tick={{fontSize: 10}} />
                                        <YAxis tick={{fontSize: 10}} />
                                        <RechartsTooltip />
                                        <Legend iconType="square" wrapperStyle={{ fontSize: '12px' }} />
                                        <Bar dataKey="Undone" stackId="a" fill="#f472b6" barSize={30} />
                                        <Bar dataKey="Completed" stackId="a" fill="#4f46e5" barSize={30} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="text-xl font-bold text-gray-800">
                        {selectedStudentId 
                            ? `${students.find(s => s.id === selectedStudentId)?.name}'s Logs`
                            : 'All Student Logs'
                        }
                    </h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input 
                                type="text" 
                                placeholder="Search logs..." 
                                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm w-full sm:w-64"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <select 
                                className="pl-10 pr-8 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm appearance-none bg-white w-full sm:w-auto"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                        <label className="flex items-center space-x-2 text-sm text-gray-700 font-medium cursor-pointer bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 hover:bg-gray-100 transition">
                            <input 
                                type="checkbox" 
                                className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                                checked={pendingActionFilter}
                                onChange={(e) => setPendingActionFilter(e.target.checked)}
                            />
                            <span>Needs Action</span>
                        </label>
                    </div>
                </div>

                <div className="divide-y divide-gray-100">
                    {filteredLogs.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">No logs match your criteria.</div>
                    ) : (
                        filteredLogs.map(log => (
                            <div key={log.id} className="p-6 hover:bg-gray-50 transition">
                                <div className="flex flex-col md:flex-row md:justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <h4 className="text-lg font-bold text-gray-800">{log.title}</h4>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                log.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                log.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                                'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {log.status.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-indigo-600 mb-2">
                                            {log.student_name} ({log.student_email})
                                            <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-semibold">{log.category || 'General'}</span>
                                        </p>
                                        <p className="text-gray-600 mb-4">{log.description}</p>
                                        
                                        {log.comments?.length > 0 && (
                                            <div className="mb-4 space-y-2">
                                                {log.comments.map(c => (
                                                    <div key={c.id} className="bg-white p-3 rounded-lg text-sm border border-gray-200">
                                                        <span className="font-semibold text-gray-700 mr-2">{c.admin_name}:</span>
                                                        <span className="text-gray-600">{c.comment}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex flex-col sm:flex-row gap-3">
                                            <div className="flex-1 flex space-x-2">
                                                <input 
                                                    type="text" 
                                                    placeholder="Add a comment..." 
                                                    className="flex-1 px-3 py-1.5 border rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
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
                                                        className="px-2 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition"
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
                                                    <span key={r.id} className="text-xs bg-gray-100 px-2 py-1 rounded-md text-gray-600">
                                                        {r.reaction_type}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
