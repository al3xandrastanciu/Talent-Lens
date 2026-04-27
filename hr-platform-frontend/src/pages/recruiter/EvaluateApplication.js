import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import evaluationService from '../../services/evaluationService';
import applicationService from '../../services/applicationService';
import { useAuth } from '../../context/AuthContext';
import recruiterService from '../../services/recruiterService';
import Navbar from '../../components/common/Navbar';

const EvaluateApplication = () => {
    const { applicationId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [application, setApplication] = useState(null);
    const [existingEval, setExistingEval] = useState(null);
    const [recruiterId, setRecruiterId] = useState(null);
    const [form, setForm] = useState({
        interviewDate: '',
        interviewrating: 3,
        comments: '',
        finalDecision: 'PENDING',
    });
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const load = async () => {
            try {
                const [rec, app] = await Promise.all([
                    recruiterService.getByUserId(user.id),
                    applicationService.getById(applicationId),
                ]);
                setRecruiterId(rec.id);
                setApplication(app);

                try {
                    const ev = await evaluationService.getByApplication(applicationId);
                    if (ev) {
                        setExistingEval(ev);
                        setForm({
                            interviewDate: ev.interviewDate ? ev.interviewDate.split('T')[0] : '',
                            interviewrating: ev.interviewrating || 3,
                            comments: ev.comments || '',
                            finalDecision: ev.finalDecision || 'PENDING',
                        });
                    }
                } catch (_) { }
            } catch (err) {
                setMessage({ type: 'error', text: 'Failed to access candidate evaluation protocol.' });
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [applicationId, user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setMessage(null);
        try {
            const payload = {
                applicationId: Number(applicationId),
                recruiterId,
                interviewDate: form.interviewDate,
                interviewrating: Number(form.interviewrating),
                comments: form.comments,
                finalDecision: form.finalDecision,
            };
            if (existingEval) {
                await evaluationService.updateEvaluation(existingEval.id, payload);
            } else {
                await evaluationService.createEvaluation(payload);
            }
            setMessage({ type: 'success', text: 'Decision recorded successfully. The candidate pipeline has been updated.' });
            setTimeout(() => navigate(-1), 2000);
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to transmit decision. System retry engaged.' });
        } finally {
            setSubmitting(false);
        }
    };

    const StarRating = () => (
        <div className="flex gap-2 items-center">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => setForm({ ...form, interviewrating: star })}
                    className={`material-symbols-outlined text-3xl transition-all ${star <= form.interviewrating ? 'text-amber-400 fill-[1] scale-110' : 'text-slate-300 dark:text-slate-700'
                        } hover:scale-125`}
                    style={{ fontVariationSettings: "'FILL' " + (star <= form.interviewrating ? 1 : 0) }}
                >
                    star
                </button>
            ))}
            <span className="text-xs font-black text-slate-400 ml-3 tracking-widest">{form.interviewrating}/5 SCALE</span>
        </div>
    );

    if (loading) return (
        <div className="min-h-screen bg-background-light dark:bg-slate-950 font-display transition-colors">
            <Navbar />
            <div className="pt-32 flex flex-col items-center justify-center gap-6">
                <div className="w-16 h-16 border-4 border-primary/10 border-t-primary rounded-full animate-spin"></div>
                <p className="text-xs font-black uppercase tracking-[0.3em] text-primary animate-pulse">Retreiving Candidate Dossier...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background-light dark:bg-slate-950 text-slate-900 dark:text-gray-100 font-display transition-colors duration-200 pb-20">
            <Navbar />

            <main className="max-w-4xl mx-auto px-4 sm:px-8 py-24">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors text-[10px] font-black uppercase tracking-widest mb-10"
                >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    Abort & Back
                </button>

                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden mb-8">
                    <div className="p-8 md:p-12 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
                        <div className="flex flex-col md:flex-row items-center gap-8 text-center md:text-left">
                            <div className="w-24 h-24 rounded-3xl bg-primary flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-primary/30">
                                {application?.candidate?.fullName?.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase mb-1">
                                    {existingEval ? 'Update Case Study' : 'Executive Evaluation'}
                                </h1>
                                <p className="text-slate-500 font-bold text-lg uppercase tracking-tight">
                                    {application?.candidate?.fullName} — <span className="text-primary">{application?.jobPosting?.title}</span>
                                </p>
                                <div className="flex flex-wrap gap-4 mt-6 justify-center md:justify-start">
                                    <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right leading-none">Status<br /><span className="text-primary">{application?.applicationStatus || application?.status}</span></span>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right leading-none">Score<br /><span className="text-amber-500">{(application?.classificationResult?.score * 100 || 0).toFixed(0)}%</span></span>
                                    </div>

                                    {/* Resume Download Action */}
                                    {application?.resume && (
                                        <button
                                            onClick={async () => {
                                                try {
                                                    const res = await fetch(`http://localhost:8080/api/resumes/download/${application.resume.id}`);
                                                    if (!res.ok) {
                                                        alert('CV file not found on server. The physical file may have been deleted.');
                                                        return;
                                                    }
                                                    const blob = await res.blob();
                                                    const url = window.URL.createObjectURL(blob);
                                                    const a = document.createElement('a');
                                                    a.href = url;
                                                    a.download = application.resume.filePath?.split('/').pop() || 'resume.pdf';
                                                    a.click();
                                                    window.URL.revokeObjectURL(url);
                                                } catch (e) {
                                                    alert('Download failed: ' + e.message);
                                                }
                                            }}
                                            className="flex items-center gap-3 px-5 py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl border border-primary/20 transition-all group"
                                        >
                                            <span className="material-symbols-outlined text-sm group-hover:scale-110 transition-transform">download</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-left leading-none">Download<br /><span>Resume</span></span>
                                        </button>
                                    )}
                                </div>

                                {/* Skills Overview */}
                                {application?.candidate?.skills?.length > 0 && (
                                    <div className="mt-6 flex flex-wrap gap-2 justify-center md:justify-start">
                                        {application.candidate.skills.map((skill, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-200/50 dark:border-slate-700/50">
                                                {skill.name}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
                        {message && (
                            <div className={`p-4 rounded-xl border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                                } font-bold text-sm animate-in zoom-in-95`}>
                                {message.text}
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Interview Window</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all appearance-none"
                                        value={form.interviewDate}
                                        onChange={(e) => setForm({ ...form, interviewDate: e.target.value })}
                                        required
                                    />
                                    <span className="absolute right-6 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 pointer-events-none">calendar_month</span>
                                </div>
                                <p className="text-[10px] text-slate-400 font-bold ml-1 italic">* Select the date when the primary interview occurred.</p>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Candidate Rating</label>
                                <div className="flex items-center h-[58px] px-6 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl shadow-inner shadow-slate-200/50 dark:shadow-none">
                                    <StarRating />
                                </div>
                                <p className="text-[10px] text-slate-400 font-bold ml-1 italic">* Technical & Cultural fit average score.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Executive Commentary</label>
                            <textarea
                                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-2xl px-8 py-6 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none transition-all min-h-[180px] text-sm leading-relaxed"
                                value={form.comments}
                                onChange={(e) => setForm({ ...form, comments: e.target.value })}
                                placeholder="Detail candidate strengths, observed growth areas, and cultural alignment..."
                            />
                        </div>

                        <div className="p-8 bg-slate-50 dark:bg-slate-950/50 rounded-3xl border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex-1 text-center md:text-left">
                                <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white mb-1">Final Disposition</h4>
                                <p className="text-[10px] font-bold text-slate-400 italic">Determine the candidate's future within the TalentLens pipeline.</p>
                            </div>
                            <div className="relative min-w-[200px]">
                                <select
                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white focus:ring-2 focus:ring-primary/20 outline-none appearance-none cursor-pointer"
                                    value={form.finalDecision}
                                    onChange={(e) => setForm({ ...form, finalDecision: e.target.value })}
                                >
                                    <option value="PENDING">Pending Review</option>
                                    <option value="ACCEPTED">Hire Candidate</option>
                                    <option value="REJECTED">Reject Case</option>
                                </select>
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-slate-400 pointer-events-none">expand_more</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-6">
                            <div className="flex items-center gap-3 text-slate-400">
                                <span className="material-symbols-outlined text-xl">verified_user</span>
                                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Decision Integrity Secured</span>
                            </div>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-16 py-5 bg-primary hover:bg-primary-dark text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-primary/30 transition-all active:scale-95 disabled:opacity-50 hover:scale-[1.02]"
                            >
                                {submitting ? 'Transmitting Data...' : (existingEval ? 'Update Evaluation' : 'Confirm Disposition')}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
};

export default EvaluateApplication;
