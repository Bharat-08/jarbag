import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import './MentorDashboard.css';

export default function MentorDashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Slots State
    const [slots, setSlots] = useState([]);
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [duration, setDuration] = useState(60);
    const [price, setPrice] = useState(500);

    // Courses State
    const [courses, setCourses] = useState([]);
    const [courseTitle, setCourseTitle] = useState('');
    const [courseDesc, setCourseDesc] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [coursePrice, setCoursePrice] = useState(999);

    const [activeTab, setActiveTab] = useState('slots');

    useEffect(() => {
        if (user?.id) {
            fetchSlots();
            fetchCourses();
        }
    }, [user]);

    const fetchSlots = async () => {
        try {
            const res = await api.get(`/mentors/slots/${user.id}`);
            setSlots(res.data.slots);
        } catch (err) {
            console.error("Failed to load slots", err);
        }
    };

    const fetchCourses = async () => {
        try {
            const res = await api.get(`/mentors/courses/${user.id}`);
            setCourses(res.data.courses);
        } catch (err) {
            console.error("Failed to load courses", err);
        }
    };

    useEffect(() => {
        if (startTime && endTime) {
            const start = new Date(`1970-01-01T${startTime}`);
            const end = new Date(`1970-01-01T${endTime}`);
            const diffMs = end - start;
            if (diffMs > 0) {
                const diffMins = Math.round(diffMs / 60000);
                setDuration(diffMins);
            }
        }
    }, [startTime, endTime]);

    const handleCreateSlot = async (e) => {
        e.preventDefault();
        try {
            await api.post('/mentors/slots', {
                mentorId: user.id,
                date,
                startTime,
                endTime,
                duration,
                price
            });
            alert("Slot Created!");
            fetchSlots();
        } catch (err) {
            console.error(err);
            alert("Failed to create slot");
        }
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        try {
            await api.post('/mentors/courses', {
                mentorId: user.id,
                title: courseTitle,
                description: courseDesc,
                videoUrl,
                price: coursePrice
            });
            alert("Course Uploaded Successfully!");
            fetchCourses();
            // Reset form
            setCourseTitle('');
            setCourseDesc('');
            setVideoUrl('');
            setCoursePrice(999);
        } catch (err) {
            console.error(err);
            alert("Failed to create course");
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const handleDeleteSlot = async (slotId) => {
        if (!window.confirm("Are you sure you want to delete this slot?")) return;
        try {
            await api.delete(`/mentors/slots/${slotId}`);
            // Optimistic update
            setSlots(slots.filter(s => s.id !== slotId));
        } catch (err) {
            console.error("Failed to delete slot", err);
            alert("Failed to delete slot");
        }
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-brand">
                    <span className="brand-icon">🛡️</span>
                    <h1>ShieldForce <span className="mentor-badge">Mentor</span></h1>
                </div>
                <div className="header-user">
                    <span className="welcome-text">Welcome, {user?.name}</span>
                    <button onClick={handleLogout} className="btn-logout" title="Sign out">
                        <span>Logout</span>
                        <span className="icon-exit">→</span>
                    </button>
                </div>
            </header>

            <div className="dashboard-tabs">
                <button
                    className={activeTab === 'slots' ? 'active' : ''}
                    onClick={() => setActiveTab('slots')}
                >
                    Manage 1:1 Slots
                </button>
                <button
                    className={activeTab === 'courses' ? 'active' : ''}
                    onClick={() => setActiveTab('courses')}
                >
                    Upload Courses
                </button>
            </div>

            <div className="dashboard-content">
                {activeTab === 'slots' && (
                    <div className="section-slots">
                        <h2>Create Availability</h2>
                        <form onSubmit={handleCreateSlot} className="dashboard-form">
                            <div className="form-group">
                                <label>Date</label>
                                <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Start Time</label>
                                    <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required />
                                </div>
                                <div className="form-group">
                                    <label>End Time</label>
                                    <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required />
                                </div>
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Duration (min) - Auto Calculated</label>
                                    <input type="number" value={duration} readOnly className="read-only-input" />
                                </div>
                                <div className="form-group">
                                    <label>Price (₹)</label>
                                    <input type="number" value={price} onChange={e => setPrice(e.target.value)} required />
                                </div>
                            </div>
                            <button type="submit" className="btn-primary">Add Slot</button>
                        </form>

                        <div className="slots-list">
                            <h3>Your Slots</h3>
                            {slots.length === 0 ? <p className="no-data-msg">No slots added yet.</p> : (
                                <ul>
                                    {slots.map(slot => (
                                        <li key={slot.id} className="slot-item">
                                            <div className="slot-info">
                                                <span className="slot-date">{new Date(slot.date).toLocaleDateString()}</span>
                                                <span className="slot-time">{slot.startTime} - {slot.endTime}</span>
                                                <span className="slot-price">₹{slot.price}</span>
                                                <span className={`status ${slot.isBooked ? 'booked' : 'open'}`}>
                                                    {slot.isBooked ? 'Booked' : 'Open'}
                                                </span>
                                            </div>
                                            {!slot.isBooked && (
                                                <button
                                                    className="btn-delete"
                                                    onClick={() => handleDeleteSlot(slot.id)}
                                                    title="Delete Slot"
                                                >
                                                    🗑️
                                                </button>
                                            )}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'courses' && (
                    <div className="section-courses">
                        <h2>Upload New Course</h2>
                        <form onSubmit={handleCreateCourse} className="dashboard-form">
                            <div className="form-group">
                                <label>Course Title</label>
                                <input type="text" value={courseTitle} onChange={e => setCourseTitle(e.target.value)} required placeholder="e.g. Advanced SSB Interview Prep" />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea value={courseDesc} onChange={e => setCourseDesc(e.target.value)} rows="3" placeholder="Brief details about the curriculum..."></textarea>
                            </div>
                            <div className="form-group">
                                <label>Video Link (Vimeo/YouTube)</label>
                                <input type="text" value={videoUrl} onChange={e => setVideoUrl(e.target.value)} required placeholder="https://vimeo.com/..." />
                            </div>
                            <div className="form-group">
                                <label>Price (₹)</label>
                                <input type="number" value={coursePrice} onChange={e => setCoursePrice(e.target.value)} required />
                            </div>
                            <button type="submit" className="btn-primary">Upload Course</button>
                        </form>

                        <div className="courses-list">
                            <h3>Your Courses</h3>
                            {courses.length === 0 ? <p className="no-data-msg">No courses uploaded.</p> : (
                                <div className="course-cards-mini">
                                    {courses.map(course => (
                                        <div key={course.id} className="course-card-mini">
                                            <h4>{course.title}</h4>
                                            <p>{course.description}</p>
                                            <div className="course-meta">
                                                <span>₹{course.price}</span>
                                                <a href={course.videoUrl} target="_blank" rel="noopener noreferrer">View Link</a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}