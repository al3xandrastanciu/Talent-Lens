import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import jobService from '../../services/jobService';
import recruiterService from '../../services/recruiterService';
import applicationService from '../../services/applicationService';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/common/Navbar';

const EMPTY_FORM = { title: '', description: '', requirements: '', skills: '', domain: 'IT' };

const ManageJobs = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [recruiter, setRecruiter] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [stats, setStats] = useState({ active: 0, applicants: 0, closed: 0 });
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingJob, setEditingJob] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const loadData = async (rec) => {
        try {
            const data = await jobService.getJobsByRecruiter(rec.id);
            setJobs(data);

            // Fetch applications to calculate stats and show pipeline preview
            let totalApplicants = 0;
            const jobsWithApps = await Promise.all(data.map(async (job) => {
                const apps = await applicationService.getByJob(job.id);
                totalApplicants += apps.length;
                return {
                    ...job,
                    appsCount: apps.length,
                    topApps: apps.sort((a, b) => (b.mlScore || 0) - (a.mlScore || 0)).slice(0, 3)
                };
            }));

            setJobs(jobsWithApps);
            setStats({
                active: data.filter(j => j.status !== 'CLOSED').length,
                applicants: totalApplicants,
                closed: data.filter(j => j.status === 'CLOSED').length
            });
        } catch (err) {
            console.error("Load error:", err);
        }
    };

    useEffect(() => {
        const init = async () => {
            if (!user?.id) return;
            try {
                const rec = await recruiterService.getByUserId(user.id);
                setRecruiter(rec);
                await loadData(rec);
            } catch (err) {
                setMessage({ type: 'error', text: 'Failed to load recruiter dashboard.' });
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [user]);

    const showMsg = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const openCreate = () => {
        setEditingJob(null);
        setForm(EMPTY_FORM);
        setShowModal(true);
    };

    const openEdit = (job) => {
        setEditingJob(job);
        setForm({
            title: job.title || '',
            description: job.description || '',
            requirements: job.requirements || '',
            domain: job.domain || 'IT',
            skills: job.skills ? job.skills.map((s) => s.name || s).join(', ') : '',
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingJob(null);
        setForm(EMPTY_FORM);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const skillsList = form.skills
                ? form.skills.split(',').map((s) => s.trim()).filter(Boolean)
                : [];
            const payload = {
                title: form.title,
                description: form.description,
                requirements: form.requirements,
                domain: form.domain,
                recruiterId: recruiter.id,
                skills: skillsList,
            };

            if (editingJob) {
                await jobService.updateJob(editingJob.id, payload);
                showMsg('success', 'Job profile updated! ✨');
            } else {
                await jobService.createJob(payload);
                showMsg('success', 'New job opportunity posted! 🚀');
            }
            await loadData(recruiter);
            closeModal();
        } catch (err) {
            showMsg('error', 'Transmission error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = async (jobId) => {
        if (!window.confirm('Close this job posting? No further applications will be accepted.')) return;
        try {
            await jobService.closeJob(jobId);
            await loadData(recruiter);
            showMsg('success', 'Job marked as closed.');
        } catch (err) {
            showMsg('error', 'Operation failed.');
        }
    };

    const handleDelete = async (jobId) => {
        if (!window.confirm('Delete this job permanently? This action is irreversible.')) return;
        try {
            await jobService.deleteJob(jobId);
            setJobs((prev) => prev.filter((j) => j.id !== jobId));
            showMsg('success', 'Job deleted from cloud.');
        } catch (err) {
            showMsg('error', 'Operation failed.');
        }
    };

    const filteredJobs = jobs.filter(j =>
        j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.domain?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return (
        <div className="min-h-screen bg-background-light dark:bg-slate-950 font-display transition-colors">
            <Navbar />
            <div className="pt-32 flex flex-col items-center justify-center gap-6">
                <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-primary animate-pulse">Initializing RecruitPro Engine...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background-light dark:bg-slate-950 text-slate-900 dark:text-gray-100 font-display transition-colors duration-200">
            <Navbar />

            <main className="max-w-screen-2xl mx-auto px-4 sm:px-8 py-24">
                {/* Header Area */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">Recruiter Panel</span>
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">Job Management</h1>
                        <p className="text-slate-500 dark:text-gray-400 text-lg">Control your active listings and analyze candidate pipelines.</p>
                    </div>
                    <button
                        onClick={openCreate}
                        className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-bold text-sm tracking-widest uppercase flex items-center gap-3 shadow-lg shadow-primary/20 transition-all active:scale-95 whitespace-nowrap"
                    >
                        <span className="material-symbols-outlined text-lg">add</span>
                        Post New Job
                    </button>
                </div>

                {message && (
                    <div className={`mb-8 p-4 rounded-xl border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                        } font-bold text-sm shadow-sm animate-in fade-in slide-in-from-top-4`}>
                        {message.text}
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-slate-500 dark:text-gray-400 font-bold uppercase tracking-wider text-[10px]">Active Jobs</p>
                            <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg text-xl">work</span>
                        </div>
                        <p className="text-3xl font-black text-slate-950 dark:text-white leading-none">{stats.active}</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-slate-500 dark:text-gray-400 font-bold uppercase tracking-wider text-[10px]">Total Applicants</p>
                            <span className="material-symbols-outlined text-secondary bg-secondary/10 p-2 rounded-lg text-xl">group</span>
                        </div>
                        <p className="text-3xl font-black text-slate-950 dark:text-white leading-none">{stats.applicants}</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-slate-500 dark:text-gray-400 font-bold uppercase tracking-wider text-[10px]">Interviews</p>
                            <span className="material-symbols-outlined text-emerald-600 bg-emerald-500/10 p-2 rounded-lg text-xl">video_camera_front</span>
                        </div>
                        <p className="text-3xl font-black text-slate-950 dark:text-white leading-none">0</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-slate-500 dark:text-gray-400 font-bold uppercase tracking-wider text-[10px]">System Health</p>
                            <span className="material-symbols-outlined text-amber-500 bg-amber-500/10 p-2 rounded-lg text-xl">memory</span>
                        </div>
                        <p className="text-3xl font-black text-slate-950 dark:text-white leading-none">AI Ready</p>
                    </div>
                </div>

                {/* Main Table Content */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50 dark:bg-slate-800/20">
                        <div className="relative w-full max-w-md">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400">search</span>
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-sm transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none"
                                placeholder="Search by job title or domain..."
                                type="text"
                            />
                        </div>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold uppercase tracking-widest text-slate-600 dark:text-gray-400 hover:bg-slate-50 transition-colors">Sort: Newest</button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Job Role</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Department</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Status</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">AI Pipeline</th>
                                    <th className="p-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-display">
                                {filteredJobs.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-20 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <span className="material-symbols-outlined text-6xl text-slate-200 dark:text-slate-800 text-[80px]">work_off</span>
                                                <p className="text-slate-500 dark:text-gray-500 font-bold">No job listings found.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredJobs.map((job) => (
                                        <tr key={job.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all">
                                            <td className="p-6">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-slate-900 dark:text-white text-base group-hover:text-primary transition-colors cursor-pointer" onClick={() => navigate(`/recruiter/jobs/${job.id}/applications`)}>{job.title}</span>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">ID: #{job.id} • Posted {new Date(job.createdAt || job.postedAt).toLocaleDateString()}</span>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-gray-400 border border-slate-200 dark:border-slate-700">
                                                    {job.domain || 'IT'}
                                                </span>
                                            </td>
                                            <td className="p-6">
                                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${job.status?.toLowerCase() === 'closed'
                                                    ? 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/40'
                                                    : 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/40'
                                                    }`}>
                                                    <span className={`w-1.5 h-1.5 rounded-full mr-2 ${job.status?.toLowerCase() === 'closed' ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
                                                    {job.status || 'ACTIVE'}
                                                </span>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex -space-x-3 overflow-hidden cursor-pointer" onClick={() => navigate(`/recruiter/jobs/${job.id}/applications`)}>
                                                        {job.topApps && job.topApps.length > 0 ? (
                                                            job.topApps.map((app, i) => (
                                                                <div key={i} className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-container border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-black text-white shadow-sm ring-1 ring-slate-200/50 dark:ring-slate-800">
                                                                    {app.candidate?.fullName?.substring(0, 2).toUpperCase() || '??'}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 border-2 border-white dark:border-slate-900 flex items-center justify-center text-slate-300">
                                                                <span className="material-symbols-outlined text-[16px]">person</span>
                                                            </div>
                                                        )}
                                                        {(job.appsCount > 3) && (
                                                            <div className="w-9 h-9 rounded-full bg-slate-950 text-white border-2 border-white dark:border-slate-900 flex items-center justify-center text-[10px] font-black">
                                                                +{job.appsCount - 3}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline cursor-pointer" onClick={() => navigate(`/recruiter/jobs/${job.id}/applications`)}>
                                                        {job.appsCount} Candidates
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-6 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                    <button
                                                        onClick={() => openEdit(job)}
                                                        className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-gray-400 hover:text-primary hover:border-primary/30 transition-all shadow-sm active:scale-90"
                                                        title="Edit Job"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">edit</span>
                                                    </button>
                                                    {job.status !== 'CLOSED' && (
                                                        <button
                                                            onClick={() => handleClose(job.id)}
                                                            className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-gray-400 hover:text-amber-600 hover:border-amber-600/30 transition-all shadow-sm active:scale-90"
                                                            title="Close Posting"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">lock</span>
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(job.id)}
                                                        className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-gray-400 hover:text-red-600 hover:border-red-600/30 transition-all shadow-sm active:scale-90"
                                                        title="Delete permanently"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">delete</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Info Card Accent */}
                <div className="mt-12 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-primary/20 dark:to-primary/10 rounded-2xl p-8 text-white relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="max-w-xl text-center md:text-left">
                            <h3 className="text-xl font-black uppercase tracking-tight mb-2 flex items-center gap-3 justify-center md:justify-start">
                                <span className="material-symbols-outlined text-primary">auto_awesome</span>
                                AI Pipeline Insights
                            </h3>
                            <p className="text-slate-400 dark:text-gray-300 text-sm font-medium">
                                Systemul RecruitPro analizează automat CV-urile și oferă scoruri ML bazate pe cerințele fiecărui job. Verifică Pipeline-ul pentru a prioritiza cei mai buni candidați.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/recruiter/analytics')}
                            className="px-8 py-3 bg-white text-slate-900 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95"
                        >
                            View Analytics
                        </button>
                    </div>
                    <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/20 rounded-full blur-[100px] -mr-32 -mt-32"></div>
                </div>
            </main>

            {/* Create / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
                    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm transition-opacity" onClick={closeModal}></div>
                    <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{editingJob ? 'Update Listing' : 'Publish Opportunity'}</h2>
                                <p className="text-sm text-slate-500 dark:text-gray-400 mt-1">Refine your criteria to attract the best talent.</p>
                            </div>
                            <button onClick={closeModal} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                                <span className="material-symbols-outlined text-slate-400">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Job Role Title *</label>
                                <input
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-5 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-slate-900 transition-all outline-none"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    placeholder="e.g. Principal Product Designer"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Area of expertise *</label>
                                    <div className="relative">
                                        <select
                                            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-5 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 transition-all outline-none appearance-none cursor-pointer"
                                            value={form.domain}
                                            onChange={(e) => setForm({ ...form, domain: e.target.value })}
                                            required
                                        >
                                            <option value="IT">IT & Engineering</option>
                                            <option value="Finance">Finance & Operations</option>
                                            <option value="Marketing">Marketing & Growth</option>
                                            <option value="HR">People & Culture</option>
                                        </select>
                                        <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 pointer-events-none">expand_more</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Technical Stack</label>
                                    <input
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-5 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                        value={form.skills}
                                        onChange={(e) => setForm({ ...form, skills: e.target.value })}
                                        placeholder="React, Figma, Node.js"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Full Description *</label>
                                <textarea
                                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-5 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 transition-all outline-none min-h-[140px] resize-none"
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    placeholder="Describe the impact of this role..."
                                    required
                                />
                            </div>
                        </form>

                        <div className="p-8 bg-slate-50/50 dark:bg-slate-950/80 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                            <button className="px-8 py-4 border border-slate-200 dark:border-slate-800 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-600 dark:text-gray-400 hover:bg-white dark:hover:bg-slate-800 transition-all" onClick={closeModal}>Cancel</button>
                            <button
                                onClick={handleSubmit}
                                disabled={submitting}
                                className="px-12 py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/30 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                            >
                                {submitting ? 'Connecting...' : editingJob ? 'Save Modifications' : 'Launch Posting'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageJobs;
