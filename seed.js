import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env manually to avoid extra dependencies if possible
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const envVars = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    envVars[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseAnonKey = envVars.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase variables in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const products = [
  // --- Juguetes (10) ---
  {
    name: "Lego Castillo Mágico", brand: "Lego", price: 450, originalPrice: 500, rating: 4.9, reviews: 120, badge: "Más vendido", badgeColor: "#B5621E",
    image: "https://images.unsplash.com/photo-1587654780228-6a4670668f44?w=600&h=600&fit=crop&auto=format",
    type: "Juguetes", occasions: ["Cumpleaños", "Días Especiales"], stock: 15,
    description: "Set de construcción Lego de un hermoso castillo. Ideal para desarrollar la creatividad."
  },
  {
    name: "Oso de Peluche Gigante", brand: "ToyWorld", price: 250, originalPrice: null, rating: 4.8, reviews: 85, badge: "Nuevo", badgeColor: "#1C1917",
    image: "https://images.unsplash.com/photo-1558500201-fb216712b3cb?w=600&h=600&fit=crop&auto=format",
    type: "Juguetes", occasions: ["Cumpleaños", "Baby Showers", "Días Especiales"], stock: 20,
    description: "Oso de peluche extra suave de 1 metro de altura, perfecto para abrazar."
  },
  {
    name: "Tren de Madera Clásico", brand: "WoodToys", price: 180, originalPrice: 200, rating: 4.7, reviews: 45, badge: "Oferta", badgeColor: "#D4843C",
    image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=600&h=600&fit=crop&auto=format",
    type: "Juguetes", occasions: ["Cumpleaños", "Baby Showers"], stock: 30,
    description: "Tren interactivo de madera con bloques de colores. Material seguro y duradero."
  },
  {
    name: "Rompecabezas 3D de Madera", brand: "PuzzleMaster", price: 120, originalPrice: null, rating: 4.6, reviews: 60, badge: "Popular", badgeColor: "#B5621E",
    image: "https://images.unsplash.com/photo-1585408985208-1cc686cbf260?w=600&h=600&fit=crop&auto=format",
    type: "Juguetes", occasions: ["Cumpleaños", "Días Especiales"], stock: 25,
    description: "Rompecabezas 3D en forma de globo terráqueo para armar en familia."
  },
  {
    name: "Auto a Control Remoto 4x4", brand: "SpeedSter", price: 300, originalPrice: 350, rating: 4.8, reviews: 90, badge: "Recomendado", badgeColor: "#1C1917",
    image: "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?w=600&h=600&fit=crop&auto=format",
    type: "Juguetes", occasions: ["Cumpleaños"], stock: 12,
    description: "Auto todoterreno a control remoto con batería recargable."
  },
  {
    name: "Juego de Mesa Familiar", brand: "BoardCo", price: 150, originalPrice: null, rating: 4.9, reviews: 150, badge: "Más vendido", badgeColor: "#B5621E",
    image: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffaed?w=600&h=600&fit=crop&auto=format",
    type: "Juguetes", occasions: ["Cumpleaños", "Días Especiales"], stock: 40,
    description: "Juego de estrategia para toda la familia, garantiza horas de diversión."
  },
  {
    name: "Set de Arte y Pintura", brand: "CreativeKids", price: 110, originalPrice: 130, rating: 4.7, reviews: 35, badge: "Oferta", badgeColor: "#D4843C",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&h=600&fit=crop&auto=format",
    type: "Juguetes", occasions: ["Cumpleaños", "Graduaciones"], stock: 18,
    description: "Set completo con acuarelas, pinceles y cuaderno de dibujo."
  },
  {
    name: "Muñeca de Colección", brand: "MagicDolls", price: 210, originalPrice: null, rating: 4.5, reviews: 40, badge: "Exclusivo", badgeColor: "#1C1917",
    image: "https://images.unsplash.com/photo-1563220455-8d5c8ebccbf2?w=600&h=600&fit=crop&auto=format",
    type: "Juguetes", occasions: ["Cumpleaños", "Días Especiales"], stock: 15,
    description: "Muñeca artesanal con vestido intercambiable de diseño exclusivo."
  },
  {
    name: "Bloques de Construcción Magnéticos", brand: "MagnaTiles", price: 280, originalPrice: 320, rating: 4.9, reviews: 200, badge: "Top 1", badgeColor: "#B5621E",
    image: "https://images.unsplash.com/photo-1590518334812-7067825d5069?w=600&h=600&fit=crop&auto=format",
    type: "Juguetes", occasions: ["Cumpleaños"], stock: 10,
    description: "Bloques magnéticos de colores para armar infinitas formas y figuras."
  },
  {
    name: "Dinosaurio Interactivo", brand: "DinoWorld", price: 190, originalPrice: null, rating: 4.6, reviews: 55, badge: "Nuevo", badgeColor: "#1C1917",
    image: "https://images.unsplash.com/photo-1563456880856-fb7c9c0b1f2e?w=600&h=600&fit=crop&auto=format",
    type: "Juguetes", occasions: ["Cumpleaños"], stock: 22,
    description: "Dinosaurio de juguete con sonidos reales y movimiento."
  },

  // --- Joyería (10) ---
  {
    name: "Collar de Plata con Diamante", brand: "Lumière", price: 850, originalPrice: 950, rating: 5.0, reviews: 42, badge: "Premium", badgeColor: "#1C1917",
    image: "https://images.unsplash.com/photo-1599643478524-fb66f5787635?w=600&h=600&fit=crop&auto=format",
    type: "Joyería", occasions: ["Aniversarios", "Bodas", "Días Especiales"], stock: 5,
    description: "Collar elegante de plata esterlina con un pequeño diamante incrustado."
  },
  {
    name: "Anillo de Oro 18k", brand: "Aura", price: 1200, originalPrice: null, rating: 4.9, reviews: 30, badge: "Exclusivo", badgeColor: "#B5621E",
    image: "https://images.unsplash.com/photo-1605100804763-247f673f8484?w=600&h=600&fit=crop&auto=format",
    type: "Joyería", occasions: ["Aniversarios", "Bodas"], stock: 3,
    description: "Anillo de compromiso o aniversario en oro de 18 kilates."
  },
  {
    name: "Pulsera de Perlas Naturales", brand: "OceanGems", price: 400, originalPrice: 450, rating: 4.8, reviews: 50, badge: "Clásico", badgeColor: "#1C1917",
    image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&h=600&fit=crop&auto=format",
    type: "Joyería", occasions: ["Aniversarios", "Bodas", "Días Especiales"], stock: 8,
    description: "Pulsera fina con auténticas perlas de agua dulce y broche de plata."
  },
  {
    name: "Reloj Elegante de Cuero", brand: "TimePiece", price: 650, originalPrice: 750, rating: 4.7, reviews: 85, badge: "Oferta", badgeColor: "#D4843C",
    image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&h=600&fit=crop&auto=format",
    type: "Joyería", occasions: ["Cumpleaños", "Aniversarios", "Graduaciones"], stock: 12,
    description: "Reloj clásico con correa de cuero auténtico y maquinaria de precisión."
  },
  {
    name: "Aretes de Cristal Swarovski", brand: "Cristalux", price: 300, originalPrice: null, rating: 4.9, reviews: 60, badge: "Popular", badgeColor: "#B5621E",
    image: "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&h=600&fit=crop&auto=format",
    type: "Joyería", occasions: ["Cumpleaños", "Aniversarios", "Días Especiales"], stock: 15,
    description: "Hermosos aretes con destellos únicos gracias a sus cristales originales."
  },
  {
    name: "Conjunto Collar y Aretes", brand: "Lumière", price: 750, originalPrice: 800, rating: 4.8, reviews: 25, badge: "Recomendado", badgeColor: "#1C1917",
    image: "https://images.unsplash.com/photo-1535632787350-4e68ef0ac584?w=600&h=600&fit=crop&auto=format",
    type: "Joyería", occasions: ["Bodas", "Aniversarios"], stock: 6,
    description: "Set completo que combina perfectamente para ocasiones muy especiales."
  },
  {
    name: "Anillo de Zafiro Azul", brand: "Aura", price: 900, originalPrice: null, rating: 5.0, reviews: 18, badge: "Premium", badgeColor: "#B5621E",
    image: "https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=600&h=600&fit=crop&auto=format",
    type: "Joyería", occasions: ["Aniversarios", "Bodas"], stock: 4,
    description: "Anillo en plata con una deslumbrante piedra de Zafiro Azul."
  },
  {
    name: "Pulsera de Plata Tejida", brand: "Lumière", price: 220, originalPrice: 250, rating: 4.7, reviews: 40, badge: "Oferta", badgeColor: "#D4843C",
    image: "https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=600&h=600&fit=crop&auto=format",
    type: "Joyería", occasions: ["Cumpleaños", "Graduaciones"], stock: 20,
    description: "Pulsera de diseño moderno, tejida artesanalmente en plata."
  },
  {
    name: "Reloj Metálico Rose Gold", brand: "TimePiece", price: 550, originalPrice: null, rating: 4.8, reviews: 70, badge: "Top Ventas", badgeColor: "#B5621E",
    image: "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&h=600&fit=crop&auto=format",
    type: "Joyería", occasions: ["Aniversarios", "Cumpleaños"], stock: 10,
    description: "Reloj elegante color oro rosa, resistente al agua y muy sofisticado."
  },
  {
    name: "Cadena de Oro Fino", brand: "Aura", price: 1100, originalPrice: 1200, rating: 4.9, reviews: 20, badge: "Clásico", badgeColor: "#1C1917",
    image: "https://images.unsplash.com/photo-1620653066344-93c4a205a1e2?w=600&h=600&fit=crop&auto=format",
    type: "Joyería", occasions: ["Bodas", "Días Especiales"], stock: 5,
    description: "Cadena delgada de oro puro de 24k, ideal para regalar estilo y valor."
  },

  // --- Flores (10) ---
  {
    name: "Ramo de Rosas Rojas", brand: "FloraLinda", price: 150, originalPrice: null, rating: 4.9, reviews: 210, badge: "Romántico", badgeColor: "#B5621E",
    image: "https://images.unsplash.com/photo-1548142813-c348350df52b?w=600&h=600&fit=crop&auto=format",
    type: "Flores", occasions: ["Aniversarios", "Días Especiales"], stock: 25,
    description: "Espectacular ramo de 24 rosas rojas importadas de la más alta calidad."
  },
  {
    name: "Arreglo de Girasoles", brand: "FloraLinda", price: 130, originalPrice: 150, rating: 4.8, reviews: 140, badge: "Alegría", badgeColor: "#D4843C",
    image: "https://images.unsplash.com/photo-1557800636-894a64c1696f?w=600&h=600&fit=crop&auto=format",
    type: "Flores", occasions: ["Cumpleaños", "Graduaciones", "Días Especiales"], stock: 18,
    description: "Arreglo floral luminoso con 6 girasoles grandes y follaje fresco."
  },
  {
    name: "Caja de Rosas y Chocolates", brand: "BloomBox", price: 280, originalPrice: null, rating: 5.0, reviews: 85, badge: "Premium", badgeColor: "#1C1917",
    image: "https://images.unsplash.com/photo-1596706443425-ce573855ff4b?w=600&h=600&fit=crop&auto=format",
    type: "Flores", occasions: ["Aniversarios", "Bodas", "Días Especiales"], stock: 10,
    description: "Elegante caja rígida con rosas perfectamente acomodadas y bombones."
  },
  {
    name: "Ramo de Tulipanes Pastel", brand: "FloraLinda", price: 190, originalPrice: 210, rating: 4.9, reviews: 65, badge: "Primavera", badgeColor: "#B5621E",
    image: "https://images.unsplash.com/photo-1520763185298-1b434c919102?w=600&h=600&fit=crop&auto=format",
    type: "Flores", occasions: ["Cumpleaños", "Baby Showers"], stock: 12,
    description: "Delicado ramo de 10 tulipanes en colores pastel, envueltos en papel craft."
  },
  {
    name: "Orquídea Púrpura en Maceta", brand: "Botanica", price: 250, originalPrice: null, rating: 4.7, reviews: 45, badge: "Duradero", badgeColor: "#1C1917",
    image: "https://images.unsplash.com/photo-1565576752762-cb6cdae78457?w=600&h=600&fit=crop&auto=format",
    type: "Flores", occasions: ["Días Especiales", "Cumpleaños"], stock: 8,
    description: "Planta de orquídea viva, un regalo elegante y de larga duración."
  },
  {
    name: "Mix Floral Silvestre", brand: "WildBlooms", price: 160, originalPrice: 180, rating: 4.8, reviews: 90, badge: "Oferta", badgeColor: "#D4843C",
    image: "https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=600&h=600&fit=crop&auto=format",
    type: "Flores", occasions: ["Cumpleaños", "Días Especiales"], stock: 20,
    description: "Ramo de estilo rústico y colorido con flores de campo y lavanda."
  },
  {
    name: "Ramo de Lirios Blancos", brand: "FloraLinda", price: 175, originalPrice: null, rating: 4.9, reviews: 50, badge: "Elegancia", badgeColor: "#B5621E",
    image: "https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=600&h=600&fit=crop&auto=format",
    type: "Flores", occasions: ["Bodas", "Aniversarios", "Días Especiales"], stock: 15,
    description: "Precioso ramo de lirios blancos de aroma intenso."
  },
  {
    name: "Cesta Floral con Frutas", brand: "BloomBox", price: 320, originalPrice: 350, rating: 4.7, reviews: 30, badge: "Recomendado", badgeColor: "#1C1917",
    image: "https://images.unsplash.com/photo-1605335123984-b03a743b1778?w=600&h=600&fit=crop&auto=format",
    type: "Flores", occasions: ["Días Especiales"], stock: 5,
    description: "Gran cesta que incluye flores frescas, frutas de temporada y vino."
  },
  {
    name: "Ramos de Peonías Rosas", brand: "FloraLinda", price: 220, originalPrice: null, rating: 5.0, reviews: 40, badge: "Exclusivo", badgeColor: "#B5621E",
    image: "https://images.unsplash.com/photo-1533616688419-b7a585564566?w=600&h=600&fit=crop&auto=format",
    type: "Flores", occasions: ["Aniversarios", "Cumpleaños"], stock: 10,
    description: "Ramo esponjoso y delicado de hermosas peonías color rosa."
  },
  {
    name: "Mini Suculentas de Regalo", brand: "Botanica", price: 80, originalPrice: 100, rating: 4.6, reviews: 110, badge: "Oferta", badgeColor: "#D4843C",
    image: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=600&h=600&fit=crop&auto=format",
    type: "Flores", occasions: ["Días Especiales", "Graduaciones", "Baby Showers"], stock: 30,
    description: "Trío de pequeñas plantas suculentas en macetas decorativas."
  },

  // --- Chocolates (10) ---
  {
    name: "Caja de Trufas Artesanales", brand: "CacaoMagia", price: 120, originalPrice: null, rating: 4.9, reviews: 300, badge: "Más vendido", badgeColor: "#B5621E",
    image: "https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=600&h=600&fit=crop&auto=format",
    type: "Chocolates", occasions: ["Cumpleaños", "Aniversarios", "Días Especiales"], stock: 40,
    description: "12 exquisitas trufas variadas, hechas con el mejor cacao."
  },
  {
    name: "Cesta de Chocolates Premium", brand: "SweetGift", price: 250, originalPrice: 280, rating: 4.8, reviews: 120, badge: "Oferta", badgeColor: "#D4843C",
    image: "https://images.unsplash.com/photo-1582293041079-7814c2f12063?w=600&h=600&fit=crop&auto=format",
    type: "Chocolates", occasions: ["Aniversarios", "Días Especiales"], stock: 15,
    description: "Gran variedad de chocolates importados presentados en cesta de mimbre."
  },
  {
    name: "Bombones Rellenos de Licor", brand: "ChocoLuxe", price: 160, originalPrice: null, rating: 4.7, reviews: 85, badge: "Adultos", badgeColor: "#1C1917",
    image: "https://images.unsplash.com/photo-1614088685112-0a760b71a3c8?w=600&h=600&fit=crop&auto=format",
    type: "Chocolates", occasions: ["Aniversarios", "Cumpleaños"], stock: 25,
    description: "Deliciosos bombones con centro líquido de finos licores."
  },
  {
    name: "Tabletas de Chocolate Amargo 70%", brand: "CacaoMagia", price: 90, originalPrice: 100, rating: 4.9, reviews: 150, badge: "Saludable", badgeColor: "#B5621E",
    image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&h=600&fit=crop&auto=format",
    type: "Chocolates", occasions: ["Días Especiales"], stock: 50,
    description: "Set de 3 tabletas de chocolate puro, intenso y bajo en azúcar."
  },
  {
    name: "Macarons de Chocolate y Frutos", brand: "SweetGift", price: 140, originalPrice: null, rating: 4.8, reviews: 60, badge: "Gourmet", badgeColor: "#1C1917",
    image: "https://images.unsplash.com/photo-1569864358642-9d1684040f43?w=600&h=600&fit=crop&auto=format",
    type: "Chocolates", occasions: ["Cumpleaños", "Baby Showers"], stock: 20,
    description: "Caja de 8 coloridos macarons rellenos de ganache de chocolate."
  },
  {
    name: "Corazón de Chocolate Relleno", brand: "ChocoLuxe", price: 180, originalPrice: 200, rating: 4.9, reviews: 110, badge: "Romántico", badgeColor: "#B5621E",
    image: "https://images.unsplash.com/photo-1526080676457-4544cb095862?w=600&h=600&fit=crop&auto=format",
    type: "Chocolates", occasions: ["Aniversarios", "Bodas"], stock: 12,
    description: "Gran corazón de chocolate que se rompe para descubrir más golosinas."
  },
  {
    name: "Caja de Bombones Belgas", brand: "BelgianDelight", price: 210, originalPrice: null, rating: 5.0, reviews: 45, badge: "Premium", badgeColor: "#1C1917",
    image: "https://images.unsplash.com/photo-1613426868846-9be975f7823b?w=600&h=600&fit=crop&auto=format",
    type: "Chocolates", occasions: ["Días Especiales", "Cumpleaños"], stock: 18,
    description: "Selección de 20 bombones del auténtico chocolate belga."
  },
  {
    name: "Fresas Cubiertas con Chocolate", brand: "SweetGift", price: 130, originalPrice: 150, rating: 4.7, reviews: 140, badge: "Oferta", badgeColor: "#D4843C",
    image: "https://images.unsplash.com/photo-1599395982845-a7b2184ef472?w=600&h=600&fit=crop&auto=format",
    type: "Chocolates", occasions: ["Aniversarios", "Días Especiales"], stock: 22,
    description: "Docena de fresas frescas cubiertas de chocolate negro, blanco y leche."
  },
  {
    name: "Kit de Fondue de Chocolate", brand: "CacaoMagia", price: 290, originalPrice: null, rating: 4.8, reviews: 75, badge: "Divertido", badgeColor: "#B5621E",
    image: "https://images.unsplash.com/photo-1621213032776-9d6632d43e59?w=600&h=600&fit=crop&auto=format",
    type: "Chocolates", occasions: ["Bodas", "Aniversarios"], stock: 10,
    description: "Incluye fuente pequeña, chocolate para derretir y palillos."
  },
  {
    name: "Chocolates en Forma de Rosa", brand: "ChocoLuxe", price: 110, originalPrice: 130, rating: 4.6, reviews: 55, badge: "Novedad", badgeColor: "#1C1917",
    image: "https://images.unsplash.com/photo-1511381939415-e440c0683015?w=600&h=600&fit=crop&auto=format",
    type: "Chocolates", occasions: ["Días Especiales", "Aniversarios"], stock: 30,
    description: "Pequeño ramo de flores hechas completamente de delicioso chocolate."
  },

  // --- Ropa (10) ---
  {
    name: "Suéter de Lana Gruesa", brand: "CozyKnit", price: 280, originalPrice: 320, rating: 4.8, reviews: 95, badge: "Invierno", badgeColor: "#1C1917",
    image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=600&fit=crop&auto=format",
    type: "Ropa", occasions: ["Cumpleaños", "Días Especiales"], stock: 15,
    description: "Suéter muy abrigador y suave, perfecto para las noches frías."
  },
  {
    name: "Bufanda de Cachemira", brand: "Elegance", price: 150, originalPrice: null, rating: 4.9, reviews: 110, badge: "Premium", badgeColor: "#B5621E",
    image: "https://images.unsplash.com/photo-1584622119932-d13fc8172c95?w=600&h=600&fit=crop&auto=format",
    type: "Ropa", occasions: ["Aniversarios", "Cumpleaños"], stock: 25,
    description: "Bufanda extremadamente suave, tejida con la mejor cachemira."
  },
  {
    name: "Chaqueta de Cuero Genuino", brand: "UrbanStyle", price: 850, originalPrice: 950, rating: 4.7, reviews: 60, badge: "Top Ventas", badgeColor: "#B5621E",
    image: "https://images.unsplash.com/photo-1520975954732-57dd22299614?w=600&h=600&fit=crop&auto=format",
    type: "Ropa", occasions: ["Cumpleaños", "Aniversarios"], stock: 8,
    description: "Chaqueta de cuero negro, estilo clásico que nunca pasa de moda."
  },
  {
    name: "Set de Pijamas de Seda", brand: "SleepWell", price: 350, originalPrice: 400, rating: 4.8, reviews: 45, badge: "Oferta", badgeColor: "#D4843C",
    image: "https://images.unsplash.com/photo-1582236814364-c48cbf0fefdf?w=600&h=600&fit=crop&auto=format",
    type: "Ropa", occasions: ["Bodas", "Aniversarios", "Días Especiales"], stock: 12,
    description: "Pijama cómoda y elegante, ideal para descansar con lujo."
  },
  {
    name: "Vestido de Noche Elegante", brand: "Elegance", price: 600, originalPrice: null, rating: 4.9, reviews: 30, badge: "Exclusivo", badgeColor: "#1C1917",
    image: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&h=600&fit=crop&auto=format",
    type: "Ropa", occasions: ["Bodas", "Graduaciones", "Aniversarios"], stock: 6,
    description: "Un vestido perfecto para galas, fiestas de grado o matrimonios."
  },
  {
    name: "Camisa de Lino Casual", brand: "UrbanStyle", price: 180, originalPrice: 200, rating: 4.6, reviews: 120, badge: "Verano", badgeColor: "#B5621E",
    image: "https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?w=600&h=600&fit=crop&auto=format",
    type: "Ropa", occasions: ["Cumpleaños", "Días Especiales"], stock: 35,
    description: "Camisa ligera de lino, ideal para climas cálidos."
  },
  {
    name: "Gorras Deportivas (Pack de 2)", brand: "FitWear", price: 90, originalPrice: 120, rating: 4.5, reviews: 80, badge: "Oferta", badgeColor: "#D4843C",
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&h=600&fit=crop&auto=format",
    type: "Ropa", occasions: ["Cumpleaños", "Días Especiales"], stock: 40,
    description: "Gorras de algodón transpirable, excelentes para salir a correr."
  },
  {
    name: "Zapatillas Urbanas Clásicas", brand: "UrbanStyle", price: 400, originalPrice: null, rating: 4.8, reviews: 200, badge: "Top 1", badgeColor: "#1C1917",
    image: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=600&h=600&fit=crop&auto=format",
    type: "Ropa", occasions: ["Cumpleaños", "Graduaciones"], stock: 20,
    description: "Calzado cómodo y a la moda, combina con cualquier atuendo."
  },
  {
    name: "Ropa para Bebé (Set de Regalo)", brand: "BabyJoy", price: 250, originalPrice: 280, rating: 5.0, reviews: 65, badge: "Adorable", badgeColor: "#B5621E",
    image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&h=600&fit=crop&auto=format",
    type: "Ropa", occasions: ["Baby Showers"], stock: 15,
    description: "Conjunto de algodón orgánico muy suave, ideal para recién nacidos."
  },
  {
    name: "Bolso de Cuero Hecho a Mano", brand: "Elegance", price: 500, originalPrice: null, rating: 4.9, reviews: 55, badge: "Artesanal", badgeColor: "#1C1917",
    image: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&h=600&fit=crop&auto=format",
    type: "Ropa", occasions: ["Aniversarios", "Cumpleaños"], stock: 10,
    description: "Bolso de hombro espacioso, confeccionado artesanalmente."
  },

  // --- Hogar / Decoración (10) ---
  {
    name: "Lámpara de Mesa Minimalista", brand: "DecoHome", price: 220, originalPrice: 250, rating: 4.7, reviews: 88, badge: "Oferta", badgeColor: "#D4843C",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&h=600&fit=crop&auto=format",
    type: "Hogar / Decoración", occasions: ["Días Especiales", "Bodas"], stock: 18,
    description: "Lámpara moderna de luz cálida, perfecta para el velador o escritorio."
  },
  {
    name: "Vela Aromática Premium", brand: "ZenLight", price: 80, originalPrice: null, rating: 4.8, reviews: 150, badge: "Popular", badgeColor: "#B5621E",
    image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&h=600&fit=crop&auto=format",
    type: "Hogar / Decoración", occasions: ["Días Especiales", "Cumpleaños", "Baby Showers"], stock: 45,
    description: "Vela de cera de soya con aroma a lavanda y vainilla, larga duración."
  },
  {
    name: "Manta de Punto Grueso", brand: "CozyKnit", price: 300, originalPrice: 350, rating: 4.9, reviews: 110, badge: "Top Ventas", badgeColor: "#1C1917",
    image: "https://images.unsplash.com/photo-1580327344181-c1163234e5a0?w=600&h=600&fit=crop&auto=format",
    type: "Hogar / Decoración", occasions: ["Bodas", "Aniversarios"], stock: 12,
    description: "Manta gigante tejida a mano, abriga y decora la sala espectacularmente."
  },
  {
    name: "Set de Tazas de Cerámica", brand: "DecoHome", price: 150, originalPrice: null, rating: 4.7, reviews: 75, badge: "Recomendado", badgeColor: "#B5621E",
    image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&h=600&fit=crop&auto=format",
    type: "Hogar / Decoración", occasions: ["Bodas", "Días Especiales"], stock: 25,
    description: "Set de 4 tazas artesanales, resistentes al calor e ideales para café o té."
  },
  {
    name: "Espejo de Pared Redondo", brand: "GlassArt", price: 450, originalPrice: 500, rating: 4.8, reviews: 40, badge: "Elegante", badgeColor: "#1C1917",
    image: "https://images.unsplash.com/photo-1618220179428-22790b46a0eb?w=600&h=600&fit=crop&auto=format",
    type: "Hogar / Decoración", occasions: ["Bodas", "Aniversarios"], stock: 8,
    description: "Espejo decorativo con marco de bronce dorado, da amplitud a cualquier espacio."
  },
  {
    name: "Cojín Decorativo Bordado", brand: "DecoHome", price: 120, originalPrice: 140, rating: 4.6, reviews: 60, badge: "Oferta", badgeColor: "#D4843C",
    image: "https://images.unsplash.com/photo-1584100936595-c0654b35a125?w=600&h=600&fit=crop&auto=format",
    type: "Hogar / Decoración", occasions: ["Días Especiales"], stock: 30,
    description: "Funda de cojín 100% algodón con un diseño bohemio bordado."
  },
  {
    name: "Maceta de Cerámica con Base", brand: "Botanica", price: 180, originalPrice: null, rating: 4.9, reviews: 55, badge: "Novedad", badgeColor: "#B5621E",
    image: "https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&h=600&fit=crop&auto=format",
    type: "Hogar / Decoración", occasions: ["Días Especiales", "Cumpleaños"], stock: 20,
    description: "Elegante maceta blanca con base de madera de pino."
  },
  {
    name: "Reloj de Pared Vintage", brand: "TimePiece", price: 280, originalPrice: 320, rating: 4.8, reviews: 85, badge: "Clásico", badgeColor: "#1C1917",
    image: "https://images.unsplash.com/photo-1506450629737-02484a0d9b73?w=600&h=600&fit=crop&auto=format",
    type: "Hogar / Decoración", occasions: ["Bodas", "Aniversarios", "Días Especiales"], stock: 15,
    description: "Gran reloj de números romanos, mecanismo silencioso."
  },
  {
    name: "Cuadro Abstracto en Lienzo", brand: "ArtGallery", price: 350, originalPrice: null, rating: 4.7, reviews: 30, badge: "Exclusivo", badgeColor: "#B5621E",
    image: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=600&h=600&fit=crop&auto=format",
    type: "Hogar / Decoración", occasions: ["Bodas", "Días Especiales"], stock: 10,
    description: "Arte moderno impreso en alta calidad y montado en bastidor de madera."
  },
  {
    name: "Organizador de Joyas de Madera", brand: "DecoHome", price: 190, originalPrice: 220, rating: 4.9, reviews: 95, badge: "Regalo Ideal", badgeColor: "#D4843C",
    image: "https://images.unsplash.com/photo-1596489370605-6eb7f4b82bc0?w=600&h=600&fit=crop&auto=format",
    type: "Hogar / Decoración", occasions: ["Cumpleaños", "Aniversarios", "Graduaciones"], stock: 22,
    description: "Caja de madera forrada de terciopelo, con múltiples compartimentos."
  }
];

async function seed() {
  console.log('Clearing existing products...');
  const { error: deleteError } = await supabase.from('products').delete().neq('id', 0);
  if (deleteError) {
    console.error('Error deleting products:', deleteError);
    process.exit(1);
  }

  console.log('Inserting 60 new products...');
  const { error: insertError } = await supabase.from('products').insert(products);
  if (insertError) {
    console.error('Error inserting products:', insertError);
    process.exit(1);
  }

  console.log('Successfully seeded 60 products!');
  process.exit(0);
}

seed();
