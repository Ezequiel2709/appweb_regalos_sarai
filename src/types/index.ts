export const PRODUCT_TYPES = ['Juguetes', 'Joyería', 'Flores', 'Chocolates', 'Ropa', 'Hogar / Decoración']
export const OCCASIONS = ['Cumpleaños', 'Aniversarios', 'Bodas', 'Baby Showers', 'Graduaciones', 'Días Especiales']

export const OCCASION_IMAGES: Record<string, string> = {
  'Cumpleaños': 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=600&h=400&fit=crop&auto=format',
  'Aniversarios': 'https://images.unsplash.com/photo-1522413452208-996ff3f3e740?w=600&h=400&fit=crop&auto=format',
  'Bodas': 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop&auto=format',
  'Baby Showers': 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=600&h=400&fit=crop&auto=format',
  'Graduaciones': 'https://images.unsplash.com/photo-1627556704302-624286467c65?w=600&h=400&fit=crop&auto=format',
  'Días Especiales': 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=600&h=400&fit=crop&auto=format',
}

export interface Product {
  id: number
  name: string
  brand: string
  price: number
  originalPrice: number | null
  rating: number
  reviews: number
  badge: string
  badgeColor: string
  image: string
  type: string
  occasions: string[]
  stock: number
  description: string
}

export interface CartItem {
  product: Product
  qty: number
}

export type CheckoutStep = 'delivery' | 'details' | 'payment' | 'confirmation'
export type ActiveSection = 'home' | 'products' | 'about' | 'location' | 'orders' | 'profile'
