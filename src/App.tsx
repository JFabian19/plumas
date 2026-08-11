import React, { useState, useMemo } from 'react';
import { 
  ShoppingBag, Plus, Minus, X, Trash2, Search, Sparkles, Filter, 
  Ruler, Truck, ShieldCheck, MapPin, CheckCircle, Smartphone, 
  ExternalLink, ChevronRight, Heart, Star, Tag, RefreshCw, Eye, MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  JEANS_PRODUCTS, JeansProduct, ColorVariant, LOGO_IMAGE, 
  SHOWCASE_MODEL_IMAGE, MARQUEE_ANNOUNCEMENT, STORE_INFO 
} from './data/jeansData';

interface CartItem {
  id: string; // product id + color + size
  product: JeansProduct;
  color: ColorVariant;
  talla: number;
  cantidad: number;
}

export default function App() {
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
  const [modalSize, setModalSize] = useState<number>(30);

  // Cart & Checkout drawer state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCartDrawer, setShowCartDrawer] = useState<boolean>(false);
  const [showSizeGuide, setShowSizeGuide] = useState<boolean>(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState<boolean>(false);

  // Quick Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Customer Checkout Form
  const [customerData, setCustomerData] = useState({
    nombre: '',
    telefono: '',
    ciudad: '',
    direccion: '',
    metodoEntrega: 'Envío a Domicilio (Lima / Provincias)',
    medioPago: 'Yape / Plin',
    notas: ''
  });

  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationSuccess, setLocationSuccess] = useState(false);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
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

  // Extract all unique brands, fits, and colors for filter chips
  const brandsList = ['Todas', 'Lois', 'Element', 'Pionier', 'Bronco'];
  const fitsList = ['Todos', 'Slim Fit', 'Semi Pitillo', 'MOM Jeans', 'Corte Clásico'];

  const allColorsList = useMemo(() => {
    const colorsSet = new Set<string>();
    JEANS_PRODUCTS.forEach(p => p.colores.forEach(c => colorsSet.add(c.nombre)));
    return ['Todos', ...Array.from(colorsSet)];
  }, []);

  // Filtered Jeans List
  const filteredProducts = useMemo(() => {
    return JEANS_PRODUCTS.filter(product => {
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
  }, [selectedBrand, selectedFit, selectedColorFilter, searchQuery]);

  // Cart operations
  const addToCart = (product: JeansProduct, color: ColorVariant, talla: number, cantidad: number = 1) => {
    const itemKey = `${product.id}-${color.nombre}-${talla}`;
    setCart(prev => {
      const existing = prev.find(item => item.id === itemKey);
      if (existing) {
        return prev.map(item =>
          item.id === itemKey ? { ...item, cantidad: item.cantidad + cantidad } : item
        );
      }
      return [...prev, { id: itemKey, product, color, talla, cantidad }];
    });
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

  const cartTotalPrice = useMemo(() => cart.reduce((acc, i) => acc + (i.product.precio * i.cantidad), 0), [cart]);

  // Geolocation Handler
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Tu navegador no soporta geolocalización por GPS.");
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const url = `https://maps.google.com/?q=${lat},${lng}`;
        setCustomerData(prev => ({ ...prev, direccion: `${prev.direccion} [Ubicación GPS: ${url}]`.trim() }));
        setIsGettingLocation(false);
        setLocationSuccess(true);
        triggerToast("¡Ubicación GPS capturada con éxito!");
      },
      (err) => {
        console.error(err);
        setIsGettingLocation(false);
        alert("No se pudo obtener la ubicación GPS automáticamente. Por favor escribe tu dirección.");
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // WhatsApp Single Item Order
  const handleDirectWhatsAppOrder = (product: JeansProduct, color: ColorVariant, talla: number) => {
    const message = `${STORE_INFO.mensajeWhatsAppBase}
👖 *${product.nombreCompleto}*
🎨 Color: *${color.nombre}*
📐 Talla: *${talla}*
💰 Precio: *S/ ${product.precio.toFixed(2)}*

¿Tienen stock disponible para envío inmediato?`;

    const encodedMsg = encodeURIComponent(message);
    window.open(`https://wa.me/${STORE_INFO.telefonoWhatsApp}?text=${encodedMsg}`, '_blank');
  };

  // WhatsApp Cart Order Checkout
  const handleSendCartToWhatsApp = () => {
    if (cart.length === 0) return;

    let itemsText = cart.map((item, idx) => {
      return `${idx + 1}. *${item.product.nombreCompleto}*
   • Color: ${item.color.nombre} | Talla: ${item.talla}
   • Cantidad: ${item.cantidad} x S/ ${item.product.precio.toFixed(2)} = S/ ${(item.product.precio * item.cantidad).toFixed(2)}`;
    }).join('\n\n');

    let customerDetails = `
📝 *DATOS DEL CLIENTE:*
• Nombre: ${customerData.nombre || 'No especificado'}
• Teléfono: ${customerData.telefono || 'No especificado'}
• Ciudad / Destino: ${customerData.ciudad || 'No especificado'}
• Dirección: ${customerData.direccion || 'Por acordar'}
• Método de Entrega: ${customerData.metodoEntrega}
• Pago Preferido: ${customerData.medioPago}`;

    if (customerData.notas) {
      customerDetails += `\n• Notas / Indicaciones: ${customerData.notas}`;
    }

    const fullMessage = `🪶 *NUEVO PEDIDO - PLUMAS JEANS* 🪶

${itemsText}

💵 *TOTAL DEL PEDIDO: S/ ${cartTotalPrice.toFixed(2)}*
${customerDetails}

Quedo a la espera de sus datos para proceder con el pago y envío. ¡Gracias!`;

    const encoded = encodeURIComponent(fullMessage);
    window.open(`https://wa.me/${STORE_INFO.telefonoWhatsApp}?text=${encoded}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 font-sans selection:bg-amber-500 selection:text-black">

      {/* 🚀 TOAST NOTIFICATION */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-20 right-4 z-50 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-amber-300/40"
          >
            <Sparkles className="w-5 h-5 animate-spin" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📢 DYNAMIC ANNOUNCEMENT MARQUEE */}
      <div className="bg-gradient-to-r from-slate-950 via-amber-950/40 to-slate-950 border-b border-amber-500/20 py-2.5 overflow-hidden text-xs font-medium tracking-wide text-amber-200/90">
        <div className="animate-marquee whitespace-nowrap flex items-center">
          <span className="mx-6 font-semibold">{MARQUEE_ANNOUNCEMENT}</span>
          <span className="mx-6 font-semibold">{MARQUEE_ANNOUNCEMENT}</span>
        </div>
      </div>

      {/* 🌟 HEADER / NAVBAR */}
      <header className="sticky top-0 z-40 glass-dark border-b border-slate-800/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <img 
              src={LOGO_IMAGE} 
              alt="Plumas Jeans Logo" 
              className="h-11 sm:h-12 w-auto object-contain rounded-lg border border-amber-500/30 p-1 bg-black/60 shadow-lg shadow-amber-500/10"
            />
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight font-title text-gold-gradient leading-none">
                PLUMAS JEANS
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium tracking-wider uppercase">
                Denim Store & Catálogo Digital
              </p>
            </div>
          </div>

          {/* Quick Actions & Cart Trigger */}
          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* Guía de Tallas Button */}
            <button
              onClick={() => setShowSizeGuide(true)}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition-all shadow-sm"
            >
              <Ruler className="w-4 h-4 text-amber-400" />
              <span>Guía de Tallas</span>
            </button>

            {/* Direct WhatsApp Contact */}
            <a
              href={`https://wa.me/${STORE_INFO.telefonoWhatsApp}?text=${encodeURIComponent(STORE_INFO.mensajeWhatsAppBase)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 transition-all"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp Directo</span>
            </a>

            {/* Shopping Cart Drawer Trigger */}
            <button
              onClick={() => setShowCartDrawer(true)}
              className="relative flex items-center gap-2.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/25 transition-all transform active:scale-95"
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden xs:inline">Mi Pedido</span>
              {cartTotalCount > 0 && (
                <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-slate-950 text-amber-400 text-xs font-extrabold border border-amber-400/40">
                  {cartTotalCount}
                </span>
              )}
            </button>

          </div>
        </div>
      </header>

      {/* 👑 HERO SECTION WITH EXCLUSIVE BRANDING */}
      <section className="relative overflow-hidden py-10 sm:py-16 bg-gradient-to-b from-slate-950 via-[#101726] to-[#0b0f17] border-b border-slate-800/60">
        
        {/* Decorative Background Feather Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left Hero Text */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider shimmer-badge">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Colección Premium Denim 2026</span>
              </div>

              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black font-title tracking-tight text-slate-100 leading-tight">
                EL ESTILO DEL JEANS <br />
                <span className="text-gold-gradient font-serif italic font-normal">hecho a tu medida.</span>
              </h2>

              <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Descubre nuestra selección exclusiva de marcas líderes: <strong className="text-slate-100 font-semibold">Lois Originals, Element, Pionier y Bronco</strong>. 
                Revisa colores, cortes y tallas en este catálogo interactivo y haz tu pedido directo a nuestro WhatsApp en 1 click.
              </p>

              {/* Stats badges */}
              <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-lg mx-auto lg:mx-0">
                <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl text-center">
                  <span className="block text-xl font-bold font-title text-amber-400">4</span>
                  <span className="text-[11px] text-slate-400 uppercase font-medium">Marcas Top</span>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl text-center">
                  <span className="block text-xl font-bold font-title text-blue-400">25+</span>
                  <span className="text-[11px] text-slate-400 uppercase font-medium">Tonalidades</span>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl text-center">
                  <span className="block text-xl font-bold font-title text-emerald-400">100%</span>
                  <span className="text-[11px] text-slate-400 uppercase font-medium">Algodón Premium</span>
                </div>
                <div className="bg-slate-900/80 border border-slate-800 p-3 rounded-xl text-center">
                  <span className="block text-xl font-bold font-title text-amber-400">Nacional</span>
                  <span className="text-[11px] text-slate-400 uppercase font-medium">Envíos a todo el Perú</span>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <a
                  href="#catalogo"
                  className="px-6 py-3 rounded-xl bg-gold-gradient text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 hover:brightness-110 transition-all flex items-center gap-2"
                >
                  <span>Explorar Catálogo</span>
                  <ChevronRight className="w-4 h-4" />
                </a>

                <button
                  onClick={() => setShowSizeGuide(true)}
                  className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-sm border border-slate-700 transition-all flex items-center gap-2"
                >
                  <Ruler className="w-4 h-4 text-amber-400" />
                  <span>Ver Guía de Cortes & Tallas</span>
                </button>
              </div>
            </div>

            {/* Right Hero Image Card */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-sm sm:max-w-md rounded-2xl overflow-hidden glass-card p-3 border border-amber-500/30 shadow-2xl shadow-amber-500/10 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                <img 
                  src={SHOWCASE_MODEL_IMAGE} 
                  alt="Plumas Jeans Lookbook Showcase" 
                  className="w-full h-80 sm:h-96 object-cover object-top rounded-xl"
                />
                <div className="absolute inset-x-3 bottom-3 p-4 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent rounded-b-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">Lookbook Denim 2026</span>
                    <span className="text-sm font-semibold text-slate-100">Tendencia Urbana & Confort</span>
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

      {/* 🔍 CATALOG SEARCH & FILTERS SECTION */}
      <section id="catalogo" className="py-8 bg-[#0e1422] border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          
          {/* Section Heading & Search bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl sm:text-3xl font-extrabold font-title text-slate-100 flex items-center gap-2">
                <span>CATÁLOGO DE PRODUCTOS</span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
                  {filteredProducts.length} Modelos
                </span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-400">
                Filtra por tu marca preferida, tipo de corte o tonalidad de jeans.
              </p>
            </div>

            {/* Live Search Bar */}
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por marca, color, corte..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-500/80 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Filter Chips Container */}
          <div className="space-y-4 pt-2">
            
            {/* Brand Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
                <Tag className="w-3.5 h-3.5" /> Marca:
              </span>
              {brandsList.map(brand => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                    selectedBrand === brand
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>

            {/* Fit / Corte Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider shrink-0 flex items-center gap-1 mr-1">
                <Filter className="w-3.5 h-3.5" /> Corte:
              </span>
              {fitsList.map(fit => (
                <button
                  key={fit}
                  onClick={() => setSelectedFit(fit)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 border ${
                    selectedFit === fit
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/20 font-semibold'
                      : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border-slate-800'
                  }`}
                >
                  {fit}
                </button>
              ))}
            </div>

            {/* Color Swatch Filter */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider shrink-0 mr-1">
                Color:
              </span>
              {allColorsList.map(colorName => (
                <button
                  key={colorName}
                  onClick={() => setSelectedColorFilter(colorName)}
                  className={`px-3 py-1 rounded-md text-xs transition-all shrink-0 border ${
                    selectedColorFilter === colorName
                      ? 'bg-slate-100 text-slate-950 font-bold border-white'
                      : 'bg-slate-900/60 hover:bg-slate-800 text-slate-400 border-slate-800'
                  }`}
                >
                  {colorName}
                </button>
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* 🛍️ PRODUCT CATALOG GRID */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-4">
            <Search className="w-12 h-12 text-slate-600 mx-auto" />
            <h4 className="text-lg font-bold text-slate-200">No se encontraron jeans con este filtro</h4>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Intenta cambiar la marca, el tipo de corte o la búsqueda de color para ver más opciones disponibles.
            </p>
            <button
              onClick={() => {
                setSelectedBrand('Todas');
                setSelectedFit('Todos');
                setSelectedColorFilter('Todos');
                setSearchQuery('');
              }}
              className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-all"
            >
              Restablecer Filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredProducts.map(product => {
              const activeColor = getActiveColor(product);
              const viewMode = activeCardViews[product.id] || 'product';
              const displayedImg = (viewMode === 'poster' && product.imagenPoster) 
                ? product.imagenPoster 
                : activeColor.imagen;

              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="group relative flex flex-col rounded-2xl glass-card border border-slate-800/90 hover:border-amber-500/50 transition-all duration-300 overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-amber-500/10"
                >
                  
                  {/* Badges Overlay */}
                  <div className="absolute top-3 left-3 z-20 flex flex-col gap-1.5 items-start">
                    <span className="px-2.5 py-1 rounded-md bg-amber-500 text-slate-950 font-extrabold text-[11px] tracking-wide uppercase shadow-md">
                      {product.marca}
                    </span>
                    {product.stockLimitado && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-950/90 text-rose-400 border border-rose-500/30 text-[10px] font-bold tracking-wider uppercase">
                        Stock Limitado
                      </span>
                    )}
                  </div>

                  {/* Right Action Badge: View Toggle */}
                  {product.imagenPoster && (
                    <div className="absolute top-3 right-3 z-20">
                      <button
                        onClick={() => handleToggleCardView(product.id)}
                        className="px-2.5 py-1 rounded-lg bg-slate-950/80 hover:bg-slate-900 text-slate-200 border border-slate-700/80 text-[11px] font-semibold flex items-center gap-1 shadow-md transition-all"
                        title="Cambiar entre foto de modelo y foto del producto"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-400" />
                        <span>{viewMode === 'poster' ? 'Ver Jean' : 'Ver Modelo'}</span>
                      </button>
                    </div>
                  )}

                  {/* Product Image Container */}
                  <div 
                    onClick={() => {
                      setDetailProduct(product);
                      setModalColor(activeColor);
                    }}
                    className="relative w-full h-80 sm:h-96 bg-slate-950 overflow-hidden cursor-pointer group-hover:brightness-105 transition-all"
                  >
                    <img 
                      src={displayedImg} 
                      alt={`${product.nombreCompleto} ${activeColor.nombre}`}
                      className="w-full h-full object-cover object-top transform group-hover:scale-105 transition-transform duration-700 ease-out"
                    />

                    {/* Bottom Gradient Fade */}
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#121826] via-[#121826]/70 to-transparent pointer-events-none" />

                    {/* Overlay Active Color Tag */}
                    <div className="absolute bottom-3 left-3 z-10">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-950/90 backdrop-blur-md text-amber-300 font-semibold text-xs border border-amber-500/30">
                        Color: {activeColor.nombre}
                      </span>
                    </div>
                  </div>

                  {/* Card Content Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4 bg-[#121826]">
                    
                    <div>
                      {/* Fit tag & price */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">
                          {product.corte}
                        </span>
                        <div className="text-right">
                          <span className="text-lg font-black text-gold-gradient font-title">
                            S/ {product.precio.toFixed(2)}
                          </span>
                          {product.precioOriginal && (
                            <span className="block text-[11px] text-slate-500 line-through -mt-1">
                              S/ {product.precioOriginal.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Product Title */}
                      <h4 
                        onClick={() => {
                          setDetailProduct(product);
                          setModalColor(activeColor);
                        }}
                        className="text-base font-bold text-slate-100 group-hover:text-amber-300 transition-colors cursor-pointer line-clamp-1"
                      >
                        {product.nombreCompleto}
                      </h4>

                      <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                        {product.descripcion}
                      </p>
                    </div>

                    {/* Color Swatch Selectors */}
                    <div className="space-y-1.5 pt-1 border-t border-slate-800/80">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Colores disponibles ({product.colores.length}):
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5 max-h-16 overflow-y-auto no-scrollbar">
                        {product.colores.map((col) => {
                          const isSelected = activeColor.nombre === col.nombre;
                          return (
                            <button
                              key={col.nombre}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectCardColor(product.id, col);
                              }}
                              className={`px-2 py-0.5 rounded-md text-[11px] font-medium transition-all border ${
                                isSelected
                                  ? 'bg-amber-500 text-slate-950 font-bold border-amber-300 scale-105 shadow-sm'
                                  : 'bg-slate-900 text-slate-300 border-slate-700/80 hover:bg-slate-800'
                              }`}
                            >
                              {col.nombre}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Sizes available pill indicator */}
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span className="font-semibold text-slate-300">Tallas:</span>
                      <div className="flex items-center gap-1">
                        {product.tallasDisponibles.map(t => (
                          <span key={t} className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Card Action Buttons */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        onClick={() => addToCart(product, activeColor, 30)}
                        className="py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-100 font-bold text-xs border border-slate-700 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                        <span>Añadir</span>
                      </button>

                      <button
                        onClick={() => handleDirectWhatsAppOrder(product, activeColor, 30)}
                        className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
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

      </main>

      {/* 📖 DETAILED PRODUCT MODAL */}
      <AnimatePresence>
        {detailProduct && modalColor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-[#121826] border border-amber-500/30 rounded-3xl overflow-hidden shadow-2xl my-8 max-h-[90vh] flex flex-col md:flex-row"
            >
              {/* Close Button */}
              <button
                onClick={() => setDetailProduct(null)}
                className="absolute top-4 right-4 z-30 p-2 rounded-full bg-slate-950/80 text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-900 transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Left Image Showcase */}
              <div className="md:w-1/2 relative bg-slate-950 flex flex-col justify-between p-4 border-b md:border-b-0 md:border-r border-slate-800">
                <div className="relative h-80 sm:h-96 md:h-[450px] w-full rounded-2xl overflow-hidden">
                  <img
                    src={modalColor.imagen}
                    alt={modalColor.nombre}
                    className="w-full h-full object-cover object-top"
                  />
                  <span className="absolute bottom-3 left-3 px-3 py-1 rounded-lg bg-slate-950/90 text-amber-300 font-bold text-xs border border-amber-500/30">
                    Color: {modalColor.nombre}
                  </span>
                </div>

                {/* Color Thumbnails Row */}
                <div className="mt-3 space-y-1">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Variantes de Color:
                  </span>
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                    {detailProduct.colores.map(c => (
                      <button
                        key={c.nombre}
                        onClick={() => setModalColor(c)}
                        className={`relative w-12 h-14 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                          modalColor.nombre === c.nombre ? 'border-amber-400 scale-105' : 'border-slate-800 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={c.imagen} alt={c.nombre} className="w-full h-full object-cover object-top" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Details Panel */}
              <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between space-y-6 overflow-y-auto">
                <div className="space-y-4">
                  
                  {/* Brand & Corte */}
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-md bg-amber-500 text-slate-950 font-extrabold text-xs uppercase">
                      {detailProduct.marca}
                    </span>
                    <span className="px-3 py-1 rounded-md bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-semibold">
                      {detailProduct.corte}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black font-title text-slate-100">
                    {detailProduct.nombreCompleto}
                  </h3>

                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-black text-gold-gradient font-title">
                      S/ {detailProduct.precio.toFixed(2)}
                    </span>
                    {detailProduct.precioOriginal && (
                      <span className="text-sm text-slate-500 line-through">
                        S/ {detailProduct.precioOriginal.toFixed(2)}
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800 pt-3">
                    {detailProduct.descripcion}
                  </p>

                  {/* Specs & Features List */}
                  <div className="space-y-2 pt-2">
                    <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      Detalles del Producto:
                    </h5>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {detailProduct.detalles.map((d, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Size Selector */}
                  <div className="space-y-2 pt-3 border-t border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                        Selecciona tu Talla:
                      </span>
                      <button
                        onClick={() => setShowSizeGuide(true)}
                        className="text-xs text-amber-400 hover:underline flex items-center gap-1"
                      >
                        <Ruler className="w-3.5 h-3.5" /> Guía de tallas
                      </button>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {detailProduct.tallasDisponibles.map(t => (
                        <button
                          key={t}
                          onClick={() => setModalSize(t)}
                          className={`w-11 h-11 rounded-xl text-sm font-bold transition-all border ${
                            modalSize === t
                              ? 'bg-amber-500 text-slate-950 border-amber-300 scale-105 shadow-md shadow-amber-500/20'
                              : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Modal Footer Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-800">
                  <button
                    onClick={() => {
                      addToCart(detailProduct, modalColor, modalSize);
                      setDetailProduct(null);
                    }}
                    className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs border border-slate-600 transition-all flex items-center justify-center gap-2"
                  >
                    <ShoppingBag className="w-4 h-4 text-amber-400" />
                    <span>Añadir al Carrito</span>
                  </button>

                  <button
                    onClick={() => {
                      handleDirectWhatsAppOrder(detailProduct, modalColor, modalSize);
                      setDetailProduct(null);
                    }}
                    className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Pedir por WhatsApp</span>
                  </button>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 📏 GUÍA DE TALLAS & CORTES MODAL */}
      <AnimatePresence>
        {showSizeGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-2xl bg-[#121826] border border-amber-500/30 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl my-8"
            >
              <button
                onClick={() => setShowSizeGuide(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-900 text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-1">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <Ruler className="w-4 h-4" /> Guía Oficial Plumas Jeans
                </div>
                <h3 className="text-2xl font-black font-title text-slate-100">
                  GUÍA DE CORTES & EQUIVALENCIA DE TALLAS
                </h3>
              </div>

              {/* Fit Types Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="font-bold text-amber-400 block">Slim Fit (Lois & Bronco)</span>
                  <p className="text-slate-400">Ceñido en muslo y pantorrilla con tiro medio. Ideal para lucir una figura estilizada y moderna.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="font-bold text-blue-400 block">Semi Pitillo (Element & Pionier)</span>
                  <p className="text-slate-400">Corte entallado sin apretar excesivamente. Bota semi recta ideal para calzado casual y zapatillas.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="font-bold text-pink-400 block">MOM Jeans (Element)</span>
                  <p className="text-slate-400">Tiro alto holgado en caderas con acabado cónico. Estilo vintage en tendencia urbana.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                  <span className="font-bold text-emerald-400 block">Corte Clásico (Pionier)</span>
                  <p className="text-slate-400">Caída recta tradicional desde la cintura hasta el tobillo. Máximo confort y solidez.</p>
                </div>
              </div>

              {/* Table of sizes */}
              <div className="border border-slate-800 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-900 text-amber-400 font-bold uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-2.5">Talla Peruana</th>
                      <th className="p-2.5">Cintura (cm)</th>
                      <th className="p-2.5">Cadera (cm)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    <tr><td className="p-2.5 font-bold text-slate-100">Talla 28</td><td className="p-2.5">70 - 74 cm</td><td className="p-2.5">88 - 92 cm</td></tr>
                    <tr><td className="p-2.5 font-bold text-slate-100">Talla 30</td><td className="p-2.5">75 - 79 cm</td><td className="p-2.5">93 - 97 cm</td></tr>
                    <tr><td className="p-2.5 font-bold text-slate-100">Talla 32</td><td className="p-2.5">80 - 84 cm</td><td className="p-2.5">98 - 102 cm</td></tr>
                    <tr><td className="p-2.5 font-bold text-slate-100">Talla 34</td><td className="p-2.5">85 - 89 cm</td><td className="p-2.5">103 - 107 cm</td></tr>
                    <tr><td className="p-2.5 font-bold text-slate-100">Talla 36</td><td className="p-2.5">90 - 95 cm</td><td className="p-2.5">108 - 113 cm</td></tr>
                  </tbody>
                </table>
              </div>

              <button
                onClick={() => setShowSizeGuide(false)}
                className="w-full py-3 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs uppercase"
              >
                Entendido, Volver al Catálogo
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🛒 CART & CHECKOUT SLIDE-OVER DRAWER */}
      <AnimatePresence>
        {showCartDrawer && (
          <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full max-w-md bg-[#121826] border-l border-slate-800 h-full flex flex-col justify-between shadow-2xl"
            >
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-amber-400" />
                  <h3 className="text-lg font-bold font-title text-slate-100">Mi Pedido Plumas Jeans</h3>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                    {cartTotalCount} items
                  </span>
                </div>
                <button
                  onClick={() => setShowCartDrawer(false)}
                  className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Items Body */}
              <div className="p-5 flex-1 overflow-y-auto space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <ShoppingBag className="w-12 h-12 text-slate-700 mx-auto" />
                    <p className="text-sm font-semibold text-slate-300">Tu pedido está vacío</p>
                    <p className="text-xs text-slate-500 max-w-xs mx-auto">
                      Explora el catálogo y añade los jeans de tu preferencia para solicitar tu envío por WhatsApp.
                    </p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex gap-3 items-center"
                    >
                      <img
                        src={item.color.imagen}
                        alt={item.product.nombreCompleto}
                        className="w-16 h-20 object-cover object-top rounded-lg bg-slate-950 shrink-0"
                      />

                      <div className="flex-1 min-w-0 space-y-1">
                        <h5 className="text-xs font-bold text-slate-100 truncate">
                          {item.product.nombreCompleto}
                        </h5>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400">
                          <span>Color: <strong className="text-amber-300">{item.color.nombre}</strong></span>
                          <span>•</span>
                          <span>Talla: <strong className="text-slate-200">{item.talla}</strong></span>
                        </div>
                        <span className="text-sm font-black text-gold-gradient block font-title">
                          S/ {(item.product.precio * item.cantidad).toFixed(2)}
                        </span>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex flex-col items-center gap-2 shrink-0">
                        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
                          <button
                            onClick={() => updateCartQty(item.id, -1)}
                            className="p-1 rounded text-slate-400 hover:text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-bold text-slate-100 px-1">
                            {item.cantidad}
                          </span>
                          <button
                            onClick={() => updateCartQty(item.id, 1)}
                            className="p-1 rounded text-slate-400 hover:text-white"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-rose-400 hover:text-rose-300 text-[10px] flex items-center gap-0.5"
                        >
                          <Trash2 className="w-3 h-3" /> Eliminar
                        </button>
                      </div>
                    </div>
                  ))
                )}

                {/* Checkout customer data form */}
                {cart.length > 0 && (
                  <div className="pt-4 border-t border-slate-800 space-y-3">
                    <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      Datos de Envío para el Pedido:
                    </h5>

                    <div>
                      <label className="text-[11px] text-slate-400 block mb-1">Nombre Completo:</label>
                      <input
                        type="text"
                        placeholder="Ej. Fabian Torres"
                        value={customerData.nombre}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, nombre: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Teléfono:</label>
                        <input
                          type="text"
                          placeholder="Ej. 993399915"
                          value={customerData.telefono}
                          onChange={(e) => setCustomerData(prev => ({ ...prev, telefono: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Ciudad / Destino:</label>
                        <input
                          type="text"
                          placeholder="Ej. Lima / Arequipa"
                          value={customerData.ciudad}
                          onChange={(e) => setCustomerData(prev => ({ ...prev, ciudad: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-[11px] text-slate-400">Dirección de Entrega:</label>
                        <button
                          type="button"
                          onClick={handleGetLocation}
                          disabled={isGettingLocation}
                          className="text-[10px] text-amber-400 hover:underline flex items-center gap-1"
                        >
                          <MapPin className="w-3 h-3" /> {isGettingLocation ? 'Obteniendo GPS...' : 'Usar GPS'}
                        </button>
                      </div>
                      <input
                        type="text"
                        placeholder="Ej. Av. Larco 456 Dpto 301"
                        value={customerData.direccion}
                        onChange={(e) => setCustomerData(prev => ({ ...prev, direccion: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Entrega:</label>
                        <select
                          value={customerData.metodoEntrega}
                          onChange={(e) => setCustomerData(prev => ({ ...prev, metodoEntrega: e.target.value }))}
                          className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none"
                        >
                          <option>Envío a Domicilio</option>
                          <option>Agencia Shalom</option>
                          <option>Olva Courier</option>
                          <option>Recojo en Tienda</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] text-slate-400 block mb-1">Medio de Pago:</label>
                        <select
                          value={customerData.medioPago}
                          onChange={(e) => setCustomerData(prev => ({ ...prev, medioPago: e.target.value }))}
                          className="w-full px-2.5 py-2 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-100 focus:outline-none"
                        >
                          <option>Yape / Plin</option>
                          <option>Tarjeta Visa / Mastercard</option>
                          <option>Transferencia BCP / BBVA</option>
                          <option>Pago Contraentrega</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Drawer Footer */}
              {cart.length > 0 && (
                <div className="p-5 border-t border-slate-800 space-y-4 bg-slate-950">
                  <div className="flex items-center justify-between text-base">
                    <span className="font-bold text-slate-300">TOTAL PEDIDO:</span>
                    <span className="text-2xl font-black text-gold-gradient font-title">
                      S/ {cartTotalPrice.toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={handleSendCartToWhatsApp}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20"
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

      {/* 🛡️ FOOTER & BRAND VALUE PROPOSITION */}
      <footer className="bg-slate-950 border-t border-slate-800/80 py-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Brand column */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img src={LOGO_IMAGE} alt="Plumas Jeans" className="h-10 w-auto rounded border border-amber-500/30 p-0.5 bg-black" />
                <h4 className="text-lg font-black font-title text-gold-gradient">PLUMAS JEANS</h4>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Especialistas en confección y comercialización de jeans masculinos y femeninos de alta calidad. Representantes de las marcas más icónicas del mercado peruano e internacional.
              </p>
            </div>

            {/* Benefits column */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Beneficios Plumas Jeans</h5>
              <ul className="space-y-2">
                <li className="flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Garantía de cambio de talla</li>
                <li className="flex items-center gap-2"><Truck className="w-4 h-4 text-amber-400" /> Envíos asegurados a todo el Perú</li>
                <li className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-blue-400" /> 100% Algodón y Denim Stretch</li>
              </ul>
            </div>

            {/* Marcas column */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Nuestras Marcas</h5>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 font-semibold">Lois Originals</span>
                <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 font-semibold">Element</span>
                <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 font-semibold">Pionier</span>
                <span className="px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 font-semibold">Bronco</span>
              </div>
            </div>

            {/* Payment & Contact column */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Atención al Cliente</h5>
              <p className="text-slate-300">Horarios: Lunes a Sábado 9:00 am - 8:00 pm</p>
              <p className="text-slate-300">WhatsApp: +51 993 399 915</p>
              <div className="pt-2 flex items-center gap-2">
                <span className="px-2 py-1 rounded bg-purple-900/40 text-purple-300 border border-purple-500/30 text-[10px] font-bold">Yape</span>
                <span className="px-2 py-1 rounded bg-cyan-900/40 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold">Plin</span>
                <span className="px-2 py-1 rounded bg-blue-900/40 text-blue-300 border border-blue-500/30 text-[10px] font-bold">Visa</span>
                <span className="px-2 py-1 rounded bg-amber-900/40 text-amber-300 border border-amber-500/30 text-[10px] font-bold">Shalom / Olva</span>
              </div>
            </div>

          </div>

          <div className="border-t border-slate-900 pt-6 text-center text-[11px] text-slate-500">
            © 2026 PLUMAS JEANS. Todos los derechos reservados. Catálogo Digital Interactivo.
          </div>

        </div>
      </footer>

    </div>
  );
}
