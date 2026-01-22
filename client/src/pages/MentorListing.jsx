import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './MentorListing.css'; // We will create this
import heroEmblem from '../assets/hero_emblem.png'; // Placeholder fallback
import PremiumModal from '../components/PremiumModal';
import Toast from '../components/Toast';
import UnifiedNavbar from '../components/UnifiedNavbar';
import LoadingSpinner from '../components/LoadingSpinner';

export default function MentorListing() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [mentors, setMentors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [toast, setToast] = useState(null); // { message, type }

    // Filters State
    const [filters, setFilters] = useState({
        categories: {
            Psych: false,
            GTO: false,
            Interview: false,
            All: true
        },
        slotsAvailable: false, // NEW: Slot availability filter
        price: 2000,
        ratingSort: null, // 'highToLow' | 'lowToHigh'
        expSort: null // 'highToLow' | 'lowToHigh'
    });

    useEffect(() => {
        fetchMentors();
    }, []);

    const fetchMentors = async () => {
        try {
            const res = await api.get('/mentors/list');
            // MOCKING AVAILABILITY: purely for frontend demo since backend doesn't send it yet
            // Deterministic mock: Odd IDs have slots, Even IDs don't (or based on some hash)
            const mentorsWithSlots = (res.data.mentors || []).map(m => ({
                ...m,
                hasSlots: (m.id % 3 !== 0) // 2 out of 3 have slots
            }));
            setMentors(mentorsWithSlots);
        } catch (err) {
            console.error("Failed to load mentors", err);
        } finally {
            setLoading(false);
        }
    };

    // Filter Logic
    const toggleCategory = (cat) => {
        if (cat === 'All') {
            const newValue = !filters.categories.All;
            setFilters(prev => ({
                ...prev,
                categories: {
                    Psych: newValue,
                    GTO: newValue,
                    Interview: newValue,
                    All: newValue
                }
            }));
        } else {
            setFilters(prev => {
                const newCategories = {
                    ...prev.categories,
                    [cat]: !prev.categories[cat]
                };

                // If all 3 specific are true, set All to true. If any false, set All to false.
                const allSelected = newCategories.Psych && newCategories.GTO && newCategories.Interview;
                newCategories.All = allSelected;

                return {
                    ...prev,
                    categories: newCategories
                };
            });
        }
    };

    const toggleSlotFilter = () => {
        setFilters(prev => ({ ...prev, slotsAvailable: !prev.slotsAvailable }));
    };

    const filteredMentors = mentors.filter(mentor => {
        // 1. Category Filter: If All is true or specific matches
        const { categories } = filters;

        const activeCats = ['Psych', 'GTO', 'Interview'].filter(c => categories[c]);

        let catMatch = true;
        if (activeCats.length > 0) {
            const mentorExp = mentor.expertise?.toLowerCase() || "";
            // Match ANY active category
            catMatch = activeCats.some(cat => mentorExp.includes(cat.toLowerCase()) || (cat === 'Interview' && mentorExp.includes('communication')));
        }

        // 2. Price Filter
        const priceMatch = mentor.price <= filters.price;

        // 3. Slot Filter
        const slotMatch = filters.slotsAvailable ? mentor.hasSlots : true;

        return catMatch && priceMatch && slotMatch;
    }).sort((a, b) => { // ... sort logic
        return 0;
    });

    // Restoration of sort logic
    filteredMentors.sort((a, b) => {
        if (filters.ratingSort) {
            return filters.ratingSort === 'highToLow' ? b.rating - a.rating : a.rating - b.rating;
        }
        if (filters.expSort) {
            return filters.expSort === 'highToLow' ? b.yearsOfExperience - a.yearsOfExperience : a.yearsOfExperience - b.yearsOfExperience;
        }
        return 0;
    });

    // Validating background gradient percentage
    const getSliderBackground = () => {
        const percentage = (filters.price / 5000) * 100;
        return `linear-gradient(to right, #3b82f6 ${percentage}%, #333 ${percentage}%)`;
    };

    return (
        <div className="mentor-listing-page">
            <UnifiedNavbar />

            {/* SPACER for fixed navbar handled by CSS or global padding, but UnifiedNavbar is usually fixed/relative. 
                Using a spacer div if needed or rely on main-content padding. */}

            <div className="listing-hero">
                <div className="hero-content">
                    {/* Hero content can go here if needed, or leave empty/clean */}
                </div>
            </div>

            <div className="main-content">
                {/* SIDEBAR FILTERS */}
                <aside className="filters-sidebar">
                    <h3>Filter Categories</h3>

                    <div className="filter-group">
                        <label>Choose Category</label>
                        <div className="checkbox-grid">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={filters.categories.Psych}
                                    onChange={() => toggleCategory('Psych')}
                                />
                                <span className="custom-check"></span>
                                Psych
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={filters.categories.GTO}
                                    onChange={() => toggleCategory('GTO')}
                                />
                                <span className="custom-check"></span>
                                GTO
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={filters.categories.Interview}
                                    onChange={() => toggleCategory('Interview')}
                                />
                                <span className="custom-check"></span>
                                Interview
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={filters.categories.All}
                                    onChange={() => toggleCategory('All')}
                                />
                                <span className="custom-check"></span>
                                Apply all
                            </label>
                        </div>
                    </div>

                    <div className="filter-group">
                        <label>Availability</label>
                        <div className="toggle-wrapper">
                            <span className="toggle-label">Only Available Slots</span>
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={filters.slotsAvailable}
                                    onChange={toggleSlotFilter}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                    </div>

                    <div className="filter-group">
                        <label>Price (Max: Rs. {filters.price})</label>
                        <div className="price-slider-container">
                            <input
                                type="range"
                                min="0"
                                max="5000"
                                step="100"
                                value={filters.price}
                                onChange={(e) => setFilters({ ...filters, price: Number(e.target.value) })}
                                className="styled-range"
                                style={{ background: getSliderBackground() }}
                            />
                        </div>
                    </div>

                    <div className="filter-group">
                        <label>Ratings</label>
                        <div className="radio-group">
                            <label className="checkbox-label">
                                <input
                                    type="radio"
                                    name="rating"
                                    checked={filters.ratingSort === 'highToLow'}
                                    onChange={() => setFilters({ ...filters, ratingSort: 'highToLow', expSort: null })}
                                />
                                <span className="custom-radio"></span>
                                High to Low
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="radio"
                                    name="rating"
                                    checked={filters.ratingSort === 'lowToHigh'}
                                    onChange={() => setFilters({ ...filters, ratingSort: 'lowToHigh', expSort: null })}
                                />
                                <span className="custom-radio"></span>
                                Low to High
                            </label>
                        </div>
                    </div>

                    <div className="filter-group">
                        <label>Work Experience</label>
                        <div className="radio-group">
                            <label className="checkbox-label">
                                <input
                                    type="radio"
                                    name="exp"
                                    checked={filters.expSort === 'highToLow'}
                                    onChange={() => setFilters({ ...filters, expSort: 'highToLow', ratingSort: null })}
                                />
                                <span className="custom-radio"></span>
                                High to Low
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="radio"
                                    name="exp"
                                    checked={filters.expSort === 'lowToHigh'}
                                    onChange={() => setFilters({ ...filters, expSort: 'lowToHigh', ratingSort: null })}
                                />
                                <span className="custom-radio"></span>
                                Low to High
                            </label>
                        </div>
                    </div>
                </aside>

                {/* MENTOR GRID */}
                <div className="mentor-grid">
                    {loading ? <LoadingSpinner fullScreen={false} /> : filteredMentors.map(mentor => (
                        <div
                            key={mentor.id}
                            className="mentor-card"
                            onClick={() => {
                                if (user?.isPremium) {
                                    navigate(`/mentor-listing/mentor/${mentor.id}`);
                                } else {
                                    setShowPremiumModal(true);
                                }
                            }}
                            style={{ cursor: 'pointer', position: 'relative' }}
                        >
                            <div className="card-left">
                                <div className={`avatar-wrapper ${mentor.hasSlots ? 'status-available' : 'status-busy'}`}>
                                    <img
                                        src={mentor.profileImage || heroEmblem}
                                        alt={mentor.name}
                                        className="mentor-avatar"
                                    />
                                </div>
                                <div className="connection-status">
                                    <span className="lightning-icon">⚡</span> Connect
                                </div>
                            </div>

                            <div className="card-center">
                                <h3>{mentor.name}</h3>
                                <div className="mentor-badges">
                                    <span className="badge-exp">🛡️ {mentor.expertise}</span>
                                    <span className="badge-years">📅 {mentor.yearsOfExperience} yrs</span>
                                </div>
                                <p className={`mentor-bio ${!user?.isPremium ? 'blur-text' : ''}`}>
                                    "{mentor.bio}"
                                </p>
                                <button className={`btn-price ${!user?.isPremium ? 'blur-text' : ''}`}>
                                    Rs. {mentor.price}
                                </button>
                            </div>

                            <div className="card-right">
                                {user?.isPremium ? (
                                    <button className="btn-check-profile">Check Profile</button>
                                ) : (
                                    <button className="btn-check-profile btn-locked">
                                        <span>🔒</span> Unlock Profile
                                    </button>
                                )}
                                <div className="rating-box">
                                    <span className="stars">{'★'.repeat(Math.round(mentor.rating))}</span>
                                    <span className="review-count">{mentor.reviewCount} reviews</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {/* Premium Modal */}
            <PremiumModal
                isOpen={showPremiumModal}
                onClose={() => setShowPremiumModal(false)}
                onConfirm={() => {
                    api.post('/auth/upgrade').then(() => {
                        setShowPremiumModal(false);
                        setToast({ message: "Upgrade Successful! You are now a Premium Member.", type: 'success' });
                        setTimeout(() => window.location.reload(), 2000);
                    }).catch(e => {
                        setToast({ message: "Upgrade failed. Please try again.", type: 'error' });
                    });
                }}
            />
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}
        </div>
    );
}
