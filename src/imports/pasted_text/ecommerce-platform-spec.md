Actúa como arquitecto de software full-stack senior y redacta/implementa la siguiente plataforma de e-commerce de regalos con estructura desacoplada entre Storefront (cliente) y Dashboard (administración).

=========================================================
1. ARQUITECTURA GENERAL
=========================================================
La plataforma requiere una estructura desacoplada entre la interfaz del cliente (Storefront) y el panel de control (Dashboard).

El catálogo se organiza en DOS EJES TAXONÓMICOS INDEPENDIENTES para soportar el modelo comercial dual:

EJE A — Tipo de Producto / Objeto (Filtro Físico):
- Juguetes
- Joyería
- Flores
- Chocolates
- Ropa
- Hogar / Decoración

EJE B — Ocasión / Evento (Filtro Contexto):
- Cumpleaños
- Aniversarios
- Bodas
- Baby Showers
- Graduaciones
- Días Especiales

Regla de negocio:
Un mismo artículo puede pertenecer a UN tipo de producto específico (ej. Peluche) y vincularse a MÚLTIPLES eventos simultáneamente (ej. Cumpleaños + Baby Shower). Relación N:M entre productos y eventos.

Diagrama lógico:

                      ┌────────────────────────┐
                      │    Catálogo Global     │
                      └───────────┬────────────┘
                                  │
         ┌────────────────────────┴────────────────────────┐
         ▼                                                 ▼
┌──────────────────┐                              ┌──────────────────┐
│ Tipo de Objeto   │                              │ Tipo de Evento   │
│ (Filtro Físico)  │                              │ (Filtro Contexto)│
├──────────────────┤                              ├──────────────────┤
│ - Flores         │                              │ - Cumpleaños     │
│ - Juguetes       │◄──────[Producto Específico]──┤ - Aniversario    │
│ - Chocolates     │   (ej: Peluche Gigante 1m)   │ - Matrimonio     │
│ - Decoración     │                              │ - Baby Shower    │
└──────────────────┘                              └──────────────────┘

=========================================================
2. MÓDULOS Y NAVEGACIÓN DEL USUARIO (STOREFRONT)
=========================================================

2.1 CABECERA (NAVBAR)
- Logotipo alineado a la izquierda.
- Barra de navegación principal:
  * Inicio: retorna a la página principal.
  * Productos: menú desplegable tipo Mega Menu dividido en DOS COLUMNAS:
      - Por Tipo de Regalo
      - Por Ocasión / Evento
  * Nosotros: historia, misión y estándares de calidad.
  * Ubicación: mapa embebido mediante Google Maps iframe/API con dirección física, horarios de atención y sucursal.
- Herramientas de usuario (derecha):
  * Barra de búsqueda predictiva con autocompletado.
  * Botón de Perfil / Login (muestra el nombre si hay sesión activa).
  * Icono de Carrito con badge dinámico (contador de ítems).

2.2 PÁGINA DE INICIO (HOME)
- Hero Banner: imagen panorámica en tonos cálidos neutros (#FAF9F6, beige suave, acentos terracota), texto persuasivo ("Compra segura, regalos memorables"), CTA que dirige a las categorías.
- Sección de Beneficios: 3 bloques explicativos:
  * Entrega a domicilio o retiro en tienda
  * Pago por QR / Tarjeta
  * Envoltura y dedicatoria personalizada
- Ofertas y Destacados: cuadrícula con productos con etiqueta de descuento activa y los más vendidos (Top Sellers). Incluir productos en el Home incrementa la conversión directa sin obligar al usuario a explorar filtros.
- Exploración Rápida: carrusel visual de ocasiones destacadas (tarjetas con imágenes de cumpleaños, bodas, etc.).

2.3 SISTEMA DE AUTENTICACIÓN Y REGISTRO
Para maximizar la tasa de conversión sin fricción burocrática, el registro requiere:
- Nombre completo.
- Número de teléfono / celular (clave principal para envíos y notificaciones de WhatsApp).
- Correo electrónico (para comprobantes y recuperación de contraseña).
- Contraseña cifrada con bcrypt o Argon2.
- Direcciones: se solicitan opcionalmente en el registro, pero se validan de forma obligatoria durante el checkout.

=========================================================
3. CARRITO Y FLUJO DE COMPRA (CHECKOUT)
=========================================================

3.1 VENTANA MODAL DEL CARRITO
Al hacer clic en el icono del carrito en el navbar, se despliega un modal centrado con:
- Fondo: backdrop-filter: blur(8px) y capa translúcida oscura rgba(0,0,0,0.4).
- Caja contenedora: esquinas redondeadas, sombra difuminada y resplandor cálido exterior:
    box-shadow: 0 0 30px rgba(200, 109, 86, 0.25);
- Controles internos:
  * Lista de ítems con foto en miniatura, nombre, precio unitario y subtotal.
  * Botones de incremento (+) y decremento (-) que validan el stock en tiempo real.
  * Botón de eliminación directa (icono de papelera) por fila.
  * Subtotal global y botón principal "Continuar al Checkout".

3.2 FLUJO DE CHECKOUT Y REGLAS DE NEGOCIO
El checkout consta de 3 etapas secuenciales + confirmación:

┌─────────────────────────┐
│   1. Método de Entrega  │ ──► [Retiro en Sucursal] (Recargo: 0.00 Bs)
│                         │ ──► [Envío a Domicilio]  (Recargo dinámico: ej. 20.00 Bs)
└────────────┬────────────┘
             │
┌────────────▼────────────┐
│   2. Datos de Envío     │ ──► Nombre destinatario, teléfono, dedicatoria, dirección
└────────────┬────────────┘
             │
┌────────────▼────────────┐
│   3. Método de Pago     │ ──► [Pago QR] (Generación dinámica + botón de verificación)
│                         │ ──► [Tarjeta] (Pasarela estándar: Card Number, CVV, Exp)
└────────────┬────────────┘
             │
┌────────────▼────────────┐
│   4. Confirmación       │ ──► Bloqueo/Reducción de Stock + Generación de Comprobante PDF
└─────────────────────────┘

CONTROL DE STOCK CONCURRENTE:
Al pulsar "Pagar", el sistema ejecuta una transacción SQL atómica:

    UPDATE productos SET stock = stock - ? WHERE id = ? AND stock >= ?;

Si la fila afectada es 0 (no hay inventario suficiente), la transacción se revierte (ROLLBACK) y se notifica al usuario que el producto se agotó mientras finalizaba la compra.

COMPROBANTE DE VENTA:
Pantalla final con resumen detallado (código de orden único, desglose de costos, método de entrega, código QR para seguimiento) y botón para descargar el comprobante en PDF.

=========================================================
4. TRAZABILIDAD Y SEGUIMIENTO DE PEDIDOS
=========================================================
Máquina de estados sincronizada entre Storefront y Dashboard:

| Estado             | Significado para el Cliente                                     | Acción del Administrador                          |
|--------------------|-----------------------------------------------------------------|---------------------------------------------------|
| Pendiente de Pago  | Pedido generado, a la espera de validación bancaria/QR.         | Revisar comprobante / abono en cuenta.            |
| En Preparación     | Pago verificado. El regalo se está empaquetando y decorando.    | Cambiar al imprimir la comanda y dedicatoria.     |
| Listo para Retiro  | (Solo Retiro en Tienda) El paquete espera al cliente.           | Marcar cuando el producto esté en mostrador.      |
| En Camino          | (Solo a Domicilio) Asignado a logística/repartidor.             | Ingresar nombre o celular del chofer/mensajero.   |
| Entregado          | El destinatario final recibió el producto.                      | Marcar con confirmación (foto o firma).           |
| Cancelado          | Pedido anulado por falta de pago o reclamo.                     | El sistema reincorpora los ítems al stock.        |

VISUALIZACIÓN EN EL PERFIL DEL USUARIO ("Mis Pedidos"):
- Barra de progreso con 4 hitos visuales:
    Recibido → En Preparación → En Camino → Entregado
- Detalles de la entrega: Tipo (Domicilio / Sucursal), fecha estimada y dedicatoria ingresada.
- Botón directo: "Consultar por este pedido en WhatsApp", que abre un chat con soporte enviando automáticamente:
    "Hola, quiero consultar el estado de mi pedido #ORD-2026-0042."

=========================================================
5. PANEL DE ADMINISTRACIÓN (DASHBOARD)
=========================================================
Requiere autenticación basada en roles (rol = 'admin').

5.1 BARRA DE CONTROL Y MÉTRICAS RÁPIDAS
- Tarjetas superiores: Ventas del día, Pedidos pendientes de despacho, Total clientes registrados, Alertas de stock crítico.
- Botón "Ver Tienda Virtual": abre el Storefront en pestaña nueva para auditar la experiencia.
- Botón "Actualizar Pedidos": petición asíncrona (Fetch/AJAX) para recargar la tabla de órdenes sin refrescar toda la página.

5.2 GESTIÓN DE PEDIDOS Y ACCIÓN RÁPIDA POR WHATSAPP
- Tabla de órdenes con filtros: Estado, Fecha, Tipo de Entrega.
- Cada fila incluye:
  * ID de orden, fecha y hora.
  * Nombre del cliente y teléfono.
  * Tipo de entrega con distintivo de color:
      - Azul → Sucursal
      - Naranja → Domicilio
  * Selector desplegable para actualizar el estado del pedido directamente.
  * Botón directo de WhatsApp:
      https://wa.me/{numero_cliente}?text={mensaje}
      Abre chat directo para coordinar entrega o confirmar dirección.

5.3 GESTIÓN DE INVENTARIO Y ALERTAS DE STOCK
- Catálogo de productos con paginación, filtros por categoría y barra de búsqueda.
- Formulario modal para crear/editar productos:
    Nombre, descripción, precio, categoría de objeto, evento asignado, imagen, stock.
- Semáforo visual de inventario:
  * Verde: Stock mayor a 5 unidades.
  * Rojo / Alerta intermitente: Stock menor o igual a 5 unidades (reabastecimiento).
  * Gris: Stock en 0 (deshabilita el botón de compra en la tienda pública).

=========================================================
6. ENTREGABLES ESPERADOS
=========================================================
Genera como mínimo:
1. Modelo de datos (tablas: usuarios, productos, tipos_producto, eventos, producto_evento, pedidos, detalle_pedido, direcciones, estados_pedido).
2. Diagrama de arquitectura desacoplada (Storefront ↔ API ↔ Dashboard).
3. Especificación de endpoints REST o GraphQL para catálogo, carrito, checkout, pedidos y administración.
4. Wireframes o descripción de UI para Navbar, Home, Modal Carrito, Checkout y Dashboard.
5. Lógica transaccional de stock (SQL atómico + ROLLBACK).
6. Flujo de estados del pedido con sincronización Storefront/Dashboard.
7. Integración WhatsApp (wa.me) y generación de comprobante PDF.
8. Semáforo de inventario y validaciones de stock en tiempo real.

Mantén consistencia en:
- Paleta cálida neutra (#FAF9F6, beige, terracota).
- Estructura desacoplada.
- Relación N:M entre productos y eventos.
- Experiencia sin fricción en registro y checkout.