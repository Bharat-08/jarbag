// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Sidebar from '../components/Sidebar';
import StatsCards from '../components/StatsCards';
import StudentList from '../components/StudentList';
import ExamActivities from '../components/ExamActivities';
import MentorList from '../components/MentorList';
import DataUpload from '../components/DataUpload';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('dashboard');
    const [stats, setStats] = useState({ totalStudents: 0, totalMentors: 0, contentCount: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await api.get('/admin/stats');
                setStats({
                    totalStudents: res.data.students || 0,
                    totalMentors: res.data.mentors || 0,
                    contentCount: res.data.exams || 0,
                    subscribedStudents: res.data.subscribed || 0
                });
            } catch (err) {
                console.error("Failed to load dashboard stats", err);
            }
        };
        fetchStats();
    }, []);

    return (
        <div className="admin-dashboard">
            <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

            <main className="dashboard-content">
                {/* Dashboard View */}
                {activeTab === 'dashboard' && (
                    <div className="welcome-section fade-in">
                        <div className="welcome-header">
                            <h1 className="welcome-title">
                                Welcome back, <span className="gradient-text">Admin</span>
                            </h1>
                            <p className="welcome-subtitle">Here is what’s happening with your platform today.</p>
                        </div>

                        <div className="dashboard-widgets">
                            <StatsCards stats={stats} />

                            {/* Quick Actions */}
                            <div className="quick-actions">
                                <h2 className="section-title">Quick Actions</h2>
                                <div className="actions-grid">
                                    <div
                                        className="action-card"
                                        onClick={() => navigate('/admin/upload')}
                                    >
                                        <div className="action-icon">📤</div>
                                        <div className="action-info">
                                            <h3>Upload E-Content</h3>
                                            <p>Add new study materials and resources</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Students View */}
                {activeTab === 'students' && (
                    <div className="fade-in">
                        <StudentList />
                    </div>
                )}

                {/* Mentors View */}
                {activeTab === 'mentors' && (
                    <div className="fade-in">
                        <MentorList />
                    </div>
                )}

                {/* Exam Activities View (Full Page) */}
                {activeTab === 'exam-activities' && (
                    <div className="fade-in">
                        <ExamActivities />
                    </div>
                )}

                {/* Data Upload View */}
                {activeTab === 'data-upload' && (
                    <div className="upload-section fade-in">
                        <h1 className="welcome-title">Content Management</h1>
                        <DataUpload />
                    </div>
                )}
            </main>
        </div>
    );
}

export default AdminDashboard;
