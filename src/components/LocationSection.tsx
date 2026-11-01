import { MapPin, Clock, Phone } from 'lucide-react';

export function LocationSection() {
  return (
    <section className="py-16 px-4 md:px-8 max-w-5xl mx-auto">
      <div className="text-center mb-12">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#B5621E] mb-2">Encuéntranos</p>
        <h2 className="text-4xl font-bold text-[#1C1917]" style={{ fontFamily: "'Playfair Display', serif" }}>Nuestra ubicación</h2>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="rounded-3xl overflow-hidden border border-[#EDE7DC]" style={{ height: 360 }}>
          <iframe
            src="https://maps.google.com/maps?q=-17.594504,-63.152901&hl=es&z=16&output=embed"
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
            { icon: <MapPin className="w-6 h-6 text-[#1C1917]" />, label: 'Dirección', value: 'Av. Tenedor - Satelite Norte, entre Av. Sajama y Av. Forestal' },
            { icon: <Clock className="w-6 h-6 text-[#1C1917]" />, label: 'Horarios', value: 'Lun – Vie: 7:00 am – 10:00 pm\nSábado: 8:00 am – 8:00 pm\nDomingo: 9:00 am – 4:00 pm' },
            { icon: <Phone className="w-6 h-6 text-[#1C1917]" />, label: 'Contacto', value: '+591 69254989 WhatsApp' },
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
  )
}
