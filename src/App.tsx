import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { Landing } from './pages/Landing';
import { Auth } from './pages/Auth';
import { Dashboard } from './pages/Dashboard';
import { Verify } from './pages/Verify';
import { PasswordResetRequest } from './pages/PasswordResetRequest';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { AuthCallback } from './pages/AuthCallback';
import { ChangeEmailPage } from './pages/ChangeEmailPage';
import { ActivityLogs } from './pages/ActivityLogs';

function App() {
  console.log('App rendering');
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/forgot-password" element={<PasswordResetRequest />} />
            <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/activity-logs" element={<ActivityLogs />} />
            <Route path="/verify" element={<Verify />} />
            <Route path="/change-email" element={<ChangeEmailPage />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
