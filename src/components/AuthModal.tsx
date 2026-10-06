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

// ─── Auth Modal ───────────────────────────────────────────────────────────────

export function AuthModal({ onClose }: { onClose: () => void }) {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        onClose()
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error

        // If the user was created but session is null, it means email confirmation is required
        if (data.user && !data.session) {
          setSuccessMsg('¡Registro exitoso! Por favor, revisa tu bandeja de entrada (y la carpeta de spam) para confirmar tu correo antes de iniciar sesión.')
        } else {
          onClose() // Auto logged in
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Ocurrió un error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={onClose} />
      <div className="relative bg-white rounded-3xl w-full max-w-sm flex flex-col overflow-hidden" style={{ boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }}>
        <div className="px-6 py-6 text-center border-b border-[#EDE7DC]">
          <h2 className="text-2xl font-bold text-[#1C1917]" style={{ fontFamily: "'Playfair Display', serif" }}>
            {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
          </h2>
          <p className="text-sm text-[#78716C] mt-1">
            {isLogin ? '¡Qué bueno verte de nuevo!' : 'Únete para hacer regalos increíbles'}
          </p>
        </div>
        <div className="px-6 py-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-[#78716C] uppercase tracking-wider block mb-1.5">Correo electrónico</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-[#EDE7DC] text-sm outline-none focus:border-[#B5621E] transition-colors" placeholder="tu@correo.com" />
            </div>
            <div>
              <label className="text-xs font-semibold text-[#78716C] uppercase tracking-wider block mb-1.5">Contraseña</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} minLength={6} className="w-full px-4 py-3 rounded-xl border border-[#EDE7DC] text-sm outline-none focus:border-[#B5621E] transition-colors" placeholder="••••••••" />
            </div>
            {errorMsg && <div className="p-3 rounded-lg bg-red-50 text-red-600 text-xs font-medium text-center">{errorMsg}</div>}
            {successMsg && <div className="p-3 rounded-lg bg-green-50 text-green-700 text-xs font-medium text-center">{successMsg}</div>}

            {successMsg ? (
              <button type="button" onClick={() => { setSuccessMsg(''); setIsLogin(true) }} className="w-full py-3 mt-2 rounded-xl font-semibold text-[#B5621E] border-2 border-[#B5621E] text-sm transition-all hover:bg-[#FFF8F4]">
                Ir a Iniciar Sesión
              </button>
            ) : (
              <button disabled={loading} type="submit" className="w-full py-3 mt-2 rounded-xl font-semibold text-white text-sm transition-all disabled:opacity-70" style={{ backgroundColor: '#B5621E' }}>
                {loading ? 'Cargando...' : (isLogin ? 'Entrar' : 'Registrarme')}
              </button>
            )}
          </form>
          {!successMsg && (
            <div className="mt-6 text-center">
              <button onClick={() => { setIsLogin(!isLogin); setErrorMsg('') }} className="text-sm font-medium text-[#78716C] hover:text-[#B5621E]">
                {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
