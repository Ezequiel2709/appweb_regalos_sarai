export function AboutSection() {
  return (
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
  )
}
