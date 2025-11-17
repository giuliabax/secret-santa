// src/components/Navbar.jsx

import { Gift } from 'lucide-react';

export default function Navbar() {
  return (
    <header className="w-full h-16 bg-primary text-primary-foreground shadow-md flex items-center justify-between px-6 z-10">
      {/* Titolo a sinistra */}
      <div className="flex items-center gap-2">
        <Gift className="h-6 w-6 text-primary-foreground" />
        <h1 className="text-2xl font-bold text-primary-foreground">Secret Santa</h1>
      </div>

      {/* 'by Ciambelle' on the right */}
      <span className="text-sm text-primary-foreground/90">by Ciambelle</span>
    </header>
  );
}