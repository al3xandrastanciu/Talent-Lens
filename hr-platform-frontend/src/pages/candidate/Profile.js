import React, { useState, useEffect } from 'react';
import candidateService from '../../services/candidateService';
import resumeService from '../../services/resumeService';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/common/Navbar';

const Profile = () => {
    const { user } = useAuth();
    const [candidate, setCandidate] = useState(null);
    const [skills, setSkills] = useState([]);
    const [formData, setFormData] = useState({ fullName: '', phone: '' });
    const [newSkill, setNewSkill] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [resumes, setResumes] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [addingSkill, setAddingSkill] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        const load = async () => {
            if (!user?.id) return;
            try {
                const c = await candidateService.getByUserId(user.id);
                setCandidate(c);
                setFormData({
                    fullName: c.fullName || '',
                    phone: c.phone || '',
                });
                const sk = await candidateService.getSkills(c.id);
                setSkills(sk);

                const res = await resumeService.getByCandidate(c.id);
                setResumes(res);
            } catch (err) {
                console.error("Profile load error:", err);
                setMessage({ type: 'error', text: 'Failed to load profile details.' });
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [user]);

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 5000);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const updated = await candidateService.updateProfile(
                candidate.id,
                formData.fullName,
                formData.phone
            );
            setCandidate(updated);
            showMessage('success', 'Profile updated successfully! ✨');
        } catch (err) {
            showMessage('error', 'Failed to update profile.');
        } finally {
            setSaving(false);
        }
    };

    const handleAddSkill = async (e) => {
        e.preventDefault();
        if (!newSkill.trim()) return;
        setAddingSkill(true);
        try {
            const updated = await candidateService.addSkill(candidate.id, newSkill.trim());
            setSkills(updated.skills || await candidateService.getSkills(candidate.id));
            setNewSkill('');
            showMessage('success', `Skill "${newSkill.trim()}" added! 🧠`);
        } catch (err) {
            showMessage('error', 'Failed to add skill.');
        } finally {
            setAddingSkill(false);
        }
    };

    const handleResumeUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            showMessage('error', 'File size too large (max 10MB)');
            return;
        }

        setUploading(true);
        try {
            const uploaded = await resumeService.upload(candidate.id, file);
            setResumes([uploaded, ...resumes]);
            showMessage('success', 'Resume uploaded successfully! 📁');
        } catch (err) {
            showMessage('error', 'Failed to upload resume.');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteResume = async (id) => {
        if (!window.confirm('Are you sure you want to delete this resume?')) return;
        try {
            await resumeService.deleteResume(id);
            setResumes(resumes.filter(r => r.id !== id));
            showMessage('success', 'Resume removed.');
        } catch (err) {
            showMessage('error', 'Failed to delete resume.');
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark font-display">
            <Navbar />
            <main className="pt-24 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                    <p className="text-sm font-bold text-primary animate-pulse uppercase tracking-widest text-center px-4">Synchronizing with Aida AI cloud...</p>
                </div>
            </main>
        </div>
    );

    const initials = (formData.fullName || user?.email || '??').substring(0, 2).toUpperCase();

    return (
        <div className="min-h-screen bg-background-light dark:bg-gray-950 text-text-main-light dark:text-gray-100 font-display transition-colors duration-200 relative overflow-hidden">
            <Navbar />

            <main className="max-w-screen-2xl mx-auto px-4 sm:px-8 py-24 relative z-10">
                {/* Header Section */}
                <div className="mb-12">
                    <h1 className="text-4xl font-extrabold tracking-tight text-text-main-light dark:text-white mb-2">My Profile</h1>
                    <p className="text-text-sub-light dark:text-gray-400 text-lg">Manage your personal information and skills</p>
                </div>

                {message && (
                    <div className={`mb-8 p-4 rounded-xl border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                        } font-bold text-sm shadow-sm animate-in fade-in slide-in-from-top-4`}>
                        {message.text}
                    </div>
                )}

                {/* Bento Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Column 1: Personal Info & Skills */}
                    <div className="lg:col-span-7 flex flex-col gap-8">
                        {/* Personal Info Section */}
                        <section className="bg-white dark:bg-gray-900 rounded-2xl p-6 sm:p-10 shadow-xl shadow-blue-900/5 dark:shadow-none border border-border-light dark:border-gray-800 transition-all">
                            <div className="flex items-center gap-6 mb-10">
                                <div className="relative group">
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white text-3xl font-bold border-4 border-gray-50 dark:border-gray-800">
                                        {initials}
                                    </div>
                                    <div className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full scale-90 shadow-lg border-2 border-white dark:border-gray-900">
                                        <span className="material-symbols-outlined text-[14px]">edit</span>
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-text-main-light dark:text-white mb-1">Personal Information</h2>
                                    <p className="text-sm text-text-sub-light dark:text-gray-400">Your public profile details</p>
                                </div>
                            </div>

                            <form onSubmit={handleSave} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-text-sub-light dark:text-gray-500 ml-1">Full Name</label>
                                        <input
                                            className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-5 py-4 text-text-main-light dark:text-white focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-gray-900 transition-all outline-none shadow-sm"
                                            value={formData.fullName}
                                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                            type="text"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold uppercase tracking-wider text-text-sub-light dark:text-gray-500 ml-1">Phone Number</label>
                                        <input
                                            className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-5 py-4 text-text-main-light dark:text-white focus:ring-2 focus:ring-primary focus:bg-white dark:focus:bg-gray-900 transition-all outline-none shadow-sm"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="Your phone number" type="tel"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold uppercase tracking-wider text-text-sub-light dark:text-gray-500 ml-1">Email Address</label>
                                    <input
                                        className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-xl px-5 py-4 text-text-main-light dark:text-white opacity-60 cursor-not-allowed outline-none"
                                        value={user?.email || ''}
                                        disabled type="email"
                                    />
                                </div>
                                <div className="pt-4 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-10 py-4 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold text-sm tracking-widest uppercase active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                                    >
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </section>

                        {/* Skills Section - Only for candidates */}
                        {user?.role !== 'RECRUITER' && (
                            <section className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-6 sm:p-10 border border-border-light dark:border-gray-800">
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-text-main-light dark:text-white mb-1">Skills</h2>
                                    <p className="text-sm text-text-sub-light dark:text-gray-400">Highlight your core competencies</p>
                                </div>

                                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-border-light dark:border-gray-800 mb-8">
                                    {skills.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-6 text-center">
                                            <span className="material-symbols-outlined text-4xl text-gray-300 dark:text-gray-700 mb-3">psychology</span>
                                            <p className="text-text-sub-light dark:text-gray-500 font-medium">No skills added yet</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-2">
                                            {skills.map((s, i) => (
                                                <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-container/10 dark:bg-primary/20 text-primary dark:text-primary-light text-sm font-bold border border-primary/10">
                                                    {s.name || s}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <form onSubmit={handleAddSkill} className="relative group">
                                    <input
                                        className="w-full bg-white dark:bg-gray-900 border-none rounded-xl pl-6 pr-32 py-5 text-text-main-light dark:text-white shadow-sm outline-none focus:ring-2 focus:ring-primary-container transition-all"
                                        placeholder="Add a skill (e.g. React, Python, Cloud Computing)"
                                        type="text"
                                        value={newSkill}
                                        onChange={(e) => setNewSkill(e.target.value)}
                                    />
                                    <button
                                        type="submit"
                                        disabled={addingSkill || !newSkill.trim()}
                                        className="absolute right-2 top-2 bottom-2 px-6 bg-secondary hover:bg-secondary-dark text-white rounded-lg font-bold text-sm active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                                    >
                                        <span className="material-symbols-outlined text-sm">add</span>
                                        {addingSkill ? '...' : 'Add'}
                                    </button>
                                </form>
                            </section>
                        )}
                    </div>

                    {/* Column 2: Resume / CV - Only for candidates */}
                    {user?.role !== 'RECRUITER' && (
                        <div className="lg:col-span-5">
                            <section className="bg-gray-100 dark:bg-gray-900/80 rounded-2xl p-6 sm:p-10 h-full flex flex-col border border-border-light dark:border-gray-800">
                                <div className="mb-8">
                                    <h2 className="text-2xl font-bold text-text-main-light dark:text-white mb-2">Resume / CV</h2>
                                    <p className="text-text-sub-light dark:text-gray-400 leading-relaxed">
                                        Upload your latest resume to help recruiters understand your background and experience better.
                                    </p>
                                </div>

                                {/* Upload Area */}
                                <label className="group relative bg-white dark:bg-gray-900 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-10 mb-10 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary hover:bg-gray-50 dark:hover:bg-gray-800 transition-all min-h-[220px]">
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,.docx"
                                        onChange={handleResumeUpload}
                                        disabled={uploading}
                                    />
                                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform shadow-lg shadow-primary/20">
                                        <span className="material-symbols-outlined text-3xl">{uploading ? 'sync' : 'cloud_upload'}</span>
                                    </div>
                                    <p className="font-bold text-text-main-light dark:text-white mb-1 uppercase tracking-widest text-xs">{uploading ? 'Uploading your career...' : 'Upload New Resume'}</p>
                                    <p className="text-xs text-text-sub-light dark:text-gray-500">PDF, DOCX up to 10MB</p>
                                </label>

                                {/* Files List */}
                                <div className="flex-grow space-y-4">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-text-sub-light dark:text-gray-600 mb-4 ml-2">Recent Uploads</h3>

                                    {resumes.length === 0 ? (
                                        <p className="text-sm text-center text-text-sub-light dark:text-gray-600 py-4 italic">No documents found.</p>
                                    ) : (
                                        resumes.map((res) => (
                                            <div key={res.id} className="bg-white dark:bg-gray-900 rounded-xl p-5 flex items-center justify-between group transition-all hover:translate-x-1 shadow-sm border border-border-light dark:border-gray-800">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${res.fileFormat?.toLowerCase() === 'pdf' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'}`}>
                                                        <span className="material-symbols-outlined">{res.fileFormat?.toLowerCase() === 'pdf' ? 'picture_as_pdf' : 'description'}</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-text-main-light dark:text-white text-sm">Resume upload ({res.fileFormat})</p>
                                                        <p className="text-[10px] text-text-sub-light dark:text-gray-500 uppercase font-black">{new Date(res.uploadedAt).toLocaleDateString()} • DOCUMENT</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteResume(res.id)}
                                                    className="p-2 text-text-sub-light dark:text-gray-600 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <span className="material-symbols-outlined text-xl">delete</span>
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Visual Accent Decor */}
                                <div className="mt-12 p-5 bg-gradient-to-r from-primary to-primary-container rounded-xl text-white shadow-lg shadow-primary/20">
                                    <div className="flex gap-4 items-start">
                                        <span className="material-symbols-outlined text-white animate-pulse" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                                        <p className="text-[11px] font-bold leading-relaxed uppercase tracking-wider opacity-90">
                                            Profiles with a current resume are 3x more likely to be contacted by premier tech partners.
                                        </p>
                                    </div>
                                </div>
                            </section>
                        </div>
                    )}
                </div>

                {/* Visual Background Accent */}
                <div className="fixed bottom-0 left-0 right-0 h-[50vh] -z-10 pointer-events-none opacity-20 dark:opacity-10">
                    <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-primary rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary rounded-full blur-[120px]"></div>
                </div>
            </main>
        </div>
    );
};

export default Profile;
