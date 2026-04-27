import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import recruiterService from '../../services/recruiterService';
import jobService from '../../services/jobService';
import applicationService from '../../services/applicationService';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/common/Navbar';

const RecruiterDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [recruiter, setRecruiter] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [stats, setStats] = useState({ totalJobs: 0, activeJobs: 0, totalApplications: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            if (!user?.id) return;
            try {
                const rec = await recruiterService.getByUserId(user.id);
                setRecruiter(rec);
                const jobList = await jobService.getJobsByRecruiter(rec.id);
                setJobs(jobList.slice(0, 5)); // show 5 recent

                // Count applications across all jobs for high-level stats
                let totalApplications = 0;
                for (const job of jobList) {
                    try {
                        const apps = await applicationService.getByJob(job.id);
                        totalApplications += apps.length;
                    } catch (_) { }
                }

                setStats({
                    totalJobs: jobList.length,
                    activeJobs: jobList.filter((j) => j.status !== 'CLOSED').length,
                    totalApplications,
                });
            } catch (err) {
                console.error("Dashboard load error:", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [user]);

    if (loading) return (
        <div className="min-h-screen bg-background-light dark:bg-slate-950 font-display">
            <Navbar />
            <div className="pt-32 flex flex-col items-center justify-center gap-6">
                <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-primary animate-pulse">Syncing Recruitment Cloud...</p>
            </div>
        </div>
    );

    const recruiterInitials = (recruiter?.fullName || user?.email || '??').substring(0, 2).toUpperCase();

    return (
        <div className="min-h-screen bg-background-light dark:bg-slate-950 text-slate-900 dark:text-gray-100 font-display transition-colors duration-200">
            <Navbar />

            <main className="max-w-screen-2xl mx-auto px-4 sm:px-8 py-24">
                {/* Welcome Header */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-12 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm shadow-blue-900/5">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white text-3xl font-black shadow-lg shadow-primary/20">
                        {recruiterInitials}
                    </div>
                    <div className="text-center md:text-left">
                        <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                            Welcome back, <span className="text-primary">{recruiter?.fullName?.split(' ')[0] || 'Recruiter'}</span>! 👋
                        </h1>
                        <p className="text-slate-500 dark:text-gray-400 mt-1 font-medium italic">
                            Today is {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </p>
                        <div className="flex items-center gap-4 mt-4 justify-center md:justify-start">
                            <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-100 dark:border-emerald-900/40">
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                System Active
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global Admin Access</span>
                        </div>
                    </div>
                    <div className="md:ml-auto flex gap-3">
                        <button onClick={() => navigate('/recruiter/jobs')} className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-primary/20 active:scale-95">Post New Job</button>
                    </div>
                </div>

                {/* Stats Bento Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm group hover:border-primary/30 transition-all">
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Inventory</span>
                            <span className="material-symbols-outlined text-primary bg-primary/10 p-2.5 rounded-xl text-2xl group-hover:scale-110 transition-transform">work</span>
                        </div>
                        <p className="text-4xl font-black text-slate-900 dark:text-white">{stats.totalJobs}</p>
                        <p className="text-xs font-bold text-slate-500 dark:text-gray-500 mt-2">Total Job Postings Created</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm group hover:border-emerald-500/30 transition-all">
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Live Traffic</span>
                            <span className="material-symbols-outlined text-emerald-600 bg-emerald-600/10 p-2.5 rounded-xl text-2xl group-hover:scale-110 transition-transform">bolt</span>
                        </div>
                        <p className="text-4xl font-black text-slate-900 dark:text-white">{stats.activeJobs}</p>
                        <p className="text-xs font-bold text-slate-500 dark:text-gray-500 mt-2">Open Positions Accepting Apps</p>
                    </div>

                    <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm group hover:border-secondary/30 transition-all">
                        <div className="flex items-center justify-between mb-6">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Engagement</span>
                            <span className="material-symbols-outlined text-secondary bg-secondary/10 p-2.5 rounded-xl text-2xl group-hover:scale-110 transition-transform">group</span>
                        </div>
                        <p className="text-4xl font-black text-slate-900 dark:text-white">{stats.totalApplications}</p>
                        <p className="text-xs font-bold text-slate-500 dark:text-gray-500 mt-2">Cumulative Candidate Submissions</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Recent Jobs Section */}
                    <div className="lg:col-span-8">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
                            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/20">
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Recent Postings</h2>
                                    <p className="text-xs text-slate-500 dark:text-gray-400 mt-1 font-bold">Latest roles published to the TalentLens network</p>
                                </div>
                                <button
                                    onClick={() => navigate('/recruiter/jobs')}
                                    className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline flex items-center gap-1"
                                >
                                    Manage All <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-50 dark:border-slate-800/50">
                                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Position</th>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                                            <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-400">Posted</th>
                                            <th className="p-6 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Task</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                                        {jobs.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="p-16 text-center italic text-slate-400 dark:text-gray-600 font-bold">No active postings detected.</td>
                                            </tr>
                                        ) : (
                                            jobs.map((job) => (
                                                <tr key={job.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all">
                                                    <td className="p-6">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-primary transition-colors">{job.title}</span>
                                                            <span className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest mt-0.5">{job.domain || 'IT'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-6">
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${job.status?.toLowerCase() === 'closed'
                                                            ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/40'
                                                            : 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/40'
                                                            }`}>
                                                            {job.status || 'ACTIVE'}
                                                        </span>
                                                    </td>
                                                    <td className="p-6 text-xs font-bold text-slate-500 dark:text-gray-400">
                                                        {new Date(job.createdAt || job.postedAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="p-6 text-right">
                                                        <button
                                                            onClick={() => navigate(`/recruiter/jobs/${job.id}/applications`)}
                                                            className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-primary hover:bg-primary hover:text-white transition-all active:scale-90"
                                                            title="Analyze Pipeline"
                                                        >
                                                            <span className="material-symbols-outlined text-lg">analytics</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions Sidebar Layout (Right) */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <div className="bg-slate-900 dark:bg-primary-container/10 rounded-3xl p-8 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden group">
                            <div className="relative z-10">
                                <h3 className="text-xl font-black uppercase tracking-tight mb-4 group-hover:translate-x-1 transition-transform">Global Analytics</h3>
                                <p className="text-slate-400 dark:text-gray-300 text-sm leading-relaxed mb-8">
                                    Analyze collective data across all active pipelines. Optimize your recruitment strategy with ML-driven insights.
                                </p>
                                <button className="w-full py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all active:scale-95 shadow-lg shadow-primary/30">
                                    Generate Report
                                </button>
                            </div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary rounded-full blur-[80px] -mr-16 -mt-16 opacity-50"></div>
                        </div>

                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm flex-1">
                            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400 mb-8 ml-1">Quick Discovery</h3>
                            <div className="space-y-6">
                                <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/recruiter/candidates')}>
                                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-2xl">person_search</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white text-sm">Talent Sourcing</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Direct Search Engine</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/recruiter/messages')}>
                                    <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-2xl">chat_bubble</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white text-sm">Direct Messages</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Communication Center</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/recruiter/settings')}>
                                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:scale-110 transition-transform">
                                        <span className="material-symbols-outlined text-2xl">settings</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white text-sm">Adjust System</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Workflow Config</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default RecruiterDashboard;
