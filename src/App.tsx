import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShoppingBag, Plus, Minus, X, Trash2, Search, Sparkles, Filter, 
  Ruler, Truck, ShieldCheck, MapPin, CheckCircle, Smartphone, 
  ExternalLink, ChevronRight, Heart, Star, Tag, RefreshCw, Eye, MessageCircle,
  Layers, Check, ArrowRight, Grid, User, CreditCard, Building2, Package
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  JEANS_PRODUCTS, JeansProduct, ColorVariant, LOGO_IMAGE, 
  SHOWCASE_MODEL_IMAGE, MARQUEE_ANNOUNCEMENT, STORE_INFO,
  CATEGORIAS_JEANS, CategoriaJeans, CategoriaId
} from './data/jeansData';
import { fetchPricesFromSheet } from './utils/sheetPriceFetcher';

interface CartItem {
  id: string; // product id + color + size
  product: JeansProduct;
  color: ColorVariant;
  talla: number | string;
  cantidad: number;
}

export default function App() {
  // Google Sheets live prices (fetched on mount)
  const [sheetPrices, setSheetPrices] = useState<Map<string, number>>(new Map());

  // Fetch prices from Google Sheets on page load
  useEffect(() => {
    fetchPricesFromSheet().then(priceMap => {
      if (priceMap.size > 0) {
        setSheetPrices(priceMap);
      }
    });
  }, []);

  // Merge sheet prices into products: if a price exists in the Sheet, use it
  const products = useMemo(() => {
    if (sheetPrices.size === 0) return JEANS_PRODUCTS;
    return JEANS_PRODUCTS.map(product => {
      const sheetPrice = sheetPrices.get(product.id);
      if (sheetPrice !== undefined) {
        return { ...product, precio: sheetPrice };
      }
      return product;
    });
  }, [sheetPrices]);

  // Category filter state ('Todas' or specific CategoriaId)
  const [selectedCategory, setSelectedCategory] = useState<string>('Todas');

  // Filters state
  const [selectedBrand, setSelectedBrand] = useState<string>('Todas');
  const [selectedFit, setSelectedFit] = useState<string>('Todos');
  const [selectedColorFilter, setSelectedColorFilter] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Active Color per product id (for quick card swatch switching)
  const [activeCardColors, setActiveCardColors] = useState<Record<string, ColorVariant>>({});
  // Selected Active View per product id ('product' | 'poster')
  const [activeCardViews, setActiveCardViews] = useState<Record<string, 'product' | 'poster'>>({});

  // Product detail modal state
  const [detailProduct, setDetailProduct] = useState<JeansProduct | null>(null);
  const [modalColor, setModalColor] = useState<ColorVariant | null>(null);
  const [modalSize, setModalSize] = useState<number | string>(30);

  // Cart & Checkout drawer state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCartDrawer, setShowCartDrawer] = useState<boolean>(false);
  const [showSizeGuide, setShowSizeGuide] = useState<boolean>(false);

  // Center Screen Added-Item Confirmation Modal
  const [addedItemModal, setAddedItemModal] = useState<{ item: CartItem; product: JeansProduct } | null>(null);

  // Quick Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Customer Checkout Form for Agency Shipping
  const [customerData, setCustomerData] = useState({
    nombre: '',
    dni: '',
    telefono: '',
    ciudad: '',
    metodoEntrega: 'Agencia Shalom',
    sucursalAgencia: '', // Specific agency branch or address
    otraAgenciaNombre: '',
    medioPago: 'Yape / Plin',
    notas: ''
  });

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Helper to format numeric prices (e.g. 200 -> S/ 200.00)
  const formatPrice = (price?: number): string | null => {
    if (price === undefined || price === null || isNaN(price) || price <= 0) {
      return null;
    }
    return `S/ ${price.toFixed(2)}`;
  };

  // Helper to get active color for a product card
  const getActiveColor = (product: JeansProduct): ColorVariant => {
    return activeCardColors[product.id] || product.colores[0];
  };

  // Helper to set active color for a product card
  const handleSelectCardColor = (productId: string, color: ColorVariant) => {
    setActiveCardColors(prev => ({ ...prev, [productId]: color }));
  };

  // Helper to toggle image view ('product' or 'poster')
  const handleToggleCardView = (productId: string) => {
    setActiveCardViews(prev => ({
      ...prev,
      [productId]: prev[productId] === 'poster' ? 'product' : 'poster'
    }));
  };

  // Extract all unique brands and fits
  const brandsList = ['Todas', 'Lois', 'Element', 'Pionier', 'Bronco'];
  const fitsList = ['Todos', 'Corte Clásico', 'Semi Pitillo', 'Slim Fit', 'Baggy Fit', 'Cargo Relajado', 'Short Denim'];

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Category filter
      if (selectedCategory !== 'Todas' && product.categoriaId !== selectedCategory) {
        return false;
      }
      // Brand filter
      if (selectedBrand !== 'Todas' && product.marca !== selectedBrand) {
        return false;
      }
      // Fit filter
      if (selectedFit !== 'Todos' && product.corte !== selectedFit) {
        return false;
      }
      // Color filter
      if (selectedColorFilter !== 'Todos') {
        const hasColor = product.colores.some(c => c.nombre.toLowerCase() === selectedColorFilter.toLowerCase());
        if (!hasColor) return false;
      }
      // Search Query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = product.nombreCompleto.toLowerCase().includes(q);
        const matchesBrand = product.marca.toLowerCase().includes(q);
        const matchesFit = product.corte.toLowerCase().includes(q);
        const matchesColor = product.colores.some(c => c.nombre.toLowerCase().includes(q));
        if (!matchesName && !matchesBrand && !matchesFit && !matchesColor) {
          return false;
        }
      }
      return true;
    });
  }, [products, selectedCategory, selectedBrand, selectedFit, selectedColorFilter, searchQuery]);

  // Cart operations
  const addToCart = (product: JeansProduct, color: ColorVariant, talla: number | string, cantidad: number = 1) => {
    const itemKey = `${product.id}-${color.nombre}-${talla}`;
    const newItem: CartItem = { id: itemKey, product, color, talla, cantidad };

    setCart(prev => {
      const existing = prev.find(item => item.id === itemKey);
      if (existing) {
        return prev.map(item =>
          item.id === itemKey ? { ...item, cantidad: item.cantidad + cantidad } : item
        );
      }
      return [...prev, newItem];
    });

    // Trigger center screen modal confirmation
    setAddedItemModal({ item: newItem, product });
    triggerToast(`¡Agregado ${product.modelo} (${color.nombre} - Talla ${talla}) a tu pedido!`);
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.id === id) {
            const newQty = item.cantidad + delta;
            return newQty > 0 ? { ...item, cantidad: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const cartTotalCount = useMemo(() => cart.reduce((acc, i) => acc + i.cantidad, 0), [cart]);
  const cartTotalPrice = useMemo(() => cart.reduce((acc, i) => acc + ((i.product.precio || 0) * i.cantidad), 0), [cart]);

  // WhatsApp Single Item Order
  const handleDirectWhatsAppOrder = (product: JeansProduct, color: ColorVariant, talla: number | string) => {
    const precioTexto = formatPrice(product.precio) || 'A consultar';
    const message = `${STORE_INFO.mensajeWhatsAppBase}
👖 *${product.nombreCompleto}*
🎨 Color: *${color.nombre}*
📐 Talla: *${talla}*
💰 Precio: *${precioTexto}*

¿Tienen stock disponible para envío inmediato por agencia?`;

    const encodedMsg = encodeURIComponent(message);
    window.open(`https://wa.me/${STORE_INFO.telefonoWhatsApp}?text=${encodedMsg}`, '_blank');
  };

  // WhatsApp Full Cart Order with Agency & Customer DNI details
  const handleSendCartToWhatsApp = () => {
    if (cart.length === 0) return;

    let itemsList = '';
    cart.forEach((item, index) => {
      const subtotalTexto = item.product.precio && item.product.precio > 0 
        ? `S/ ${(item.product.precio * item.cantidad).toFixed(2)}` 
        : 'A consultar';

      itemsList += `${index + 1}. *${item.product.nombreCompleto}*\n   • Color: ${item.color.nombre}\n   • Talla: ${item.talla}\n   • Cantidad: ${item.cantidad}\n   • Subtotal: ${subtotalTexto}\n\n`;
    });

    let agenciaTexto = customerData.metodoEntrega;
    if (customerData.metodoEntrega === 'Otras Agencias' && customerData.otraAgenciaNombre.trim()) {
      agenciaTexto = `Otras Agencias (${customerData.otraAgenciaNombre.trim()})`;
    }

    let customerInfo = '';
    if (customerData.nombre || customerData.dni || customerData.telefono || customerData.ciudad) {
      customerInfo = `\n👤 *DATOS PARA EL ENVÍO POR AGENCIA:*\n` +
        (customerData.nombre ? `• Nombre Completo: ${customerData.nombre}\n` : '') +
        (customerData.dni ? `• DNI: ${customerData.dni}\n` : '') +
        (customerData.telefono ? `• Teléfono: ${customerData.telefono}\n` : '') +
        (customerData.ciudad ? `• Ciudad / Destino: ${customerData.ciudad}\n` : '') +
        `• Agencia / Método: ${agenciaTexto}\n` +
        (customerData.sucursalAgencia ? `• Sucursal de Recojo / Dirección: ${customerData.sucursalAgencia}\n` : '') +
        (customerData.medioPago ? `• Medio de Pago: ${customerData.medioPago}\n` : '');
    }

    const totalTexto = cartTotalPrice > 0 ? `S/ ${cartTotalPrice.toFixed(2)}` : 'A consultar por WhatsApp';

    const fullMessage = `🪶 *NUEVO PEDIDO - PLUMAS JEANS* 🪶\n\n*PRODUCTOS:* \n${itemsList}💵 *TOTAL DEL PEDIDO: ${totalTexto}*${customerInfo}\n¿Tienen stock disponible para confirmar mi pedido?`;

    const encodedMsg = encodeURIComponent(fullMessage);
    window.open(`https://wa.me/${STORE_INFO.telefonoWhatsApp}?text=${encodedMsg}`, '_blank');
  };

  const handleOpenDetailModal = (product: JeansProduct, color?: ColorVariant) => {
    setDetailProduct(product);
    setModalColor(color || product.colores[0]);
    setModalSize(product.tallasDisponibles[0]);
  };

  const selectCategoryAndScroll = (catId: string) => {
    setSelectedCategory(catId);
    setTimeout(() => {
      const el = document.getElementById('productos-seccion');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 50);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* 📣 TOP ANNOUNCEMENT MARQUEE BAR */}
      <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 text-slate-950 py-1.5 px-4 text-[11px] font-extrabold tracking-wide overflow-hidden border-b border-amber-400/40 shadow-sm">
        <div className="whitespace-nowrap animate-marquee flex items-center justify-center gap-4">
          <span>{MARQUEE_ANNOUNCEMENT}</span>
        </div>
      </div>

      {/* 🔔 FLOATING TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-bold border border-slate-800 shadow-2xl backdrop-blur-md flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 👑 HEADER / NAVBAR */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl border-b border-slate-200/90 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Brand Title Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-lg shadow-md border border-amber-400">
              🪶
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black font-title tracking-wider text-slate-900 leading-none">
                PLUMAS <span className="text-amber-600">JEANS</span>
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-500 font-medium tracking-tight">
                Tienda Oficial de Jeans & Moda Premium
              </p>
            </div>
          </div>

          {/* Right Header Navigation & Order Drawer Button */}
          <div className="flex items-center gap-3">
            
            <button
              onClick={() => setShowSizeGuide(true)}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-all"
            >
              <Ruler className="w-4 h-4 text-amber-600" />
              <span>Guía Tallas</span>
            </button>

            <a
              href={`https://wa.me/${STORE_INFO.telefonoWhatsApp}?text=${encodeURIComponent(STORE_INFO.mensajeWhatsAppBase)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 transition-all"
            >
              <Smartphone className="w-4 h-4 text-emerald-600" />
              <span>WhatsApp</span>
            </a>

            {/* Shopping Cart / Order Drawer Trigger */}
            <button
              onClick={() => setShowCartDrawer(true)}
              className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition-all transform active:scale-95"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              <span className="hidden xs:inline uppercase tracking-wider">Mi Pedido</span>
              {cartTotalCount > 0 && (
                <span className="flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full bg-slate-900 text-amber-400 text-xs font-black">
                  {cartTotalCount}
                </span>
              )}
            </button>

          </div>
        </div>
      </header>

      {/* 👑 HERO SECTION - LIGHT MODE */}
      <section className="relative overflow-hidden py-10 sm:py-14 bg-gradient-to-b from-white via-slate-50 to-amber-50/20 border-b border-slate-200/80">
        
        {/* Background Decorative Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Hero Text */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Colección Completa Denim & Moda 2026</span>
              </div>

              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black font-title tracking-tight text-slate-900 leading-tight">
                EL ESTILO DEL JEANS <br />
                <span className="text-amber-600 font-serif italic font-normal">hecho a tu medida.</span>
              </h2>

              <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto lg:mx-0 font-medium leading-relaxed">
                Descubre nuestra selección de jeans, dril, shorts y casacas de las mejores marcas: <strong className="text-slate-900 font-bold">Lois Originals, Element, Pionier y Bronco</strong>. 
                Elige tu categoría en las ventanas interactivas a continuación y realiza tu pedido directo a nuestro WhatsApp en 1 click.
              </p>

              {/* Stats badges */}
              <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto lg:mx-0">
                <div className="bg-white border border-slate-200 p-3 rounded-2xl text-center shadow-sm">
                  <span className="block text-xl font-bold font-title text-amber-600">5</span>
                  <span className="text-[11px] text-slate-500 uppercase font-bold">Categorías</span>
                </div>
                <div className="bg-white border border-slate-200 p-3 rounded-2xl text-center shadow-sm">
                  <span className="block text-xl font-bold font-title text-blue-600">17+</span>
                  <span className="text-[11px] text-slate-500 uppercase font-bold">Modelos Top</span>
                </div>
                <div className="bg-white border border-slate-200 p-3 rounded-2xl text-center shadow-sm">
                  <span className="block text-xl font-bold font-title text-emerald-600">100%</span>
                  <span className="text-[11px] text-slate-500 uppercase font-bold">Calidad Premium</span>
                </div>
                <div className="bg-white border border-slate-200 p-3 rounded-2xl text-center shadow-sm">
                  <span className="block text-xl font-bold font-title text-amber-600">Nacional</span>
                  <span className="text-[11px] text-slate-500 uppercase font-bold">Envíos por Agencia</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <a
                  href="#categorias-ventanas"
                  className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
                >
                  <Grid className="w-4 h-4" />
                  <span>Explorar Categorías</span>
                </a>

                <button
                  onClick={() => setShowSizeGuide(true)}
                  className="px-5 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm border border-slate-300 transition-all flex items-center gap-2 shadow-sm"
                >
                  <Ruler className="w-4 h-4 text-amber-600" />
                  <span>Ver Guía de Tallas</span>
                </button>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-sm sm:max-w-md rounded-3xl overflow-hidden bg-white p-3 border border-slate-200 shadow-xl transform rotate-1 hover:rotate-0 transition-transform duration-500">
                <div className="w-full h-80 sm:h-96 bg-slate-100 rounded-2xl overflow-hidden flex items-center justify-center">
                  <img 
                    src={SHOWCASE_MODEL_IMAGE} 
                    alt="Plumas Jeans Lookbook Showcase" 
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <div className="absolute inset-x-3 bottom-3 p-4 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent rounded-b-2xl flex items-center justify-between text-white">
                  <div>
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">Lookbook Denim 2026</span>
                    <span className="text-sm font-semibold">Tendencia Urbana & Confort</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-md bg-amber-500 text-slate-950 text-xs font-extrabold">
                    PREMIUM
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 🖼️ CATEGORY WINDOWS GRID SECTION - LIGHT MODE */}
      <section id="categorias-ventanas" className="py-12 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 text-xs font-extrabold uppercase tracking-widest inline-flex items-center gap-1.5">
              <Grid className="w-3.5 h-3.5 text-amber-600" />
              <span>Explora Por Categorías</span>
            </span>
            <h3 className="text-2xl sm:text-4xl font-black font-title text-slate-900 tracking-tight uppercase">
              VENTANAS DE CATEGORÍAS
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Haz clic en cualquiera de nuestras categorías para abrir la sección de productos correspondiente.
            </p>
          </div>

          {/* 5 CATEGORY WINDOW CARDS GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
            
            {/* Option: Ver Todas */}
            <button
              onClick={() => selectCategoryAndScroll('Todas')}
              className={`group relative rounded-2xl overflow-hidden border-2 transition-all duration-300 text-left p-4 flex flex-col justify-between h-44 sm:h-52 shadow-md ${
                selectedCategory === 'Todas'
                  ? 'border-amber-500 bg-amber-50/80 ring-2 ring-amber-400/40'
                  : 'border-slate-200 hover:border-amber-400 bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                  {products.length} Ítems
                </span>
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-black font-title text-slate-900 group-hover:text-amber-600 transition-colors uppercase">
                  VER TODAS
                </h4>
                <p className="text-[11px] text-slate-500 font-semibold">Catálogo Completo</p>
              </div>
            </button>

            {/* 5 Main Category Cards */}
            {CATEGORIAS_JEANS.map(cat => {
              const count = products.filter(p => p.categoriaId === cat.id).length;
              const isSelected = selectedCategory === cat.id;

              return (
                <button
                  key={cat.id}
                  onClick={() => selectCategoryAndScroll(cat.id)}
                  className={`group relative rounded-2xl overflow-hidden border-2 transition-all duration-300 text-left flex flex-col justify-end h-44 sm:h-52 shadow-md transform hover:-translate-y-1 ${
                    isSelected
                      ? 'border-amber-500 ring-4 ring-amber-500/20 scale-[1.02]'
                      : 'border-slate-200 hover:border-amber-500/60'
                  }`}
                >
                  {/* Category Image Header Background */}
                  <img 
                    src={cat.imagenHeader} 
                    alt={cat.nombre}
                    className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent group-hover:opacity-90 transition-opacity" />

                  <div className="relative z-10 p-4 space-y-1 text-white">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 uppercase">
                        {count} {count === 1 ? 'Modelo' : 'Modelos'}
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-black font-title text-white group-hover:text-amber-300 transition-colors uppercase leading-tight">
                      {cat.nombre}
                    </h4>
                    
                    <p className="text-[10px] text-slate-200 font-medium line-clamp-1">
                      {cat.subtitulo}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

        </div>
      </section>

      {/* 🔍 SEARCH & FILTERS BAR - LIGHT MODE */}
      <section id="productos-seccion" className="py-6 bg-slate-100/90 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-extrabold font-title text-slate-900">
                  {selectedCategory === 'Todas' ? 'TODOS LOS PRODUCTOS' : CATEGORIAS_JEANS.find(c => c.id === selectedCategory)?.nombre.toUpperCase()}
                </h3>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                  {filteredProducts.length} Productos
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">
                {selectedCategory !== 'Todas' ? 'Mostrando la selección de esta categoría.' : 'Explora todas las categorías desplegadas.'}
              </p>
            </div>

            {/* Live Search Bar */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar modelo, corte, color..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white border border-slate-300 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 transition-all shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Secondary Filters Bar */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-2 border-t border-slate-200 text-xs">
            
            {/* Brand Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="font-bold text-amber-700 uppercase text-[11px] shrink-0">Marca:</span>
              {brandsList.map(brand => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all text-[11px] border ${
                    selectedBrand === brand
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>

            {/* Fit Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="font-bold text-blue-700 uppercase text-[11px] shrink-0">Corte:</span>
              {fitsList.map(fit => (
                <button
                  key={fit}
                  onClick={() => setSelectedFit(fit)}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all text-[11px] border ${
                    selectedFit === fit
                      ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {fit}
                </button>
              ))}
            </div>

            {selectedCategory !== 'Todas' && (
              <button
                onClick={() => setSelectedCategory('Todas')}
                className="text-amber-700 hover:underline text-[11px] font-extrabold ml-auto"
              >
                Ver Todas las Categorías
              </button>
            )}

          </div>

        </div>
      </section>

      {/* 🛍️ MAIN CATALOG CONTENT - LIGHT MODE */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <Search className="w-12 h-12 text-slate-400 mx-auto" />
            <h4 className="text-lg font-bold text-slate-800">No se encontraron productos con estos filtros</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Intenta cambiar la categoría, la marca o el término de búsqueda para visualizar más opciones.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('Todas');
                setSelectedBrand('Todas');
                setSelectedFit('Todos');
                setSelectedColorFilter('Todos');
                setSearchQuery('');
              }}
              className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all shadow-md"
            >
              Restablecer Todos los Filtros
            </button>
          </div>
        ) : (
          <div className="space-y-16">
            {CATEGORIAS_JEANS.map(cat => {
              const catProducts = filteredProducts.filter(p => p.categoriaId === cat.id);
              
              // Skip category if single category selected and this isn't it
              if (selectedCategory !== 'Todas' && selectedCategory !== cat.id) return null;
              // Skip category if search active and no products match in this category
              if (catProducts.length === 0 && (searchQuery || selectedBrand !== 'Todas' || selectedFit !== 'Todos')) return null;

              return (
                <section key={cat.id} id={cat.id} className="space-y-6">
                  
                  {/* 🖼️ CATEGORY HEADER CARD - LIGHT MODE STYLE */}
                  <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-lg group">
                    <div className="absolute inset-0 bg-slate-950/50 z-10" />
                    <img 
                      src={cat.imagenHeader} 
                      alt={cat.nombre} 
                      className="w-full h-44 sm:h-60 object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 z-20 p-6 sm:p-8 flex flex-col justify-end bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent text-white">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-md">
                          {cat.badge}
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-slate-900/90 text-amber-300 border border-amber-500/40 font-extrabold text-xs">
                          {catProducts.length} {catProducts.length === 1 ? 'Modelo' : 'Modelos'}
                        </span>
                      </div>

                      <h3 className="text-2xl sm:text-3xl font-black font-title text-white uppercase tracking-tight">
                        {cat.nombre}
                      </h3>
                      
                      <p className="text-xs sm:text-sm text-slate-200 font-medium leading-relaxed">
                        {cat.descripcion}
                      </p>
                    </div>
                  </div>

                  {/* 🛍️ PRODUCT GRID FOR THIS CATEGORY */}
                  {catProducts.length === 0 ? (
                    <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-xs text-slate-500 font-medium">
                      No hay productos disponibles bajo esta selección.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                      {catProducts.map(product => {
                        const activeColor = getActiveColor(product);
                        const viewMode = activeCardViews[product.id] || 'product';
                        const displayedImg = (viewMode === 'poster' && product.imagenPoster) 
                          ? product.imagenPoster 
                          : activeColor.imagen;
                        
                        const precioFormateado = formatPrice(product.precio);

                        return (
                          <motion.div
                            key={product.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="group relative flex flex-col rounded-2xl bg-white border border-slate-200 hover:border-amber-500/60 transition-all duration-300 overflow-hidden shadow-sm hover:shadow-xl"
                          >
                            
                            {/* Badges Overlay */}
                            <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 items-start">
                              <span className="px-2.5 py-1 rounded-md bg-amber-500 text-slate-950 font-extrabold text-[11px] tracking-wide uppercase shadow-md">
                                {product.marca}
                              </span>
                              {product.stockLimitado && (
                                <span className="px-2 py-0.5 rounded-md bg-slate-900 text-rose-300 border border-rose-400/40 text-[10px] font-bold tracking-wider uppercase shadow-md">
                                  Stock Limitado
                                </span>
                              )}
                            </div>

                            {/* Right Action Badge: View Toggle */}
                            {product.imagenPoster && (
                              <div className="absolute top-3 right-3 z-20">
                                <button
                                  onClick={() => handleToggleCardView(product.id)}
                                  className="px-2.5 py-1 rounded-lg bg-white/90 hover:bg-white text-slate-800 border border-slate-200 text-[11px] font-bold flex items-center gap-1 shadow-md transition-all backdrop-blur-md"
                                  title="Cambiar vista foto jean / modelo"
                                >
                                  <Eye className="w-3.5 h-3.5 text-amber-600" />
                                  <span>{viewMode === 'poster' ? 'Ver Producto' : 'Ver Modelo'}</span>
                                </button>
                              </div>
                            )}

                            {/* 🖼️ PERFECTLY CENTERED & NON-CROPPED PRODUCT PHOTO BOX */}
                            <div 
                              onClick={() => handleOpenDetailModal(product, activeColor)}
                              className="relative w-full h-80 sm:h-96 bg-slate-100/90 flex items-center justify-center p-3 overflow-hidden cursor-pointer group-hover:bg-slate-200/60 transition-all"
                            >
                              <img 
                                src={displayedImg} 
                                alt={`${product.nombreCompleto} ${activeColor.nombre}`}
                                className="max-w-full max-h-full w-auto h-auto object-contain object-center transform group-hover:scale-105 transition-transform duration-500 ease-out drop-shadow-md"
                              />

                              {/* Bottom Color Tag */}
                              <div className="absolute bottom-3 left-3 z-10">
                                <span className="px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-md text-amber-800 font-bold text-xs border border-slate-200 shadow-md">
                                  Color: {activeColor.nombre}
                                </span>
                              </div>
                            </div>

                            {/* Card Content Details - Light Mode */}
                            <div className="p-5 flex-1 flex flex-col justify-between space-y-4 bg-white">
                              
                              <div>
                                {/* Fit tag & price */}
                                <div className="flex items-center justify-between gap-2 mb-1.5">
                                  <span className="text-xs font-extrabold text-blue-700 uppercase tracking-wider">
                                    {product.corte}
                                  </span>
                                  <div className="text-right">
                                    {precioFormateado ? (
                                      <>
                                        <span className="text-lg font-black text-amber-600 font-title">
                                          {precioFormateado}
                                        </span>
                                        {product.precioOriginal && product.precioOriginal > 0 && (
                                          <span className="block text-[11px] text-slate-400 line-through -mt-1">
                                            {formatPrice(product.precioOriginal)}
                                          </span>
                                        )}
                                      </>
                                    ) : (
                                      <span className="text-[11px] font-extrabold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                                        Consultar
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Product Title */}
                                <h4 
                                  onClick={() => handleOpenDetailModal(product, activeColor)}
                                  className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition-colors cursor-pointer line-clamp-1"
                                >
                                  {product.nombreCompleto}
                                </h4>

                                <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed font-medium">
                                  {product.descripcion}
                                </p>
                              </div>

                              {/* Color Swatches Selector */}
                              <div className="space-y-2 pt-2 border-t border-slate-100">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="text-slate-500 text-[11px] font-semibold">Variantes de Color:</span>
                                  <span className="text-amber-700 text-[11px] font-bold">{product.colores.length} colores</span>
                                </div>
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  {product.colores.map((color) => {
                                    const isSelected = activeColor.nombre === color.nombre;
                                    return (
                                      <button
                                        key={color.nombre}
                                        onClick={() => handleSelectCardColor(product.id, color)}
                                        className={`group/swatch relative w-7 h-7 rounded-full transition-all duration-200 p-0.5 border ${
                                          isSelected
                                            ? 'border-amber-500 scale-110 shadow-md shadow-amber-500/30'
                                            : 'border-slate-300 hover:border-slate-500 opacity-80 hover:opacity-100'
                                        }`}
                                        title={color.nombre}
                                      >
                                        <span 
                                          className="block w-full h-full rounded-full border border-black/20" 
                                          style={{ backgroundColor: color.hexColor }} 
                                        />
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Sizes available indicator */}
                              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                                <span className="font-bold text-slate-700">Tallas:</span>
                                <div className="flex items-center gap-1 flex-wrap">
                                  {product.tallasDisponibles.map(t => (
                                    <span key={t} className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-[10px] font-extrabold text-slate-700">
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* Card Action Buttons */}
                              <div className="grid grid-cols-2 gap-2 pt-2">
                                <button
                                  onClick={() => addToCart(product, activeColor, product.tallasDisponibles[0])}
                                  className="py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs border border-amber-300 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                                >
                                  <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
                                  <span>Añadir</span>
                                </button>

                                <button
                                  onClick={() => handleDirectWhatsAppOrder(product, activeColor, product.tallasDisponibles[0])}
                                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-sm"
                                >
                                  <Smartphone className="w-3.5 h-3.5" />
                                  <span>Pedir WhatsApp</span>
                                </button>
                              </div>

                            </div>

                          </motion.div>
                        );
                      })}
                    </div>
                  )}

                </section>
              );
            })}
          </div>
        )}
      </main>

      {/* 📍 FLOATING "VER PEDIDO" BUTTON IN THE CENTER OF THE SCREEN */}
      <AnimatePresence>
        {cartTotalCount > 0 && !showCartDrawer && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-md w-[92%] sm:w-auto"
          >
            <button
              onClick={() => setShowCartDrawer(true)}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-600 hover:to-amber-700 text-white font-black text-sm sm:text-base shadow-2xl shadow-amber-500/30 border-2 border-amber-300 flex items-center justify-between sm:justify-center gap-4 transition-all transform hover:scale-[1.03] active:scale-95 ring-4 ring-white/90 backdrop-blur-md"
            >
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <ShoppingBag className="w-6 h-6 text-white stroke-[2.5]" />
                  <span className="absolute -top-1.5 -right-1.5 bg-slate-900 text-amber-400 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {cartTotalCount}
                  </span>
                </div>
                <span className="uppercase tracking-wider">Ver Mi Pedido</span>
              </div>

              <div className="flex items-center gap-2 bg-slate-900 text-amber-400 px-3 py-1 rounded-xl text-xs sm:text-sm font-black">
                <span>{cartTotalPrice > 0 ? `S/ ${cartTotalPrice.toFixed(2)}` : 'A consultar'}</span>
                <ChevronRight className="w-4 h-4 text-amber-400" />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🎯 CENTER SCREEN ADDED-TO-CART CONFIRMATION MODAL */}
      <AnimatePresence>
        {addedItemModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 20 }}
              transition={{ type: "spring", stiffness: 350, damping: 25 }}
              className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl text-center space-y-5 relative overflow-hidden"
            >
              {/* Glow accent bar */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500" />
              
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-300 flex items-center justify-center mx-auto shadow-sm">
                <Check className="w-8 h-8 stroke-[3]" />
              </div>

              <div>
                <span className="text-xs font-black text-amber-600 uppercase tracking-widest block mb-1">
                  ¡Añadido a tu Pedido!
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 font-title">
                  {addedItemModal.product.nombreCompleto}
                </h3>
              </div>

              {/* Product Details Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3 text-left">
                <div className="w-16 h-20 bg-slate-100 rounded-xl border border-slate-200 shrink-0 flex items-center justify-center overflow-hidden p-1">
                  <img 
                    src={addedItemModal.item.color.imagen} 
                    alt={addedItemModal.product.nombreCompleto}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
                <div className="space-y-1 text-xs text-slate-700">
                  <p>Color: <strong className="text-amber-700">{addedItemModal.item.color.nombre}</strong></p>
                  <p>Talla: <strong className="text-slate-900">{addedItemModal.item.talla}</strong></p>
                  <p>Cantidad: <strong className="text-slate-900">{addedItemModal.item.cantidad}</strong></p>
                  <p className="text-base font-black text-amber-600 font-title pt-0.5">
                    {addedItemModal.product.precio && addedItemModal.product.precio > 0 
                      ? formatPrice(addedItemModal.product.precio * addedItemModal.item.cantidad)
                      : 'Precio a consultar'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setAddedItemModal(null)}
                  className="py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 transition-all flex items-center justify-center gap-1.5"
                >
                  <span>Seguir Comprando</span>
                </button>

                <button
                  onClick={() => {
                    setAddedItemModal(null);
                    setShowCartDrawer(true);
                  }}
                  className="py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Ver Pedido</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🔍 PRODUCT DETAIL MODAL - LIGHT MODE */}
      <AnimatePresence>
        {detailProduct && modalColor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-3xl bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xl my-8"
            >
              <button
                onClick={() => setDetailProduct(null)}
                className="absolute top-4 right-4 z-30 p-2 rounded-full bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-300 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2">
                {/* Modal Product Image */}
                <div className="relative h-80 md:h-full bg-slate-100 min-h-[350px] flex items-center justify-center p-4">
                  <img
                    src={modalColor.imagen}
                    alt={`${detailProduct.nombreCompleto} ${modalColor.nombre}`}
                    className="max-w-full max-h-full object-contain object-center drop-shadow-xl"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 rounded-md bg-amber-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider shadow-sm">
                      {detailProduct.marca}
                    </span>
                  </div>
                </div>

                {/* Modal Product Info */}
                <div className="p-6 md:p-8 flex flex-col justify-between space-y-6 bg-white">
                  
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs font-extrabold text-blue-700 uppercase tracking-wider block mb-1">
                        Corte: {detailProduct.corte}
                      </span>
                      <h3 className="text-xl sm:text-2xl font-black font-title text-slate-900">
                        {detailProduct.nombreCompleto}
                      </h3>
                      <div className="flex items-center gap-3 mt-2">
                        {detailProduct.precio && detailProduct.precio > 0 ? (
                          <>
                            <span className="text-2xl font-black text-amber-600 font-title">
                              {formatPrice(detailProduct.precio)}
                            </span>
                            {detailProduct.precioOriginal && detailProduct.precioOriginal > 0 && (
                              <span className="text-xs text-slate-400 line-through font-semibold">
                                {formatPrice(detailProduct.precioOriginal)}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-xs font-extrabold px-3 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300">
                            Precio a consultar por WhatsApp
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {detailProduct.descripcion}
                    </p>

                    {/* Color selection */}
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-2">
                        Color Seleccionado: <strong className="text-amber-700">{modalColor.nombre}</strong>
                      </label>
                      <div className="flex items-center gap-2 flex-wrap">
                        {detailProduct.colores.map(c => (
                          <button
                            key={c.nombre}
                            onClick={() => setModalColor(c)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 border transition-all ${
                              modalColor.nombre === c.nombre
                                ? 'bg-amber-100 text-amber-900 border-amber-400 shadow-sm'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <span className="w-3.5 h-3.5 rounded-full border border-black/20" style={{ backgroundColor: c.hexColor }} />
                            <span>{c.nombre}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Size selection */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-bold text-slate-700">Selecciona tu Talla:</label>
                        <button
                          onClick={() => setShowSizeGuide(true)}
                          className="text-[11px] text-amber-700 hover:underline font-extrabold flex items-center gap-1"
                        >
                          <Ruler className="w-3.5 h-3.5" /> Guía de Tallas
                        </button>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {detailProduct.tallasDisponibles.map(t => (
                          <button
                            key={t}
                            onClick={() => setModalSize(t)}
                            className={`min-w-[44px] h-11 px-3 rounded-xl text-xs font-extrabold transition-all border ${
                              modalSize === t
                                ? 'bg-amber-500 text-slate-950 border-amber-400 scale-105 shadow-md'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Modal Footer Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-200">
                    <button
                      onClick={() => {
                        addToCart(detailProduct, modalColor, modalSize);
                        setDetailProduct(null);
                      }}
                      className="py-3.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Añadir al Pedido</span>
                    </button>

                    <button
                      onClick={() => {
                        handleDirectWhatsAppOrder(detailProduct, modalColor, modalSize);
                        setDetailProduct(null);
                      }}
                      className="py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Pedir por WhatsApp</span>
                    </button>
                  </div>

                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 📐 SIZE GUIDE MODAL */}
      <AnimatePresence>
        {showSizeGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-xl bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <button
                onClick={() => setShowSizeGuide(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <Ruler className="w-7 h-7 text-amber-600" />
                <div>
                  <h3 className="text-xl font-bold font-title text-slate-900">Guía de Tallas & Medidas</h3>
                  <p className="text-xs text-slate-500 font-medium">Tabla de equivalencia referencial en centímetros</p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 text-amber-800 font-extrabold uppercase text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="p-3">Talla Peruana</th>
                      <th className="p-3">Cintura (cm)</th>
                      <th className="p-3">Cadera (cm)</th>
                      <th className="p-3">Largo (cm)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 font-semibold">
                    <tr><td className="p-3 font-bold text-amber-700">28 (XS / S)</td><td className="p-3">72 - 76 cm</td><td className="p-3">90 - 94 cm</td><td className="p-3">102 cm</td></tr>
                    <tr><td className="p-3 font-bold text-amber-700">30 (S / M)</td><td className="p-3">77 - 81 cm</td><td className="p-3">95 - 99 cm</td><td className="p-3">104 cm</td></tr>
                    <tr><td className="p-3 font-bold text-amber-700">32 (M / L)</td><td className="p-3">82 - 86 cm</td><td className="p-3">100 - 104 cm</td><td className="p-3">105 cm</td></tr>
                    <tr><td className="p-3 font-bold text-amber-700">34 (L / XL)</td><td className="p-3">87 - 91 cm</td><td className="p-3">105 - 109 cm</td><td className="p-3">106 cm</td></tr>
                    <tr><td className="p-3 font-bold text-amber-700">36 (XL / XXL)</td><td className="p-3">92 - 96 cm</td><td className="p-3">110 - 114 cm</td><td className="p-3">107 cm</td></tr>
                  </tbody>
                </table>
              </div>

              <button
                onClick={() => setShowSizeGuide(false)}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-md"
              >
                Entendido, Volver al Catálogo
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🛒 CART & CHECKOUT DRAWER - LIGHT MODE WITH AGENCY SHIPPING FORM */}
      <AnimatePresence>
        {showCartDrawer && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-md bg-white border-l border-slate-200 h-full flex flex-col justify-between shadow-2xl"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-amber-600" />
                  <h3 className="text-lg font-bold font-title text-slate-900">Mi Pedido Plumas Jeans</h3>
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                    {cartTotalCount} items
                  </span>
                </div>
                <button
                  onClick={() => setShowCartDrawer(false)}
                  className="p-1.5 rounded-lg bg-white text-slate-500 hover:text-slate-900 border border-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Items & Form Body */}
              <div className="p-5 flex-1 overflow-y-auto space-y-5">
                {cart.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
                    <p className="text-sm font-bold text-slate-700">Tu pedido está vacío</p>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto font-medium">
                      Explora las categorías del catálogo y añade las prendas de tu preferencia para solicitar tu envío por agencia.
                    </p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex gap-3 items-center shadow-sm"
                    >
                      <div className="w-16 h-20 bg-white rounded-xl border border-slate-200 shrink-0 flex items-center justify-center p-1 overflow-hidden">
                        <img
                          src={item.color.imagen}
                          alt={item.product.nombreCompleto}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <h5 className="text-xs font-bold text-slate-900 truncate">
                          {item.product.nombreCompleto}
                        </h5>
                        <div className="flex items-center gap-2 text-[11px] text-slate-600 font-medium">
                          <span>Color: <strong className="text-amber-700">{item.color.nombre}</strong></span>
                          <span>•</span>
                          <span>Talla: <strong className="text-slate-900">{item.talla}</strong></span>
                        </div>
                        <span className="text-sm font-black text-amber-600 block font-title">
                          {item.product.precio && item.product.precio > 0 
                            ? formatPrice(item.product.precio * item.cantidad)
                            : 'A consultar'}
                        </span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex flex-col items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-300">
                          <button
                            onClick={() => updateCartQty(item.id, -1)}
                            className="p-1 rounded text-slate-600 hover:text-slate-900"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-slate-900 px-1">
                            {item.cantidad}
                          </span>
                          <button
                            onClick={() => updateCartQty(item.id, 1)}
                            className="p-1 rounded text-slate-600 hover:text-slate-900"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-rose-600 hover:text-rose-700 text-[10px] font-bold flex items-center gap-0.5"
                        >
                          <Trash2 className="w-3 h-3" /> Eliminar
                        </button>
                      </div>
                    </div>
                  ))
                )}

                {/* 🚚 AGENCY SHIPPING FORM */}
                {cart.length > 0 && (
                  <div className="pt-4 border-t border-slate-200 space-y-3.5">
                    
                    <div className="flex items-center justify-between">
                      <h5 className="text-xs font-extrabold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                        <Truck className="w-4 h-4 text-amber-600" />
                        <span>Datos para el Envío por Agencia</span>
                      </h5>
                    </div>

                    {/* Nombre Completo */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1 flex items-center gap-1">
                        <User className="w-3 h-3 text-slate-500" /> Nombre Completo:
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Fabian Torres"
                        value={customerData.nombre}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, nombre: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-semibold"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      {/* DNI - STRICTLY 8 DIGITS LIMIT */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1 flex items-center gap-1">
                          <CreditCard className="w-3 h-3 text-slate-500" /> Número DNI (8 dígitos):
                        </label>
                        <input
                          type="text"
                          maxLength={8}
                          placeholder="Ej. 74839201"
                          value={customerData.dni}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 8);
                            setCustomerData(prev => ({ ...prev, dni: val }));
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-mono font-bold"
                        />
                      </div>

                      {/* Teléfono Completo - STRICTLY 9 DIGITS LIMIT */}
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1 flex items-center gap-1">
                          <Smartphone className="w-3 h-3 text-slate-500" /> Teléfono (9 dígitos):
                        </label>
                        <input
                          type="text"
                          maxLength={9}
                          placeholder="Ej. 993399915"
                          value={customerData.telefono}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '').slice(0, 9);
                            setCustomerData(prev => ({ ...prev, telefono: val }));
                          }}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-mono font-bold"
                        />
                      </div>
                    </div>

                    {/* Ciudad / Destino */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" /> Ciudad / Destino:
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. Arequipa / Cusco / Trujillo / Lima"
                        value={customerData.ciudad}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, ciudad: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-semibold"
                      />
                    </div>

                    {/* Agencia / Método de Entrega */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-500" /> Agencia de Transporte / Método:
                      </label>
                      <select
                        value={customerData.metodoEntrega}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, metodoEntrega: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                      >
                        <option value="Agencia Shalom">Agencia Shalom</option>
                        <option value="Agencia Olva Courier">Agencia Olva Courier</option>
                        <option value="Agencia Marvisur">Agencia Marvisur</option>
                        <option value="Otras Agencias">Otras Agencias (Especificar)</option>
                        <option value="Envío a Domicilio">Envío a Domicilio</option>
                        <option value="Recojo en Tienda">Recojo en Tienda</option>
                      </select>
                    </div>

                    {/* Dynamic Field: Agency Branch or Exact Home Address */}
                    {(customerData.metodoEntrega === 'Agencia Shalom' || 
                      customerData.metodoEntrega === 'Agencia Olva Courier' || 
                      customerData.metodoEntrega === 'Agencia Marvisur' || 
                      customerData.metodoEntrega === 'Otras Agencias') && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-1"
                      >
                        <label className="text-[11px] font-bold text-amber-800 block">
                          {customerData.metodoEntrega === 'Otras Agencias' 
                            ? 'Nombre de la Agencia & Sucursal:' 
                            : `Sucursal / Dirección de ${customerData.metodoEntrega} donde recogerás:`}
                        </label>
                        <input
                          type="text"
                          placeholder={customerData.metodoEntrega === 'Otras Agencias' ? 'Ej. Flores Cargo - Agencia Central' : 'Ej. Sucursal Av. Ejército 405 (Cayma)'}
                          value={customerData.sucursalAgencia}
                          onChange={(e) => setCustomerData(prev => ({ ...prev, sucursalAgencia: e.target.value }))}
                          className="w-full px-3 py-2 rounded-xl bg-amber-50 border border-amber-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-600 focus:bg-white transition-all font-semibold"
                        />
                      </motion.div>
                    )}

                    {customerData.metodoEntrega === 'Envío a Domicilio' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-1"
                      >
                        <label className="text-[11px] font-bold text-slate-700 block">
                          Dirección exacta de tu Domicilio:
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. Av. Larco 456 Dpto 301, Miraflores"
                          value={customerData.sucursalAgencia}
                          onChange={(e) => setCustomerData(prev => ({ ...prev, sucursalAgencia: e.target.value }))}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white transition-all font-semibold"
                        />
                      </motion.div>
                    )}

                    {/* Medio de Pago */}
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1 flex items-center gap-1">
                        <CreditCard className="w-3 h-3 text-slate-500" /> Medio de Pago:
                      </label>
                      <select
                        value={customerData.medioPago}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, medioPago: e.target.value }))}
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-xs font-bold text-slate-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                      >
                        <option>Yape / Plin</option>
                        <option>Tarjeta Visa / Mastercard</option>
                        <option>Transferencia BCP / BBVA</option>
                        <option>Pago Contraentrega</option>
                      </select>
                    </div>

                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              {cart.length > 0 && (
                <div className="p-5 border-t border-slate-200 space-y-4 bg-slate-50">
                  <div className="flex items-center justify-between text-base">
                    <span className="font-bold text-slate-700">TOTAL PEDIDO:</span>
                    <span className="text-2xl font-black text-amber-600 font-title">
                      {cartTotalPrice > 0 ? `S/ ${cartTotalPrice.toFixed(2)}` : 'A consultar'}
                    </span>
                  </div>

                  <button
                    onClick={handleSendCartToWhatsApp}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                  >
                    <Smartphone className="w-5 h-5" />
                    <span>Enviar Pedido a WhatsApp</span>
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🛡️ FOOTER - GROUNDED NAVY CONTRAST */}
      <footer className="bg-slate-900 border-t border-slate-800 py-12 text-slate-300 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img src={LOGO_IMAGE} alt="Plumas Jeans" className="h-10 w-auto rounded border border-amber-500/40 p-0.5 bg-white" />
                <h4 className="text-lg font-black font-title text-amber-400">PLUMAS JEANS</h4>
              </div>
              <p className="text-slate-400 leading-relaxed font-medium">
                Especialistas en confección y comercialización de jeans masculinos y femeninos, dril, shorts y casacas de alta calidad.
              </p>
            </div>

            <div className="space-y-2">
              <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Beneficios Plumas Jeans</h5>
              <ul className="space-y-2 font-medium">
                <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Garantía de cambio de talla</li>
                <li className="flex items-center gap-2"><Truck className="w-4 h-4 text-amber-400" /> Envíos por Shalom, Olva y Marvisur</li>
                <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-blue-400" /> 100% Algodón y Denim Stretch</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Nuestras Marcas</h5>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 font-bold">Lois Originals</span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 font-bold">Element</span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 font-bold">Pionier</span>
                <span className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 font-bold">Bronco</span>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Atención al Cliente</h5>
              <p className="text-slate-300 font-medium">Horarios: Lunes a Sábado 9:00 am - 8:00 pm</p>
              <p className="text-slate-300 font-medium">WhatsApp: +51 993 399 915</p>
              <div className="pt-2 flex items-center gap-2">
                <span className="px-2 py-1 rounded bg-purple-900/50 text-purple-300 border border-purple-500/30 text-[10px] font-bold">Yape</span>
                <span className="px-2 py-1 rounded bg-cyan-900/50 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">Plin</span>
                <span className="px-2 py-1 rounded bg-blue-900/50 text-blue-300 border border-blue-500/30 text-[10px] font-bold">Visa</span>
                <span className="px-2 py-1 rounded bg-amber-900/50 text-amber-300 border border-amber-500/30 text-[10px] font-bold">Marvisur / Shalom</span>
              </div>
            </div>

          </div>

          <div className="border-t border-slate-800 pt-6 text-center text-[11px] text-slate-500 font-medium">
            © 2026 PLUMAS JEANS. Todos los derechos reservados. Catálogo Digital Interactivo.
          </div>

        </div>
      </footer>

    </div>
  );
}
