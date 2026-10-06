import { useState, useEffect } from 'react';
import { Store, Truck, DollarSign, Package, Users, AlertTriangle, ClipboardList } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { PRODUCT_TYPES, OCCASIONS, Product } from '../types';
import { AuthModal } from '../components/AuthModal';


// ─── Dashboard ────────────────────────────────────────────────────────────────



export const STATUS_COLORS: Record<string, string> = {
  'Pendiente de Pago': '#EAB308',
  'En Preparación': '#3B82F6',
  'Listo para Retiro': '#8B5CF6',
  'En Camino': '#F97316',
  'Entregado': '#22C55E',
  'Cancelado': '#EF4444',
}

export function Dashboard() {
  const [orders, setOrders] = useState<any[]>([])
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    supabase.from('products').select('*').order('id').then(({ data }) => {
      if (data) setProducts(data)
    })
  }, [])
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory'>('orders')
  const [filterStatus, setFilterStatus] = useState('Todos')
  const [editProduct, setEditProduct] = useState<Product | null>(null)
  const [showProductModal, setShowProductModal] = useState(false)
  const [searchQ, setSearchQ] = useState('')
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    supabase.from('orders').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setOrders(data)
    })
  }, [])

  const pendingCount = orders.filter(o => ['Pendiente de Pago', 'En Preparación'].includes(o.status)).length
  const criticalStock = products.filter(p => p.stock > 0 && p.stock <= 5).length
  const todaySales = orders.filter(o => o.created_at && o.created_at.startsWith(new Date().toISOString().split('T')[0])).reduce((s, o) => s + o.total, 0)

  const filteredOrders = orders.filter(o => filterStatus === 'Todos' || o.status === filterStatus)
  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(searchQ.toLowerCase()))

  if (!user || user.email !== 'admin@gmail.com') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAF7F2] p-4">
        <div className="mb-8 text-center">
          <span className="text-3xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif", color: '#1C1917' }}>
            Admin<span style={{ color: '#B5621E' }}>Panel</span>
          </span>
          <p className="text-[#78716C] mt-2">Acceso restringido solo para administradores</p>
        </div>

        {user ? (
          <div className="bg-white p-8 rounded-3xl border border-[#EDE7DC] text-center max-w-sm w-full" style={{ boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-[#1C1917] mb-2">Acceso Denegado</h3>
            <p className="text-sm text-[#78716C] mb-6">Tu cuenta actual ({user.email}) no tiene permisos de administrador.</p>
            <div className="space-y-3">
              <Link to="/" className="block w-full py-3 rounded-xl font-semibold text-white text-sm transition-all hover:opacity-90" style={{ backgroundColor: '#B5621E' }}>
                Volver a la tienda
              </Link>
              <button onClick={() => supabase.auth.signOut()} className="block w-full py-3 rounded-xl font-semibold text-red-600 border border-red-200 text-sm hover:bg-red-50 transition-all">
                Cerrar sesión e intentar de nuevo
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-sm relative z-10">
            <form onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const email = (form.elements.namedItem('email') as HTMLInputElement).value;
              const password = (form.elements.namedItem('password') as HTMLInputElement).value;
              const { error } = await supabase.auth.signInWithPassword({ email, password });
              if (error) alert(error.message);
            }} className="bg-white p-8 rounded-3xl border border-[#EDE7DC]" style={{ boxShadow: '0 25px 50px rgba(0,0,0,0.1)' }}>
              <h3 className="text-xl font-bold text-[#1C1917] mb-6 text-center">Iniciar Sesión (Admin)</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[#78716C] uppercase tracking-wider block mb-1.5">Correo Admin</label>
                  <input name="email" type="email" required className="w-full px-4 py-3 rounded-xl border border-[#EDE7DC] text-sm outline-none focus:border-[#B5621E] transition-colors" placeholder="admin@gmail.com" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#78716C] uppercase tracking-wider block mb-1.5">Contraseña</label>
                  <input name="password" type="password" required className="w-full px-4 py-3 rounded-xl border border-[#EDE7DC] text-sm outline-none focus:border-[#B5621E] transition-colors" placeholder="••••••••" />
                </div>
                <button type="submit" className="w-full py-3 mt-4 rounded-xl font-semibold text-white text-sm transition-all hover:bg-gray-800" style={{ backgroundColor: '#1C1917' }}>
                  Entrar al Panel
                </button>
                <div className="text-center mt-4">
                  <Link to="/" className="text-sm font-medium text-[#78716C] hover:text-[#B5621E]">← Volver a la tienda</Link>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F0E8', fontFamily: "'DM Sans', sans-serif" }}>
      {/* Top bar */}
      <div className="border-b border-[#D6CFC6]" style={{ backgroundColor: '#FAF7F2' }}>
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif", color: '#1C1917' }}>
              Admin<span style={{ color: '#B5621E' }}>Panel</span>
            </span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: '#EDE7DC', color: '#78716C' }}>Dashboard</span>
          </div>
          <div className="flex gap-3">
            <Link to="/" className="text-sm font-medium text-[#B5621E] hover:underline underline-offset-4 flex items-center">Ver Tienda ↗</Link>
            <button onClick={() => {
              supabase.from('orders').select('*').order('created_at', { ascending: false }).then(({ data }) => { if (data) setOrders(data) })
              supabase.from('products').select('*').order('id').then(({ data }) => { if (data) setProducts(data) })
            }} className="text-sm px-4 py-2 rounded-xl bg-[#EDE7DC] text-[#1C1917] font-medium hover:bg-[#D6CFC6] transition-colors">⟳ Actualizar</button>
            <button onClick={() => supabase.auth.signOut()} className="text-sm px-4 py-2 rounded-xl border border-red-200 text-red-600 font-medium hover:bg-red-50 transition-colors">Cerrar sesión</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* KPI cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Ventas del día', value: `Bs. ${todaySales}`, icon: <DollarSign className="w-6 h-6" />, color: '#22C55E' },
            { label: 'Pedidos pendientes', value: pendingCount, icon: <Package className="w-6 h-6" />, color: '#F97316' },
            { label: 'Clientes registrados', value: '1,284', icon: <Users className="w-6 h-6" />, color: '#3B82F6' },
            { label: 'Stock crítico', value: `${criticalStock} productos`, icon: <AlertTriangle className="w-6 h-6" />, color: '#EF4444' },
          ].map(card => (
            <div key={card.label} className="bg-white rounded-2xl p-5 border border-[#EDE7DC]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[#1C1917]">{card.icon}</span>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: card.color }} />
              </div>
              <p className="text-2xl font-bold text-[#1C1917]">{card.value}</p>
              <p className="text-xs text-[#78716C] mt-1">{card.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-[#EDE7DC] p-1 rounded-xl w-fit">
          {([['orders', <span className="flex items-center gap-1.5"><ClipboardList className="w-4 h-4" /> Pedidos</span>], ['inventory', <span className="flex items-center gap-1.5"><Package className="w-4 h-4" /> Inventario</span>]] as const).map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)} className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all" style={{ backgroundColor: activeTab === key ? 'white' : 'transparent', color: activeTab === key ? '#1C1917' : '#78716C', boxShadow: activeTab === key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none' }}>
              {label}
            </button>
          ))}
        </div>

        {/* Orders table */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl border border-[#EDE7DC] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#EDE7DC] flex flex-wrap gap-3 items-center">
              <h3 className="font-semibold text-[#1C1917] flex-1">Gestión de Pedidos</h3>
              <div className="flex gap-2 flex-wrap">
                {['Todos', 'Pendiente de Pago', 'En Preparación', 'En Camino', 'Entregado'].map(s => (
                  <button key={s} onClick={() => setFilterStatus(s)} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all" style={{ backgroundColor: filterStatus === s ? '#1C1917' : '#F5F0E8', color: filterStatus === s ? 'white' : '#78716C' }}>{s}</button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#EDE7DC]" style={{ backgroundColor: '#FAF9F6' }}>
                    {['Orden', 'Fecha', 'Cliente', 'Entrega', 'Total', 'Estado', 'Acciones'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#78716C] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order, i) => (
                    <tr key={order.id} className="border-b border-[#F5F0E8] hover:bg-[#FAF9F6] transition-colors" style={{ backgroundColor: i % 2 === 0 ? 'white' : '#FDFCFB' }}>
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-[#B5621E]">{order.id}</td>
                      <td className="px-4 py-3 text-xs text-[#78716C]">{new Date(order.created_at).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-[#1C1917] text-xs">{order.client_name}</p>
                        <p className="text-[#78716C] text-[11px]">{order.client_phone}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold px-2 py-1 rounded-full inline-block mb-1" style={{ backgroundColor: order.delivery_type === 'home' ? '#FFF7ED' : '#EFF6FF', color: order.delivery_type === 'home' ? '#EA580C' : '#2563EB' }}>
                          {order.delivery_type === 'home' ? <span className="flex items-center gap-1"><Truck className="w-3 h-3" /> Domicilio</span> : <span className="flex items-center gap-1"><Store className="w-3 h-3" /> Sucursal</span>}
                        </span>
                        {order.delivery_type === 'home' && order.client_address && (
                          <p className="text-[11px] text-[#78716C] max-w-[150px] leading-tight mt-1">{order.client_address}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 font-bold text-[#1C1917] text-xs">Bs. {order.total}</td>
                      <td className="px-4 py-3">
                        <select
                          value={order.status}
                          onChange={async (e) => {
                            const newStatus = e.target.value
                            setOrders(orders.map(o => o.id === order.id ? { ...o, status: newStatus } : o))
                            await supabase.from('orders').update({ status: newStatus }).eq('id', order.id)
                          }}
                          className="text-xs font-semibold px-2 py-1 rounded-full border-0 outline-none cursor-pointer"
                          style={{ backgroundColor: STATUS_COLORS[order.status] + '20', color: STATUS_COLORS[order.status] }}
                        >
                          {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={`https://wa.me/591${order.phone}?text=Hola ${order.client}, tu pedido ${order.id} está: ${order.status}.`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:scale-105"
                          style={{ backgroundColor: '#25D366', color: 'white' }}
                        >
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                          WA
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Inventory */}
        {activeTab === 'inventory' && (
          <div className="bg-white rounded-2xl border border-[#EDE7DC] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#EDE7DC] flex items-center gap-4">
              <h3 className="font-semibold text-[#1C1917] flex-1">Inventario de Productos</h3>
              <div className="flex items-center gap-2 bg-[#F5F0E8] rounded-xl px-3 py-2">
                <svg className="w-4 h-4 text-[#78716C]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="Buscar producto..." className="bg-transparent text-sm outline-none w-36 text-[#1C1917] placeholder-[#A8A29E]" />
              </div>
              <button onClick={() => { setEditProduct(null); setShowProductModal(true) }} className="text-sm px-4 py-2 rounded-xl font-semibold text-white transition-all hover:scale-105" style={{ backgroundColor: '#B5621E' }}>+ Nuevo producto</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#EDE7DC]" style={{ backgroundColor: '#FAF9F6' }}>
                    {['Producto', 'Tipo', 'Ocasiones', 'Precio', 'Stock', 'Acciones'].map(h => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#78716C] uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p, i) => (
                    <tr key={p.id} className="border-b border-[#F5F0E8] hover:bg-[#FAF9F6] transition-colors" style={{ backgroundColor: i % 2 === 0 ? 'white' : '#FDFCFB' }}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={p.image} alt={p.name} className="w-10 h-10 rounded-lg object-cover bg-[#F5F0E8]" />
                          <div>
                            <p className="font-semibold text-[#1C1917] text-xs">{p.name}</p>
                            <p className="text-[11px] text-[#78716C]">{p.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#78716C]">{p.type}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {p.occasions.slice(0, 2).map(o => <span key={o} className="text-[10px] bg-[#F5F0E8] text-[#78716C] px-1.5 py-0.5 rounded">{o}</span>)}
                          {p.occasions.length > 2 && <span className="text-[10px] text-[#A8A29E]">+{p.occasions.length - 2}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold text-xs text-[#1C1917]">Bs. {p.price}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.stock === 0 ? '#9CA3AF' : p.stock <= 5 ? '#EF4444' : '#22C55E' }} />
                          <span className="text-xs font-semibold" style={{ color: p.stock === 0 ? '#9CA3AF' : p.stock <= 5 ? '#EF4444' : '#1C1917' }}>
                            {p.stock === 0 ? 'Agotado' : `${p.stock} uds.`}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => { setEditProduct(p); setShowProductModal(true) }} className="text-xs text-[#B5621E] hover:underline font-medium">Editar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Product edit modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowProductModal(false)} />
          <form className="relative bg-white rounded-2xl w-full max-w-md p-6 space-y-4" style={{ boxShadow: '0 0 40px rgba(0,0,0,0.2)' }} onSubmit={async (e) => {
            e.preventDefault()
            const fd = new FormData(e.currentTarget)
            const payload = {
              name: String(fd.get('name') || ''),
              description: String(fd.get('description') || ''),
              price: Number(fd.get('price') || 0),
              stock: Number(fd.get('stock') || 0),
              type: String(fd.get('type') || ''),
              occasions: fd.getAll('occasions').map(String)
            }
            if (editProduct) {
              await supabase.from('products').update(payload).eq('id', editProduct.id)
            } else {
              await supabase.from('products').insert({
                ...payload,
                brand: 'TiendaRegalo',
                image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&h=600&fit=crop&auto=format',
                rating: 5,
                reviews: 0,
                badge: 'Nuevo',
                badgeColor: '#10B981'
              })
            }
            supabase.from('products').select('*').order('id').then(({ data }) => { if (data) setProducts(data) })
            setShowProductModal(false)
          }}>
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-[#1C1917]">{editProduct ? 'Editar Producto' : 'Nuevo Producto'}</h3>
              <button type="button" onClick={() => setShowProductModal(false)} className="w-8 h-8 rounded-full bg-[#F5F0E8] text-[#78716C] flex items-center justify-center hover:bg-[#EDE7DC]">✕</button>
            </div>
            {[{ label: 'Nombre', key: 'name' }, { label: 'Descripción', key: 'description' }, { label: 'Precio (Bs.)', key: 'price' }, { label: 'Stock', key: 'stock' }].map(field => (
              <div key={field.key}>
                <label className="text-xs font-semibold text-[#78716C] uppercase tracking-wider block mb-1">{field.label}</label>
                <input name={field.key} defaultValue={editProduct ? String(editProduct[field.key as keyof Product] ?? '') : ''} className="w-full px-4 py-3 rounded-xl border border-[#EDE7DC] text-sm outline-none focus:border-[#B5621E] transition-colors" required />
              </div>
            ))}
            <div>
              <label className="text-xs font-semibold text-[#78716C] uppercase tracking-wider block mb-1">Tipo de Producto</label>
              <select name="type" defaultValue={editProduct?.type} className="w-full px-4 py-3 rounded-xl border border-[#EDE7DC] text-sm outline-none focus:border-[#B5621E] transition-colors">
                {PRODUCT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-[#78716C] uppercase tracking-wider block mb-2">Ocasiones</label>
              <div className="flex flex-wrap gap-2">
                {OCCASIONS.map(o => (
                  <label key={o} className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" name="occasions" value={o} defaultChecked={editProduct?.occasions.includes(o)} className="accent-[#B5621E]" />
                    <span className="text-xs text-[#78716C]">{o}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setShowProductModal(false)} className="flex-1 py-3 rounded-xl border border-[#EDE7DC] text-[#78716C] font-medium text-sm hover:bg-[#F5F0E8] transition-colors">Cancelar</button>
              <button type="submit" className="flex-1 py-3 rounded-xl font-semibold text-white text-sm transition-all hover:scale-[1.02]" style={{ backgroundColor: '#B5621E' }}>Guardar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
