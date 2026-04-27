import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import jobService from '../../services/jobService';
import Navbar from '../../components/common/Navbar';
import JobCard from '../../components/jobs/JobCard';

const JobBoard = () => {
    const [jobs, setJobs] = useState([]);
    const [keyword, setKeyword] = useState('');
    const [selectedDomain, setSelectedDomain] = useState('All');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const loadJobs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            let data;
            if (keyword.trim()) {
                data = await jobService.searchJobs(keyword);
            } else if (selectedDomain !== 'All') {
                data = await jobService.getJobsByDomain(selectedDomain);
            } else {
                data = await jobService.getAllJobs();
            }
            setJobs(data);
        } catch (err) {
            setError('Failed to load jobs. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [keyword, selectedDomain]);

    useEffect(() => {
        const delay = setTimeout(() => {
            loadJobs();
        }, 400);
        return () => clearTimeout(delay);
    }, [loadJobs]);

    const handleApply = (id) => {
        navigate(`/jobs/${id}`);
    };

    const handleViewDetails = (id) => {
        navigate(`/jobs/${id}`);
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-display transition-colors duration-200">
            <Navbar />

            <main className="w-full max-w-[1000px] mx-auto px-4 lg:px-10 py-10">
                {/* Hero Section */}
                <div className="flex flex-col gap-2 mb-12 text-center md:text-left">
                    <h1 className="text-text-main-light dark:text-text-main-dark text-4xl md:text-5xl font-black leading-tight tracking-[-0.033em]">
                        Find Your Next Opportunity
                    </h1>
                    <p className="text-text-secondary-light dark:text-text-secondary-dark text-lg md:text-xl font-normal max-w-2xl">
                        Browse roles tailored to your profile with our automated CV matching technology.
                    </p>
                </div>

                {/* Search and Filters Hub */}
                <div className="mb-10 space-y-6">
                    {/* Search Bar */}
                    <div className="relative group">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary-light group-focus-within:text-primary transition-colors">search</span>
                        <input
                            type="text"
                            className="w-full h-14 pl-12 pr-4 bg-white dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl shadow-sm focus:border-primary focus:ring-0 outline-none transition-all text-sm"
                            placeholder="Search jobs by title, department or keyword..."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                    </div>

                    {/* Department / Domain Filters */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-widest text-text-secondary-light mr-2">Filter by Department:</span>
                        {['All', 'IT', 'Finance', 'Marketing', 'Sales', 'Others'].map(domain => (
                            <button
                                key={domain}
                                onClick={() => setSelectedDomain(domain)}
                                className={`px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 active:scale-95 ${selectedDomain === domain
                                    ? 'bg-primary text-white shadow-md shadow-blue-500/20'
                                    : 'bg-white dark:bg-card-dark text-text-secondary-light border border-border-light dark:border-border-dark hover:border-primary/50'
                                    }`}
                            >
                                {domain}
                            </button>
                        ))}
                    </div>

                    <div className="flex justify-between items-center px-1">
                        <span className="text-sm font-medium text-text-secondary-light">
                            Showing <span className="text-text-main-light dark:text-text-main-dark font-bold">{jobs.length}</span> positions
                        </span>
                    </div>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-error-container text-on-error-container text-sm font-bold rounded-xl border border-error/10">
                        {error}
                    </div>
                )}

                {/* Job Listings */}
                {loading ? (
                    <div className="flex flex-col gap-4 animate-pulse">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-40 bg-white dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark"></div>
                        ))}
                    </div>
                ) : jobs.length === 0 ? (
                    <div className="py-20 text-center bg-white dark:bg-card-dark rounded-xl border border-border-light dark:border-border-dark shadow-sm">
                        <span className="material-symbols-outlined text-6xl text-slate-200 mb-4">search_off</span>
                        <h3 className="text-xl font-bold text-text-main-light dark:text-text-main-dark">No jobs found</h3>
                        <p className="text-text-secondary-light">Try adjusting your search or filters to find what you're looking for.</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {jobs.map((job) => (
                            <JobCard
                                key={job.id}
                                job={job}
                                onClick={handleViewDetails}
                                onApply={handleApply}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination (Visual Only for now) */}
                <div className="mt-16 flex items-center justify-center gap-2">
                    <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-card-dark text-text-secondary-light hover:bg-gray-50 transition-colors disabled:opacity-50">
                        <span className="material-symbols-outlined text-sm">chevron_left</span>
                    </button>
                    <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white font-bold text-sm shadow-md shadow-blue-500/20">
                        1
                    </button>
                    <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-card-dark text-text-main-light font-medium text-sm hover:bg-gray-50 transition-colors">
                        2
                    </button>
                    <span className="px-2 text-text-secondary-light">...</span>
                    <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-card-dark text-text-main-light font-medium text-sm hover:bg-gray-50 transition-colors">
                        8
                    </button>
                    <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-border-light dark:border-border-dark bg-white dark:bg-card-dark text-text-secondary-light hover:bg-gray-50 transition-colors">
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                </div>
            </main>

            {/* Simple Footer */}
            <footer className="mt-auto border-t border-border-light dark:border-border-dark bg-white dark:bg-card-dark py-10">
                <div className="max-w-[1000px] mx-auto px-4 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col items-center md:items-start gap-1">


                    </div>

                </div>
            </footer>
        </div>
    );
};

export default JobBoard;
