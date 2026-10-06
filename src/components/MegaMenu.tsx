import React from 'react';
import { motion } from 'framer-motion';
import { PRODUCT_TYPES, OCCASIONS } from '../types';

// ─── Mega Menu ────────────────────────────────────────────────────────────────

export function MegaMenu({ onClose, onFilter }: { onClose: () => void; onFilter: (type: string, value: string) => void }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9, x: -20, y: -10, transformOrigin: 'top left' }} animate={{ opacity: 1, scale: 1, x: 0, y: 0 }} transition={{ duration: 0.25, ease: "easeOut" }} className="absolute top-full left-0 right-0 z-40 border-t border-[#EDE7DC] shadow-2xl" style={{ backgroundColor: '#FAF7F2' }}>
      <div className="max-w-7xl mx-auto px-8 py-8 grid grid-cols-2 gap-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#B5621E] mb-4">Por Tipo de Regalo</p>
          <div className="grid grid-cols-2 gap-2">
            {PRODUCT_TYPES.map(t => (
              <button key={t} onClick={() => { onFilter('type', t); onClose() }} className="text-left px-3 py-2.5 rounded-xl text-sm text-[#1C1917] hover:bg-[#EDE7DC] hover:text-[#B5621E] transition-colors font-medium">{t}</button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#B5621E] mb-4">Por Ocasión / Evento</p>
          <div className="grid grid-cols-2 gap-2">
            {OCCASIONS.map(o => (
              <button key={o} onClick={() => { onFilter('occasion', o); onClose() }} className="text-left px-3 py-2.5 rounded-xl text-sm text-[#1C1917] hover:bg-[#EDE7DC] hover:text-[#B5621E] transition-colors font-medium">{o}</button>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  )
}
