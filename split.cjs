const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'src');
const appTsxPath = path.join(srcPath, 'App.tsx');
const content = fs.readFileSync(appTsxPath, 'utf-8');

// Parse sections
const lines = content.split('\n');
const sections = {};
let currentSectionName = 'Imports';
let currentSectionContent = [];

for (const line of lines) {
  const match = line.match(/^\/\/ ─── (.*?) ───/);
  if (match) {
    sections[currentSectionName] = currentSectionContent.join('\n');
    currentSectionName = match[1].trim();
    currentSectionContent = [];
  }
  currentSectionContent.push(line);
}
sections[currentSectionName] = currentSectionContent.join('\n');

// Create directories
['types', 'lib', 'components', 'pages'].forEach(dir => {
  const fullPath = path.join(srcPath, dir);
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath);
});

// 1. Data -> src/types/index.ts
// Just extract the interfaces and constants. We'll dump the whole Data section there.
const dataContent = `export const PRODUCT_TYPES = ['Juguetes', 'Joyería', 'Flores', 'Chocolates', 'Ropa', 'Hogar / Decoración']
export const OCCASIONS = ['Cumpleaños', 'Aniversarios', 'Bodas', 'Baby Showers', 'Graduaciones', 'Días Especiales']

export const OCCASION_IMAGES: Record<string, string> = {
  'Cumpleaños': 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=600&h=400&fit=crop&auto=format',
  'Aniversarios': 'https://images.unsplash.com/photo-1522413452208-996ff3f3e740?w=600&h=400&fit=crop&auto=format',
  'Bodas': 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop&auto=format',
  'Baby Showers': 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=400&fit=crop&auto=format',
  'Graduaciones': 'https://images.unsplash.com/photo-1627556704302-624286467c65?w=600&h=400&fit=crop&auto=format',
  'Días Especiales': 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&h=400&fit=crop&auto=format',
}

export interface Product {
  id: number
  name: string
  brand: string
  price: number
  originalPrice: number | null
  rating: number
  reviews: number
  badge: string
  badgeColor: string
  image: string
  type: string
  occasions: string[]
  stock: number
  description: string
}

export interface CartItem {
  product: Product
  qty: number
}

export type CheckoutStep = 'delivery' | 'details' | 'payment' | 'confirmation'
export type ActiveSection = 'home' | 'products' | 'about' | 'location' | 'orders'
`;
fs.writeFileSync(path.join(srcPath, 'types', 'index.ts'), dataContent);

const imports = `import React, { useState, useRef, useEffect } from 'react';
import { ShoppingBag, Store, Truck, Smartphone, CreditCard, Gift, DollarSign, Package, Users, AlertTriangle, ClipboardList, Cake, Search, MapPin, Clock, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Link, BrowserRouter, Routes, Route } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { PRODUCT_TYPES, OCCASIONS, OCCASION_IMAGES, Product, CartItem, CheckoutStep, ActiveSection } from '../types';
import { fmtPrice, Stars, StockBadge } from '../lib/helpers';
import { ProductCard } from '../components/ProductCard';
import { CartModal } from '../components/CartModal';
import { CheckoutModal } from '../components/CheckoutModal';
import { MegaMenu } from '../components/MegaMenu';
import { AuthModal } from '../components/AuthModal';
import { Storefront } from '../pages/Storefront';
import { Dashboard } from '../pages/Dashboard';
`;

// Helper replacing export function
const fixExports = (str) => {
  return str.replace(/function ([A-Z][a-zA-Z0-9_]+)/g, 'export function $1').replace(/function fmtPrice/g, 'export function fmtPrice').replace(/function Stars/g, 'export function Stars').replace(/function StockBadge/g, 'export function StockBadge');
};

// 2. Helpers -> src/lib/helpers.tsx
fs.writeFileSync(path.join(srcPath, 'lib', 'helpers.tsx'), imports + '\n' + fixExports(sections['Helpers']));

// 3. Components
fs.writeFileSync(path.join(srcPath, 'components', 'ProductCard.tsx'), imports + '\n' + fixExports(sections['Product Card']));
fs.writeFileSync(path.join(srcPath, 'components', 'CartModal.tsx'), imports + '\n' + fixExports(sections['Cart Modal']));
fs.writeFileSync(path.join(srcPath, 'components', 'CheckoutModal.tsx'), imports + '\n' + fixExports(sections['Checkout']));
fs.writeFileSync(path.join(srcPath, 'components', 'MegaMenu.tsx'), imports + '\n' + fixExports(sections['Mega Menu']));
fs.writeFileSync(path.join(srcPath, 'components', 'AuthModal.tsx'), imports + '\n' + fixExports(sections['Auth Modal']));

// 4. Pages
fs.writeFileSync(path.join(srcPath, 'pages', 'Dashboard.tsx'), imports + '\n' + fixExports(sections['Dashboard']).replace(/const STATUS_COLORS/g, 'export const STATUS_COLORS'));
fs.writeFileSync(path.join(srcPath, 'pages', 'Storefront.tsx'), imports + '\n' + fixExports(sections['Storefront']));

// 5. App.tsx (Root)
const appTsxContent = `import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Storefront } from './pages/Storefront';
import { Dashboard } from './pages/Dashboard';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Storefront />} />
        <Route path="/admin" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}
`;
fs.writeFileSync(appTsxPath, appTsxContent);

console.log('Successfully split the project into logical files.');
