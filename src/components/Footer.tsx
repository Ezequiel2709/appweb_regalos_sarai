import { User } from '@supabase/supabase-js';
import { PRODUCT_TYPES, OCCASIONS } from '../types';

export function Footer({
  applyFilter,
  user,
  setProfileTab,
  setActiveSection,
  setAuthModalOpen
}: {
  applyFilter: (type: string, val: string) => void;
  user: User | null;
  setProfileTab: (t: 'orders' | 'wishlist' | 'addresses' | 'settings') => void;
  setActiveSection: (s: 'home' | 'about' | 'location' | 'profile') => void;
  setAuthModalOpen: (o: boolean) => void;
}) {
  return (
    <footer className="border-t border-[#D6CFC6] py-12 px-4 md:px-8 mt-16" style={{ backgroundColor: '#9a5628ff' }}>
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        <div>
          <p className="text-2xl font-bold mb-3" style={{ fontFamily: "'Playfair Display', serif", color: 'white' }}>
            <span style={{ color: '#D4843C' }}>Every</span> Occasion
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
            <li><button onClick={() => { if (user) { setProfileTab('orders'); setActiveSection('profile') } else setAuthModalOpen(true) }} className="text-sm text-[#78716C] hover:text-white transition-colors text-left">Rastrear pedido</button></li>
            <li><a href="mailto:soporte@tiendaregalo.com" className="text-sm text-[#78716C] hover:text-white transition-colors">Contacto</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-10 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-[#57534E]">© 2026 Every Occasion. Todos los derechos reservados.</p>
        <div className="flex gap-4">
          {['QR', 'Tarjeta', 'Transferencia'].map(p => <span key={p} className="text-xs px-2.5 py-1 rounded border border-white/10 text-[#78716C]">{p}</span>)}
        </div>
      </div>
    </footer>
  )
}
