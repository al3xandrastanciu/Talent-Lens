import React from 'react';
import { Link } from 'react-router-dom';

const AuthLayout = ({ children }) => {
    return (
        <div className="bg-background text-on-surface antialiased min-h-screen flex flex-col font-['Inter']">
            {/* TopAppBar */}
            <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md fixed top-0 w-full z-50 border-b border-slate-100 dark:border-slate-800 shadow-sm">
                <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto container">
                    <Link to="/" className="text-2xl font-black tracking-tighter text-blue-600 dark:text-blue-400">
                        TalentLens
                    </Link>
                    <div className="hidden md:flex items-center gap-8 text-sm">

                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/login" className="text-blue-600 dark:text-blue-400 font-bold border-b-2 border-blue-600 hover:text-blue-700 transition-colors">
                            Sign In
                        </Link>
                    </div>
                </nav>
            </header>

            {/* Main Content Canvas */}
            <main className="flex-grow flex items-stretch pt-[72px]">
                {/* Left Side: Cinematic Branding */}
                <section className="hidden lg:flex w-1/2 relative overflow-hidden items-center justify-center p-20 bg-gradient-to-br from-[#135bec] to-[#00174c]">
                    <div className="relative z-10 text-white max-w-lg">
                        <h1 className="text-6xl font-black tracking-tighter leading-none mb-8">
                            ORCHESTRATING <br />
                            PROFESSIONAL <br />
                            GROWTH.
                        </h1>
                        <p className="text-xl opacity-90 leading-relaxed font-light">
                            Experience the future of talent acquisition with an interface designed for precision, speed, and intellectual clarity.
                        </p>
                    </div>
                    {/* Glassmorphic Accents */}
                    <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                    <div className="absolute top-10 left-10 w-64 h-64 border border-white/10 rounded-full blur-2xl"></div>
                </section>

                {/* Right Side: Interaction Hub */}
                <section className="w-full lg:w-1/2 bg-white flex items-center justify-center p-8 md:p-16 overflow-y-auto">
                    <div className="w-full max-w-md">
                        {children}
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-slate-50 dark:bg-slate-950 w-full py-12 px-6 border-t border-slate-200 dark:border-slate-800 text-sm leading-relaxed">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 max-w-7xl mx-auto">
                    <div className="flex flex-col items-center md:items-start gap-2">

                    </div>
                    <div className="flex flex-wrap justify-center gap-8 text-xs text-slate-500 uppercase tracking-widest font-medium">

                    </div>
                </div>
            </footer>
        </div>
    );
};

export default AuthLayout;
