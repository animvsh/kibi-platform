
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './styles/index.css'; // Updated path to the correct location
import { AuthProvider } from './contexts/AuthContext';
import { CourseGenerationProvider } from './contexts/CourseGenerationContext';
import { DemoModeProvider } from './contexts/DemoModeContext'; // Add this import

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <CourseGenerationProvider>
        <DemoModeProvider>
          <App />
        </DemoModeProvider>
      </CourseGenerationProvider>
    </AuthProvider>
  </React.StrictMode>,
);
