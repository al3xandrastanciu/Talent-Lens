import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/authService';
import AuthLayout from '../../components/auth/AuthLayout';

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '', password: '', role: 'CANDIDATE',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) =>
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleRoleChange = (role) => {
        setFormData({ ...formData, role });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            await authService.register(formData);
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Please check your details and try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout>
            {/* Toggle Header */}
            <div className="flex items-center gap-1 mb-10 bg-surface-container-low p-1 rounded-xl">
                <Link to="/login" className="flex-1 py-3 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-all duration-200 text-center">
                    Login
                </Link>
                <button className="flex-1 py-3 text-sm font-bold rounded-lg bg-white shadow-sm text-primary transition-all duration-200">
                    Register
                </button>
            </div>

            <div className="mb-10 text-center lg:text-left">
                <h2 className="text-3xl font-black text-on-surface tracking-tight mb-2">Create Account</h2>
                <p className="text-on-surface-variant text-sm">Join the next generation of professionals.</p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-error-container text-on-error-container text-xs font-bold rounded-lg border border-error/10">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* Role Selection Grid */}
                <div className="grid grid-cols-1 gap-4 mb-8">
                    {/* Candidate Role */}
                    <label 
                        className={`group relative flex items-center p-6 bg-surface-container-low border-2 rounded-xl cursor-pointer transition-all duration-300 active:scale-[0.98] ${
                            formData.role === 'CANDIDATE' ? 'border-primary shadow-sm' : 'border-transparent hover:border-primary/20'
                        }`}
                        onClick={() => handleRoleChange('CANDIDATE')}
                    >
                        <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-white shadow-sm group-hover:shadow-md transition-all">
                            <span className="material-symbols-outlined text-primary text-3xl">person_search</span>
                        </div>
                        <div className="ml-5">
                            <span className="block text-lg font-bold text-on-surface tracking-tight leading-none mb-1">Candidate</span>
                            <span className="block text-xs text-on-surface-variant">Looking for a job.</span>
                        </div>
                        <div className={`ml-auto w-6 h-6 border-2 rounded-full flex items-center justify-center transition-colors ${
                            formData.role === 'CANDIDATE' ? 'border-primary bg-primary' : 'border-outline'
                        }`}>
                            <div className="w-2 h-2 bg-white rounded-full opacity-100"></div>
                        </div>
                    </label>

                    {/* Recruiter Role */}
                    <label 
                        className={`group relative flex items-center p-6 bg-surface-container-low border-2 rounded-xl cursor-pointer transition-all duration-300 active:scale-[0.98] ${
                            formData.role === 'RECRUITER' ? 'border-primary shadow-sm' : 'border-transparent hover:border-primary/20'
                        }`}
                        onClick={() => handleRoleChange('RECRUITER')}
                    >
                        <div className="flex items-center justify-center w-14 h-14 rounded-lg bg-white shadow-sm group-hover:shadow-md transition-all">
                            <span className="material-symbols-outlined text-primary text-3xl">corporate_fare</span>
                        </div>
                        <div className="ml-5">
                            <span className="block text-lg font-bold text-on-surface tracking-tight leading-none mb-1">Recruiter</span>
                            <span className="block text-xs text-on-surface-variant">Hiring top talent.</span>
                        </div>
                        <div className={`ml-auto w-6 h-6 border-2 rounded-full flex items-center justify-center transition-colors ${
                            formData.role === 'RECRUITER' ? 'border-primary bg-primary' : 'border-outline'
                        }`}>
                            <div className="w-2 h-2 bg-white rounded-full opacity-100"></div>
                        </div>
                    </label>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant mb-2 px-1">First Name</label>
                            <input 
                                name="firstName"
                                type="text"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                                className="w-full h-14 px-5 bg-surface-container-low border border-outline rounded-lg focus:border-primary focus:ring-0 focus:bg-white transition-all outline-none text-sm" 
                                placeholder="Jane" 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant mb-2 px-1">Last Name</label>
                            <input 
                                name="lastName"
                                type="text"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                                className="w-full h-14 px-5 bg-surface-container-low border border-outline rounded-lg focus:border-primary focus:ring-0 focus:bg-white transition-all outline-none text-sm" 
                                placeholder="Doe" 
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant mb-2 px-1">Email Address</label>
                        <input 
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="w-full h-14 px-5 bg-surface-container-low border border-outline rounded-lg focus:border-primary focus:ring-0 focus:bg-white transition-all outline-none text-sm" 
                            placeholder="name@company.com" 
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-on-surface-variant mb-2 px-1">Password</label>
                        <input 
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full h-14 px-5 bg-surface-container-low border border-outline rounded-lg focus:border-primary focus:ring-0 focus:bg-white transition-all outline-none text-sm" 
                            placeholder="••••••••" 
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full h-14 mt-4 bg-primary text-white font-bold rounded-lg shadow-sm hover:shadow-lg hover:bg-blue-700 transition-all active:scale-95 duration-200 disabled:opacity-70"
                    >
                        {loading ? 'Creating...' : 'Create Account'}
                    </button>
                </div>
            </form>
        </AuthLayout>
    );
};
export default Register;