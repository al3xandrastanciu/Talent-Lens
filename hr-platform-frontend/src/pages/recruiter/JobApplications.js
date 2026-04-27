import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import applicationService from '../../services/applicationService';
import jobService from '../../services/jobService';
import Navbar from '../../components/common/Navbar';

const JobApplications = () => {
    const { jobId } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = useState(null);
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);
    const [selectedApp, setSelectedApp] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [mlResult, setMlResult] = useState(null);
    const [classifying, setClassifying] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const [jobData, appData] = await Promise.all([
                    jobService.getJobById(jobId),
                    applicationService.getByJob(jobId),
                ]);
                setJob(jobData);

                const appsWithScores = await Promise.all(appData.map(async (app) => {
                    try {
                        const mlData = await applicationService.getMLResult(app.id);
                        return { ...app, mlScore: mlData?.score || 0 };
                    } catch (err) {
                        return { ...app, mlScore: 0 };
                    }
                }));

                setApplications(appsWithScores.sort((a, b) => (b.mlScore || 0) - (a.mlScore || 0)));
            } catch (err) {
                setMessage({ type: 'error', text: 'Failed to synchronize candidate pipelines.' });
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [jobId]);

    const showMsg = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const handleViewProfile = async (app) => {
        setSelectedApp(app);
        setMlResult(null);
        setShowModal(true);
        try {
            const res = await applicationService.getMLResult(app.id);
            if (res) setMlResult(res);
        } catch (_) { }
    };

    const handleClassify = async () => {
        if (!selectedApp) return;
        setClassifying(true);
        try {
            const res = await applicationService.classify(selectedApp.id);
            setMlResult(res);
            // Update the list score too
            setApplications(prev => prev.map(a => a.id === selectedApp.id ? { ...a, mlScore: res.score } : a).sort((a, b) => (b.mlScore || 0) - (a.mlScore || 0)));
            showMsg('success', 'AI score recalibrated for candidate.');
        } catch (err) {
            showMsg('error', 'Classification engine offline.');
        } finally {
            setClassifying(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-background-light dark:bg-slate-950 font-display transition-colors">
            <Navbar />
            <div className="pt-32 flex flex-col items-center justify-center gap-6">
                <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-primary animate-pulse">Analyzing Candidate Match Scores...</p>
            </div>
        </div>
    );

    const getScoreColor = (score) => {
        if (!score && score !== 0) return { bg: 'bg-slate-500', text: 'text-slate-600', dot: 'bg-slate-500' };
        if (score >= 0.7) return { bg: 'bg-emerald-500', text: 'text-emerald-600', dot: 'bg-emerald-500' };
        if (score >= 0.4) return { bg: 'bg-amber-500', text: 'text-amber-600', dot: 'bg-amber-500' };
        return { bg: 'bg-rose-500', text: 'text-rose-600', dot: 'bg-rose-500' };
    };

    const getMatchLabel = (score) => {
        if (!score && score !== 0) return 'NOT EVALUATED';
        if (score >= 0.7) return 'HIGH MATCH';
        if (score >= 0.4) return 'POTENTIAL';
        return 'LOW MATCH';
    };

    return (
        <div className="min-h-screen bg-background-light dark:bg-slate-950 text-slate-900 dark:text-gray-100 font-display transition-colors duration-200">
            <Navbar />

            <main className="max-w-screen-2xl mx-auto px-4 sm:px-8 py-24">
                {/* Context Header */}
                <div className="mb-12">
                    <button
                        onClick={() => navigate('/recruiter/jobs')}
                        className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-[10px] font-black uppercase tracking-widest mb-6"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                        Back to Management
                    </button>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full">Recruitment Pipeline</span>
                            </div>
                            <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">
                                {job?.title || 'Job Applicants'}
                            </h1>
                            <p className="text-slate-500 dark:text-gray-400 text-lg flex items-center gap-2">
                                <span className="material-symbols-outlined text-base">group</span>
                                {applications.length} Candidates currently in review
                            </p>
                        </div>
                        {job?.status !== 'CLOSED' && (
                            <div className="px-6 py-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-4">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                <span className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Position Active & Open</span>
                            </div>
                        )}
                    </div>
                </div>

                {message && (
                    <div className={`mb-8 p-4 rounded-xl border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                        } font-bold text-sm shadow-sm`}>
                        {message.text}
                    </div>
                )}

                {/* Applications Table */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[900px]">
                            <thead>
                                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Candidate Role Profile</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">AI Compatibility</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Applied Date</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Process Status</th>
                                    <th className="p-6 text-right text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Decisions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {applications.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="p-32 text-center">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center">
                                                    <span className="material-symbols-outlined text-4xl text-slate-300">person_off</span>
                                                </div>
                                                <p className="text-slate-500 font-bold">No applications detected for this posting yet.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    applications.map((app, idx) => (
                                        <tr key={app.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all">
                                            <td className="p-6">
                                                <div className="flex items-center gap-5">
                                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center text-primary font-black text-xs shadow-sm shadow-slate-200 dark:shadow-none border border-slate-200 dark:border-slate-700">
                                                        {app.candidate?.fullName?.substring(0, 2).toUpperCase() || '??'}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">{app.candidate?.fullName || 'Anonymous Candidate'}</span>
                                                        <span className="text-[10px] font-black text-slate-400 dark:text-gray-500 uppercase tracking-widest mt-0.5">{app.candidate?.user?.email || 'no-email@talentlens.io'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center justify-between min-w-[120px]">
                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${getScoreColor(app.mlScore).text}`}>
                                                            {getMatchLabel(app.mlScore)}
                                                        </span>
                                                        <span className="text-[10px] font-black text-slate-500">{(app.mlScore * 100 || 0).toFixed(0)}%</span>
                                                    </div>
                                                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full ${getScoreColor(app.mlScore).bg} transition-all duration-1000`}
                                                            style={{ width: `${app.mlScore * 100 || 0}%` }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                                                {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-6 text-center">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${app.status === 'ACCEPTED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400' :
                                                    app.status === 'REJECTED' ? 'bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-900/20 dark:text-rose-400' :
                                                        'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400'
                                                    }`}>
                                                    {app.status || 'PENDING'}
                                                </span>
                                            </td>
                                            <td className="p-6 text-right">
                                                <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                    <button
                                                        onClick={() => handleViewProfile(app)}
                                                        className="p-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-gray-400 hover:text-primary transition-all shadow-sm active:scale-90"
                                                        title="Quick Profile View"
                                                    >
                                                        <span className="material-symbols-outlined text-lg">visibility</span>
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/recruiter/evaluate/${app.id}`)}
                                                        className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-slate-900/10"
                                                    >
                                                        Evaluate
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
            </main>

            {/* Candidate Quick-View Modal */}
            {showModal && selectedApp && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
                    <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
                    <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/30 dark:bg-slate-800/20">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-white text-xl font-black">
                                    {selectedApp.candidate?.fullName?.substring(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{selectedApp.candidate?.fullName}</h2>
                                    <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{selectedApp.candidate?.user?.email}</p>
                                </div>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-full transition-colors shadow-sm">
                                <span className="material-symbols-outlined text-slate-400">close</span>
                            </button>
                        </div>

                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[60vh] overflow-y-auto font-display">
                            {/* AI Match Stats */}
                            <div className="space-y-6">
                                <div className="p-6 bg-slate-900 dark:bg-primary-container/10 rounded-2xl text-white relative overflow-hidden group">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] mb-6 opacity-70">AI Classification Result</h3>
                                    {mlResult ? (
                                        <div className="relative z-10">
                                            <div className="text-5xl font-black mb-2">{(mlResult.score * 100).toFixed(0)}%</div>
                                            <div className="flex items-center gap-2 mb-6">
                                                <span className={`w-2 h-2 rounded-full ${getScoreColor(mlResult.score).dot}`}></span>
                                                <span className="text-[10px] font-black uppercase tracking-widest">{getMatchLabel(mlResult.score)}</span>
                                            </div>
                                            <p className="text-xs text-slate-400 leading-relaxed">The system identified a {mlResult.score > 0.7 ? 'high' : 'moderate'} compatibility match with your job requirements.</p>
                                        </div>
                                    ) : (
                                        <div className="text-center py-4 relative z-10">
                                            <p className="text-xs text-slate-400 mb-6">No score calculated for this candidate yet.</p>
                                            <button
                                                onClick={handleClassify}
                                                disabled={classifying}
                                                className="w-full py-3 bg-primary text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-primary-dark transition-all disabled:opacity-50"
                                            >
                                                {classifying ? 'Processing...' : 'Run ML Analysis'}
                                            </button>
                                        </div>
                                    )}
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-primary/20 rounded-full blur-[50px] -mr-12 -mt-12"></div>
                                </div>

                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Candidate Tech Stack</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedApp.candidate?.skills?.length > 0 ? (
                                            selectedApp.candidate.skills.map((s, i) => (
                                                <span key={i} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[10px] font-black text-slate-600 dark:text-gray-400 lowercase tracking-wider">
                                                    #{s.name || s}
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-[10px] italic text-slate-400">No skills where mentioned.</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Skills Match Breakdown */}
                            <div className="space-y-6">
                                {mlResult && (
                                    <>
                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-emerald-500 ml-1 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-sm">check_circle</span>
                                                Matched Criteria
                                            </h4>
                                            <p className="text-xs font-bold text-slate-600 dark:text-gray-400 leading-relaxed bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10">
                                                {mlResult.matchedSkills || 'No direct skills match detected.'}
                                            </p>
                                        </div>

                                        <div className="space-y-4">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-rose-500 ml-1 flex items-center gap-2">
                                                <span className="material-symbols-outlined text-sm">warning</span>
                                                Growth Areas
                                            </h4>
                                            <p className="text-xs font-bold text-slate-600 dark:text-gray-400 leading-relaxed bg-rose-500/5 p-4 rounded-xl border border-rose-500/10">
                                                {mlResult.missingSkills || 'All core requirements fulfilled.'}
                                            </p>
                                        </div>
                                    </>
                                )}

                                <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">CV Insight</h4>
                                    <div className="text-[10px] text-slate-500 dark:text-gray-500 leading-loose italic">
                                        "{selectedApp.resume?.extractedText?.substring(0, 180)}..."
                                    </div>
                                    {selectedApp.resume && (
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const res = await fetch(`http://localhost:8080/api/resumes/download/${selectedApp.resume.id}`);
                                                    if (!res.ok) {
                                                        alert('CV file not found on server. The physical file may have been deleted.');
                                                        return;
                                                    }
                                                    const blob = await res.blob();
                                                    const url = window.URL.createObjectURL(blob);
                                                    const a = document.createElement('a');
                                                    a.href = url;
                                                    a.download = selectedApp.resume.filePath?.split('/').pop() || 'resume.pdf';
                                                    a.click();
                                                    window.URL.revokeObjectURL(url);
                                                } catch (e) {
                                                    alert('Download failed: ' + e.message);
                                                }
                                            }}
                                            className="w-full mt-6 py-3 border border-slate-200 dark:border-slate-800 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-gray-400 hover:bg-white dark:hover:bg-slate-900 transition-all flex items-center justify-center gap-2"
                                        >
                                            <span className="material-symbols-outlined text-sm">download</span>
                                            Download Document
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-8 bg-slate-50/50 dark:bg-slate-950/80 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                            <button className="px-8 py-4 bg-slate-900 hover:bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/10 transition-all active:scale-95" onClick={() => navigate(`/recruiter/evaluate/${selectedApp.id}`)}>
                                Start Full Evaluation
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobApplications;
