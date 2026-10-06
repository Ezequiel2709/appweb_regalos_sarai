import React, { useState } from 'react';
import { ShoppingBag, Heart } from 'lucide-react';
import { Product } from '../types';
import { fmtPrice, Stars, StockBadge } from '../lib/helpers';

// ─── Product Card ─────────────────────────────────────────────────────────────

export function ProductCard({ product, isLiked, onToggleLike, onAdd }: { product: Product; isLiked?: boolean; onToggleLike?: (p: Product) => void; onAdd: (p: Product) => void }) {
  const [added, setAdded] = useState(false)

  const handleAdd = () => {
    if (product.stock === 0) return
    onAdd(product)
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
  }

  return (
    <div className="group bg-white rounded-2xl overflow-hidden border border-[#EDE7DC] hover:border-[#B5621E] hover:shadow-xl transition-all duration-300 flex flex-col">
      <div className="relative overflow-hidden bg-[#F5F0E8]" style={{ height: 220 }}>
        <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <span className="absolute top-3 left-3 text-white text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: product.badgeColor }}>{product.badge}</span>
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
            <span className="bg-[#1C1917] text-white text-xs font-semibold px-3 py-1.5 rounded-full">Agotado</span>
          </div>
        )}
        {onToggleLike && (
          <button 
            onClick={(e) => { e.stopPropagation(); onToggleLike(product); }} 
            className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-all shadow-sm"
          >
            <Heart className={`w-4 h-4 transition-colors ${isLiked ? 'fill-[#B5621E] text-[#B5621E]' : 'text-[#78716C] hover:text-[#B5621E]'}`} />
          </button>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-[#B5621E] font-semibold uppercase tracking-wider mb-1">{product.brand}</p>
        <h3 className="font-semibold text-[#1C1917] text-sm mb-1 leading-snug flex-1">{product.name}</h3>
        <div className="flex items-center gap-1.5 mb-2">
          <Stars rating={product.rating} />
          <span className="text-xs text-[#78716C]">({product.reviews})</span>
        </div>
        <div className="flex flex-wrap gap-1 mb-2">
          {product.occasions.slice(0, 2).map(o => (
            <span key={o} className="text-[10px] text-[#78716C] bg-[#F5F0E8] px-2 py-0.5 rounded-full">{o}</span>
          ))}
        </div>
        <div className="flex items-end gap-2 mb-3">
          <span className="text-lg font-bold text-[#1C1917]">{fmtPrice(product.price)}</span>
          {product.originalPrice && <span className="text-xs text-[#78716C] line-through">{fmtPrice(product.originalPrice)}</span>}
        </div>
        <StockBadge stock={product.stock} />
        <button
          onClick={handleAdd}
          disabled={product.stock === 0}
          className="mt-3 w-full py-2.5 rounded-xl font-medium text-sm transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: added ? '#1C1917' : product.stock === 0 ? '#D6CFC6' : '#B5621E', color: 'white' }}
        >
          {added ? '✓ Agregado' : product.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
        </button>
      </div>
    </div>
  )
}
