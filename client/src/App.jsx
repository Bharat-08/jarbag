import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Signup from './pages/Signup';
import Login from './pages/Login';
import News from './pages/News';
import Hi from './pages/Hi';
import MentorRegistration from './pages/MentorRegistration';

// Candidate Pages
import CandidateHome from './pages/CandidateHome';
import Practice from './pages/Practice';

// Test & Assessment Pages
import TestMode from './pages/TestMode';
import TatInstructions from './pages/TatInstructions';
import TatTest from './pages/TatTest';
import WatTest from './pages/WatTest';
import WatInstructions from './pages/WatInstructions';
import TestVimeo from './pages/TestVimeo';

// Mentor/Admin Pages
import AdminUpload from './pages/AdminUpload';
import MentorListing from './pages/MentorListing';
import MentorDashboard from './pages/MentorDashboard';
import MentorProfile from './pages/MentorProfile';
import AdminDashboard from './pages/AdminDashboard';

// UPDATED: Now capturing location to enable "Return to previous page"
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation(); // Capture where the user is trying to go

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    // Redirect to login, but save the current location in 'state.from'
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || user.role !== 'ADMIN') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user) {
    if (location.state?.from) {
      return <Navigate to={location.state.from} replace />;
    }

    if (user.role === 'ADMIN') {
      return <Navigate to="/admin-dashboard" replace />;
    }
    if (user.role === 'CANDIDATE') {
      return <Navigate to="/candidate-home" replace />;
    }
    if (user.role === 'MENTOR') {
      return <Navigate to="/mentor-dashboard" replace />;
    }
    return <Navigate to="/news" replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />
          <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/mentor-registration" element={<MentorRegistration />} />

          {/* Protected Routes (Candidates & Others) */}
          <Route path="/news" element={<ProtectedRoute><News /></ProtectedRoute>} />
          <Route path="/hi" element={<ProtectedRoute><Hi /></ProtectedRoute>} />
          <Route path="/candidate-home" element={<ProtectedRoute><CandidateHome /></ProtectedRoute>} />

          {/* Feature Routes */}
          <Route path="/practice" element={<ProtectedRoute><Practice /></ProtectedRoute>} />
          <Route path="/mentor-listing" element={<ProtectedRoute><MentorListing /></ProtectedRoute>} />
          <Route path="/mentor-listing/mentor/:id" element={<ProtectedRoute><MentorProfile /></ProtectedRoute>} />

          {/* Mentor Routes */}
          <Route path="/mentor-dashboard" element={<ProtectedRoute><MentorDashboard /></ProtectedRoute>} />

          {/* Test Mode Routes */}
          <Route path="/test-mode" element={<ProtectedRoute><TestMode /></ProtectedRoute>} />
          <Route path="/test-mode/tat" element={<ProtectedRoute><TatInstructions /></ProtectedRoute>} />
          <Route path="/test-mode/tat/active" element={<ProtectedRoute><TatTest /></ProtectedRoute>} />
          <Route path="/test-mode/wat" element={<ProtectedRoute><WatInstructions /></ProtectedRoute>} />
          <Route path="/test-mode/wat/active" element={<ProtectedRoute><WatTest /></ProtectedRoute>} />
          <Route path="/test-vimeo" element={<TestVimeo />} />

          {/* Admin Routes */}
          <Route path="/admin/upload" element={<AdminRoute><AdminUpload /></AdminRoute>} />
          <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;