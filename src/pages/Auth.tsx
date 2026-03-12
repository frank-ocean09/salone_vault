import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function Auth() {
    const navigate = useNavigate();
    useEffect(() => {
        // Detect if user wanted signup or login from query params
        const params = new URLSearchParams(window.location.search);
        const mode = params.get('mode');

        if (mode === 'signup') {
            navigate('/signup', { replace: true });
        } else {
            navigate('/login', { replace: true });
        }
    }, [navigate]);

    return (
        <div className="min-h-screen bg-[#012A32] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-[#2EAF7D]/30 border-t-[#2EAF7D] rounded-full animate-spin" />
        </div>
    );
}

export default Auth;
