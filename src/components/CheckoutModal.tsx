import React, { useState, useRef, useEffect } from 'react';
import { ShoppingBag, Store, Truck, Smartphone, CreditCard, Gift, DollarSign, Package, Users, AlertTriangle, ClipboardList, Cake, Search, MapPin, Clock, Phone } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { Link, BrowserRouter, Routes, Route } from 'react-router-dom';
import type { User } from '@supabase/supabase-js';
import { PRODUCT_TYPES, OCCASIONS, OCCASION_IMAGES, Product, CartItem, CheckoutStep, ActiveSection } from '../types';
import { fmtPrice, Stars, StockBadge } from '../lib/helpers';
// ─── Checkout ─────────────────────────────────────────────────────────────────

export function CheckoutModal({ items, user, userAddresses = [], onClose, onComplete }: {
  items: CartItem[]
  user: User | null
  userAddresses?: any[]
  onClose: () => void
  onComplete: () => void
}) {
  const [step, setStep] = useState<CheckoutStep>('delivery')
  const [deliveryType, setDeliveryType] = useState<'pickup' | 'home'>('home')
  const [details, setDetails] = useState({ 
    name: user?.user_metadata?.name || '', 
    phone: user?.user_metadata?.phone || '', 
    address: '', 
    dedication: '' 
  })
  const [payMethod, setPayMethod] = useState<'qr' | 'card'>('qr')
  const [cardDetails, setCardDetails] = useState({ number: '', cvv: '', expiry: '' })
  const [orderCode] = useState(() => `ORD-2026-${String(Math.floor(Math.random() * 9000) + 1000)}`)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeLeft, setTimeLeft] = useState(300) // 5 minutos para QR

  useEffect(() => {
    if (step === 'payment' && payMethod === 'qr' && timeLeft > 0) {
      const t = setTimeout(() => setTimeLeft(l => l - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [step, payMethod, timeLeft])

  const handleSubmit = async () => {
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 2500))
    try {
      await supabase.from('orders').insert({
        code: orderCode,
        client_name: details.name,
        client_email: user ? user.email : null,
        client_phone: details.phone,
        client_address: details.address,
        delivery_type: deliveryType,
        total: total,
        items: items
      })
      for (const item of items) {
        const newStock = Math.max(0, item.product.stock - item.qty)
        await supabase.from('products').update({ stock: newStock }).eq('id', item.product.id)
      }
    } catch (e) {
      console.error(e)
    }
    setIsSubmitting(false)
    setStep('confirmation')
  }

  const subtotal = items.reduce((s, i) => s + i.product.price * i.qty, 0)
  const shipping = deliveryType === 'home' ? 20 : 0
  const total = subtotal + shipping

  const STEPS: CheckoutStep[] = ['delivery', 'details', 'payment', 'confirmation']
  const stepIdx = STEPS.indexOf(step)
  const STEP_LABELS = ['Entrega', 'Datos', 'Pago', 'Confirmado']

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }} />
      <div className="relative bg-white rounded-3xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden" style={{ boxShadow: '0 0 60px rgba(200,109,86,0.25), 0 25px 50px rgba(0,0,0,0.3)' }}>
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#EDE7DC]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[#1C1917]" style={{ fontFamily: "'Playfair Display', serif" }}>Checkout</h2>
            {step !== 'confirmation' && <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F5F0E8] text-[#78716C] hover:bg-[#EDE7DC] transition-colors text-sm">✕</button>}
          </div>
          <div className="flex gap-1">
            {STEP_LABELS.map((label, i) => (
              <div key={label} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full h-1 rounded-full transition-all duration-500" style={{ backgroundColor: i <= stepIdx ? '#B5621E' : '#EDE7DC' }} />
                <span className="text-[10px] font-medium" style={{ color: i <= stepIdx ? '#B5621E' : '#A8A29E' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">

          {/* Step 1: Delivery */}
          {step === 'delivery' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-[#1C1917]">¿Cómo quieres recibir tu pedido?</h3>
              {[
                { key: 'pickup', icon: <Store className="w-6 h-6" />, label: 'Retiro en Sucursal', desc: 'Gratis · Av. Los Pinos 234, entre 9am–6pm', extra: 'Bs. 0.00' },
                { key: 'home', icon: <Truck className="w-6 h-6" />, label: 'Envío a Domicilio', desc: 'Tu dirección · Entrega en 24–48 horas', extra: 'Bs. 20.00' },
              ].map(opt => (
                <button
                  key={opt.key}
                  onClick={() => setDeliveryType(opt.key as 'pickup' | 'home')}
                  className="w-full flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all"
                  style={{ borderColor: deliveryType === opt.key ? '#B5621E' : '#EDE7DC', backgroundColor: deliveryType === opt.key ? '#FFF8F4' : 'white' }}
                >
                  <span className="mt-0.5 text-[#1C1917]">{opt.icon}</span>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-[#1C1917]">{opt.label}</p>
                    <p className="text-xs text-[#78716C] mt-0.5">{opt.desc}</p>
                  </div>
                  <span className="text-sm font-bold" style={{ color: opt.extra === 'Bs. 0.00' ? '#1C6B4A' : '#B5621E' }}>{opt.extra}</span>
                </button>
              ))}
              <div className="bg-[#F5F0E8] rounded-2xl p-4 text-sm text-[#78716C]">
                <p className="font-semibold text-[#1C1917] mb-1">Resumen del pedido</p>
                {items.map(i => (
                  <div key={i.product.id} className="flex justify-between py-0.5">
                    <span>{i.product.name} ×{i.qty}</span>
                    <span>{fmtPrice(i.product.price * i.qty)}</span>
                  </div>
                ))}
                <div className="border-t border-[#D6CFC6] mt-2 pt-2 flex justify-between font-bold text-[#1C1917]">
                  <span>Total estimado</span>
                  <span>{fmtPrice(total)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 'details' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-[#1C1917]">Datos de envío</h3>
              {userAddresses.length > 0 && deliveryType === 'home' && (
                <div className="mb-4">
                  <label className="text-xs font-semibold text-[#78716C] uppercase tracking-wider block mb-2">Usar dirección guardada</label>
                  <div className="flex flex-wrap gap-2">
                    {userAddresses.map(addr => (
                      <button 
                        key={addr.id} 
                        onClick={() => setDetails(prev => ({ ...prev, address: addr.address }))}
                        className="px-3 py-1.5 rounded-lg border border-[#EDE7DC] bg-[#F5F0E8] text-[#1C1917] text-xs font-medium hover:border-[#B5621E] transition-colors"
                      >
                        {addr.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {[
                { key: 'name', label: 'Nombre del destinatario', placeholder: 'Ej. Ana García' },
                { key: 'phone', label: 'Teléfono / Celular', placeholder: '+591 69254989' },
                ...(deliveryType === 'home' ? [{ key: 'address', label: 'Dirección de entrega', placeholder: 'Calle, Nro., Zona, Ciudad' }] : []),
                { key: 'dedication', label: 'Dedicatoria personalizada (opcional)', placeholder: 'Con todo mi amor...' },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-xs font-semibold text-[#78716C] uppercase tracking-wider block mb-1.5">{field.label}</label>
                  {field.key === 'dedication' ? (
                    <textarea
                      value={details[field.key as keyof typeof details]}
                      onChange={e => setDetails(d => ({ ...d, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border border-[#EDE7DC] text-sm text-[#1C1917] outline-none focus:border-[#B5621E] transition-colors resize-none placeholder-[#A8A29E]"
                    />
                  ) : (
                    <input
                      value={details[field.key as keyof typeof details]}
                      onChange={e => setDetails(d => ({ ...d, [field.key]: e.target.value }))}
                      placeholder={field.placeholder}
                      className="w-full px-4 py-3 rounded-xl border border-[#EDE7DC] text-sm text-[#1C1917] outline-none focus:border-[#B5621E] transition-colors placeholder-[#A8A29E]"
                    />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Step 3: Payment */}
          {step === 'payment' && (
            <div className="space-y-4">
              <h3 className="font-semibold text-[#1C1917]">Método de pago</h3>
              <div className="flex gap-3">
                {[{ key: 'qr', icon: <Smartphone className="w-6 h-6" />, label: 'Pago QR' }, { key: 'card', icon: <CreditCard className="w-6 h-6" />, label: 'Tarjeta' }].map(m => (
                  <button key={m.key} onClick={() => setPayMethod(m.key as 'qr' | 'card')} className="flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all" style={{ borderColor: payMethod === m.key ? '#B5621E' : '#EDE7DC', backgroundColor: payMethod === m.key ? '#FFF8F4' : 'white' }}>
                    <span className="text-[#1C1917]">{m.icon}</span>
                    <span className="text-sm font-semibold text-[#1C1917]">{m.label}</span>
                  </button>
                ))}
              </div>
              {payMethod === 'qr' ? (
                <div className="text-center space-y-3">
                  <div className="w-48 h-48 mx-auto rounded-2xl bg-white flex flex-col items-center justify-center border-2 border-[#1C1917] p-2 relative shadow-sm">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=GeneradoPorTiendaRegalo" alt="QR Code" className="w-full h-full object-contain" />
                  </div>
                  <p className="text-sm font-semibold text-[#B5621E]">
                    El código expira en: {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
                  </p>
                  <p className="text-sm text-[#78716C] px-4">Escanea el código QR Simple desde la app de tu banco.</p>
                  <div className="bg-[#F5F0E8] rounded-2xl p-4 flex justify-between items-center">
                    <span className="text-sm text-[#78716C]">Total a pagar</span>
                    <span className="font-bold text-lg text-[#1C1917]">{fmtPrice(total)}</span>
                  </div>
                  <button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl border-2 border-[#B5621E] text-white bg-[#B5621E] font-semibold text-sm hover:bg-[#8e4c16] hover:border-[#8e4c16] transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Verificando transacción...' : '✓ Ya realicé el pago'}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <label className="text-xs font-semibold text-[#78716C] uppercase tracking-wider block mb-1.5">Número de tarjeta</label>
                    <input 
                      value={cardDetails.number} 
                      onChange={e => setCardDetails(d => ({ ...d, number: e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim().substring(0, 19) }))} 
                      placeholder="0000 0000 0000 0000" 
                      className="w-full px-4 py-3 rounded-xl border border-[#EDE7DC] text-sm outline-none focus:border-[#B5621E] transition-colors placeholder-[#A8A29E]" 
                    />
                    {cardDetails.number.startsWith('4') ? <span className="absolute right-4 top-9 font-bold text-blue-800 italic text-xs">VISA</span> : 
                     cardDetails.number.startsWith('5') ? <span className="absolute right-4 top-9 font-bold text-red-600 text-xs">MasterCard</span> : null}
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-[#78716C] uppercase tracking-wider block mb-1.5">Vencimiento</label>
                      <input 
                        value={cardDetails.expiry} 
                        onChange={e => {
                          const v = e.target.value.replace(/\D/g, '');
                          setCardDetails(d => ({ ...d, expiry: v.length >= 2 ? v.substring(0,2) + '/' + v.substring(2,4) : v }))
                        }} 
                        placeholder="MM/AA" 
                        className="w-full px-4 py-3 rounded-xl border border-[#EDE7DC] text-sm outline-none focus:border-[#B5621E] transition-colors placeholder-[#A8A29E]" 
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs font-semibold text-[#78716C] uppercase tracking-wider block mb-1.5">CVV</label>
                      <input 
                        type="password"
                        value={cardDetails.cvv} 
                        onChange={e => setCardDetails(d => ({ ...d, cvv: e.target.value.replace(/\D/g, '').substring(0, 4) }))} 
                        placeholder="123" 
                        className="w-full px-4 py-3 rounded-xl border border-[#EDE7DC] text-sm outline-none focus:border-[#B5621E] transition-colors placeholder-[#A8A29E]" 
                      />
                    </div>
                  </div>
                  <div className="bg-[#F5F0E8] rounded-2xl p-4 flex justify-between">
                    <span className="text-sm text-[#78716C]">Total</span>
                    <span className="font-bold text-[#1C1917]">{fmtPrice(total)}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 'confirmation' && (
            <div className="text-center space-y-5 py-4">
              <div className="w-20 h-20 mx-auto rounded-full flex items-center justify-center" style={{ backgroundColor: '#F0FDF4' }}><Gift className="w-10 h-10 text-green-600" /></div>
              <div>
                <h3 className="text-2xl font-bold text-[#1C1917]" style={{ fontFamily: "'Playfair Display', serif" }}>¡Pedido confirmado!</h3>
                <p className="text-[#78716C] text-sm mt-1">Tu regalo está en camino</p>
              </div>
              <div className="bg-[#F5F0E8] rounded-2xl p-4 text-left space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[#78716C]">Código de orden</span>
                  <span className="font-bold text-[#B5621E]">{orderCode}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#78716C]">Método de entrega</span>
                  <span className="font-medium text-[#1C1917]">{deliveryType === 'home' ? 'Domicilio' : 'Sucursal'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#78716C]">Total pagado</span>
                  <span className="font-bold text-[#1C1917]">{fmtPrice(total)}</span>
                </div>
                {details.dedication && (
                  <div className="border-t border-[#D6CFC6] pt-2 text-sm">
                    <span className="text-[#78716C]">Dedicatoria: </span>
                    <span className="italic text-[#1C1917]">"{details.dedication}"</span>
                  </div>
                )}
              </div>
              {/* Progress bar */}
              <div className="flex justify-between items-center gap-2">
                {['Recibido', 'En Prep.', 'En Camino', 'Entregado'].map((s, i) => (
                  <div key={s} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all" style={{ backgroundColor: i === 0 ? '#B5621E' : '#EDE7DC', color: i === 0 ? 'white' : '#78716C' }}>
                      {i === 0 ? '✓' : i + 1}
                    </div>
                    <span className="text-[9px] text-center leading-tight" style={{ color: i === 0 ? '#B5621E' : '#A8A29E' }}>{s}</span>
                  </div>
                ))}
              </div>
              <a
                href={`https://wa.me/59169254989?text=Hola, quiero consultar el estado de mi pedido ${orderCode}.`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-semibold text-white text-sm transition-all hover:scale-[1.02]"
                style={{ backgroundColor: '#25D366' }}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                Consultar por WhatsApp
              </a>
              <button onClick={() => { onComplete(); onClose() }} className="w-full py-3 rounded-xl border-2 border-[#EDE7DC] text-[#78716C] font-medium text-sm hover:border-[#B5621E] hover:text-[#B5621E] transition-colors">
                Volver a la tienda
              </button>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {step !== 'confirmation' && (
          <div className="px-6 py-4 border-t border-[#EDE7DC] flex gap-3">
            {stepIdx > 0 && (
              <button onClick={() => setStep(STEPS[stepIdx - 1])} className="px-5 py-3 rounded-xl border border-[#EDE7DC] text-[#78716C] font-medium text-sm hover:bg-[#F5F0E8] transition-colors">
                ← Atrás
              </button>
            )}
            <button
              disabled={isSubmitting || (step === 'payment' && payMethod === 'card' && (cardDetails.number.length < 19 || cardDetails.expiry.length < 5 || cardDetails.cvv.length < 3))}
              onClick={() => {
                if (step === 'payment') {
                  handleSubmit()
                }
                else setStep(STEPS[stepIdx + 1])
              }}
              className="flex-1 py-3 rounded-xl font-semibold text-white text-sm transition-all hover:scale-[1.02]"
              style={{ backgroundColor: '#B5621E' }}
            >
              {isSubmitting ? 'Procesando...' : (step === 'payment' ? `Pagar ${fmtPrice(total)}` : 'Continuar →')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
