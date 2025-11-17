// src/App.jsx

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/page.jsx';
import Navbar from '@/components/Navbar.jsx'; // 1. Importa la tua nuova Navbar
import { Toaster as SonnerToaster } from 'sonner';

function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        
        {/* 2. Usa il componente Navbar qui */}
        <Navbar />

        {/* --- CONTENUTO PRINCIPALE --- */}
        <main className="flex-grow p-4 flex justify-center items-center">
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </main>
        
        <SonnerToaster richColors />
      </div>
    </Router>
  );
}

export default App;