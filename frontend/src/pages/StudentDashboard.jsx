import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, Clock, MessageSquare, ThumbsUp } from 'lucide-react';
import api from '../services/api';

const StudentDashboard = () => {
    const [logs, setLogs] = useState([]);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('General');
    const [status, setStatus] = useState('pending');
    const [editingLog, setEditingLog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');

    const fetchLogs = async () => {
        try {
            const res = await api.get('/logs/mylogs');
            setLogs(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingLog) {
                await api.put(`/logs/${editingLog.id}`, { title, description, category, status });
            } else {
                await api.post('/logs', { title, description, category, status });
            }
            setTitle('');
            setDescription('');
            setCategory('General');
            setStatus('pending');
            setEditingLog(null);
            fetchLogs();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this log?')) {
            try {
                await api.delete(`/logs/${id}`);
                fetchLogs();
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleEdit = (log) => {
        setEditingLog(log);
        setTitle(log.title);
        setDescription(log.description);
        setCategory(log.category || 'General');
        setStatus(log.status);
    };

    const filteredLogs = logs.filter(log => {
        if (filterStatus === 'all') return true;
        if (filterStatus === 'uncompleted') return log.status !== 'completed';
        return log.status === filterStatus;
    });

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
                    <div className="bg-indigo-100 p-3 rounded-lg text-indigo-600">
                        <CheckCircle className="h-8 w-8" />
                    </div>
                    <div>
                        <p className="text-gray-500 text-sm font-medium">Total Logs</p>
                        <p className="text-3xl font-bold text-gray-800">{logs.length}</p>
                    </div>
                </div>
                {/* Additional stats could go here */}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-4">
                        <h3 className="text-xl font-bold mb-4 flex items-center">
                            <Plus className="h-5 w-5 mr-2 text-indigo-500" />
                            {editingLog ? 'Edit Activity' : 'Add Activity'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input 
                                    type="text" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                                    value={title} onChange={(e) => setTitle(e.target.value)} required 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea 
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-32 resize-none" 
                                    value={description} onChange={(e) => setDescription(e.target.value)} required 
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select 
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white" 
                                    value={category} onChange={(e) => setCategory(e.target.value)}
                                >
                                    <option value="General">General</option>
                                    <option value="Homework">Homework</option>
                                    <option value="Project">Project</option>
                                    <option value="Exam">Exam</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select 
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white" 
                                    value={status} onChange={(e) => setStatus(e.target.value)}
                                >
                                    <option value="pending">Pending</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                </select>
                            </div>
                            <div className="flex space-x-3 pt-2">
                                <button type="submit" className="flex-1 bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-indigo-700 transition">
                                    {editingLog ? 'Update' : 'Submit'}
                                </button>
                                {editingLog && (
                                    <button 
                                        type="button" 
                                        className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-semibold hover:bg-gray-200 transition"
                                        onClick={() => {
                                            setEditingLog(null);
                                            setTitle(''); setDescription(''); setCategory('General'); setStatus('pending');
                                        }}
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                        <h3 className="text-xl font-bold text-gray-800">Your Recent Logs</h3>
                        <select 
                            className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm bg-white"
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                        >
                            <option value="all">All Tasks</option>
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="uncompleted">Uncompleted</option>
                        </select>
                    </div>
                    {loading ? (
                        <div className="text-center py-10 text-gray-500 animate-pulse">Loading logs...</div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="bg-white p-8 text-center rounded-xl border border-dashed border-gray-300 text-gray-500">
                            No logs found for this filter. Start by adding one!
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredLogs.map(log => (
                                <div key={log.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h4 className="text-lg font-bold text-gray-800">{log.title}</h4>
                                            <div className="flex items-center space-x-3 mt-1 text-xs text-gray-500">
                                                <span className="flex items-center"><Clock className="h-3 w-3 mr-1" /> {new Date(log.created_at).toLocaleDateString()}</span>
                                                <span className="px-2 py-1 rounded-full font-medium bg-gray-100 text-gray-700">
                                                    {log.category || 'General'}
                                                </span>
                                                <span className={`px-2 py-1 rounded-full font-medium ${
                                                    log.status === 'completed' ? 'bg-green-100 text-green-700' :
                                                    log.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                    {log.status.replace('_', ' ').toUpperCase()}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button onClick={() => handleEdit(log)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition">
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                            <button onClick={() => handleDelete(log.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 mb-4">{log.description}</p>
                                    
                                    {(log.comments?.length > 0 || log.reactions?.length > 0) && (
                                        <div className="mt-4 pt-4 border-t border-gray-100">
                                            {log.reactions?.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {log.reactions.map(r => (
                                                        <span key={r.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                            {r.reaction_type} <span className="ml-1 text-gray-500">- {r.admin_name}</span>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                            {log.comments?.length > 0 && (
                                                <div className="space-y-2">
                                                    <p className="text-xs font-semibold text-gray-500 uppercase flex items-center"><MessageSquare className="h-3 w-3 mr-1"/> Admin Comments</p>
                                                    {log.comments.map(c => (
                                                        <div key={c.id} className="bg-gray-50 p-3 rounded-lg text-sm border border-gray-100">
                                                            <span className="font-semibold text-gray-700 block mb-1">{c.admin_name}</span>
                                                            <span className="text-gray-600">{c.comment}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
