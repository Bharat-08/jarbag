import './Sidebar.css';
import { useAuth } from '../context/AuthContext';

const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'students', label: 'Students', icon: '👥' },
    { id: 'mentors', label: 'Mentors', icon: '👨' },
    { id: 'exam-activities', label: 'Exam Activities', icon: '📝' },
    { id: 'data-upload', label: 'Data Upload', icon: '☁️' },
];

import { useNavigate } from 'react-router-dom';

function Sidebar({ activeTab, setActiveTab }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="logo-area">
                    <span className="logo-icon">🛡️</span>
                    <span className="logo-text">AdminPanel</span>
                </div>
            </div>

            <div className="admin-profile-section">
                <div className="profile-wrapper">
                    <div className="avatar-circle">
                        <img
                            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"
                            alt="Admin"
                            className="avatar-img"
                        />
                        <span className="status-dot online"></span>
                    </div>
                    <div className="profile-info-text">
                        <h3 className="admin-name">{user?.name || 'Admin User'}</h3>
                        <span className="admin-role">{user?.role || 'Super Admin'}</span>
                        {user?.isPremium && user?.subscriptionEndDate && (
                            <div className="plan-expiry-badge">
                                Plan Exp: {new Date(user.subscriptionEndDate).toLocaleDateString()}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <nav className="sidebar-menu">
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`menu-item ${activeTab === item.id ? 'active' : ''}`}
                    >
                        <span className="menu-icon">{item.icon}</span>
                        <span className="menu-label">{item.label}</span>
                    </button>
                ))}
            </nav>

            <div className="sidebar-footer">
                <button className="menu-item logout" onClick={handleLogout}>
                    <span className="menu-icon">🚪</span>
                    <span className="menu-label">Logout</span>
                </button>
            </div>
        </aside>
    );
}

export default Sidebar;
