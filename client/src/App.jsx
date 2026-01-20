import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Signup from './pages/Signup';
import Login from './pages/Login';
import News from './pages/News';
import Hi from './pages/Hi';
import MentorRegistration from './pages/MentorRegistration';

import CandidateHome from './pages/CandidateHome';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const PublicOnlyRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (user) {
    if (user.role === 'CANDIDATE') {
      return <Navigate to="/candidate-home" replace />;
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
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<PublicOnlyRoute><Signup /></PublicOnlyRoute>} />
          <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/news" element={<ProtectedRoute><News /></ProtectedRoute>} />
          <Route path="/hi" element={<ProtectedRoute><Hi /></ProtectedRoute>} />
          <Route path="/candidate-home" element={<ProtectedRoute><CandidateHome /></ProtectedRoute>} />
          <Route path="/mentor-registration" element={<MentorRegistration />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
