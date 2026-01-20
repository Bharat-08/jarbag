import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import heroSoldier from '../assets/hero_soldier.png';
import practiceCard from '../assets/practice_card.png';
import testCard from '../assets/test_card.png';
import trainingCard from '../assets/training_card.png';

const CandidateHome = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-black text-white font-sans">
            {/* Top Navigation */}
            <header className="flex justify-between items-center p-4 border-b border-gray-800">
                <div className="flex gap-6 text-sm font-medium">
                    <a href="#" className="hover:text-yellow-400">Posts</a>
                    <a href="#" className="hover:text-yellow-400">Blogs</a>
                    <a href="#" className="hover:text-yellow-400 text-white font-bold">Practice</a>
                    <a href="#" onClick={() => navigate('/news')} className="hover:text-yellow-400">News</a>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Filter Categories"
                            className="bg-white text-black px-4 py-1 rounded-full text-sm outline-none w-64"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">🔍</span>
                    </div>
                    <div className="flex items-center gap-2 cursor-pointer" onClick={logout}>
                        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center overflow-hidden">
                            {/* Placeholder avatar */}
                            <span className="text-xs">{user?.name?.charAt(0) || 'U'}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Banner Navigation Strip */}
            <div className="bg-[#6b705c] text-white flex justify-evenly py-2 text-xs font-semibold uppercase tracking-wide relative">
                {/* Background image overlay effect could go here, keeping it simple for now */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/20 to-transparent pointer-events-none"></div>
                <a href="#">SSB Guidance</a>
                <span className="text-white/50">|</span>
                <a href="#">Free Mentorship</a>
                <span className="text-white/50">|</span>
                <a href="#">Free Resources</a>
                <span className="text-white/50">|</span>
                <a href="#">SSB Courses</a>
                <span className="text-white/50">|</span>
                <a href="#">About Us</a>
            </div>

            {/* Main Hero Banner */}
            <div className="relative w-full h-64 overflow-hidden">
                <img src={heroSoldier} alt="Soldiers Parade" className="w-full h-full object-cover object-center" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
            </div>

            {/* Title */}
            <div className="text-center py-8">
                <h1 className="text-4xl font-bold">Select a desired category</h1>
            </div>

            {/* Cards Grid */}
            <div className="flex justify-center gap-8 px-8 pb-12 flex-wrap">
                {/* Practice Mode */}
                <div className="w-80 bg-white rounded-3xl overflow-hidden shadow-lg transform transition hover:scale-105 cursor-pointer">
                    <div className="h-48 bg-gray-900 relative">
                        <img src={practiceCard} alt="Practice Mode" className="w-full h-full object-cover" />
                    </div>
                    <div className="bg-[#1db954] py-3 text-center">
                        <h3 className="text-white font-bold text-xl">Practice Mode</h3>
                    </div>
                </div>

                {/* Test Mode */}
                <div className="w-80 bg-white rounded-3xl overflow-hidden shadow-lg transform transition hover:scale-105 cursor-pointer">
                    <div className="h-48 bg-gray-900 relative">
                        <img src={testCard} alt="Test Mode" className="w-full h-full object-cover" />
                    </div>
                    <div className="bg-[#ff6b6b] py-3 text-center">
                        <h3 className="text-white font-bold text-xl">Test Mode</h3>
                    </div>
                </div>

                {/* Training Mode */}
                <div className="w-80 bg-white rounded-3xl overflow-hidden shadow-lg transform transition hover:scale-105 cursor-pointer">
                    <div className="h-48 bg-gray-900 relative">
                        <img src={trainingCard} alt="Training Mode" className="w-full h-full object-cover" />
                    </div>
                    <div className="bg-[#5c7cfa] py-3 text-center">
                        <h3 className="text-white font-bold text-xl">Training Mode</h3>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CandidateHome;
