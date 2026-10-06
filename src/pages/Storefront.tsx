import { useState, useRef, useEffect } from 'react';
import { ShoppingBag, Store, Truck, Smartphone, CreditCard, Gift, DollarSign, Package, Users, AlertTriangle, ClipboardList, Cake, Search, MapPin, Clock, Phone, Heart, Settings, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';
import { PRODUCT_TYPES, OCCASIONS, OCCASION_IMAGES, Product, CartItem, ActiveSection } from '../types';
import { ProductCard } from '../components/ProductCard';
import { CartModal } from '../components/CartModal';
import { CheckoutModal } from '../components/CheckoutModal';
import { MegaMenu } from '../components/MegaMenu';
import { AuthModal } from '../components/AuthModal';
import { Link } from 'react-router-dom';
import { fmtPrice } from '../lib/helpers';


// ─── Storefront ───────────────────────────────────────────────────────────────

export function Storefront() {
  const [cart, setCart] = useState<CartItem[]>([])
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [megaMenuOpen, setMegaMenuOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<ActiveSection>('home')
  const [filterType, setFilterType] = useState<string | null>(null)
  const [filterOccasion, setFilterOccasion] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const megaRef = useRef<HTMLDivElement>(null)

  const [products, setProducts] = useState<Product[]>([])
  const [userOrders, setUserOrders] = useState<any[]>([])
  const [profileTab, setProfileTab] = useState<'orders' | 'wishlist' | 'settings' | 'addresses'>('orders')
  const [wishlistIds, setWishlistIds] = useState<number[]>([])
  const [userAddresses, setUserAddresses] = useState<any[]>([])
  const [newAddressTitle, setNewAddressTitle] = useState('')
  const [newAddressValue, setNewAddressValue] = useState('')
  const [settingsName, setSettingsName] = useState('')
  const [settingsPhone, setSettingsPhone] = useState('')
  const [settingsPassword, setSettingsPassword] = useState('')

  useEffect(() => {
    supabase.from('products').select('*').order('id').then(({ data }) => {
      if (data) setProducts(data)
    })
  }, [])

  useEffect(() => {
    if (user) {
      if (activeSection === 'profile') {
        supabase.from('orders').select('*').eq('client_email', user.email).order('created_at', { ascending: false }).then(({ data }) => {
          if (data) setUserOrders(data)
        })
        supabase.from('user_addresses').select('*').eq('user_email', user.email).order('id').then(({ data }) => {
          if (data) setUserAddresses(data)
        })
      }
      supabase.from('wishlists').select('product_id').eq('user_email', user.email).then(({ data, error }) => {
        if (data && !error) setWishlistIds(data.map(d => d.product_id))
      })
    }
  }, [user, activeSection])

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newAddressTitle || !newAddressValue) return
    const newAddr = { user_email: user.email, title: newAddressTitle, address: newAddressValue }
    const { data, error } = await supabase.from('user_addresses').insert(newAddr).select().single()
    if (error) alert("Error al guardar dirección: " + error.message)
    else {
      setUserAddresses(prev => [...prev, data])
      setNewAddressTitle('')
      setNewAddressValue('')
    }
  }

  const handleDeleteAddress = async (id: number) => {
    const { error } = await supabase.from('user_addresses').delete().eq('id', id)
    if (!error) setUserAddresses(prev => prev.filter(a => a.id !== id))
  }

  const handleToggleLike = async (p: Product) => {
    if (!user) {
      setAuthModalOpen(true)
      return
    }
    const isLiked = wishlistIds.includes(p.id)
    if (isLiked) {
      setWishlistIds(prev => prev.filter(id => id !== p.id))
      const { error } = await supabase.from('wishlists').delete().match({ user_email: user.email, product_id: p.id })
      if (error) alert("Error al quitar de favoritos: " + error.message)
    } else {
      setWishlistIds(prev => [...prev, p.id])
      const { error } = await supabase.from('wishlists').insert({ user_email: user.email, product_id: p.id })
      if (error) alert("Error al agregar a favoritos: " + error.message)
    }
  }

  useEffect(() => {
    if (user && profileTab === 'settings') {
      setSettingsName(user.user_metadata?.name || '')
      setSettingsPhone(user.user_metadata?.phone || '')
    }
  }, [user, profileTab])

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    const updates: any = { data: { name: settingsName, phone: settingsPhone } }
    if (settingsPassword) {
      updates.password = settingsPassword
    }
    const { error } = await supabase.auth.updateUser(updates)
    if (error) {
      alert("Error al actualizar: " + error.message)
    } else {
      alert("¡Perfil actualizado con éxito!")
      setSettingsPassword('')
    }
  }

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [activeSection, filterType, filterOccasion])

  const cartCount = cart.reduce((s, i) => s + i.qty, 0)

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(i => i.product.id === product.id)
      if (existing) return prev.map(i => i.product.id === product.id ? { ...i, qty: Math.min(i.qty + 1, product.stock) } : i)
      return [...prev, { product, qty: 1 }]
    })
  }

  const updateQty = (id: number, delta: number) => {
    setCart(prev => prev.map(i => i.product.id === id ? { ...i, qty: Math.max(1, Math.min(i.qty + delta, i.product.stock)) } : i).filter(i => i.qty > 0))
  }

  const removeItem = (id: number) => setCart(prev => prev.filter(i => i.product.id !== id))

  const applyFilter = (type: string, value: string) => {
    if (type === 'type') { setFilterType(value); setFilterOccasion(null) }
    else { setFilterOccasion(value); setFilterType(null) }
    setActiveSection('products')
  }

  const filteredProducts = products.filter(p => {
    if (filterType && p.type !== filterType) return false
    if (filterOccasion && !p.occasions.includes(filterOccasion)) return false
    if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  // Close mega menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) setMegaMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF7F2', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Announcement */}
      <div className="text-center py-2.5 text-xs font-medium text-white" style={{ backgroundColor: '#B5621E' }}>
        🎁 Envoltura de regalo sin costo &nbsp;·&nbsp; Pago por QR / Tarjeta &nbsp;·&nbsp; Entrega a domicilio disponible
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-[#D6CFC6]" style={{ backgroundColor: '#FAF7F2' }} ref={megaRef}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between h-16 relative">
          {/* Logo */}
          <button onClick={() => setActiveSection('home')} className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif", color: '#1C1917' }}>
              EVERY<span style={{ color: '#B5621E' }}> OCCASION</span>
            </span>
          </button>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-6">
            <button onClick={() => setActiveSection('home')} className="text-sm font-medium transition-all duration-300" style={{ color: activeSection === 'home' ? '#B5621E' : '#78716C', textShadow: activeSection === 'home' ? '0 0 12px rgba(181,98,30,0.4)' : 'none' }} onMouseEnter={e => e.currentTarget.style.textShadow = '0 0 12px rgba(181,98,30,0.6)'} onMouseLeave={e => e.currentTarget.style.textShadow = activeSection === 'home' ? '0 0 12px rgba(181,98,30,0.4)' : 'none'}>Inicio</button>
            <button
              onClick={() => setMegaMenuOpen(!megaMenuOpen)}
              className="text-sm font-medium transition-all duration-300 flex items-center gap-1"
              style={{ color: activeSection === 'products' ? '#B5621E' : '#78716C', textShadow: activeSection === 'products' ? '0 0 12px rgba(181,98,30,0.4)' : 'none' }}
              onMouseEnter={e => e.currentTarget.style.textShadow = '0 0 12px rgba(181,98,30,0.6)'} onMouseLeave={e => e.currentTarget.style.textShadow = activeSection === 'products' ? '0 0 12px rgba(181,98,30,0.4)' : 'none'}
            >
              Productos
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={megaMenuOpen ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'} /></svg>
            </button>
            <button onClick={() => setActiveSection('about')} className="text-sm font-medium transition-all duration-300" style={{ color: activeSection === 'about' ? '#B5621E' : '#78716C', textShadow: activeSection === 'about' ? '0 0 12px rgba(181,98,30,0.4)' : 'none' }} onMouseEnter={e => e.currentTarget.style.textShadow = '0 0 12px rgba(181,98,30,0.6)'} onMouseLeave={e => e.currentTarget.style.textShadow = activeSection === 'about' ? '0 0 12px rgba(181,98,30,0.4)' : 'none'}>Nosotros</button>
            <button onClick={() => setActiveSection('location')} className="text-sm font-medium transition-all duration-300" style={{ color: activeSection === 'location' ? '#B5621E' : '#78716C', textShadow: activeSection === 'location' ? '0 0 12px rgba(181,98,30,0.4)' : 'none' }} onMouseEnter={e => e.currentTarget.style.textShadow = '0 0 12px rgba(181,98,30,0.6)'} onMouseLeave={e => e.currentTarget.style.textShadow = activeSection === 'location' ? '0 0 12px rgba(181,98,30,0.4)' : 'none'}>Ubicación</button>
          </div>

          {/* Tools */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-[#EDE7DC] rounded-full px-4 py-2">
              <svg className="w-4 h-4 text-[#78716C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input value={searchQuery} onChange={e => { setSearchQuery(e.target.value); if (e.target.value) setActiveSection('products') }} placeholder="Buscar regalos..." className="bg-transparent text-sm outline-none w-36 text-[#1C1917] placeholder-[#A8A29E]" />
            </div>
            {user ? (
              <div className="relative group">
                <button className="hidden md:flex items-center gap-2 text-sm font-medium text-[#1C1917] hover:text-[#B5621E]">
                  <span className="w-8 h-8 rounded-full bg-[#B5621E] text-white flex items-center justify-center text-xs font-bold uppercase">
                    {(user.user_metadata?.name?.charAt(0) || user.email?.charAt(0) || 'U')}
                  </span>
                  <span className="max-w-[100px] truncate">{user.user_metadata?.name || user.email?.split('@')[0]}</span>
                </button>
                <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-xl shadow-lg border border-[#EDE7DC] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all overflow-hidden z-50">
                  <button onClick={() => setActiveSection('profile')} className="block w-full text-left px-4 py-3 text-sm text-[#1C1917] hover:bg-[#F5F0E8] font-medium border-b border-[#EDE7DC]">Mi Perfil</button>
                  {user.email === 'admin@gmail.com' && (
                    <Link to="/admin" className="block w-full text-left px-4 py-3 text-sm text-[#1C1917] hover:bg-[#F5F0E8] font-medium border-b border-[#EDE7DC]">Ir al Panel</Link>
                  )}
                  <button onClick={() => { setActiveSection('home'); supabase.auth.signOut() }} className="block w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 font-medium">Cerrar sesión</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setAuthModalOpen(true)} className="hidden md:block text-sm font-medium text-[#78716C] hover:text-[#B5621E] transition-colors">Iniciar sesión</button>
            )}
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden relative p-2.5 rounded-full hover:bg-[#EDE7DC] transition-colors">
              <svg className="w-5 h-5 text-[#1C1917]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <button onClick={() => setCartOpen(true)} className="relative p-2.5 rounded-full hover:bg-[#EDE7DC] transition-colors">
              <svg className="w-5 h-5 text-[#1C1917]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
              {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-white text-[10px] font-bold flex items-center justify-center" style={{ backgroundColor: '#B5621E' }}>{cartCount}</span>}
            </button>
          </div>
        </div>
        {megaMenuOpen && <MegaMenu onClose={() => setMegaMenuOpen(false)} onFilter={applyFilter} />}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-[#EDE7DC] shadow-lg z-50">
            <div className="flex flex-col p-4 space-y-4">
              <button onClick={() => { setActiveSection('home'); setMobileMenuOpen(false); setMegaMenuOpen(false); }} className="text-left font-medium text-[#1C1917]">Inicio</button>
              <div>
                <button onClick={() => setMegaMenuOpen(!megaMenuOpen)} className="w-full text-left font-medium text-[#1C1917] flex justify-between items-center">
                  Productos
                  <svg className={`w-4 h-4 transition-transform ${megaMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </button>
                {megaMenuOpen && (
                  <div className="mt-3 pl-4 space-y-4 border-l-2 border-[#EDE7DC]">
                    <div>
                      <p className="text-xs font-semibold text-[#B5621E] mb-2 uppercase">Tipo de Regalo</p>
                      <div className="flex flex-col space-y-2">
                        {PRODUCT_TYPES.map(t => (
                          <button key={t} onClick={() => { applyFilter('type', t); setMobileMenuOpen(false); setMegaMenuOpen(false); }} className="text-left text-sm text-[#78716C]">{t}</button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-[#B5621E] mb-2 uppercase">Ocasión</p>
                      <div className="flex flex-col space-y-2">
                        {OCCASIONS.map(o => (
                          <button key={o} onClick={() => { applyFilter('occasion', o); setMobileMenuOpen(false); setMegaMenuOpen(false); }} className="text-left text-sm text-[#78716C]">{o}</button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <button onClick={() => { setActiveSection('about'); setMobileMenuOpen(false) }} className="text-left font-medium text-[#1C1917]">Nosotros</button>
              <button onClick={() => { setActiveSection('location'); setMobileMenuOpen(false) }} className="text-left font-medium text-[#1C1917]">Ubicación</button>
              {!user ? (
                <button onClick={() => { setAuthModalOpen(true); setMobileMenuOpen(false) }} className="text-left font-medium text-[#B5621E]">Iniciar sesión</button>
              ) : (
                <div className="border-t border-[#EDE7DC] pt-4 mt-2 flex flex-col space-y-4">
                  <p className="text-xs text-[#78716C]">Conectado como {user.user_metadata?.name || user.email}</p>
                  <button onClick={() => { setActiveSection('profile'); setMobileMenuOpen(false) }} className="text-left font-medium text-[#1C1917]">Mi Perfil</button>
                  {user.email === 'admin@gmail.com' && (
                    <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block text-left font-medium text-[#1C1917]">Ir al Panel</Link>
                  )}
                  <button onClick={() => { setActiveSection('home'); supabase.auth.signOut(); setMobileMenuOpen(false) }} className="text-left font-medium text-red-600">Cerrar sesión</button>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* ── HOME ── */}
      {activeSection === 'home' && (
        <>
          {/* Hero */}
          <section className="relative overflow-hidden" style={{ minHeight: '78vh' }}>
            <div className="absolute inset-0">
              <img src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1600&h=900&fit=crop&auto=format" alt="Regalos especiales" className="w-full h-full object-cover" />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(105deg, rgba(28,25,23,0.85) 0%, rgba(28,25,23,0.45) 55%, rgba(28,25,23,0.1) 100%)' }} />
            </div>
            <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 flex items-center" style={{ minHeight: '78vh' }}>
              <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }} className="max-w-xl">
                <span className="inline-block text-xs font-semibold uppercase tracking-widest mb-4 px-3 py-1.5 rounded-full" style={{ backgroundColor: 'rgba(181,98,30,0.9)', color: 'white' }}>
                  ✦ Regalos Memorables 2026
                </span>
                <h1 className="text-5xl md:text-6xl font-bold text-white mb-5 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Compra segura,<br /><span style={{ color: '#D4843C' }}>regalos</span><br />memorables
                </h1>
                <p className="text-[#D6CFC6] text-lg mb-8 leading-relaxed">
                  Juguetes, joyería, flores, chocolates y más. Para cada persona y cada momento especial, con envoltura y dedicatoria incluidas.
                </p>
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => setActiveSection('products')} className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-semibold text-white transition-all hover:scale-105 hover:shadow-lg" style={{ backgroundColor: '#B5621E' }}>
                    Ver catálogo
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </button>
                  <button onClick={() => { setFilterOccasion('Cumpleaños'); setActiveSection('products') }} className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full font-medium border border-white/40 text-white hover:bg-white/10 transition-all">
                    <Cake className="w-4 h-4" /> Regalos de cumpleaños
                  </button>
                </div>
                <div className="flex items-center gap-8 mt-10 pt-8 border-t border-white/20">
                  {[['500+', 'Productos'], ['98%', 'Satisfacción'], ['24h', 'Entrega']].map(([val, label]) => (
                    <div key={label}>
                      <p className="text-2xl font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>{val}</p>
                      <p className="text-xs text-[#A8A29E] mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </section>

          {/* Benefits */}
          <section className="py-10 border-b border-[#D6CFC6]" style={{ backgroundColor: '#EDE7DC' }}>
            <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: <Truck className="w-8 h-8 text-[#1C1917]" />, title: 'Entrega a domicilio', desc: 'O retira gratis en nuestra sucursal' },
                { icon: <Smartphone className="w-8 h-8 text-[#1C1917]" />, title: 'Pago por QR / Tarjeta', desc: 'Rápido, seguro y sin comisiones' },
                { icon: <Gift className="w-8 h-8 text-[#1C1917]" />, title: 'Envoltura y dedicatoria', desc: 'Personalizada sin costo extra' },
              ].map(b => (
                <div key={b.title} className="flex items-center gap-4">
                  <span className="flex-shrink-0">{b.icon}</span>
                  <div>
                    <p className="font-semibold text-[#1C1917] text-sm">{b.title}</p>
                    <p className="text-xs text-[#78716C] mt-0.5">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Featured products */}
          <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[#B5621E] mb-2">Destacados</p>
                <h2 className="text-3xl font-bold text-[#1C1917]" style={{ fontFamily: "'Playfair Display', serif" }}>Ofertas y Top Sellers</h2>
              </div>
              <button onClick={() => setActiveSection('products')} className="text-sm font-medium text-[#B5621E] hover:underline underline-offset-4 hidden md:block">Ver todo →</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.slice(0, 4).map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.5, delay: i * 0.1 }}>
                  <ProductCard product={p} isLiked={wishlistIds.includes(p.id)} onToggleLike={handleToggleLike} onAdd={addToCart} />
                </motion.div>
              ))}
            </div>
          </section>

          {/* Occasion Carousel */}
          <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-xs font-semibold uppercase tracking-widest text-[#B5621E] mb-2">Por Ocasión</p>
              <h2 className="text-3xl font-bold text-[#1C1917]" style={{ fontFamily: "'Playfair Display', serif" }}>¿Cuál es el momento?</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
              {OCCASIONS.map(occ => (
                <button key={occ} onClick={() => { setFilterOccasion(occ); setActiveSection('products') }} className="group relative rounded-2xl overflow-hidden text-left" style={{ height: 180 }}>
                  <img src={OCCASION_IMAGES[occ]} alt={occ} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(28,25,23,0.8) 0%, rgba(28,25,23,0.1) 60%)' }} />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-base font-bold text-white" style={{ fontFamily: "'Playfair Display', serif" }}>{occ}</p>
                    <p className="text-xs text-white/70 group-hover:text-white transition-colors mt-0.5">Ver regalos →</p>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </>
      )}

      {/* ── PRODUCTS ── */}
      {activeSection === 'products' && (
        <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
          <div className="flex flex-wrap items-center gap-3 mb-8">
            <div>
              <h2 className="text-3xl font-bold text-[#1C1917]" style={{ fontFamily: "'Playfair Display', serif" }}>
                {filterType || filterOccasion || 'Todos los regalos'}
              </h2>
              <p className="text-sm text-[#78716C] mt-1">{filteredProducts.length} productos encontrados</p>
            </div>
            <div className="flex flex-wrap gap-2 ml-auto">
              {filterType && <button onClick={() => setFilterType(null)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: '#B5621E' }}>{filterType} ✕</button>}
              {filterOccasion && <button onClick={() => setFilterOccasion(null)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: '#B5621E' }}>{filterOccasion} ✕</button>}
            </div>
          </div>
          {/* Type filter */}
          <div className="flex flex-wrap gap-2 mb-8">
            <button onClick={() => setFilterType(null)} className="px-4 py-2 rounded-full text-xs font-semibold transition-all" style={{ backgroundColor: !filterType ? '#1C1917' : '#EDE7DC', color: !filterType ? 'white' : '#78716C' }}>Todos</button>
            {PRODUCT_TYPES.map(t => (
              <button key={t} onClick={() => setFilterType(filterType === t ? null : t)} className="px-4 py-2 rounded-full text-xs font-semibold transition-all" style={{ backgroundColor: filterType === t ? '#B5621E' : '#EDE7DC', color: filterType === t ? 'white' : '#78716C' }}>{t}</button>
            ))}
          </div>
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map(p => <ProductCard key={p.id} product={p} isLiked={wishlistIds.includes(p.id)} onToggleLike={handleToggleLike} onAdd={addToCart} />)}
            </div>
          ) : (
            <div className="text-center py-24 text-[#78716C]">
              <Search className="w-12 h-12 mx-auto mb-4 text-[#A8A29E]" />
              <p className="font-semibold">Sin resultados</p>
              <p className="text-sm mt-1">Prueba con otro filtro</p>
            </div>
          )}
        </section>
      )}

      {/* ── ABOUT ── */}
      {activeSection === 'about' && (
        <section className="py-16 px-4 md:px-8 max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#B5621E] mb-2">Quiénes somos</p>
            <h2 className="text-4xl font-bold text-[#1C1917]" style={{ fontFamily: "'Playfair Display', serif" }}>Nuestra historia</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-10 items-center mb-12">
            <img src="https://images.unsplash.com/photo-1513201099705-a9746e1e201f?w=600&h=500&fit=crop&auto=format" alt="Tienda de regalos" className="rounded-3xl w-full h-72 object-cover" />
            <div>
              <p className="text-[#78716C] leading-relaxed mb-4">
                Nacimos en 2019 con una misión simple: hacer que regalar sea una experiencia memorable, no un trámite. Desde nuestra tienda en el corazón de la ciudad, hemos entregado miles de sonrisas.
              </p>
              <p className="text-[#78716C] leading-relaxed">
                Seleccionamos cuidadosamente cada producto: juguetes, joyería, flores, chocolates, ropa y decoración. Todo con estándares de calidad premium y servicio de envoltura artesanal incluido.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {[['1,800+', 'Pedidos entregados'], ['98%', 'Clientes satisfechos'], ['5 años', 'De experiencia']].map(([v, l]) => (
              <div key={l} className="bg-white rounded-2xl p-6 text-center border border-[#EDE7DC]">
                <p className="text-3xl font-bold text-[#B5621E]" style={{ fontFamily: "'Playfair Display', serif" }}>{v}</p>
                <p className="text-xs text-[#78716C] mt-1">{l}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── LOCATION ── */}
      {activeSection === 'location' && (
        <section className="py-16 px-4 md:px-8 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#B5621E] mb-2">Encuéntranos</p>
            <h2 className="text-4xl font-bold text-[#1C1917]" style={{ fontFamily: "'Playfair Display', serif" }}>Nuestra ubicación</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="rounded-3xl overflow-hidden border border-[#EDE7DC]" style={{ height: 360 }}>
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m17!1m12!1m3!1d3639.747184209057!2d-63.15607662483022!3d-17.594926283328146!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m2!1m1!2s!5e1!3m2!1ses!2sbo!4v1791073788545!5m2!1ses!2sbo"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación de la tienda"
              />
            </div>
            <div className="space-y-5">
              {[
                { icon: <MapPin className="w-6 h-6 text-[#1C1917]" />, label: 'Dirección', value: 'Av. Los Pinos 234, entre 6 de Agosto y Ecuador\nZona Sopocachi, La Paz, Bolivia' },
                { icon: <Clock className="w-6 h-6 text-[#1C1917]" />, label: 'Horarios', value: 'Lun – Vie: 9:00 am – 7:00 pm\nSábado: 9:00 am – 6:00 pm\nDomingo: 10:00 am – 3:00 pm' },
                { icon: <Phone className="w-6 h-6 text-[#1C1917]" />, label: 'Contacto', value: '+591 2 2441234\nWhatsApp: +591 69254989' },
              ].map(item => (
                <div key={item.label} className="flex gap-4 bg-white rounded-2xl p-5 border border-[#EDE7DC]">
                  <span className="flex-shrink-0">{item.icon}</span>
                  <div>
                    <p className="font-semibold text-sm text-[#1C1917] mb-1">{item.label}</p>
                    <p className="text-sm text-[#78716C] whitespace-pre-line">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── PROFILE ── */}
      {activeSection === 'profile' && user && (
        <section className="py-16 px-4 md:px-8 max-w-6xl mx-auto flex flex-col md:flex-row gap-10">
          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0">
            <div className="mb-8">
              <h1 className="text-3xl text-[#1C1917] mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>Mi Cuenta</h1>
              <p className="text-[#78716C] text-sm">{user.email}</p>
            </div>
            <nav className="space-y-2">
              <button onClick={() => setProfileTab('orders')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${profileTab === 'orders' ? 'bg-[#1C1917] text-white' : 'text-[#78716C] hover:bg-[#EDE7DC]'}`}>
                <ShoppingBag className="w-5 h-5" /> Mis Pedidos
              </button>
              <button onClick={() => setProfileTab('wishlist')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${profileTab === 'wishlist' ? 'bg-[#1C1917] text-white' : 'text-[#78716C] hover:bg-[#EDE7DC]'}`}>
                <Heart className="w-5 h-5" /> Lista de Deseos
              </button>
              <button onClick={() => setProfileTab('addresses')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${profileTab === 'addresses' ? 'bg-[#1C1917] text-white' : 'text-[#78716C] hover:bg-[#EDE7DC]'}`}>
                <MapPin className="w-5 h-5" /> Direcciones Guardadas
              </button>
              <button onClick={() => setProfileTab('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-colors ${profileTab === 'settings' ? 'bg-[#1C1917] text-white' : 'text-[#78716C] hover:bg-[#EDE7DC]'} mt-8`}>
                <Settings className="w-5 h-5" /> Ajustes
              </button>
              <button onClick={() => { setActiveSection('home'); supabase.auth.signOut() }} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl font-medium transition-colors">
                <LogOut className="w-5 h-5" /> Cerrar Sesión
              </button>
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 bg-white p-8 rounded-3xl border border-[#EDE7DC] shadow-sm overflow-x-auto">
            {profileTab === 'settings' ? (
              <div className="max-w-lg">
                <h2 className="text-2xl text-[#1C1917] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>Ajustes de Cuenta</h2>
                <form onSubmit={handleUpdateSettings} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-[#1C1917] mb-1">Correo Electrónico</label>
                    <input type="email" value={user.email} disabled className="w-full px-4 py-2.5 rounded-xl border border-[#EDE7DC] bg-[#F5F0E8] text-[#A8A29E] outline-none cursor-not-allowed" />
                    <p className="text-xs text-[#78716C] mt-1">El correo no se puede cambiar.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1C1917] mb-1">Nombre Completo</label>
                    <input type="text" value={settingsName} onChange={e => setSettingsName(e.target.value)} placeholder="Ej. Juan Pérez" className="w-full px-4 py-2.5 rounded-xl border border-[#EDE7DC] focus:border-[#B5621E] outline-none transition-colors" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1C1917] mb-1">Teléfono</label>
                    <input type="tel" value={settingsPhone} onChange={e => setSettingsPhone(e.target.value)} placeholder="Ej. 70012345" className="w-full px-4 py-2.5 rounded-xl border border-[#EDE7DC] focus:border-[#B5621E] outline-none transition-colors" />
                  </div>
                  <div className="pt-4 border-t border-[#EDE7DC]">
                    <label className="block text-sm font-medium text-[#1C1917] mb-1">Nueva Contraseña (Opcional)</label>
                    <input type="password" value={settingsPassword} onChange={e => setSettingsPassword(e.target.value)} placeholder="Escribe para cambiarla" className="w-full px-4 py-2.5 rounded-xl border border-[#EDE7DC] focus:border-[#B5621E] outline-none transition-colors" />
                  </div>
                  <button type="submit" className="w-full py-3 mt-2 bg-[#1C1917] text-white rounded-xl font-medium hover:bg-[#292524] transition-colors shadow-sm">
                    Guardar Cambios
                  </button>
                </form>
              </div>
            ) : profileTab === 'addresses' ? (
              <div className="max-w-xl">
                <h2 className="text-2xl text-[#1C1917] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>Mis Direcciones</h2>
                <div className="space-y-4 mb-8">
                  {userAddresses.length === 0 ? (
                    <p className="text-[#78716C] text-sm">Aún no tienes direcciones guardadas.</p>
                  ) : (
                    userAddresses.map(addr => (
                      <div key={addr.id} className="flex items-center justify-between p-4 border border-[#EDE7DC] rounded-2xl bg-[#F5F0E8]">
                        <div>
                          <p className="font-bold text-[#1C1917] text-sm">{addr.title}</p>
                          <p className="text-[#78716C] text-sm mt-0.5">{addr.address}</p>
                        </div>
                        <button onClick={() => handleDeleteAddress(addr.id)} className="text-red-500 hover:text-red-700 p-2">✕</button>
                      </div>
                    ))
                  )}
                </div>
                <h3 className="text-lg font-bold text-[#1C1917] mb-4">Añadir nueva dirección</h3>
                <form onSubmit={handleAddAddress} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#1C1917] mb-1">Nombre (ej: Mi Casa, Oficina)</label>
                    <input required type="text" value={newAddressTitle} onChange={e => setNewAddressTitle(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-[#EDE7DC] focus:border-[#B5621E] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1C1917] mb-1">Dirección completa</label>
                    <input required type="text" value={newAddressValue} onChange={e => setNewAddressValue(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-[#EDE7DC] focus:border-[#B5621E] outline-none" />
                  </div>
                  <button type="submit" className="w-full py-3 bg-[#B5621E] text-white rounded-xl font-medium hover:bg-[#8e4c16] transition-colors">
                    Guardar Dirección
                  </button>
                </form>
              </div>
            ) : profileTab === 'orders' ? (
              <>
                <h2 className="text-2xl text-[#1C1917] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>Historial de Pedidos</h2>
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b-2 border-[#EDE7DC] text-[#78716C] text-xs uppercase tracking-wider">
                      <th className="pb-4 font-semibold">Orden</th>
                      <th className="pb-4 font-semibold">Fecha</th>
                      <th className="pb-4 font-semibold">Estado</th>
                      <th className="pb-4 font-semibold text-right">Total</th>
                      <th className="pb-4 font-semibold text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="text-sm">
                    {userOrders.length === 0 ? (
                      <tr><td colSpan={4} className="py-8 text-center text-[#78716C]">Aún no tienes pedidos registrados.</td></tr>
                    ) : (
                      userOrders.map(order => (
                        <tr key={order.id || Math.random()} className="border-b border-[#EDE7DC] hover:bg-[#F5F0E8] transition-colors">
                          <td className="py-4 font-medium text-[#B5621E]">{order.code || 'Sin código'}</td>
                          <td className="py-4 text-[#1C1917]">{order.created_at ? new Date(order.created_at).toLocaleDateString() : 'Reciente'}</td>
                          <td className="py-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${order.status === 'Entregado' ? 'bg-green-100 text-green-800' : order.status === 'Cancelado' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                              {String(order.status || 'Pendiente').toUpperCase()}
                            </span>
                          </td>
                          <td className="py-4 text-right font-bold text-[#1C1917]">{fmtPrice(Number(order.total) || 0)}</td>
                          <td className="py-4 text-right">
                            <a
                              href={`https://wa.me/59169254989?text=Hola, tengo una consulta sobre mi pedido ${order.code}.`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold transition-transform hover:scale-105"
                              style={{ backgroundColor: '#25D366' }}
                              title="Contactar por WhatsApp"
                            >
                              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                              Chat
                            </a>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </>
            ) : (
              <>
                <h2 className="text-2xl text-[#1C1917] mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>Lista de Deseos</h2>
                {wishlistIds.length === 0 ? (
                  <p className="py-8 text-center text-[#78716C]">No tienes productos guardados en tu lista de deseos.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.filter(p => wishlistIds.includes(p.id)).map(p => (
                      <ProductCard key={p.id} product={p} isLiked={true} onToggleLike={handleToggleLike} onAdd={addToCart} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-[#D6CFC6] py-12 px-4 md:px-8 mt-16" style={{ backgroundColor: '#1C1917' }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
          <div>
            <p className="text-2xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif", color: 'white' }}>
              Tienda<span style={{ color: '#D4843C' }}>Regalo</span>
            </p>
            <p className="text-sm text-[#78716C] leading-relaxed">Tu destino de regalos únicos y memorables. Calidad, creatividad y entrega a domicilio.</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#D4843C' }}>Tipos</p>
            <ul className="space-y-2.5">
              {PRODUCT_TYPES.slice(0, 4).map(t => (
                <li key={t}><button onClick={() => applyFilter('type', t)} className="text-sm text-[#78716C] hover:text-white transition-colors text-left">{t}</button></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#D4843C' }}>Ocasiones</p>
            <ul className="space-y-2.5">
              {OCCASIONS.slice(0, 4).map(o => (
                <li key={o}><button onClick={() => applyFilter('occasion', o)} className="text-sm text-[#78716C] hover:text-white transition-colors text-left">{o}</button></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#D4843C' }}>Ayuda</p>
            <ul className="space-y-2.5">
              <li><button onClick={() => { if(user) { setProfileTab('orders'); setActiveSection('profile') } else setAuthModalOpen(true) }} className="text-sm text-[#78716C] hover:text-white transition-colors text-left">Rastrear pedido</button></li>
              <li><a href="mailto:soporte@tiendaregalo.com" className="text-sm text-[#78716C] hover:text-white transition-colors">Contacto</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-10 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#57534E]">© 2026 TiendaRegalo. Todos los derechos reservados.</p>
          <div className="flex gap-4">
            {['QR', 'Tarjeta', 'Transferencia'].map(p => <span key={p} className="text-xs px-2.5 py-1 rounded border border-white/10 text-[#78716C]">{p}</span>)}
          </div>
        </div>
      </footer>

      {/* Modals */}
      {cartOpen && !checkoutOpen && (
        <CartModal items={cart} onClose={() => setCartOpen(false)} onQtyChange={updateQty} onRemove={removeItem} onCheckout={() => { setCartOpen(false); setCheckoutOpen(true) }} />
      )}
      {checkoutOpen && (
        <CheckoutModal items={cart} user={user} userAddresses={userAddresses} onClose={() => setCheckoutOpen(false)} onComplete={() => {
          setCart([])
          supabase.from('products').select('*').order('id').then(({ data }) => {
            if (data) setProducts(data)
          })
        }} />
      )}
      {authModalOpen && <AuthModal onClose={() => setAuthModalOpen(false)} />}
    </div>
  )
}
