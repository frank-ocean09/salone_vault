import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { checkSupabaseConfig } from './lib/supabase';

// Print Supabase config info at startup (masked keys).
checkSupabaseConfig();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

console.log('App mounted');
