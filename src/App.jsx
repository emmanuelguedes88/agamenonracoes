import React, { useState, useEffect } from 'react';
import { FaInstagram, FaFacebook } from "react-icons/fa";
import {
  ShoppingCart, Menu, X, PawPrint, ArrowRight, Minus, Plus, Lock, CreditCard,
  Check, MapPin, Mail, Phone, MessageCircle, Star, ShieldCheck, QrCode, LogIn, LogOut
} from 'lucide-react';

// ==========================================
// FIREBASE (lido do arquivo firebase.js que usa o .env)
// ==========================================
import { signInWithRedirect, signOut, onAuthStateChanged } from "firebase/auth";
import { auth, provider } from "./firebase";

// ==========================================
// DADOS DA LOJA
// ==========================================
const PRODUCTS = [
  { id: 1, name: "Ração Super Premium Cães Adultos", price: 189.90, category: "Cães", img: "https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&q=80&w=400" },
  { id: 2, name: "Sachê Premium Gatos Sabor Salmão", price: 4.50, category: "Gatos", img: "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=400" },
  { id: 3, name: "Coleira Peitoral Reflexiva", price: 45.00, category: "Acessórios", img: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&q=80&w=400" },
  { id: 4, name: "Brinquedo Osso de Borracha Resistente", price: 22.90, category: "Brinquedos", img: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&q=80&w=400" },
  { id: 5, name: "Arranhador Torre para Gatos", price: 210.00, category: "Gatos", img: "https://images.unsplash.com/photo-1526336179256-1347bdb255ee?auto=format&fit=crop&q=80&w=400" },
  { id: 6, name: "Cama Confortável Nuvem", price: 120.00, category: "Conforto", img: "https://images.unsplash.com/photo-1583512603805-3cc6b41f3edb?auto=format&fit=crop&q=80&w=400" },
  { id: 7, name: "Antipulgas e Carrapatos 10-20kg", price: 95.50, category: "Saúde", img: "https://images.unsplash.com/photo-1591946614720-90a587da4a36?auto=format&fit=crop&q=80&w=400" },
  { id: 8, name: "Tapete Higiênico 30 Unidades", price: 49.90, category: "Higiene", img: "https://images.unsplash.com/photo-1601979031925-424e53b6caaa?auto=format&fit=crop&q=80&w=400" }
];

// Foto de reserva caso o link de alguma imagem pare de funcionar
const FALLBACK_IMG = "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&q=80&w=400";

const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

export default function App() {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [toasts, setToasts] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [usuario, setUsuario] = useState(null);

  const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const cartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const finalTotal = paymentMethod === 'pix' ? cartTotal * 0.95 : cartTotal;

  const primeiroNome = (u) => (u?.displayName ? u.displayName.split(' ')[0] : 'Cliente');

  const addToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // Mantém o login ao recarregar a página
  useEffect(() => {
    const cancelar = onAuthStateChanged(auth, (user) => setUsuario(user));
    return cancelar;
  }, []);

  // ==========================================
  // LOGIN / LOGOUT
  // ==========================================
  const fazerLoginComGoogle = () => {
    signInWithRedirect(auth, provider)
      .then((resultado) => {
        setUsuario(resultado.user);
        addToast('Bem-vindo(a), ' + primeiroNome(resultado.user) + '! 🐶', 'success');
      })
      .catch((erro) => {
        console.error("Erro no login", erro);
        addToast("Não foi possível fazer login. (" + (erro.code || "erro") + ")", 'error');
      });
  };

  const fazerLogout = () => {
    signOut(auth).then(() => {
      setUsuario(null);
      addToast("Você saiu da sua conta.", 'success');
    });
  };

  // ==========================================
  // CARRINHO
  // ==========================================
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    addToast(product.name + ' adicionado! 🐶', 'success');
  };

  const updateQuantity = (id, delta) => {
    setCart(prev =>
      prev
        .map(item => (item.id === id ? { ...item, quantity: item.quantity + delta } : item))
        .filter(item => item.quantity > 0)
    );
  };

  const handlePayment = () => {
    if (!usuario) {
      addToast("Por favor, faça login para finalizar a compra!", 'error');
      setIsCheckoutOpen(false);
      fazerLoginComGoogle();
      return;
    }
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsCheckoutOpen(false);
      setCart([]);
      addToast("Pagamento aprovado! Seu pedido já está sendo separado. 🎉", 'success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 2000);
  };

  // ==========================================
  // COMPONENTES VISUAIS
  // (chamados como funções no return, ex.: {Navigation()},
  // para não serem recriados a cada render)
  // ==========================================
  const Navigation = () => (
    <header className="fixed w-full top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
            <PawPrint className="text-orange-500 w-8 h-8 mr-2" />
            <span className="font-bold text-lg sm:text-xl text-amber-900 tracking-tight">Agamenon <span className="text-orange-500">Rações</span></span>
          </div>

          <nav className="hidden md:flex space-x-8">
            <a href="#inicio" className="text-gray-600 hover:text-orange-500 transition font-medium">Início</a>
            <a href="#produtos" className="text-gray-600 hover:text-orange-500 transition font-medium">Produtos</a>
            <a href="#historia" className="text-gray-600 hover:text-orange-500 transition font-medium">Nossa História</a>
          </nav>

          <div className="flex items-center space-x-1 sm:space-x-4">
            {/* ÁREA DE LOGIN */}
            <div className="flex items-center sm:border-r border-gray-300 sm:pr-4">
              {!usuario ? (
                <button onClick={fazerLoginComGoogle} title="Entrar com Google" aria-label="Entrar com Google" className="flex items-center text-sm font-bold text-orange-500 hover:text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 sm:px-4 py-2 rounded-full transition">
                  <LogIn className="w-5 h-5 sm:w-4 sm:h-4 sm:mr-2" /> <span className="hidden sm:inline">Entrar</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="hidden sm:flex flex-col text-right">
                    <span className="text-xs text-gray-500">Olá,</span>
                    <span className="text-sm font-bold text-amber-900 leading-none">{primeiroNome(usuario)}</span>
                  </div>
                  {usuario.photoURL && (
                    <img src={usuario.photoURL} alt="Perfil" className="w-9 h-9 rounded-full border-2 border-orange-500 shadow-sm" />
                  )}
                  <button onClick={fazerLogout} className="text-gray-400 hover:text-red-500 ml-1 transition" title="Sair da conta">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            <button onClick={() => setIsCartOpen(true)} className="relative text-gray-600 hover:text-orange-500 transition p-2 focus:outline-none">
              <ShoppingCart className="w-6 h-6" />
              {cartItemsCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center transform translate-x-1 -translate-y-1">
                  {cartItemsCount}
                </span>
              )}
            </button>

            <button className="md:hidden text-gray-600 focus:outline-none p-2" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Menu Mobile */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 px-4 py-4 space-y-4 shadow-lg">
          <div className="border-b border-gray-100 pb-4 mb-2">
            {!usuario ? (
              <button onClick={() => { fazerLoginComGoogle(); setIsMobileMenuOpen(false); }} className="w-full flex justify-center items-center font-bold text-white bg-orange-500 py-3 rounded-xl">
                <LogIn className="w-5 h-5 mr-2" /> Entrar com Google
              </button>
            ) : (
              <div className="flex items-center justify-between bg-amber-50 p-3 rounded-xl">
                <div className="flex items-center gap-3">
                  {usuario.photoURL && (
                    <img src={usuario.photoURL} alt="Perfil" className="w-10 h-10 rounded-full border-2 border-orange-500" />
                  )}
                  <span className="font-bold text-amber-900">{usuario.displayName || 'Cliente'}</span>
                </div>
                <button onClick={() => { fazerLogout(); setIsMobileMenuOpen(false); }} className="text-red-500 p-2">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
          <a href="#inicio" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-gray-600 hover:text-orange-500 font-medium">Início</a>
          <a href="#produtos" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-gray-600 hover:text-orange-500 font-medium">Produtos</a>
          <a href="#historia" onClick={() => setIsMobileMenuOpen(false)} className="block py-2 text-gray-600 hover:text-orange-500 font-medium">Nossa História</a>
        </div>
      )}
    </header>
  );

  const Hero = () => (
    <section id="inicio" className="relative bg-amber-50 overflow-hidden pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16 sm:pt-20 sm:pb-24 lg:pt-32 lg:pb-40 flex flex-col lg:flex-row items-center">
        <div className="lg:w-1/2 z-10 text-center lg:text-left">
          <span className="text-emerald-600 font-bold tracking-wider uppercase text-sm mb-4 block">
            Tudo para seu melhor amigo 🐶🐱
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-amber-900 leading-tight mb-6">
            Nutrição e alegria <br /> em cada <span className="text-orange-500">tigela.</span>
          </h1>
          <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto lg:mx-0">
            As melhores marcas de ração, petiscos saudáveis e acessórios com entrega rápida em Abreu e Lima e Igarassu. Seu pet merece o melhor!
          </p>
          <div className="flex justify-center lg:justify-start space-x-4">
            <a href="#produtos" className="inline-flex items-center bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition transform hover:-translate-y-1">
              Ver Produtos <ArrowRight className="ml-2 w-5 h-5" />
            </a>
          </div>
        </div>
        <div className="lg:w-1/2 mt-12 lg:mt-0 relative flex justify-center">
          <div className="relative w-72 h-72 sm:w-96 sm:h-96 bg-orange-500 rounded-full flex items-center justify-center shadow-2xl overflow-hidden border-8 border-white">
            <img src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=600&h=600" alt="Cachorro feliz" className="object-cover w-full h-full" />
          </div>
          <div className="absolute top-10 right-10 lg:right-20 bg-white p-3 rounded-full shadow-lg text-2xl animate-bounce">🦴</div>
          <div className="absolute bottom-10 left-10 bg-white p-3 rounded-full shadow-lg text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>🎾</div>
        </div>
      </div>
    </section>
  );

  const ProductGrid = () => (
    <section id="produtos" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-amber-900 mb-4 flex items-center justify-center gap-2">
            Nossos Destaques <Star className="text-yellow-400 fill-current w-8 h-8" />
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">Selecionamos cuidadosamente os melhores produtos para a saúde e felicidade do seu pet.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {PRODUCTS.map(product => (
            <div key={product.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 flex flex-col group">
              <div className="h-48 overflow-hidden relative">
                <img
                  src={product.img}
                  alt={product.name}
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK_IMG; }}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                />
                <span className="absolute top-3 left-3 bg-amber-50 text-amber-900 text-xs font-bold px-2 py-1 rounded shadow">
                  {product.category}
                </span>
              </div>
              <div className="p-5 flex flex-col flex-grow">
                <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">{product.name}</h3>
                <div className="mt-auto flex justify-between items-center pt-4">
                  <span className="text-xl font-extrabold text-orange-500">{formatCurrency(product.price)}</span>
                  <button
                    onClick={() => addToCart(product)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white w-10 h-10 rounded-full flex items-center justify-center transition shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );

  const History = () => (
    <section id="historia" className="py-20 bg-amber-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center gap-12">
        <div className="md:w-1/2 rounded-2xl overflow-hidden shadow-xl">
          <img src="https://images.unsplash.com/photo-1601758174114-e711c0cbaa69?auto=format&fit=crop&q=80&w=800" alt="Interior da nossa loja" className="w-full h-auto object-cover hover:scale-105 transition duration-500" />
        </div>
        <div className="md:w-1/2">
          <h2 className="text-3xl font-bold text-amber-900 mb-6">Nossa História 📖</h2>
          <p className="text-gray-700 mb-4 leading-relaxed">
            A <strong className="text-orange-500">Agamenon Rações</strong> nasceu com o propósito de atender a região metropolitana norte com os melhores produtos do mercado. Agora com duas unidades (Abreu e Lima e Igarassu), estamos sempre perto de você e do seu pet.
          </p>
          <div className="flex space-x-6 mt-6">
            <div className="text-center">
              <h4 className="text-3xl font-extrabold text-emerald-600">2</h4>
              <span className="text-sm text-gray-600">Unidades Físicas</span>
            </div>
            <div className="text-center">
              <h4 className="text-3xl font-extrabold text-emerald-600">100%</h4>
              <span className="text-sm text-gray-600">Foco no seu Pet</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  const Footer = () => (
    <footer id="contato" className="bg-amber-900 text-white pt-16 pb-8 border-t-4 border-orange-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        <div>
          <div className="flex items-center mb-4">
            <PawPrint className="text-orange-500 w-8 h-8 mr-2" />
            <span className="font-bold text-xl tracking-tight">Agamenon <span className="text-orange-500">Rações</span></span>
          </div>
          <p className="text-gray-300 text-sm mb-4">A melhor loja para o seu melhor amigo. Qualidade, carinho e entrega expressa.</p>
        </div>

        <div>
          <h4 className="text-lg font-bold mb-4 text-amber-100">Nossas Lojas 📍</h4>
          <ul className="space-y-4 text-gray-300 text-sm">
            <li className="flex items-start">
              <MapPin className="w-5 h-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Caetés 1</strong><br />
                Rua Cento e Cinquenta e Quatro, 6<br />
                Abreu e Lima, PE<br />
                <span className="text-orange-400 flex items-center mt-1"><Phone className="w-3 h-3 mr-1" /> (81) 98676-9972</span>
              </div>
            </li>
            <li className="flex items-start">
              <MapPin className="w-5 h-5 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Loteamento Agamenon</strong><br />
                Avenida Severino Tavares Uchoa, 57<br />
                Igarassu, PE<br />
                <span className="text-orange-400 flex items-center mt-1"><Phone className="w-3 h-3 mr-1" /> (81) 98454-1740</span>
              </div>
            </li>
            <li className="flex items-center pt-2 border-t border-amber-800"><Mail className="w-5 h-5 text-orange-500 mr-2" /> agamenonracoes@hotmail.com</li>
          </ul>
        </div>

        <div>
          <h4 className="text-lg font-bold mb-4 text-amber-100">Redes Sociais 📱</h4>
          <div className="flex space-x-4">
            <a href="#" className="bg-white/10 hover:bg-orange-500 p-3 rounded-full transition transform hover:scale-110"><FaInstagram className="w-5 h-5" /></a>
            <a href="#" className="bg-white/10 hover:bg-orange-500 p-3 rounded-full transition transform hover:scale-110"><FaFacebook className="w-5 h-5" /></a>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center border-t border-white/20 pt-8 text-xs text-gray-400">
        <p>© {new Date().getFullYear()} Agamenon Rações.</p>
      </div>
    </footer>
  );

  const CartSidebar = () => (
    <>
      {isCartOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />}
      <div className={'fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl transform transition-transform duration-300 z-50 flex flex-col ' + (isCartOpen ? 'translate-x-0' : 'translate-x-full')}>
        <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-amber-50">
          <h2 className="text-lg font-bold text-amber-900 flex items-center">
            <ShoppingCart className="w-5 h-5 mr-2" /> Seu Carrinho
          </h2>
          <button onClick={() => setIsCartOpen(false)} className="text-gray-500 hover:text-red-500 p-2"><X className="w-6 h-6" /></button>
        </div>

        <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50">
          {cart.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">
              <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-300 opacity-50" />
              <p>Seu carrinho está vazio.</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex items-center gap-4 bg-white p-3 rounded-xl shadow-sm border border-gray-100">
                <img src={item.img} alt={item.name} className="w-16 h-16 object-cover rounded-lg border border-gray-100" />
                <div className="flex-grow">
                  <h4 className="text-sm font-bold text-gray-800 line-clamp-1">{item.name}</h4>
                  <p className="text-orange-500 font-bold text-sm">{formatCurrency(item.price)}</p>
                </div>
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button onClick={() => updateQuantity(item.id, -1)} className="w-6 h-6 text-gray-600 bg-white rounded shadow-sm"><Minus className="w-3 h-3 mx-auto" /></button>
                  <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="w-6 h-6 text-gray-600 bg-white rounded shadow-sm"><Plus className="w-3 h-3 mx-auto" /></button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-gray-200 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <div className="flex justify-between font-bold text-lg mb-4 text-amber-900">
            <span>Total:</span>
            <span>{formatCurrency(cartTotal)}</span>
          </div>
          <button
            disabled={cart.length === 0}
            onClick={() => {
              if (!usuario) {
                setIsCartOpen(false);
                addToast("Você precisa entrar na conta para comprar!", 'error');
                fazerLoginComGoogle();
              } else {
                setIsCartOpen(false);
                setIsCheckoutOpen(true);
              }
            }}
            className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl transition disabled:opacity-50 flex items-center justify-center"
          >
            {usuario
              ? <><Lock className="w-4 h-4 mr-2" /> Finalizar Compra</>
              : <><LogIn className="w-4 h-4 mr-2" /> Entrar para Comprar</>}
          </button>
        </div>
      </div>
    </>
  );

  const CheckoutModal = () => {
    if (!isCheckoutOpen) return null;
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <div className="p-5 border-b bg-orange-500 text-white flex justify-between items-center">
            <h3 className="text-xl font-bold flex items-center"><Lock className="w-5 h-5 mr-2" /> Pagamento</h3>
            <button onClick={() => setIsCheckoutOpen(false)} className="text-white hover:text-gray-200"><X className="w-6 h-6" /></button>
          </div>

          <div className="p-6 overflow-y-auto">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 flex items-start text-amber-900 text-sm">
              <ShieldCheck className="w-6 h-6 text-amber-600 mt-0.5 mr-3 flex-shrink-0" />
              <div><strong>Modo demonstração:</strong> nenhum pagamento real é cobrado. Não digite dados reais de cartão.</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-bold text-gray-700 mb-3">Método de Pagamento</h4>
                <div className="space-y-3">
                  <label className={'flex items-center p-3 border rounded-lg cursor-pointer ' + (paymentMethod === 'pix' ? 'border-orange-500 bg-orange-50' : 'hover:bg-gray-50')}>
                    <input type="radio" checked={paymentMethod === 'pix'} onChange={() => setPaymentMethod('pix')} className="text-orange-500" />
                    <span className="ml-3 font-medium flex items-center"><QrCode className="w-5 h-5 text-teal-500 mr-2" /> PIX (5% OFF)</span>
                  </label>
                  <label className={'flex items-center p-3 border rounded-lg cursor-pointer ' + (paymentMethod === 'credit' ? 'border-orange-500 bg-orange-50' : 'hover:bg-gray-50')}>
                    <input type="radio" checked={paymentMethod === 'credit'} onChange={() => setPaymentMethod('credit')} className="text-orange-500" />
                    <span className="ml-3 font-medium flex items-center"><CreditCard className="w-5 h-5 text-blue-500 mr-2" /> Cartão de Crédito</span>
                  </label>
                </div>
                <div className="mt-4 flex justify-between font-bold text-amber-900">
                  <span>Total:</span>
                  <span>{formatCurrency(finalTotal)}</span>
                </div>
              </div>

              {paymentMethod === 'pix' ? (
                <div className="text-center p-4 border border-dashed rounded-lg bg-gray-50">
                  <QrCode className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm font-medium">Escaneie para pagar</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium mb-1">Número do Cartão *</label>
                    <input type="text" placeholder="0000 0000 0000 0000" className="w-full border rounded-lg p-2 text-sm" />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-5 border-t bg-gray-50 flex justify-end gap-3 rounded-b-2xl">
            <button disabled={isProcessing} onClick={() => setIsCheckoutOpen(false)} className="px-4 py-2 font-medium hover:bg-gray-200 rounded-lg">Cancelar</button>
            <button onClick={handlePayment} disabled={isProcessing} className="px-6 py-2 bg-emerald-500 text-white font-bold rounded-lg flex items-center">
              {isProcessing ? "Processando..." : <><Check className="w-5 h-5 mr-2" /> Confirmar</>}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col relative font-sans text-gray-800 bg-gray-50">
      <div className="fixed top-20 right-4 left-4 sm:left-auto z-[70] flex flex-col gap-2 sm:items-end pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={'text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 ' + (toast.type === 'success' ? 'bg-emerald-500' : 'bg-orange-500')}
          >
            <Check className="w-5 h-5" />
            <span className="font-medium">{toast.message}</span>
          </div>
        ))}
      </div>

      {Navigation()}
      <main className="flex-grow">
        {Hero()}
        {ProductGrid()}
        {History()}
      </main>
      {Footer()}

      {/* WHATSAPP - seção fixa no final da página, não acompanha o scroll */}
      <div className="bg-amber-900 border-t border-white/10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h3 className="text-center text-white font-bold text-lg mb-5">Fale com a gente pelo WhatsApp</h3>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="https://wa.me/5581984541740?text=Olá,%20gostaria%20de%20falar%20com%20a%20loja%20de%20Igarassu!"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 text-white py-3 px-6 rounded-full shadow-lg hover:bg-green-600 transition transform hover:scale-105 flex items-center justify-center text-sm font-bold"
            >
              <MessageCircle className="w-5 h-5 mr-2" /> Loja Igarassu
            </a>
            <a
              href="https://wa.me/5581986769972?text=Olá,%20gostaria%20de%20falar%20com%20a%20loja%20de%20Abreu%20e%20Lima!"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-600 text-white py-3 px-6 rounded-full shadow-lg hover:bg-green-700 transition transform hover:scale-105 flex items-center justify-center text-sm font-bold"
            >
              <MessageCircle className="w-5 h-5 mr-2" /> Loja Abreu e Lima
            </a>
          </div>
        </div>
      </div>

      {CartSidebar()}
      {CheckoutModal()}
    </div>
  );
}

