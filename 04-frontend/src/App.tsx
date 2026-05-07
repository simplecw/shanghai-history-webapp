import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import MapsPage from './pages/MapsPage';
import BuildingsPage from './pages/BuildingsPage';

export default function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <BrowserRouter>
      <div className="flex h-screen">
        <Sidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <main className="flex-1 overflow-hidden">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/maps" element={<MapsPage />} />
            <Route path="/buildings" element={<BuildingsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}