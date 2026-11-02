import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Storefront } from './pages/Storefront';
import { Dashboard } from './pages/Dashboard';

export default function App() {
  return (
    <BrowserRouter basename="/appweb_regalos_sarai">
      <Routes>
        <Route path="/" element={<Storefront />} />
        <Route path="/admin" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}
