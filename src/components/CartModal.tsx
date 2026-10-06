import React, { useState, useRef, useEffect } from 'react';
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

// ─── Cart Modal ───────────────────────────────────────────────────────────────

export function CartModal({ items, onClose, onQtyChange, onRemove, onCheckout }: {
  items: CartItem[]
  onClose: () => void
  onQtyChange: (id: number, delta: number) => void
  onRemove: (id: number) => void
  onCheckout: () => void
}) {
  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0)

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="absolute inset-0" style={{ background: 'radial-gradient(circle at center, rgba(181,98,30,0.2) 0%, rgba(0,0,0,0.65) 100%)', backdropFilter: 'blur(8px)' }} onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: "spring", duration: 0.5, bounce: 0.3 }} className="relative bg-white rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col overflow-hidden" style={{ boxShadow: '0 0 120px rgba(181,98,30,0.4), 0 25px 50px rgba(0,0,0,0.3)' }}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#EDE7DC]">
          <h2 className="text-xl font-bold text-[#1C1917]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Tu carrito <span className="text-[#B5621E]">({items.length})</span>
          </h2>
          <button onClick={onClose} className="w-9 h-9 flex items-center justify-center rounded-full bg-[#F5F0E8] hover:bg-[#EDE7DC] text-[#78716C] transition-colors">✕</button>
        </div>
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16 text-[#78716C]">
            <ShoppingBag className="w-12 h-12 mb-3" />
            <p className="font-medium">Tu carrito está vacío</p>
            <button onClick={onClose} className="text-sm text-[#B5621E] hover:underline underline-offset-4">Seguir explorando →</button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.map(item => (
                <div key={item.product.id} className="flex gap-4 items-start">
                  <img src={item.product.image} alt={item.product.name} className="w-16 h-16 rounded-xl object-cover bg-[#F5F0E8] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-[#1C1917] leading-tight">{item.product.name}</p>
                    <p className="text-xs text-[#78716C] mt-0.5">{item.product.brand}</p>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <button onClick={() => onQtyChange(item.product.id, -1)} className="w-7 h-7 rounded-full bg-[#EDE7DC] text-[#1C1917] font-bold flex items-center justify-center text-sm hover:bg-[#D6CFC6] transition-colors">−</button>
                        <span className="text-sm font-semibold w-6 text-center">{item.qty}</span>
                        <button onClick={() => onQtyChange(item.product.id, 1)} disabled={item.qty >= item.product.stock} className="w-7 h-7 rounded-full bg-[#EDE7DC] text-[#1C1917] font-bold flex items-center justify-center text-sm hover:bg-[#D6CFC6] transition-colors disabled:opacity-40">+</button>
                      </div>
                      <span className="font-bold text-sm text-[#1C1917]">{fmtPrice(item.product.price * item.qty)}</span>
                    </div>
                  </div>
                  <button onClick={() => onRemove(item.product.id)} className="text-[#A8A29E] hover:text-red-500 transition-colors mt-1 p-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              ))}
            </div>
            <div className="px-6 py-5 border-t border-[#EDE7DC] bg-[#FAF9F6]">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-[#78716C]">Subtotal</span>
                <span className="text-xl font-bold text-[#1C1917]">{fmtPrice(subtotal)}</span>
              </div>
              <button onClick={onCheckout} className="w-full py-4 rounded-2xl font-semibold text-white text-base transition-all hover:scale-[1.02] hover:shadow-lg" style={{ backgroundColor: '#B5621E' }}>
                Continuar al Checkout →
              </button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  )
}
