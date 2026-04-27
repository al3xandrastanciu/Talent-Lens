import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import jobService from '../../services/jobService';
import applicationService from '../../services/applicationService';
import candidateService from '../../services/candidateService';
import resumeService from '../../services/resumeService';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/common/Navbar';

const JobDetail = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);
    const [hasApplied, setHasApplied] = useState(false);
    const [message, setMessage] = useState(null);
    const [candidateId, setCandidateId] = useState(null);
    const [resumes, setResumes] = useState([]);
    const [selectedResumeId, setSelectedResumeId] = useState('');
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const [jobData, candidateData] = await Promise.all([
                    jobService.getJobById(id),
                    candidateService.getByUserId(user.id),
                ]);
                setJob(jobData);
                setCandidateId(candidateData.id);

                // Check for existing application
                const [resumesData, applicationsData] = await Promise.all([
                    resumeService.getByCandidate(candidateData.id),
                    applicationService.getByCandidate(candidateData.id)
                ]);

                setResumes(resumesData);
                if (resumesData.length > 0) {
                    setSelectedResumeId(resumesData[0].id);
                }

                const alreadyApplied = applicationsData.some(app => app.jobPosting.id === Number(id));
                setHasApplied(alreadyApplied);

            } catch (err) {
                setMessage({ type: 'error', text: 'Failed to load job details.' });
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id, user]);

    const handleApply = async () => {
        if (!candidateId) {
            setMessage({ type: 'error', text: 'Candidate profile data is missing. Please refresh or update your profile.' });
            return;
        }

        setApplying(true);
        setMessage(null);
        try {
            await applicationService.apply(
                Number(candidateId),
                Number(id),
                selectedResumeId ? Number(selectedResumeId) : null
            );
            setMessage({ type: 'success', text: '🎉 Application submitted successfully!' });
            setHasApplied(true);
            setShowApplyModal(false);
        } catch (err) {
            console.error('Application error:', err);
            const errorData = err?.response?.data;
            const msg = typeof errorData === 'string'
                ? errorData
                : (errorData?.message || errorData?.error || 'A system error occurred.');
            setMessage({ type: 'error', text: `Failed to apply: ${msg}` });
        } finally {
            setApplying(false);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const uploaded = await resumeService.upload(candidateId, file);
            setResumes([uploaded, ...resumes]);
            setSelectedResumeId(uploaded.id);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to upload resume.' });
        } finally {
            setUploading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-background text-on-surface font-body">
            <Navbar />
            <main className="pt-24 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-sm font-bold text-primary animate-pulse uppercase tracking-widest">Aida AI is fetching details...</p>
                </div>
            </main>
        </div>
    );

    if (!job) return (
        <div className="min-h-screen bg-background text-on-surface font-body">
            <Navbar />
            <main className="pt-24 px-8 max-w-4xl mx-auto">
                <div className="bg-error-container text-on-error-container p-6 rounded-xl border border-error/10 mb-8">
                    Job not found.
                </div>
                <button className="flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all" onClick={() => navigate('/jobs')}>
                    <span className="material-symbols-outlined">arrow_back</span> Back to Jobs
                </button>
            </main>
        </div>
    );

    return (
        <div className="min-h-screen bg-background text-on-surface font-body transition-all duration-300">
            <Navbar />

            <main className="pt-24 pb-20 px-4 md:px-8 max-w-4xl mx-auto">
                {/* Breadcrumb & Back Action */}
                <div className="mb-8 flex items-center gap-2 text-on-surface-variant font-medium text-sm group">
                    <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
                    <button onClick={() => navigate('/jobs')} className="hover:text-primary transition-colors bg-transparent border-none">
                        Back to Job Listings
                    </button>
                </div>

                {message && (
                    <div className={`mb-8 p-4 rounded-xl border ${message.type === 'success'
                        ? 'bg-secondary-container text-on-secondary-container border-secondary/20'
                        : 'bg-error-container text-on-error-container border-error/20'
                        } font-bold text-sm shadow-sm animate-in fade-in slide-in-from-top-4 duration-300`}>
                        {message.text}
                    </div>
                )}

                <div className="space-y-8">
                    {/* Hero Header */}
                    <div className="bg-white dark:bg-card-dark rounded-3xl p-8 md:p-10 shadow-sm border border-outline-variant/10">
                        <div className="flex flex-wrap items-center gap-4 mb-6">
                            <span className="bg-secondary-container text-on-secondary-container px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                {job.status || 'Active'}
                            </span>
                            <span className="bg-primary/10 text-primary px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary/20">
                                {job.domain || 'General'}
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold text-on-surface tracking-tight mb-6 leading-tight font-headline">
                            {job.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-6">
                            <div className="flex items-center gap-2 text-on-surface-variant bg-surface-container-low px-4 py-2 rounded-xl">
                                <span className="material-symbols-outlined text-primary text-xl">location_on</span>
                                <span className="font-semibold text-sm">{job.location || 'Remote / Hybrid'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-on-surface-variant bg-surface-container-low px-4 py-2 rounded-xl">
                                <span className="material-symbols-outlined text-primary text-xl">corporate_fare</span>
                                <span className="font-bold text-sm">{job.companyName || 'Corporate Partner'}</span>
                            </div>
                        </div>
                    </div>

                    {/* Description Section */}
                    <div className="bg-white dark:bg-card-dark rounded-3xl p-8 border border-outline-variant/15 shadow-sm">
                        <h2 className="text-2xl font-bold mb-6 text-on-surface flex items-center gap-2 font-headline">
                            <span className="material-symbols-outlined text-primary">description</span>
                            Job Description
                        </h2>
                        <div className="prose prose-slate max-w-none text-on-surface-variant leading-relaxed font-body whitespace-pre-line">
                            {job.description}
                        </div>
                    </div>

                    {/* Requirements Section */}
                    {job.requirements && (
                        <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/5">
                            <h3 className="text-xl font-bold mb-6 text-on-surface flex items-center gap-2 font-headline">
                                <span className="material-symbols-outlined text-secondary">verified</span>
                                Requirements
                            </h3>
                            <div className="text-on-surface-variant leading-relaxed font-body whitespace-pre-line">
                                {job.requirements}
                            </div>
                        </div>
                    )}

                    {/* Skills Section */}
                    {job.skills && job.skills.length > 0 && (
                        <div className="bg-white dark:bg-card-dark rounded-3xl p-8 border border-outline-variant/15 shadow-sm">
                            <h3 className="text-xl font-bold mb-6 text-on-surface flex items-center gap-2 font-headline">
                                <span className="material-symbols-outlined text-tertiary">psychology</span>
                                Required Skills
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {job.skills.map((s, i) => (
                                    <span key={i} className="px-4 py-2 rounded-xl bg-background border border-outline-variant/20 text-on-surface-variant text-sm font-semibold hover:border-primary/50 transition-colors cursor-default">
                                        {s.name || s}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Application CTA */}
                    <div className="pt-8 flex flex-col sm:flex-row gap-4">
                        {job.status === 'CLOSED' ? (
                            <div className="flex-1 bg-surface-container-high text-on-surface-variant p-4 rounded-2xl text-center font-bold uppercase tracking-widest border border-outline-variant/20">
                                Applications Closed
                            </div>
                        ) : hasApplied ? (
                            <div className="flex-1 bg-secondary-container text-on-secondary-container py-4 rounded-2xl font-black text-md uppercase tracking-widest flex items-center justify-center gap-2 border border-secondary/20 shadow-sm">
                                Applied
                                <span className="material-symbols-outlined text-secondary">check_circle</span>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowApplyModal(true)}
                                disabled={applying || message?.type === 'success'}
                                className="flex-1 bg-primary hover:bg-primary-hover text-white py-4 rounded-2xl font-black text-md uppercase tracking-widest shadow-xl shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100"
                            >
                                {applying ? 'Applying...' : 'Apply Now'}
                                <span className="material-symbols-outlined">send</span>
                            </button>
                        )}
                        {/* <button className="px-8 bg-white border border-outline-variant text-on-surface py-4 rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-surface-container-low transition-colors flex items-center justify-center gap-2">
                            Save Job
                            <span className="material-symbols-outlined">bookmark</span>
                        </button> */}
                    </div>
                </div>

                {/* Apply Modal */}
                {showApplyModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-md animate-in fade-in duration-300">
                        <div className="bg-white dark:bg-card-dark rounded-[2.5rem] w-full max-w-lg shadow-2xl border border-outline-variant/10 overflow-hidden animate-in zoom-in-95 duration-300">
                            <div className="p-8 pb-4 flex justify-between items-center border-b border-outline-variant/5">
                                <h2 className="text-2xl font-black text-on-surface font-headline tracking-tight">Apply for Role</h2>
                                <button onClick={() => setShowApplyModal(false)} className="size-10 flex items-center justify-center rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <p className="text-sm font-bold text-on-surface-variant uppercase tracking-widest">Select your Resume</p>
                                    <p className="text-xs text-on-surface-variant/70 italic">Pick the best profile for this matching algorithm.</p>
                                </div>

                                {resumes.length > 0 ? (
                                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {resumes.map(r => (
                                            <label
                                                key={r.id}
                                                className={`group flex items-center gap-4 p-4 rounded-2xl border-2 transition-all cursor-pointer ${selectedResumeId === r.id
                                                    ? 'border-primary bg-primary/5 shadow-sm'
                                                    : 'border-outline-variant/10 bg-surface-container-lowest hover:border-primary/40'
                                                    }`}
                                            >
                                                <div className={`size-5 rounded-full border-2 flex items-center justify-center transition-all ${selectedResumeId === r.id ? 'border-primary' : 'border-outline-variant'
                                                    }`}>
                                                    {selectedResumeId === r.id && <div className="size-2.5 bg-primary rounded-full"></div>}
                                                </div>
                                                <input
                                                    type="radio"
                                                    className="hidden"
                                                    name="resume"
                                                    value={r.id}
                                                    checked={selectedResumeId === r.id}
                                                    onChange={() => setSelectedResumeId(r.id)}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-black text-sm text-on-surface truncate uppercase tracking-tight">{r.fileName || `RESUME_${r.id}`}</div>
                                                    <div className="text-[10px] text-on-surface-variant/60 font-medium">Uploaded {new Date(r.uploadedAt).toLocaleDateString()}</div>
                                                </div>
                                                <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 transition-opacity">description</span>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-6 bg-surface-container-low rounded-2xl border border-outline-variant/10 text-center space-y-2">
                                        <span className="material-symbols-outlined text-4xl text-on-surface-variant/30">upload_file</span>
                                        <p className="text-sm font-bold text-on-surface-variant">No resumes found</p>
                                    </div>
                                )}

                                <div className="pt-4 flex flex-col gap-4">
                                    <label className="flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-outline-variant/30 rounded-2xl text-sm font-black text-on-surface-variant hover:border-primary hover:text-primary transition-all cursor-pointer">
                                        <input type="file" className="hidden" accept=".pdf,.docx" onChange={handleFileUpload} />
                                        <span className="material-symbols-outlined">{uploading ? 'sync' : 'add'}</span>
                                        {uploading ? 'Uploading...' : 'Add New Resume'}
                                    </label>

                                    <button
                                        onClick={handleApply}
                                        disabled={applying || !selectedResumeId || uploading}
                                        className="w-full py-4 bg-primary text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50 disabled:scale-100"
                                    >
                                        {applying ? 'Submitting Application...' : 'Confirm & Apply'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default JobDetail;
