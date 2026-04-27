import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import applicationService from '../../services/applicationService';
import candidateService from '../../services/candidateService';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/common/Navbar';

const statusMapping = {
    PENDING: { label: 'In Review', color: 'bg-yellow-50 text-yellow-700 ring-yellow-600/20', icon: 'pending_actions' },
    REVIEWED: { label: 'Under Review', color: 'bg-blue-50 text-blue-700 ring-blue-600/20', icon: 'visibility' },
    ACCEPTED: { label: 'Offer Received', color: 'bg-green-50 text-green-700 ring-green-600/20', icon: 'check_circle' },
    REJECTED: { label: 'Rejected', color: 'bg-gray-100 text-gray-600 ring-gray-500/20', icon: 'cancel' },
};

const domainIcons = {
    IT: 'code',
    Finance: 'payments',
    Marketing: 'campaign',
    Sales: 'trending_up',
    Design: 'design_services',
    Engineering: 'construction',
    HR: 'groups',
};

const MyApplications = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    useEffect(() => {
        if (!user || !user.id) return;

        const load = async () => {
            try {
                setLoading(true);
                const candidate = await candidateService.getByUserId(user.id);
                if (candidate && candidate.id) {
                    const data = await applicationService.getByCandidate(candidate.id);
                    setApplications(data);
                }
            } catch (err) {
                console.error("Error loading candidate applications:", err);
                setMessage({ type: 'error', text: 'Failed to load applications. Please try again later.' });
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [user]);

    const handleWithdraw = async (appId) => {
        if (!window.confirm('Are you sure you want to withdraw this application?')) return;
        try {
            await applicationService.withdraw(appId);
            setApplications((prev) => prev.filter((a) => a.id !== appId));
            setMessage({ type: 'success', text: 'Application withdrawn successfully.' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to withdraw application.' });
        }
    };

    const stats = useMemo(() => ({
        total: applications.length,
        active: applications.filter(a => a.status === 'PENDING' || a.status === 'REVIEWED').length,
        actionRequired: applications.filter(a => a.status === 'REVIEWED').length
    }), [applications]);

    const filteredApplications = useMemo(() => {
        return applications.filter(app => {
            const matchesSearch = (app.jobPosting?.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (app.jobPosting?.companyName || '').toLowerCase().includes(searchTerm.toLowerCase());

            if (statusFilter === 'ALL') return matchesSearch;
            if (statusFilter === 'ACTIVE') return matchesSearch && (app.status === 'PENDING' || app.status === 'REVIEWED');
            if (statusFilter === 'ARCHIVED') return matchesSearch && (app.status === 'REJECTED' || app.status === 'ACCEPTED');
            return matchesSearch;
        });
    }, [applications, searchTerm, statusFilter]);

    if (loading) return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-display">
            <Navbar />
            <main className="pt-24 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-sm font-bold text-primary animate-pulse uppercase tracking-widest">Aida AI is loading your dashboard...</p>
                </div>
            </main>
        </div>
    );

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark text-text-main-light dark:text-text-main-dark font-display transition-colors duration-200">
            <Navbar />

            <main className="pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                {/* Header Section */}
                <div className="w-full mb-8">
                    <h2 className="text-3xl font-black tracking-tight text-text-main-light dark:text-text-main-dark mb-2">My Applications</h2>
                    <p className="text-text-sub-light dark:text-text-sub-dark text-base">Track the progress of your current job applications in real-time.</p>
                </div>

                {message && (
                    <div className={`mb-8 p-4 rounded-xl border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                        } font-bold text-sm shadow-sm animate-in fade-in slide-in-from-top-4`}>
                        {message.text}
                    </div>
                )}

                {/* Stats Section */}
                <div className="w-full grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-text-sub-light dark:text-text-sub-dark font-medium">Total Applications</p>
                            <span className="material-symbols-outlined text-primary bg-primary/10 p-2 rounded-lg">folder_open</span>
                        </div>
                        <p className="text-3xl font-bold text-text-main-light dark:text-text-main-dark">{stats.total}</p>
                    </div>

                    <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-text-sub-light dark:text-text-sub-dark font-medium">Active Processes</p>
                            <span className="material-symbols-outlined text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-lg">pending_actions</span>
                        </div>
                        <p className="text-3xl font-bold text-text-main-light dark:text-text-main-dark">{stats.active}</p>
                    </div>

                    <div className="bg-card-light dark:bg-card-dark border border-primary dark:border-primary/50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow ring-1 ring-primary/5">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-primary dark:text-primary font-medium">Action Required</p>
                            <span className="material-symbols-outlined text-red-500 bg-red-100 dark:bg-red-900/30 p-2 rounded-lg">assignment_late</span>
                        </div>
                        <p className="text-3xl font-bold text-text-main-light dark:text-text-main-dark">{stats.actionRequired}</p>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="w-full bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
                    {/* Filters Toolbar */}
                    <div className="p-4 sm:p-6 border-b border-border-light dark:border-border-dark flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-gray-50/50 dark:bg-background-dark/30">
                        <div className="relative w-full sm:w-96">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-sub-light dark:text-text-sub-dark">
                                <span className="material-symbols-outlined">search</span>
                            </div>
                            <input
                                className="block w-full rounded-lg border-0 py-2.5 pl-10 pr-4 text-text-main-light dark:text-text-main-dark bg-white dark:bg-border-dark ring-1 ring-inset ring-border-light dark:ring-border-dark placeholder:text-text-sub-light dark:placeholder:text-text-sub-dark focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 shadow-sm"
                                placeholder="Search by job title or company..."
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                            {['ALL', 'ACTIVE', 'ARCHIVED'].map((filter) => (
                                <button
                                    key={filter}
                                    onClick={() => setStatusFilter(filter)}
                                    className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all ${statusFilter === filter
                                            ? 'bg-text-main-light dark:bg-text-main-dark text-white shadow'
                                            : 'bg-white dark:bg-border-dark border border-border-light dark:border-border-dark text-text-sub-light dark:text-text-sub-dark hover:bg-secondary dark:hover:bg-gray-700'
                                        }`}
                                >
                                    {filter.charAt(0) + filter.slice(1).toLowerCase()} Statuses
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Application List */}
                    <div className="divide-y divide-border-light dark:divide-border-dark flex-1">
                        {filteredApplications.length > 0 ? (
                            filteredApplications.map((app) => {
                                const status = statusMapping[app.status] || statusMapping.PENDING;
                                const domainIcon = domainIcons[app.jobPosting?.domain] || 'work';
                                return (
                                    <div key={app.id} className="group p-4 sm:p-6 hover:bg-background-light dark:hover:bg-background-dark/50 transition-colors">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="flex items-start gap-4 flex-1">
                                                <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                    <span className="material-symbols-outlined">{domainIcon}</span>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="text-base font-semibold text-text-main-light dark:text-text-main-dark group-hover:text-primary transition-colors truncate">
                                                        {app.jobPosting?.title || `Job #${app.jobId}`}
                                                    </h3>
                                                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-text-sub-light dark:text-text-sub-dark">
                                                        <span className="flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-[16px]">apartment</span> {app.jobPosting?.companyName || 'Corporate Partner'}
                                                        </span>
                                                        <span className="flex items-center gap-1">
                                                            <span className="material-symbols-outlined text-[16px]">calendar_today</span> Applied {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 w-full sm:w-auto">
                                                <div className="flex flex-col items-start sm:items-end">
                                                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${status.color}`}>
                                                        {status.label}
                                                    </span>
                                                    <span className="text-xs text-text-sub-light dark:text-text-sub-dark mt-1">Updated recently</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => navigate(`/jobs/${app.jobPosting?.id || app.jobId}`)}
                                                        className="rounded-lg bg-white dark:bg-border-dark px-3 py-2 text-sm font-semibold text-text-main-light dark:text-text-main-dark shadow-sm ring-1 ring-inset ring-border-light dark:ring-border-dark hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                                                    >
                                                        Details
                                                    </button>
                                                    {(app.status === 'PENDING' || app.status === 'REVIEWED') && (
                                                        <button
                                                            onClick={() => handleWithdraw(app.id)}
                                                            className="rounded-lg bg-red-50 dark:bg-red-900/20 px-3 py-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-100 transition-all"
                                                        >
                                                            Withdraw
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-12 text-center flex flex-col items-center justify-center gap-4 text-text-sub-light dark:text-text-sub-dark">
                                <span className="material-symbols-outlined text-6xl opacity-20">inventory_2</span>
                                <p className="font-medium">No applications found matching your criteria.</p>
                                <button className="btn btn-primary" onClick={() => navigate('/jobs')}>Explore Job Board</button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default MyApplications;
