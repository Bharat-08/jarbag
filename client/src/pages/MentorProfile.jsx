import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import './MentorProfile.css';
import heroEmblem from '../assets/hero_emblem.png';
import UnifiedNavbar from '../components/UnifiedNavbar';
import LoadingSpinner from '../components/LoadingSpinner';

export default function MentorProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [mentor, setMentor] = useState(null);
    const [slots, setSlots] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            const [mentorRes, slotsRes, coursesRes] = await Promise.all([
                api.get(`/mentors/profile/${id}`),
                api.get(`/mentors/slots/${id}`),
                api.get(`/mentors/courses/${id}`)
            ]);

            setMentor(mentorRes.data.mentor);
            setSlots(slotsRes.data.slots);
            setCourses(coursesRes.data.courses);
        } catch (err) {
            console.error("Failed to load mentor data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleBookSlot = (slot) => {
        alert(`Booking functionality coming soon for ${slot.startTime}! (Mock)`);
    };

    const handleBuyCourse = (course) => {
        alert(`Purchase functionality coming soon for ${course.title}! (Mock)`);
    };

    if (loading) return <LoadingSpinner />;
    if (!mentor) return <div className="error-screen">Mentor not found.</div>;

    return (
        <div className="mentor-profile-container">
            <UnifiedNavbar />

            <header className="profile-header">
                <div className="profile-card-main">
                    <img
                        src={mentor.profileImage || heroEmblem}
                        alt={mentor.name}
                        className="profile-avatar"
                    />
                    <div className="profile-info">
                        <h1>{mentor.name}</h1>
                        <span className="profile-badge">{mentor.expertise}</span>
                        <div className="profile-stats">
                            <span>⭐ {mentor.rating} ({mentor.reviewCount} Reviews)</span>
                            <span>📅 {mentor.yearsOfExperience} years exp</span>
                        </div>
                        <p className="profile-bio">{mentor.bio}</p>
                    </div>
                </div>
            </header>

            <div className="profile-sections">
                <section className="section-slots">
                    <h2>Available 1:1 Slots</h2>
                    {slots.length === 0 ? (
                        <p className="empty-state">No slots available right now.</p>
                    ) : (
                        <div className="slots-grid">
                            {slots.map(slot => (
                                <div key={slot.id} className={`slot-card ${slot.isBooked ? 'booked' : ''}`}>
                                    <div className="slot-time">
                                        <span className="date">{new Date(slot.date).toLocaleDateString()}</span>
                                        <span className="time">{slot.startTime}</span>
                                    </div>
                                    <div className="slot-details">
                                        <span className="duration">⏱ {slot.duration} min</span>
                                        <span className="price">₹{slot.price}</span>
                                    </div>
                                    <button
                                        className="btn-book"
                                        disabled={slot.isBooked}
                                        onClick={() => handleBookSlot(slot)}
                                    >
                                        {slot.isBooked ? 'Booked' : 'Book Now'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

                <section className="section-courses">
                    <h2>Video Courses</h2>
                    {courses.length === 0 ? (
                        <p className="empty-state">No courses uploaded yet.</p>
                    ) : (
                        <div className="courses-grid">
                            {courses.map(course => (
                                <div key={course.id} className="course-card">
                                    <div className="course-content">
                                        <h3>{course.title}</h3>
                                        <p>{course.description}</p>
                                    </div>
                                    <div className="course-footer">
                                        <span className="price">₹{course.price}</span>
                                        <button className="btn-buy" onClick={() => handleBuyCourse(course)}>Buy Access</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
