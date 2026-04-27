import React from 'react';

const JobCard = ({ job, onClick, onApply }) => {
    // Mapping domain to a readable "Department" and icon
    const getDepartmentIcon = (domain) => {
        switch (domain?.toUpperCase()) {
            case 'IT': return 'laptop_mac';
            case 'FINANCE': return 'payments';
            case 'MARKETING': return 'campaign';
            case 'SALES': return 'trending_up';
            default: return 'work';
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return 'Recently';
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: 'numeric', month: 'short', year: 'numeric',
        });
    };

    return (
        <article className="group relative flex flex-col md:flex-row md:items-center justify-between gap-6 rounded-xl bg-white dark:bg-card-dark p-6 shadow-sm border border-border-light dark:border-border-dark hover:shadow-md hover:border-primary/30 transition-all duration-300 cursor-pointer"
            onClick={() => onClick(job.id)}>
            <div className="flex-1 flex flex-col gap-3">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-xl font-bold text-text-main-light dark:text-text-main-dark group-hover:text-primary transition-colors">
                            {job.title}
                        </h3>
                        <p className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
                            {job.companyName || 'Corporate Partner'}
                        </p>
                    </div>
                    {/* Department Badge */}
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                        <span className="material-symbols-outlined text-xs">{getDepartmentIcon(job.domain)}</span>
                        {job.domain || 'General'}
                    </span>
                </div>

                <div className="flex flex-wrap gap-2 text-xs font-medium text-text-secondary-light dark:text-text-secondary-dark">
                    <span className="flex items-center gap-1 px-2 py-1 rounded bg-background-light dark:bg-background-dark">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        {job.location || 'Remote / Bucharest'}
                    </span>
                    <span className="flex items-center gap-1 px-2 py-1 rounded bg-background-light dark:bg-background-dark">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        Full-time
                    </span>
                    <span className="flex items-center gap-1 px-2 py-1 rounded bg-background-light dark:bg-background-dark">
                        <span className="material-symbols-outlined text-sm">calendar_today</span>
                        {formatDate(job.createdAt || job.publishedAt)}
                    </span>
                </div>

                <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark line-clamp-2">
                    {job.description}
                </p>

                {job.skills && job.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                        {job.skills.slice(0, 3).map((skill, index) => (
                            <span key={index} className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-400 font-medium">
                                {skill.name || skill}
                            </span>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex flex-row md:flex-col gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                <button
                    onClick={() => onClick(job.id)}
                    className="flex-1 md:w-32 h-10 rounded-lg border border-border-light dark:border-border-dark text-text-main-light dark:text-text-main-dark font-semibold text-sm hover:bg-background-light dark:hover:bg-gray-800 transition-colors"
                >
                    Details
                </button>
                <button
                    onClick={() => onApply(job.id)}
                    className="flex-1 md:w-32 h-10 rounded-lg bg-primary text-white font-semibold text-sm hover:bg-primary-hover transition-colors shadow-sm shadow-blue-500/20"
                >
                    Apply Now
                </button>
            </div>
        </article>
    );
};

export default JobCard;
