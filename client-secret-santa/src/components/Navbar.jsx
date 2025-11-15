// src/components/Navbar.jsx

import { Gift } from 'lucide-react';

export default function Navbar() {
  return (
    <header
      className="w-full h-16 relative text-white shadow-md z-10 bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/christmas-navbar.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay per garantire contrasto */}
      <div className="absolute inset-0 bg-black/30" aria-hidden="true" />

      {/* Contenuto sopra l'overlay */}
      <div className="relative z-10 flex items-center justify-between px-6 h-full">
        {/* Titolo a sinistra */}
        <div className="flex items-center gap-2">
          <Gift className="h-6 w-6 text-white" />
          <h1 className="text-2xl font-bold text-white">Secret Santa</h1>
        </div>

        {/* NOTE: 'by Ciambelle' moved to the page component (bottom-right) */}
      </div>
    </header>
  );
}