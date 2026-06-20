import React, { useState, useEffect } from 'react';
import { PRODUCTS } from './data/products';
import './App.css';

function App() {
  // Slider Refs
  const trendingSliderRef = React.useRef(null);
  const bestsellerSliderRef = React.useRef(null);

  const scrollSlider = (sliderRef, dir) => {
    if (sliderRef.current) {
      const scrollAmount = sliderRef.current.offsetWidth * 0.8;
      sliderRef.current.scrollBy({ left: dir * scrollAmount, behavior: 'smooth' });
    }
  };

  const decodeToken = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  // 1. Core State
  const [activeView, setActiveView] = useState('home'); // home | shop | product | wishlist
  const [selectedProductId, setSelectedProductId] = useState(null);
  
  const [productsList, setProductsList] = useState(PRODUCTS);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [user, setUser] = useState(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      const decoded = decodeToken(token);
      if (decoded) {
        return {
          isLoggedIn: true,
          name: decoded.name || decoded.mail?.split('@')[0] || 'User',
          role: decoded.role || 'user'
        };
      }
    }
    const saved = localStorage.getItem('nykaa_user');
    return saved ? JSON.parse(saved) : { isLoggedIn: false, name: null, role: 'user' };
  });

  // Dashboard tab states
  const [sellerActiveTab, setSellerActiveTab] = useState('overview');
  const [adminActiveTab, setAdminActiveTab] = useState('overview');

  // Seller add product form
  const [sellerProductForm, setSellerProductForm] = useState({
    name: '',
    brand: '',
    price: '',
    mrp: '',
    stock: '100',
    description: '',
    category: 'makeup',
    subcategory: '',
    imageFile: null
  });

  // Mock Admin/Seller Users and Orders database
  const [mockUsers, setMockUsers] = useState([
    { id: 1, name: 'System Administrator', email: 'admin@gmail.com', role: 'admin', phone: '9999999999' },
    { id: 2, name: 'Rahul (Seller)', email: 'rahulkumardakua01@gmail.com', role: 'seller', phone: '8018047024' },
    { id: 3, name: 'Rahul (User)', email: 'rahulkumardakua09@gmail.com', role: 'user', phone: '7008163981' },
    { id: 4, name: 'Rahul 2', email: 'rahulkumardakua123@gmail.com', role: 'user', phone: '9861006036' }
  ]);

  const [mockOrders, setMockOrders] = useState([
    { id: 102941, user: 'rahulkumardakua09@gmail.com', total_amount: 1950, shipping_address: 'Rahul, Flat 2B, Kazi Bazar, City - 753002', status: 'pending', payment_method: 'card', items: [{ name: 'Retro Matte Lipstick', price: 1950, quantity: 1 }] },
    { id: 102942, user: 'rahulkumardakua123@gmail.com', total_amount: 599, shipping_address: 'Rahul 2, House 4, City - 753001', status: 'delivered', payment_method: 'cod', items: [{ name: 'SuperStay Matte Ink Liquid Lipstick', price: 599, quantity: 1 }] }
  ]);

  // Filter State
  const [filters, setFilters] = useState({
    search: '',
    category: [],
    subcategory: null,
    brand: [],
    price: [],
    rating: null
  });
  const [sort, setSort] = useState('popularity');
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponInput, setCouponInput] = useState('');
  const [couponMessage, setCouponMessage] = useState({ text: '', type: '' });

  // Checkout State
  const [checkoutStep, setCheckoutStep] = useState(0);
  const [checkoutAddress, setCheckoutAddress] = useState({
    name: '',
    address: '',
    pincode: '',
    city: '',
    phone: ''
  });
  const [selectedPayment, setSelectedPayment] = useState('cod');

  // Modals / Drawer toggles
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // login | signup
  const [authForm, setAuthForm] = useState({ name: '', phone: '', email: '', password: '', role: 'user', companyName: '', companyAddress: '', gstin: '' });
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ name: '', email: '', subject: '', message: '' });

  const [toasts, setToasts] = useState([]);

  // Carousel Slider Banner Data
  const heroBanners = [
    {
      id: "banner-1",
      title: "MAC Gold Takeover",
      subtitle: "Flat 15% Off on Iconic Lipsticks & Foundations",
      desc: "Grab Best Seller Ruby Woo & Velvet Teddy, now available in premium combos with complimentary gift bags.",
      image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&auto=format&fit=crop&q=80",
      btnText: "Shop MAC Cosmetics",
      target: { brand: "MAC" }
    },
    {
      id: "banner-2",
      title: "Dermatological Hydration",
      subtitle: "Explore Advanced Hydrating Serums & Cleansers",
      desc: "Get up to 20% Off on Minimalist, CeraVe, and The Ordinary. The ultimate barrier recovery products.",
      image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=1200&auto=format&fit=crop&q=80",
      btnText: "Shop Skincare",
      target: { category: "skin" }
    },
    {
      id: "banner-3",
      title: "Salon Hair Rituals At Home",
      subtitle: "Professional Hair Care range starts at ₹799",
      desc: "Tame frizz, protect colored shafts, and prevent split ends with Olaplex & L'Oreal Professionnel.",
      image: "https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=1200&auto=format&fit=crop&q=80",
      btnText: "Explore Hair Care",
      target: { category: "hair" }
    }
  ];
  const [currentCarouselIndex, setCurrentCarouselIndex] = useState(0);

  // Search Suggestions State
  const [searchSuggestions, setSearchSuggestions] = useState([]);

  // PDP local states
  const [pdpSelectedShade, setPdpSelectedShade] = useState(null);
  const [pdpSelectedSize, setPdpSelectedSize] = useState(null);
  const [pdpActivePrice, setPdpActivePrice] = useState(0);
  const [pdpActiveMrp, setPdpActiveMrp] = useState(0);
  const [pdpActiveImage, setPdpActiveImage] = useState('');
  const [pdpActiveImageIndex, setPdpActiveImageIndex] = useState(0);
  const [pdpActiveTab, setPdpActiveTab] = useState('desc'); // desc | ingredients | how
  const [reviewFormRating, setReviewFormRating] = useState(0);
  const [reviewForm, setReviewForm] = useState({ name: '', comment: '' });

  // 2. Lifecycle Effects
  useEffect(() => {
    fetchProductsFromDB();
    // Sync Hash Router on Load
    const handleHash = () => {
      const hash = window.location.hash || '#home';
      const cleanHash = hash.split('?')[0].replace('#', '');
      setActiveView(cleanHash);

      const params = new URLSearchParams(hash.substring(hash.indexOf('?') + 1));
      if (cleanHash === 'shop') {
        setFilters(prev => ({
          ...prev,
          search: params.get('q') || '',
          category: params.get('category') && params.get('category') !== 'all' ? [params.get('category')] : [],
          subcategory: params.get('subcategory') || null,
          brand: params.get('brand') ? [params.get('brand')] : []
        }));
      }
      if (cleanHash === 'product' && params.has('id')) {
        setSelectedProductId(params.get('id'));
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);

    // Auto Carousel Timer
    const timer = setInterval(() => {
      setCurrentCarouselIndex(prev => (prev + 1) % heroBanners.length);
    }, 5000);

    return () => {
      window.removeEventListener('hashchange', handleHash);
      clearInterval(timer);
    };
  }, []);

  // Sync API Data when login state updates
  useEffect(() => {
    if (user.isLoggedIn) {
      loadCartFromDB();
      loadWishlistFromDB();
    } else {
      setCart([]);
      setWishlist([]);
    }
  }, [user.isLoggedIn]);

  // Close user dropdown menu when clicking anywhere on the document
  useEffect(() => {
    const handleOutsideClick = () => {
      setIsUserMenuOpen(false);
    };
    document.addEventListener('click', handleOutsideClick);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
    };
  }, []);

  // Protect dashboard views and load dashboard data
  useEffect(() => {
    if (activeView === 'admin-dashboard') {
      if (user.role !== 'admin') {
        setActiveView('home');
        window.location.hash = 'home';
        showToast('Access denied. Admin role required.', 'error');
      } else {
        fetchUsersFromDB();
        fetchAllOrdersFromDB();
      }
    }
    if (activeView === 'seller-dashboard') {
      if (user.role !== 'seller') {
        setActiveView('home');
        window.location.hash = 'home';
        showToast('Access denied. Seller role required.', 'error');
      }
    }
  }, [activeView, user.role]);

  // 3. API Integrations
  const getAuthHeaders = (extra = {}) => {
    const token = localStorage.getItem('access_token');
    return token ? { ...extra, Authorization: `Bearer ${token}` } : extra;
  };

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const loadCartFromDB = () => {
    fetch('/add_to_cart/cart', { headers: getAuthHeaders() })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(dbItems => {
        const parsed = dbItems.map(item => {
          const prod = productsList.find(p => p.id === item.product_id || p.name === item.name);
          return {
            id: item.id, // DB item id
            productId: prod ? prod.id : item.product_id,
            name: item.name,
            brand: prod ? prod.brand : 'Generic',
            image: prod ? getProductImage(prod) : getProductFallbackImage('Generic', item.name),
            shade: null,
            size: null,
            price: item.price,
            mrp: prod ? prod.mrp : item.price,
            quantity: item.quantity
          };
        });
        setCart(parsed);
      })
      .catch(() => console.log('Cart fetch failed.'));
  };

  const loadWishlistFromDB = () => {
    fetch('/wishlist/view', { headers: getAuthHeaders() })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(dbItems => {
        const itemIds = dbItems.map(item => {
          const mockProd = productsList[item.product_id - 1];
          return mockProd ? mockProd.id : null;
        }).filter(Boolean);
        setWishlist(itemIds);
      })
      .catch(() => console.log('Wishlist fetch failed.'));
  };

  const fetchProductsFromDB = () => {
    fetch('/products')
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(dbProds => {
        const merged = dbProds.map(dp => {
          const staticMatch = PRODUCTS.find(sp => sp.name.toLowerCase() === dp.name.toLowerCase());
          if (staticMatch) {
            return {
              ...staticMatch,
              id: dp.id,
              price: dp.price,
              stock: dp.stock,
              images: [dp.imageurl.startsWith('upload/') ? `/${dp.imageurl}` : dp.imageurl, ...(staticMatch.images ? staticMatch.images.slice(1) : [])]
            };
          } else {
            return {
              id: dp.id,
              name: dp.name,
              brand: 'Generic',
              price: dp.price,
              mrp: dp.price,
              discount: 0,
              stock: dp.stock,
              description: 'No description available.',
              category: 'makeup',
              subcategory: null,
              images: [dp.imageurl.startsWith('upload/') ? `/${dp.imageurl}` : dp.imageurl],
              rating: 5.0,
              reviewsCount: 1,
              tags: ['New']
            };
          }
        });
        setProductsList(merged);
      })
      .catch(() => console.log('Failed to fetch products from backend, using local defaults.'));
  };

  const fetchUsersFromDB = () => {
    fetch('/admin/users', { headers: getAuthHeaders() })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setMockUsers(data);
      })
      .catch(() => console.log('Failed to fetch users.'));
  };

  const fetchAllOrdersFromDB = () => {
    fetch('/order/all', { headers: getAuthHeaders() })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setMockOrders(data);
      })
      .catch(() => console.log('Failed to fetch orders.'));
  };

  // 4. Cart Logic
  const handleAddToCart = (productId, qty = 1, shade = null, size = null, price = null, mrp = null) => {
    const product = productsList.find(p => p.id === productId);
    if (!product) return;

    if (!user.isLoggedIn) {
      showToast('Please login to manage your bag', 'info');
      setIsAuthOpen(true);
      return;
    }

    // Call backend API to add
    fetch('/add_to_cart/addtocart', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        name: product.name,
        quantity: qty
      })
    })
      .then(res => {
        if (!res.ok) throw new Error('Database Error');
        return res.json();
      })
      .then(() => {
        loadCartFromDB();
        showToast('Item added to Bag!');
        setIsCartOpen(true);
      })
      .catch(() => showToast('Failed to add item to Bag', 'error'));
  };

  const handleUpdateCartQty = (cartItem, change) => {
    const targetQty = cartItem.quantity + change;
    if (targetQty <= 0) {
      handleRemoveFromCart(cartItem.id);
      return;
    }

    fetch(`/add_to_cart/update/${cartItem.id}`, {
      method: 'PUT',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ quantity: targetQty })
    })
      .then(res => {
        if (!res.ok) throw new Error();
        loadCartFromDB();
      })
      .catch(() => showToast('Could not update quantity', 'error'));
  };

  const handleRemoveFromCart = (dbItemId) => {
    fetch(`/add_to_cart/delete_item/${dbItemId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
      .then(res => {
        if (!res.ok) throw new Error();
        loadCartFromDB();
        showToast('Item removed from Bag');
      })
      .catch(() => showToast('Could not remove item', 'error'));
  };

  // 5. Wishlist Logic
  const getWishlistProductIdForDB = (productId) => {
    const idx = productsList.findIndex(p => p.id === productId);
    return idx > -1 ? idx + 1 : 1;
  };

  const handleToggleWishlist = (productId) => {
    if (!user.isLoggedIn) {
      showToast('Please login to manage your wishlist', 'info');
      setIsAuthOpen(true);
      return;
    }

    const isWishlisted = wishlist.includes(productId);
    if (isWishlisted) {
      // Find database ID for the wishlist entry
      fetch('/wishlist/view', { headers: getAuthHeaders() })
        .then(res => res.json())
        .then(items => {
          const intId = getWishlistProductIdForDB(productId);
          const match = items.find(i => i.product_id === intId);
          if (match) {
            return fetch(`/wishlist/delete/${match.wishlist_item_id}`, {
              method: 'DELETE',
              headers: getAuthHeaders()
            });
          }
        })
        .then(() => {
          loadWishlistFromDB();
          showToast('Item removed from Wishlist', 'info');
        })
        .catch(() => showToast('Could not remove item from wishlist', 'error'));
    } else {
      const intId = getWishlistProductIdForDB(productId);
      fetch('/wishlist/add', {
        method: 'POST',
        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ product_id: intId })
      })
        .then(res => {
          if (!res.ok) throw new Error();
          loadWishlistFromDB();
          showToast('Item added to Wishlist!');
        })
        .catch(() => showToast('Could not add to wishlist', 'error'));
    }
  };

  // 6. Checkout & Payment
  const calculateCartTotals = () => {
    const subtotal = cart.reduce((acc, curr) => acc + (curr.price * curr.quantity), 0);
    let shipping = subtotal >= 499 || subtotal === 0 ? 0 : 40;
    let discount = 0;

    if (couponApplied === 'NYKAA20') {
      discount = Math.round(subtotal * 0.2); // 20% Off
    }

    const grandTotal = subtotal + shipping - discount;
    return { subtotal, shipping, discount, grandTotal };
  };

  const totals = calculateCartTotals();

  const handleCheckoutTrigger = () => {
    if (cart.length === 0) {
      showToast('Your bag is empty', 'info');
      return;
    }
    setIsCartOpen(false);
    if (!user.isLoggedIn) {
      showToast('Please login to proceed to checkout', 'info');
      setAuthMode('login');
      setIsAuthOpen(true);
    } else {
      setCheckoutStep(1);
      setCheckoutStepUI();
    }
  };

  const setCheckoutStepUI = () => {
    // Simply sets view
  };

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    if (!checkoutAddress.name || !checkoutAddress.address || !checkoutAddress.pincode || !checkoutAddress.city || !checkoutAddress.phone) {
      showToast('Please fill all address fields', 'info');
      return;
    }
    setCheckoutStep(2);
  };

  const handlePlaceOrder = async () => {
    const fullAddress = `${checkoutAddress.name}, ${checkoutAddress.address}, ${checkoutAddress.city} - ${checkoutAddress.pincode} (Phone: ${checkoutAddress.phone})`;
    submitOrderToDB(fullAddress, selectedPayment);
  };

  const submitOrderToDB = (shippingAddress, paymentMethod) => {
    fetch('/order/place', {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        shipping_address: shippingAddress,
        payment_method: paymentMethod
      })
    })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(() => {
        setCart([]);
        setCheckoutStep(3);
        showToast('Order placed successfully!');
      })
      .catch(() => showToast('Failed to place order. Check product stock.', 'error'));
  };

  // 7. Authentication handlers
  const handleLogin = (e) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      showToast('Please fill all login fields', 'info');
      return;
    }

    // Direct mock login check for admin or local seller (fallback testing mode)
    const mockUserMatch = mockUsers.find(u => u.email === loginForm.email);
    if (mockUserMatch && loginForm.password === 'Password@123') {
      const userState = { isLoggedIn: true, name: mockUserMatch.name, role: mockUserMatch.role };
      setUser(userState);
      localStorage.setItem('nykaa_user', JSON.stringify(userState));
      setIsAuthOpen(false);
      showToast(`Welcome back (Test Mode), ${mockUserMatch.name}!`);
      setLoginForm({ email: '', password: '' });

      if (mockUserMatch.role === 'admin') {
        setActiveView('admin-dashboard');
        window.location.hash = 'admin-dashboard';
      } else if (mockUserMatch.role === 'seller') {
        setActiveView('seller-dashboard');
        window.location.hash = 'seller-dashboard';
      } else {
        setActiveView('home');
        window.location.hash = 'home';
      }
      return;
    }

    fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mail: loginForm.email,
        password: loginForm.password
      })
    })
      .then(async res => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || 'Invalid credentials');
        }
        return res.json();
      })
      .then(data => {
        localStorage.setItem('access_token', data.token);
        const decoded = decodeToken(data.token);
        const userRole = decoded?.role || 'user';
        const userState = { isLoggedIn: true, name: decoded?.name || loginForm.email.split('@')[0], role: userRole };
        setUser(userState);
        localStorage.setItem('nykaa_user', JSON.stringify(userState));
        setIsAuthOpen(false);
        showToast('Login Successful!');
        setLoginForm({ email: '', password: '' });

        if (userRole === 'admin') {
          setActiveView('admin-dashboard');
          window.location.hash = 'admin-dashboard';
        } else if (userRole === 'seller') {
          setActiveView('seller-dashboard');
          window.location.hash = 'seller-dashboard';
        } else {
          setActiveView('home');
          window.location.hash = 'home';
        }
      })
      .catch(err => showToast(err.message || 'Login failed', 'error'));
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!authForm.name || !authForm.phone || !authForm.email || !authForm.password) {
      showToast('Please fill all fields', 'info');
      return;
    }

    if (authForm.role === 'seller') {
      fetch('/seller/seller_register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: authForm.name,
          phone: authForm.phone,
          mail: authForm.email,
          password: authForm.password,
          shopname: authForm.companyName || "Seller",
          gstnumber: parseInt(authForm.gstin) || 0,
          address: authForm.companyAddress || "Address"
        })
      })
        .then(async res => {
          if (!res.ok) {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.detail || 'Seller registration failed.');
          }
          return res.json();
        })
        .then(() => {
          showToast('Seller registration successful! You can now log in.', 'success');
          setIsAuthOpen(false);
          setAuthMode('login');
          setAuthForm({ name: '', phone: '', email: '', password: '', role: 'user', companyName: '', companyAddress: '', gstin: '' });
        })
        .catch(err => showToast(err.message || 'Registration failed', 'error'));
      return;
    }

    fetch('/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: authForm.name,
        phone: authForm.phone,
        mail: authForm.email,
        password: authForm.password
      })
    })
      .then(async res => {
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || 'User already exists or inputs invalid.');
        }
        return res.json();
      })
      .then(() => {
        showToast('Verification email sent! Please check your inbox.');
        setIsAuthOpen(false);
        setAuthForm({ name: '', phone: '', email: '', password: '', role: 'user', companyName: '', companyAddress: '', gstin: '' });
      })
      .catch(err => showToast(err.message || 'Registration failed', 'error'));
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('nykaa_user');
    setUser({ isLoggedIn: false, name: null, role: 'user' });
    setActiveView('home');
    window.location.hash = 'home';
    showToast('Logged out successfully', 'info');
  };

  const fetchOrdersHistory = () => {
    setOrdersLoading(true);
    fetch('/order/order_history', { headers: getAuthHeaders() })
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setOrders(data);
        setOrdersLoading(false);
      })
      .catch(() => {
        setOrders([]);
        setOrdersLoading(false);
      });
  };

  // 8. Contact Form Handler
  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.subject || !contactForm.message) {
      showToast('Please fill all contact fields', 'info');
      return;
    }
    // Simulation / Mock Send
    showToast('Message sent! We will contact you soon.');
    setIsContactOpen(false);
    setContactForm({ name: '', email: '', subject: '', message: '' });
  };

  // 9. Coupon Handler
  const handleApplyCoupon = () => {
    if (cart.length === 0) {
      showToast('Add items to Bag first', 'info');
      return;
    }
    const code = couponInput.trim().toUpperCase();
    if (code === 'NYKAA20') {
      setCouponApplied('NYKAA20');
      setCouponMessage({ text: 'Coupon applied! 20% discount added.', type: 'success' });
      showToast('Coupon applied!');
    } else {
      setCouponApplied(null);
      setCouponMessage({ text: 'Invalid coupon. Try NYKAA20', type: 'error' });
      showToast('Invalid Coupon Code', 'info');
    }
  };

  // Helper selectors
  const getProductImage = (product) => {
    return product.images && product.images.length > 0
      ? product.images[0]
      : getProductFallbackImage(product.brand, product.name);
  };

  const getProductFallbackImage = (brand = 'Nykaa', name = 'Product') => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="600" viewBox="0 0 600 600">
        <rect width="600" height="600" fill="#fff6fa"/>
        <text x="300" y="300" text-anchor="middle" font-family="Arial" font-size="36" fill="#fc2779">${brand}</text>
        <text x="300" y="350" text-anchor="middle" font-family="Arial" font-size="20" fill="#5a6e7f">${name.slice(0, 30)}</text>
      </svg>
    `;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  };

  const generateStarsHTML = (rating) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const stars = [];
    for (let i = 0; i < full; i++) stars.push(<i key={`f-${i}`} className="fa-solid fa-star"></i>);
    if (half) stars.push(<i key="h" className="fa-solid fa-star-half-stroke"></i>);
    const empty = 5 - stars.length;
    for (let i = 0; i < empty; i++) stars.push(<i key={`e-${i}`} className="fa-regular fa-star"></i>);
    return stars;
  };

  // Filter & Sort Products
  const getFilteredProducts = () => {
    let list = [...productsList];

    // Search
    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.brand.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q)
      );
    }

    // Category
    if (filters.category.length > 0) {
      list = list.filter(p => filters.category.includes(p.category));
    }

    // Subcategory
    if (filters.subcategory) {
      list = list.filter(p => p.subcategory === filters.subcategory);
    }

    // Brand
    if (filters.brand.length > 0) {
      list = list.filter(p => filters.brand.includes(p.brand));
    }

    // Rating
    if (filters.rating) {
      list = list.filter(p => p.rating >= filters.rating);
    }

    // Price
    if (filters.price.length > 0) {
      list = list.filter(p => {
        let ok = false;
        filters.price.forEach(r => {
          if (r === '0-500' && p.price <= 500) ok = true;
          if (r === '500-1500' && p.price > 500 && p.price <= 1500) ok = true;
          if (r === '1500-3000' && p.price > 1500 && p.price <= 3000) ok = true;
          if (r === '3000-above' && p.price > 3000) ok = true;
        });
        return ok;
      });
    }

    // Sort
    if (sort === 'popularity') list.sort((a, b) => b.reviewsCount - a.reviewsCount);
    else if (sort === 'price-low') list.sort((a, b) => a.price - b.price);
    else if (sort === 'price-high') list.sort((a, b) => b.price - a.price);
    else if (sort === 'rating') list.sort((a, b) => b.rating - a.rating);
    else if (sort === 'discount') list.sort((a, b) => b.discount - a.discount);

    return list;
  };

  const filteredProducts = getFilteredProducts();
  const selectedProduct = productsList.find(p => p.id === selectedProductId);

  // Auto configure selected product state when navigating to PDP
  useEffect(() => {
    if (selectedProduct) {
      setPdpSelectedShade(selectedProduct.shades?.length ? selectedProduct.shades[0].name : null);
      setPdpSelectedSize(selectedProduct.sizes?.length ? selectedProduct.sizes[0].name : null);
      setPdpActivePrice(selectedProduct.sizes?.length ? selectedProduct.sizes[0].price : selectedProduct.price);
      setPdpActiveMrp(selectedProduct.sizes?.length ? selectedProduct.sizes[0].mrp : selectedProduct.mrp);
      setPdpActiveImage(getProductImage(selectedProduct));
      setPdpActiveImageIndex(0);
      setReviewFormRating(0);
      setReviewForm({ name: '', comment: '' });
    }
  }, [selectedProductId]);

  return (
    <div className="nykaa-app-wrapper">
      
      {/* TOAST SYSTEM ALERTS */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className="toast">
            <i className={`fa-solid ${t.type === 'success' ? 'fa-circle-check success' : 'fa-circle-info info'}`}></i>
            <span>{t.message}</span>
          </div>
        ))}
      </div>

      {/* HEADER NAVBAR */}
      <header>
        <div className="top-banner-strip">
          <span>FREE SHIPPING ON ORDERS ABOVE ₹499 • 100% AUTHENTIC PRODUCTS</span>
        </div>

        <div className="container navbar-main">
          {/* Nykaa Styled Logo */}
          <div className="logo-container" onClick={() => { setActiveView('home'); window.location.hash = 'home'; }}>
            <svg viewBox="0 0 512 250" style={{ height: '32px', width: 'auto', cursor: 'pointer' }}>
              <path d="M157.9 57.2c5-9.6-11.2-6.9-11.2-6.9-5.8 0-8.4 7-9.6 9l-17.5 34.5c-3.3 5.7-14.2 30.1-17.8 35.5-.3-5.5.1-16.5.2-19.1.7-10.4 1.4-18.3 2.5-27.8.8-7.4 2.4-15.7.9-23.1-1-4.6-2.5-4.9-9.1-5.6-6.9-.7-11.6 9.3-13.9 14-8.4 17.4-17.8 34.4-25.3 52.2-2.2 5.2-4.9 10.4-7.2 15.5-2.7 6.2-5.2 12.3-8.1 18.4-3.1 6.4-12.8 27.4-15.5 34-3 7.2-3.6 13 8.4 12.7 1.9 0 6.1.4 11.3-5.2 4.1-4.4 4.9-8.5 7.3-14.6 8.6-21.6 14.7-35.9 24.1-57.3.9-2.1 3-8.2 5.1-12.9-.1 6.7-1.2 14.7-1.7 20-1.6 19.4-2.7 38.1-4.4 57.3-.2 2.6-.9 5.7.3 8.1 1.2 2.4 4.2 3 6.6 3.3 9.6 1.2 10.6-3.6 13.6-10.2 2.7-5.9 4.3-10.7 6.7-16.7 7.4-18.5 15.2-36.8 23.8-54.8 2.2-4.6 4.4-9.1 6.8-13.6 4.4-8.3 8-16.1 12.8-25.3 3.6-6.6 7.1-14.1 10.9-21.4zm329.5 52.1c-1.1-11.1-16.3-5.5-25.4-3.8-3.4.6-13.9 2.6-26 4.9-.5-12.5-.3-10-.4-17.6-.3-11-.9-19.6-1.5-29.3-.4-6.1-1.3-14.6-12.3-13-12.8 1.8-14.9 8.2-18.3 15.9-8.9 20.1-8.6 20.2-18.7 42.6-.8 1.7-4.5 10.7-5.1 12.5-.4.1-1.2.3-2.2.6-4.1.9-9.1 2-14.6 3.2l.1-.5c1.3-10.2 2.9-20.4 4.3-30.6 1.3-9.3 2.7-24.5 3.8-33.8 1.2-10-10.4-9.8-10.4-9.8-7.1-.4-9.8 1.7-14.3 7.5-7.7 10-17 20.8-25.2 31.8-14.9 19.9-25.8 34.9-39.3 54.9-3.9 5.8-9.9 14.6-15.1 21.5-3.5-6.9-6.5-14.5-9.4-21.5-4.2-10-7.3-16.2-9.3-22.8-1.8-5.8.4-6.6 4.7-9.9 12.4-9.4 26.4-15.9 39.1-24.9 9-6.4 19.8-13.5 28.6-20.1 0 0 5.1-3 7.9-6.8 3.5-4.8-6.4-9.8-6.4-9.8-5.6-.9-8.7.4-12.6 2.2-4 1.8-9.2 5.9-12.6 8.6-7.5 5.8-17 12.7-24.4 18.5-9.1 7.1-15.3 11.5-25.3 17.4l25.4-38c8.3-10.7-13.7-13.7-22.1-2.4-7.8 10.1-13.1 19-19.2 28.2-14.7 21.9-26.8 44.9-38.9 69-4.6 9.2-9.1 18.8-13.3 28.3-2 4.6-7.9 15.2.2 16.3 17.3 2.2 20.1-6 24-15.9 6.4-16.3 8.5-19.3 12.6-29.4 4-9.8 6.9-15.4 11.4-23.8.1-.1 1.4-2.2 1.4-2.2.8 1.7 6.1 19.3 6.8 21.3 3.6 9.5 9.9 31.7 13.5 41.8 2.6 8.4 3.3 10.8 14.6 10.5 5.6-.1 8-2.3 11.7-9.3s19.7-36.8 19.7-36.8c4.8-.8 11.7-2 16.2-2.8.8-.1 2.6-.5 5.1-1 1.7-.2 3.1-.5 4.2-.8.1 0 .1 0 .2-.1 4.4-.9 10-2 16.1-3.2-1.1 5.5-4.5 17.6-5.2 20.7 0 0-7.4 28.8 2.2 30.3 6 .9 9.1-.1 9.1-.1 11.2-1.3 11.4-16.4 11.4-16.4l6.1-39.1c4.4-.9 8.8-1.8 13.1-2.6l-13.2 44.6c-1.9 6.3-3.3 14.4 8 14.4 9.2.5 9.8-5.3 9.8-5.3.2-.9 7.5-24.4 9.3-32.8 1.2-5.4 5.5-19.3 7.2-24.9 4.8-.9 8.4-1.6 10.1-1.9 2-.3 5.9-1 11-1.8-.1 5.2 0 12.4.1 13.4 1.1 15.8-.1 32.2 3.2 47.7.5 2.5 1.5 5.7 4.7 5.7 3.8 0 5-.4 9-.7 11.6-1 9.5-12.7 8.8-20.1-.8-8.2-1.6-15.1-2.7-23.3-.9-6.7-1.5-15.5-1.6-26.1v-.2c19-3.2 39.5-6.7 42.5-7.2 4.8-1.3 8.8-.9 7.8-11.9zm-148.5 21c0 .1-.1.1-.1.2-13.3 2.9-25.8 5.7-32.8 7.3 7-11.7 37.8-54.3 42.5-59.3-2.6 13.2-6.8 37.7-9.6 51.8zm76.8-16.8v.7c-6.4 1.2-12.4 2.4-17.2 3.3 6.1-15.8 12.5-35.2 16.3-45-.3 7.3 1.2 33.8.9 41zM229.2 66.4c2-3.7 6.5-11 .9-13.8-3.3-1.6-7.7-2.6-11.1-.9-2.8 1.5-4.9 4.4-6.3 7.1l-21.4 33.7c-3.5 4.8-6.8 10.8-13.9 11.6-4.7.5-8.1-1.5-8-5.7.1-4.3 2.6-10 4.5-13.7 5.6-10.6 6.3-14.2 11.7-24.7 5.2-10.1-11.8-12.4-16-5.1-3 5.2-8.8 15-10.1 18.3-2.4 6-20.4 34.6-12.6 45.9 10 12.8 36.6-7.4 23 15.9-11 18.7-17.9 29.4-27.5 46.7-2.1 3.7-4.7 7.4-5.4 11.8-1 6.2 7.5 6.1 11.2 5.9 6.5-.5 9.6-3.5 12.2-9.4 1.4-3.1 3.3-6.9 4.7-10 12.6-27.5 26-51.4 42.6-78 7.9-12.6 14.9-23.4 21.5-35.6z" fill="#fc2779"></path>
            </svg>
          </div>

          {/* Search Bar */}
          <div className="search-container">
            <div className="search-box-wrapper">
              <i className="fa-solid fa-magnifying-glass"></i>
              <input 
                type="text" 
                placeholder="Search for products, brands and categories..." 
                value={filters.search}
                onChange={(e) => {
                  const val = e.target.value;
                  setFilters(prev => ({ ...prev, search: val }));
                  
                  // Simple autocomplete matching
                  if (val.trim()) {
                    const matches = productsList.filter(p => 
                      p.name.toLowerCase().includes(val.toLowerCase()) ||
                      p.brand.toLowerCase().includes(val.toLowerCase())
                    ).slice(0, 5);
                    setSearchSuggestions(matches);
                  } else {
                    setSearchSuggestions([]);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setSearchSuggestions([]);
                    setActiveView('shop');
                    window.location.hash = `shop?q=${encodeURIComponent(filters.search)}`;
                  }
                }}
              />
            </div>
            {/* Search Suggestions Drawer */}
            {searchSuggestions.length > 0 && (
              <div className="search-suggestions active">
                {searchSuggestions.map(item => (
                  <div key={item.id} className="suggestion-item" onClick={() => {
                    setSearchSuggestions([]);
                    setSelectedProductId(item.id);
                    setActiveView('product');
                    window.location.hash = `product?id=${item.id}`;
                  }}>
                    <i className="fa-solid fa-magnifying-glass"></i>
                    <div>
                      <strong style={{ color: 'var(--text-main)', fontSize: '13px' }}>{item.brand}</strong> - {item.name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Action Panel Buttons */}
          <div className="nav-actions">
            <button className="nav-btn" onClick={() => { setActiveView('wishlist'); window.location.hash = 'wishlist'; }}>
              <i className="fa-regular fa-heart"></i>
              <span>Wishlist</span>
              {wishlist.length > 0 && <span className="badge-count">{wishlist.length}</span>}
            </button>

            <button className="nav-btn" onClick={() => setIsCartOpen(true)}>
              <i className="fa-solid fa-bag-shopping"></i>
              <span>Bag</span>
              {cart.length > 0 && <span className="badge-count">{cart.reduce((a,c) => a + c.quantity, 0)}</span>}
            </button>

            <div className="user-menu-wrapper" style={{ position: 'relative' }}>
              {user.isLoggedIn ? (
                <div className="logged-in-wrapper">
                  <button className="nav-btn user-btn" onClick={(e) => { e.stopPropagation(); setIsUserMenuOpen(prev => !prev); }}>
                    Hi, {user.name || 'User'}
                  </button>
                  <div className={`user-dropdown ${isUserMenuOpen ? 'active' : ''}`}>
                    {user.role === 'admin' && (
                      <div className="user-dropdown-item" onClick={() => { setActiveView('admin-dashboard'); window.location.hash = 'admin-dashboard'; }}>
                        <i className="fa-solid fa-user-shield"></i> Admin Panel
                      </div>
                    )}
                    {user.role === 'seller' && (
                      <div className="user-dropdown-item" onClick={() => { setActiveView('seller-dashboard'); window.location.hash = 'seller-dashboard'; }}>
                        <i className="fa-solid fa-store"></i> Seller Panel
                      </div>
                    )}
                    <div className="user-dropdown-item" onClick={() => { setActiveView('wishlist'); window.location.hash = 'wishlist'; }}>
                      <i className="fa-regular fa-heart"></i> My Wishlist
                    </div>
                    <div className="user-dropdown-item" onClick={() => { fetchOrdersHistory(); setIsOrdersOpen(true); }}>
                      <i className="fa-solid fa-box-archive"></i> My Orders
                    </div>
                    <div className="user-dropdown-item logout-item" onClick={handleLogout}>
                      <i className="fa-solid fa-power-off"></i> Log Out
                    </div>
                  </div>
                </div>
              ) : (
                <button className="signin-btn" onClick={() => { setAuthMode('login'); setIsAuthOpen(true); }}>Login</button>
              )}
            </div>
          </div>
        </div>

        {/* CATEGORIES SUB-NAVBAR */}
        <nav className="navbar-categories">
          <ul className="category-links">
            <li className="category-item">
              <span className="category-link" onClick={() => {
                setFilters({ search: '', category: [], subcategory: null, brand: [], price: [], rating: null });
                setActiveView('shop');
                window.location.hash = 'shop';
              }}>All Products</span>
            </li>
            
            <li className="category-item">
              <span className="category-link" onClick={() => {
                setFilters(prev => ({ ...prev, category: ['makeup'], subcategory: null, search: '' }));
                setActiveView('shop');
                window.location.hash = 'shop?category=makeup';
              }}>Makeup</span>
              <div className="mega-dropdown">
                <div className="mega-column">
                  <h4>Lips</h4>
                  <ul>
                    <li><span className="mega-link" onClick={() => { setFilters(prev => ({ ...prev, category: ['makeup'], subcategory: 'lips', search: '' })); setActiveView('shop'); window.location.hash = 'shop?category=makeup&subcategory=lips'; }}>Lipsticks</span></li>
                    <li><span className="mega-link" onClick={() => { setFilters(prev => ({ ...prev, category: ['makeup'], subcategory: 'lips', search: '' })); setActiveView('shop'); window.location.hash = 'shop?category=makeup&subcategory=lips'; }}>Liquid Lips</span></li>
                    <li><span className="mega-link" onClick={() => { setFilters(prev => ({ ...prev, category: ['makeup'], subcategory: 'lips', search: '' })); setActiveView('shop'); window.location.hash = 'shop?category=makeup&subcategory=lips'; }}>Lip Crayon</span></li>
                  </ul>
                </div>
                <div className="mega-column">
                  <h4>Face</h4>
                  <ul>
                    <li><span className="mega-link" onClick={() => { setFilters(prev => ({ ...prev, category: ['makeup'], subcategory: 'face', search: '' })); setActiveView('shop'); window.location.hash = 'shop?category=makeup&subcategory=face'; }}>Foundations</span></li>
                    <li><span className="mega-link" onClick={() => { setFilters(prev => ({ ...prev, category: ['makeup'], subcategory: 'face', search: '' })); setActiveView('shop'); window.location.hash = 'shop?category=makeup&subcategory=face'; }}>Compact Powders</span></li>
                    <li><span className="mega-link" onClick={() => { setFilters(prev => ({ ...prev, category: ['makeup'], subcategory: 'face', search: '' })); setActiveView('shop'); window.location.hash = 'shop?category=makeup&subcategory=face'; }}>Blushers</span></li>
                  </ul>
                </div>
                <div className="mega-column">
                  <h4>Eyes</h4>
                  <ul>
                    <li><span className="mega-link" onClick={() => { setFilters(prev => ({ ...prev, category: ['makeup'], subcategory: 'eyes', search: '' })); setActiveView('shop'); window.location.hash = 'shop?category=makeup&subcategory=eyes'; }}>Kajals</span></li>
                    <li><span className="mega-link" onClick={() => { setFilters(prev => ({ ...prev, category: ['makeup'], subcategory: 'eyes', search: '' })); setActiveView('shop'); window.location.hash = 'shop?category=makeup&subcategory=eyes'; }}>Mascaras</span></li>
                    <li><span className="mega-link" onClick={() => { setFilters(prev => ({ ...prev, category: ['makeup'], subcategory: 'eyes', search: '' })); setActiveView('shop'); window.location.hash = 'shop?category=makeup&subcategory=eyes'; }}>Eyeshadows</span></li>
                  </ul>
                </div>
                <div className="mega-image-col" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300')" }}>
                  <h5>Bold Colors</h5>
                  <p>Explore luxury cosmetics</p>
                </div>
              </div>
            </li>

            <li className="category-item">
              <span className="category-link" onClick={() => {
                setFilters(prev => ({ ...prev, category: ['skin'], subcategory: null, search: '' }));
                setActiveView('shop');
                window.location.hash = 'shop?category=skin';
              }}>Skin</span>
              <div className="mega-dropdown">
                <div className="mega-column">
                  <h4>Moisturizers</h4>
                  <ul>
                    <li><span className="mega-link" onClick={() => { setFilters(prev => ({ ...prev, category: ['skin'], subcategory: 'moisturizer', search: '' })); setActiveView('shop'); window.location.hash = 'shop?category=skin&subcategory=moisturizer'; }}>Creams & Gels</span></li>
                    <li><span className="mega-link" onClick={() => { setFilters(prev => ({ ...prev, category: ['skin'], subcategory: 'moisturizer', search: '' })); setActiveView('shop'); window.location.hash = 'shop?category=skin&subcategory=moisturizer'; }}>Face Oils</span></li>
                  </ul>
                </div>
                <div className="mega-column">
                  <h4>Serums & Cleansers</h4>
                  <ul>
                    <li><span className="mega-link" onClick={() => { setFilters(prev => ({ ...prev, category: ['skin'], subcategory: 'serum', search: '' })); setActiveView('shop'); window.location.hash = 'shop?category=skin&subcategory=serum'; }}>Acne Serums</span></li>
                    <li><span className="mega-link" onClick={() => { setFilters(prev => ({ ...prev, category: ['skin'], subcategory: 'serum', search: '' })); setActiveView('shop'); window.location.hash = 'shop?category=skin&subcategory=serum'; }}>Hydration Serums</span></li>
                    <li><span className="mega-link" onClick={() => { setFilters(prev => ({ ...prev, category: ['skin'], subcategory: 'cleanser', search: '' })); setActiveView('shop'); window.location.hash = 'shop?category=skin&subcategory=cleanser'; }}>Facial Wash</span></li>
                  </ul>
                </div>
                <div className="mega-column">
                  <h4>Sun Care</h4>
                  <ul>
                    <li><span className="mega-link" onClick={() => { setFilters(prev => ({ ...prev, category: ['skin'], subcategory: 'sunscreen', search: '' })); setActiveView('shop'); window.location.hash = 'shop?category=skin&subcategory=sunscreen'; }}>Sunblock SPF 50</span></li>
                    <li><span className="mega-link" onClick={() => { setFilters(prev => ({ ...prev, category: ['skin'], subcategory: 'sunscreen', search: '' })); setActiveView('shop'); window.location.hash = 'shop?category=skin&subcategory=sunscreen'; }}>Matte Sunscreen</span></li>
                  </ul>
                </div>
                <div className="mega-image-col" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?w=300')" }}>
                  <h5>Clean Care Routine</h5>
                  <p>Dermatologically verified serums</p>
                </div>
              </div>
            </li>

            <li className="category-item">
              <span className="category-link" onClick={() => {
                setFilters(prev => ({ ...prev, category: ['hair'], subcategory: null, search: '' }));
                setActiveView('shop');
                window.location.hash = 'shop?category=hair';
              }}>Hair</span>
              <div className="mega-dropdown">
                <div className="mega-column">
                  <h4>Wash</h4>
                  <ul>
                    <li><span className="mega-link" onClick={() => { setFilters(prev => ({ ...prev, category: ['hair'], subcategory: 'shampoo', search: '' })); setActiveView('shop'); window.location.hash = 'shop?category=hair&subcategory=shampoo'; }}>Shampoos</span></li>
                    <li><span className="mega-link" onClick={() => { setFilters(prev => ({ ...prev, category: ['hair'], subcategory: 'shampoo', search: '' })); setActiveView('shop'); window.location.hash = 'shop?category=hair&subcategory=shampoo'; }}>Conditioners</span></li>
                  </ul>
                </div>
                <div className="mega-column">
                  <h4>Treatments</h4>
                  <ul>
                    <li><span className="mega-link" onClick={() => { setFilters(prev => ({ ...prev, category: ['hair'], subcategory: 'hair-treatment', search: '' })); setActiveView('shop'); window.location.hash = 'shop?category=hair&subcategory=hair-treatment'; }}>Hair Masks</span></li>
                    <li><span className="mega-link" onClick={() => { setFilters(prev => ({ ...prev, category: ['hair'], subcategory: 'hair-treatment', search: '' })); setActiveView('shop'); window.location.hash = 'shop?category=hair&subcategory=hair-treatment'; }}>Oils & Serums</span></li>
                  </ul>
                </div>
                <div className="mega-image-col" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=300')" }}>
                  <h5>Lustrous Locks</h5>
                  <p>Strengthen your roots</p>
                </div>
              </div>
            </li>

            <li className="category-item">
              <span className="category-link" onClick={() => {
                setFilters(prev => ({ ...prev, category: ['fragrance'], subcategory: null, search: '' }));
                setActiveView('shop');
                window.location.hash = 'shop?category=fragrance';
              }}>Fragrance</span>
              <div className="mega-dropdown">
                <div className="mega-column">
                  <h4>Luxury Perfumes</h4>
                  <ul>
                    <li><span className="mega-link" onClick={() => { setFilters(prev => ({ ...prev, category: ['fragrance'], subcategory: 'perfume', search: '' })); setActiveView('shop'); window.location.hash = 'shop?category=fragrance&subcategory=perfume'; }}>Eau De Parfum</span></li>
                    <li><span className="mega-link" onClick={() => { setFilters(prev => ({ ...prev, category: ['fragrance'], subcategory: 'perfume', search: '' })); setActiveView('shop'); window.location.hash = 'shop?category=fragrance&subcategory=perfume'; }}>Eau De Toilette</span></li>
                  </ul>
                </div>
                <div className="mega-column">
                  <h4>Daily Freshness</h4>
                  <ul>
                    <li><span className="mega-link" onClick={() => { setFilters(prev => ({ ...prev, category: ['fragrance'], subcategory: 'body-mist', search: '' })); setActiveView('shop'); window.location.hash = 'shop?category=fragrance&subcategory=body-mist'; }}>Body Mists</span></li>
                    <li><span className="mega-link" onClick={() => { setFilters(prev => ({ ...prev, category: ['fragrance'], subcategory: 'body-mist', search: '' })); setActiveView('shop'); window.location.hash = 'shop?category=fragrance&subcategory=body-mist'; }}>Deodorants</span></li>
                  </ul>
                </div>
                <div className="mega-image-col" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541643600914-78b084683601?w=300')" }}>
                  <h5>Elegant Scents</h5>
                  <p>Premium perfumes for him & her</p>
                </div>
              </div>
            </li>
          </ul>
        </nav>
      </header>

      {/* DYNAMIC VIEW SLOTS */}
      <main>
        
        {/* 1. HOME VIEW */}
        {activeView === 'home' && (
          <section className="view-section active">
            {/* Hero Carousel */}
            <div className="hero-carousel">
              <div className="carousel-track" style={{ transform: `translateX(-${currentCarouselIndex * 100}%)`, display: 'flex', transition: 'transform 0.5s ease-in-out' }}>
                {heroBanners.map((banner, index) => (
                  <div key={banner.id} className="carousel-slide" style={{ backgroundImage: `url('${banner.image}')`, minWidth: '100%' }}>
                    <div className="carousel-content">
                      <span>Nykaa Featured</span>
                      <h2>{banner.title}</h2>
                      <p>{banner.subtitle}</p>
                      <button className="carousel-btn" onClick={() => {
                        if (banner.target.brand) {
                          setFilters(prev => ({ ...prev, brand: [banner.target.brand], category: [] }));
                          setActiveView('shop');
                        } else if (banner.target.category) {
                          setFilters(prev => ({ ...prev, category: [banner.target.category], brand: [] }));
                          setActiveView('shop');
                        }
                      }}>{banner.btnText}</button>
                    </div>
                  </div>
                ))}
              </div>
              <button className="carousel-arrow prev" onClick={() => setCurrentCarouselIndex(prev => (prev - 1 + heroBanners.length) % heroBanners.length)}>
                <i className="fa-solid fa-chevron-left"></i>
              </button>
              <button className="carousel-arrow next" onClick={() => setCurrentCarouselIndex(prev => (prev + 1) % heroBanners.length)}>
                <i className="fa-solid fa-chevron-right"></i>
              </button>
              <div className="carousel-dots">
                {heroBanners.map((_, idx) => (
                  <div key={idx} className={`carousel-dot ${idx === currentCarouselIndex ? 'active' : ''}`} onClick={() => setCurrentCarouselIndex(idx)}></div>
                ))}
              </div>
            </div>

            <div className="container">
              {/* Categories Bubbles */}
              <div className="category-bubbles">
                {[
                  { name: 'Makeup', type: 'category', val: 'makeup', img: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=150' },
                  { name: 'Skin Care', type: 'category', val: 'skin', img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=150' },
                  { name: 'Hair Care', type: 'category', val: 'hair', img: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=150' },
                  { name: 'Fragrance', type: 'category', val: 'fragrance', img: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=150' },
                  { name: 'MAC Luxe', type: 'brand', val: 'MAC', img: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=150' },
                  { name: 'Hot Deals', type: 'all', val: 'all', icon: 'fa-solid fa-tags', img: null }
                ].map((item, idx) => (
                  <div key={idx} className="bubble-item" onClick={() => {
                    if (item.type === 'category') {
                      setFilters(prev => ({ ...prev, category: [item.val], brand: [], subcategory: null }));
                    } else if (item.type === 'brand') {
                      setFilters(prev => ({ ...prev, brand: [item.val], category: [], subcategory: null }));
                    } else {
                      setFilters({ search: '', category: [], subcategory: null, brand: [], price: [], rating: null });
                    }
                    setActiveView('shop');
                    window.location.hash = item.type === 'all' ? 'shop' : `shop?${item.type}=${item.val}`;
                  }}>
                    <div className="bubble-img-wrapper" style={item.icon ? { backgroundColor: 'var(--nykaa-pink-light)', color: 'var(--nykaa-pink)', fontSize: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' } : {}}>
                      {item.icon ? <i className={item.icon}></i> : <img src={item.img} alt={item.name} />}
                    </div>
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>

              {/* Product Sliders: Trending */}
              <div className="section-header">
                <div className="section-title-wrap">
                  <h3>Trending Now</h3>
                  <p>Our top favorited items this week</p>
                </div>
              </div>
              <div className="product-slider-container">
                <button className="slider-nav prev-nav" onClick={() => scrollSlider(trendingSliderRef, -1)}><i className="fa-solid fa-chevron-left"></i></button>
                <div className="product-slider" ref={trendingSliderRef}>
                  {productsList.filter(p => p.tags?.includes('Trending')).map(product => (
                    <ProductCard key={product.id} product={product} onAdd={handleAddToCart} onWishlist={handleToggleWishlist} wishlist={wishlist} onNav={setSelectedProductId} setView={setActiveView} fallbackImg={getProductFallbackImage} />
                  ))}
                </div>
                <button className="slider-nav next-nav" onClick={() => scrollSlider(trendingSliderRef, 1)}><i className="fa-solid fa-chevron-right"></i></button>
              </div>

              {/* Promotional Mid Banners Grid */}
              <div className="promos-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginTop: '40px' }}>
                {[
                  {
                    title: "Clean Skincare Routine",
                    sub: "Minimalist marks up to 35% Off",
                    img: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400",
                    action: () => { setFilters(prev => ({ ...prev, category: ['skin'], brand: [], subcategory: null })); setActiveView('shop'); window.location.hash = 'shop?category=skin'; }
                  },
                  {
                    title: "Bold Lip Collection",
                    sub: "Maybelline SuperStay Ink 14% Off",
                    img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400",
                    action: () => { setFilters(prev => ({ ...prev, category: ['makeup'], brand: [], subcategory: 'lips' })); setActiveView('shop'); window.location.hash = 'shop?category=makeup&subcategory=lips'; }
                  },
                  {
                    title: "Elegant Body Mists",
                    sub: "Sweet Vanilla & Hawaii Mists 22% Off",
                    img: "https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=400",
                    action: () => { setFilters(prev => ({ ...prev, category: ['fragrance'], brand: [], subcategory: null })); setActiveView('shop'); window.location.hash = 'shop?category=fragrance'; }
                  }
                ].map((pr, idx) => (
                  <div key={idx} className="promo-banner" onClick={pr.action} style={{ backgroundImage: `url('${pr.img}')`, cursor: 'pointer', borderRadius: '8px', height: '220px', backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '20px', color: 'white' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: '8px', zIndex: 1 }}></div>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, zIndex: 2, marginBottom: '4px' }}>Hurry Up!</span>
                    <h4 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 4px', zIndex: 2 }}>{pr.title}</h4>
                    <p style={{ fontSize: '12px', margin: '0 0 12px', opacity: 0.9, zIndex: 2 }}>{pr.sub}</p>
                    <button className="luxe-btn" style={{ border: '1px solid white', color: 'white', alignSelf: 'flex-start', zIndex: 2 }}>Shop Now</button>
                  </div>
                ))}
              </div>

              {/* Luxe Spotlight Section */}
              <div className="luxe-spotlight" style={{ marginTop: '40px' }}>
                <div className="luxe-header" style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <p style={{ letterSpacing: '2px', color: 'var(--text-muted)' }}>Discover Pure Indulgence</p>
                  <h3 style={{ fontSize: '24px', fontWeight: '700' }}>The Luxe Spotlight</h3>
                </div>
                <div className="luxe-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                  {productsList.filter(p => p.tags?.includes('Luxe')).slice(0, 4).map(item => (
                    <div key={item.id} className="luxe-card" style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                      <div className="luxe-image" onClick={() => { setSelectedProductId(item.id); setActiveView('product'); window.location.hash = `product?id=${item.id}`; }} style={{ cursor: 'pointer', height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={getProductImage(item)} alt={item.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                      </div>
                      <div className="luxe-info" style={{ marginTop: '12px' }}>
                        <h4 style={{ fontWeight: '700', fontSize: '14px' }}>{item.brand}</h4>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 10px' }}>{item.name}</p>
                        <button className="luxe-btn" onClick={() => { setSelectedProductId(item.id); setActiveView('product'); window.location.hash = `product?id=${item.id}`; }}>Discover</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Best Sellers Section */}
              <div className="section-header" style={{ marginTop: '40px' }}>
                <div className="section-title-wrap">
                  <h3>Best Sellers</h3>
                  <p>Tried, tested, and loved cosmetics & skin formulations</p>
                </div>
              </div>
              <div className="product-slider-container">
                <button className="slider-nav prev-nav" onClick={() => scrollSlider(bestsellerSliderRef, -1)}><i className="fa-solid fa-chevron-left"></i></button>
                <div className="product-slider" ref={bestsellerSliderRef}>
                  {productsList.filter(p => p.tags?.includes('Best Seller')).map(product => (
                    <ProductCard key={product.id} product={product} onAdd={handleAddToCart} onWishlist={handleToggleWishlist} wishlist={wishlist} onNav={setSelectedProductId} setView={setActiveView} fallbackImg={getProductFallbackImage} />
                  ))}
                </div>
                <button className="slider-nav next-nav" onClick={() => scrollSlider(bestsellerSliderRef, 1)}><i className="fa-solid fa-chevron-right"></i></button>
              </div>
            </div>
          </section>
        )}

        {/* 2. PLP SHOP VIEW */}
        {activeView === 'shop' && (
          <section className="view-section active">
            <div className="container plp-container" style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '30px', marginTop: '30px' }}>
              
              {/* Sidebar Filters */}
              <aside className="filter-sidebar" style={{ borderRight: '1px solid var(--border-color)', paddingRight: '20px' }}>
                <div className="filter-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h4 style={{ fontWeight: '700' }}>Filters</h4>
                  <button className="clear-all-btn" style={{ background: 'none', border: 'none', color: 'var(--nykaa-pink)', cursor: 'pointer' }} onClick={() => setFilters({ search: '', category: [], subcategory: null, brand: [], price: [], rating: null })}>Clear All</button>
                </div>

                <div className="filter-section" style={{ marginBottom: '20px' }}>
                  <div className="filter-title" style={{ fontWeight: '700', marginBottom: '10px' }}>Category</div>
                  <div className="filter-options">
                    {['makeup', 'skin', 'hair', 'fragrance'].map(cat => (
                      <label key={cat} className="checkbox-label" style={{ display: 'block', margin: '6px 0', cursor: 'pointer', textTransform: 'capitalize' }}>
                        <input 
                          type="checkbox" 
                          checked={filters.category.includes(cat)}
                          onChange={() => {
                            setFilters(prev => {
                              const list = [...prev.category];
                              const idx = list.indexOf(cat);
                              if (idx > -1) list.splice(idx, 1);
                              else list.push(cat);
                              return { ...prev, category: list };
                            });
                          }}
                        /> {cat}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="filter-section" style={{ marginBottom: '20px' }}>
                  <div className="filter-title" style={{ fontWeight: '700', marginBottom: '10px' }}>Brand</div>
                  <div className="filter-options" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                    {[...new Set(productsList.map(p => p.brand))].sort().map(brand => (
                      <label key={brand} className="checkbox-label" style={{ display: 'block', margin: '6px 0', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={filters.brand.includes(brand)}
                          onChange={() => {
                            setFilters(prev => {
                              const list = [...prev.brand];
                              const idx = list.indexOf(brand);
                              if (idx > -1) list.splice(idx, 1);
                              else list.push(brand);
                              return { ...prev, brand: list };
                            });
                          }}
                        /> {brand}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="filter-section" style={{ marginBottom: '20px' }}>
                  <div className="filter-title" style={{ fontWeight: '700', marginBottom: '10px' }}>Price Range</div>
                  <div className="filter-options">
                    {[
                      { label: 'Under ₹500', val: '0-500' },
                      { label: '₹500 - ₹1500', val: '500-1500' },
                      { label: '₹1500 - ₹3000', val: '1500-3000' },
                      { label: '₹3000 & Above', val: '3000-above' }
                    ].map(r => (
                      <label key={r.val} className="checkbox-label" style={{ display: 'block', margin: '6px 0', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={filters.price.includes(r.val)}
                          onChange={() => {
                            setFilters(prev => {
                              const list = [...prev.price];
                              const idx = list.indexOf(r.val);
                              if (idx > -1) list.splice(idx, 1);
                              else list.push(r.val);
                              return { ...prev, price: list };
                            });
                          }}
                        /> {r.label}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="filter-section">
                  <div className="filter-title" style={{ fontWeight: '700', marginBottom: '10px' }}>Customer Rating</div>
                  <div className="filter-options">
                    {[4.5, 4.0].map(star => (
                      <label key={star} className="checkbox-label" style={{ display: 'block', margin: '6px 0', cursor: 'pointer' }}>
                        <input 
                          type="radio" 
                          name="rating-filter"
                          checked={filters.rating === star}
                          onChange={() => setFilters(prev => ({ ...prev, rating: prev.rating === star ? null : star }))}
                        /> {star} ★ & above
                      </label>
                    ))}
                  </div>
                </div>
              </aside>

              {/* Main Catalog Grid */}
              <div className="plp-content">
                <div className="plp-content-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <div className="results-count">Showing {filteredProducts.length} products</div>
                  <div className="sort-select-wrapper">
                    <span style={{ marginRight: '8px' }}>Sort By:</span>
                    <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
                      <option value="popularity">Popularity</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Customer Rating</option>
                      <option value="discount">Discount</option>
                    </select>
                  </div>
                </div>

                <div className="plp-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                  {filteredProducts.length === 0 ? (
                    <div className="plp-empty-state" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 0' }}>
                      <i className="fa-solid fa-face-meh" style={{ fontSize: '48px', color: 'var(--text-muted)', marginBottom: '16px' }}></i>
                      <h3>No products match your filters</h3>
                      <p>Try resetting the category filters or widen your search criteria.</p>
                    </div>
                  ) : (
                    filteredProducts.map(product => (
                      <ProductCard key={product.id} product={product} onAdd={handleAddToCart} onWishlist={handleToggleWishlist} wishlist={wishlist} onNav={setSelectedProductId} setView={setActiveView} fallbackImg={getProductFallbackImage} />
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 3. PDP DETAIL VIEW */}
        {activeView === 'product' && selectedProduct && (
          <section className="view-section active">
            <div className="container pdp-container" style={{ marginTop: '30px' }}>
              <div className="pdp-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
                
                {/* Images */}
                <div className="pdp-image-gallery" style={{ display: 'flex', gap: '15px' }}>
                  <div className="pdp-thumbnails" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {(selectedProduct.images?.length ? selectedProduct.images : [getProductFallbackImage(selectedProduct.brand, selectedProduct.name)]).map((img, idx) => (
                      <div key={idx} className={`pdp-thumb ${idx === pdpActiveImageIndex ? 'active' : ''}`} onClick={() => { setPdpActiveImage(img); setPdpActiveImageIndex(idx); }} style={{ width: '60px', height: '60px', border: '1px solid var(--border-color)', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}>
                        <img src={img} alt="thumb" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                      </div>
                    ))}
                  </div>
                  <div className="pdp-main-image" style={{ flex: 1, border: '1px solid var(--border-color)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '400px', padding: '20px' }}>
                    <img src={pdpActiveImage || getProductImage(selectedProduct)} alt={selectedProduct.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                  </div>
                </div>

                {/* Details */}
                <div className="pdp-details-info">
                  <div className="pdp-brand-title" style={{ fontSize: '18px', fontWeight: '700', color: 'var(--nykaa-pink)' }}>{selectedProduct.brand}</div>
                  <h1 className="pdp-name-title" style={{ fontSize: '24px', fontWeight: '700', margin: '8px 0 12px' }}>{selectedProduct.name}</h1>

                  <div className="pdp-meta-row" style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div className="pdp-stars" style={{ display: 'flex', gap: '2px', color: '#ffb400' }}>
                      {generateStarsHTML(selectedProduct.rating)}
                    </div>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({selectedProduct.reviewsCount} reviews)</span>
                  </div>

                  <div className="pdp-price-section" style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '20px' }}>
                    <span className="pdp-price" style={{ fontSize: '28px', fontWeight: '800' }}>₹{pdpActivePrice}</span>
                    {selectedProduct.discount > 0 && (
                      <>
                        <span className="pdp-mrp" style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '16px' }}>₹{pdpActiveMrp}</span>
                        <span className="pdp-discount" style={{ color: '#00824b', fontWeight: '700', fontSize: '16px' }}>{selectedProduct.discount}% Off</span>
                      </>
                    )}
                  </div>

                  {/* Shades Swatches */}
                  {selectedProduct.shades?.length > 0 && (
                    <div className="pdp-selector-section" style={{ marginBottom: '20px' }}>
                      <div style={{ fontWeight: '700', marginBottom: '8px' }}>Shade: <span style={{ color: 'var(--nykaa-pink)' }}>{pdpSelectedShade}</span></div>
                      <div className="swatches-grid" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {selectedProduct.shades.map(s => (
                          <button key={s.name} className={`swatch-color-btn ${pdpSelectedShade === s.name ? 'active' : ''}`} style={{ backgroundColor: s.colorCode, width: '28px', height: '28px', borderRadius: '50%', border: pdpSelectedShade === s.name ? '2px solid black' : '1px solid #ddd', cursor: 'pointer' }} onClick={() => setPdpSelectedShade(s.name)} title={s.name}></button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sizes */}
                  {selectedProduct.sizes?.length > 0 && (
                    <div className="pdp-selector-section" style={{ marginBottom: '20px' }}>
                      <div style={{ fontWeight: '700', marginBottom: '8px' }}>Available Sizes:</div>
                      <div className="swatches-grid" style={{ display: 'flex', gap: '8px' }}>
                        {selectedProduct.sizes.map(sz => (
                          <button key={sz.name} className={`swatch-size-btn ${pdpSelectedSize === sz.name ? 'active' : ''}`} style={{ border: pdpSelectedSize === sz.name ? '2px solid var(--nykaa-pink)' : '1px solid var(--border-color)', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', background: 'none' }} onClick={() => { setPdpSelectedSize(sz.name); setPdpActivePrice(sz.price); setPdpActiveMrp(sz.mrp); }}>{sz.name}</button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="pdp-actions-row" style={{ display: 'flex', gap: '15px', marginTop: '24px' }}>
                    <button className="pdp-add-bag" style={{ flex: 1 }} onClick={() => handleAddToCart(selectedProduct.id, 1, pdpSelectedShade, pdpSelectedSize, pdpActivePrice, pdpActiveMrp)}>
                      <i className="fa-solid fa-bag-shopping"></i> Add to Bag
                    </button>
                    <button className={`pdp-wishlist ${wishlist.includes(selectedProduct.id) ? 'active' : ''}`} style={{ padding: '0 20px' }} onClick={() => handleToggleWishlist(selectedProduct.id)}>
                      <i className={`${wishlist.includes(selectedProduct.id) ? 'fa-solid' : 'fa-regular'} fa-heart`}></i> {wishlist.includes(selectedProduct.id) ? 'Wishlisted' : 'Add to Wishlist'}
                    </button>
                  </div>

                  {/* Specs Accordions */}
                  <div className="pdp-tabs" style={{ marginTop: '30px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                    <div className="tabs-nav" style={{ display: 'flex', gap: '20px', marginBottom: '12px' }}>
                      {['desc', 'ingredients', 'how'].map(tab => (
                        <button key={tab} className={`tab-btn ${pdpActiveTab === tab ? 'active' : ''}`} style={{ background: 'none', border: 'none', borderBottom: pdpActiveTab === tab ? '2px solid var(--nykaa-pink)' : 'none', cursor: 'pointer', paddingBottom: '4px', fontWeight: pdpActiveTab === tab ? '700' : '400' }} onClick={() => setPdpActiveTab(tab)}>
                          {tab === 'desc' ? 'Description' : tab === 'ingredients' ? 'Ingredients' : 'How To Use'}
                        </button>
                      ))}
                    </div>
                    <div className="tab-pane active" style={{ fontSize: '13px', lineHeight: '1.6', color: 'var(--text-muted)' }}>
                      {pdpActiveTab === 'desc' && <p>{selectedProduct.description}</p>}
                      {pdpActiveTab === 'ingredients' && <p>Aqua (Water), Glycerin, Niacinamide, Zinc PCA, Hyaluronic Acid, Xanthan Gum, Phenoxyethanol, Citric Acid.</p>}
                      {pdpActiveTab === 'how' && <p>Apply 2-3 drops onto clean, damp skin of the face and neck daily. Gently press with fingers until fully absorbed.</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 4. WISHLIST VIEW */}
        {activeView === 'wishlist' && (
          <section className="view-section active">
            <div className="container wishlist-container" style={{ marginTop: '30px' }}>
              <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '20px' }}>My Wishlist</h3>
              {wishlist.length === 0 ? (
                <div className="wishlist-empty" style={{ textAlign: 'center', padding: '60px 0' }}>
                  <i className="fa-regular fa-heart" style={{ fontSize: '48px', color: 'var(--text-muted)', marginBottom: '16px' }}></i>
                  <h3>Your wishlist is empty</h3>
                  <p>Add items you love to your wishlist to view them here.</p>
                </div>
              ) : (
                <div className="wishlist-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
                  {productsList.filter(p => wishlist.includes(p.id)).map(product => (
                    <ProductCard key={product.id} product={product} onAdd={handleAddToCart} onWishlist={handleToggleWishlist} wishlist={wishlist} onNav={setSelectedProductId} setView={setActiveView} fallbackImg={getProductFallbackImage} />
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* 5. SELLER DASHBOARD VIEW */}
        {activeView === 'seller-dashboard' && (
          <section className="view-section active">
            <div className="container dashboard-container">
              <div className="dashboard-title-bar">
                <div>
                  <h2>Seller Dashboard</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Manage your inventory, listings, and sales performance</p>
                </div>
                <button className="switch-dashboard-btn" onClick={() => { setActiveView('home'); window.location.hash = 'home'; }}>
                  <i className="fa-solid fa-arrow-left-long" style={{ marginRight: '6px' }}></i> Switch to Customer Store
                </button>
              </div>

              <div className="dashboard-layout">
                {/* Sidebar */}
                <aside className="dashboard-sidebar">
                  <button 
                    className={`sidebar-tab-btn ${sellerActiveTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setSellerActiveTab('overview')}
                  >
                    <i className="fa-solid fa-chart-line"></i> Overview
                  </button>
                  <button 
                    className={`sidebar-tab-btn ${sellerActiveTab === 'inventory' ? 'active' : ''}`}
                    onClick={() => setSellerActiveTab('inventory')}
                  >
                    <i className="fa-solid fa-boxes-stacked"></i> My Inventory
                  </button>
                  <button 
                    className={`sidebar-tab-btn ${sellerActiveTab === 'add-product' ? 'active' : ''}`}
                    onClick={() => setSellerActiveTab('add-product')}
                  >
                    <i className="fa-solid fa-circle-plus"></i> Add Product
                  </button>
                </aside>

                {/* Main Content Panel */}
                <div className="dashboard-main-panel">
                  {sellerActiveTab === 'overview' && (
                    <div className="dashboard-tab-content">
                      <div className="stats-summary-grid">
                        <div className="stat-metric-card pink">
                          <h5>Total Sales Revenue</h5>
                          <div className="metric-value">₹48,500</div>
                          <i className="fa-solid fa-indian-rupee-sign"></i>
                        </div>
                        <div className="stat-metric-card purple">
                          <h5>Orders Processed</h5>
                          <div className="metric-value">12</div>
                          <i className="fa-solid fa-dolly"></i>
                        </div>
                        <div className="stat-metric-card blue">
                          <h5>Active Listings</h5>
                          <div className="metric-value">{productsList.length}</div>
                          <i className="fa-solid fa-tag"></i>
                        </div>
                      </div>

                      <div className="dashboard-section-header" style={{ marginTop: '30px' }}>
                        <h3>Recent Orders</h3>
                      </div>
                      <div className="db-table-wrapper">
                        <table className="db-table">
                          <thead>
                            <tr>
                              <th>Order ID</th>
                              <th>Customer</th>
                              <th>Product</th>
                              <th>Total Amount</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {mockOrders.map(o => (
                              <tr key={o.id}>
                                <td>NYK-{o.id}</td>
                                <td>{o.user}</td>
                                <td>{o.items?.[0]?.name || 'Beauty Product'}</td>
                                <td>₹{o.total_amount}</td>
                                <td>
                                  <span className={`btn-status-badge ${o.status}`}>
                                    {o.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {sellerActiveTab === 'inventory' && (
                    <div className="dashboard-tab-content">
                      <div className="dashboard-section-header">
                        <h3>Inventory Catalog ({productsList.length} Items)</h3>
                        <button className="db-action-btn" onClick={() => setSellerActiveTab('add-product')}>
                          <i className="fa-solid fa-plus"></i> Add New Product
                        </button>
                      </div>
                      <div className="db-table-wrapper">
                        <table className="db-table">
                          <thead>
                            <tr>
                              <th>Image</th>
                              <th>Name</th>
                              <th>Brand</th>
                              <th>Category</th>
                              <th>Price</th>
                              <th>Stock</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {productsList.map(p => (
                              <tr key={p.id}>
                                <td>
                                  <img src={p.images?.[0] || getProductImage(p)} alt={p.name} />
                                </td>
                                <td>
                                  <div style={{ fontWeight: '700' }}>{p.name}</div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: {p.id}</div>
                                </td>
                                <td>{p.brand}</td>
                                <td style={{ textTransform: 'capitalize' }}>{p.category}</td>
                                <td style={{ fontWeight: '700' }}>₹{p.price}</td>
                                <td>{p.stock || 100}</td>
                                <td>
                                  <button 
                                    className="table-action-btn delete" 
                                    title="Delete product"
                                    onClick={() => {
                                      if (confirm(`Are you sure you want to delete "${p.name}"?`)) {
                                        fetch(`/seller/product_delete/${p.id}`, {
                                          method: 'DELETE',
                                          headers: getAuthHeaders()
                                        })
                                          .then(res => {
                                            if (!res.ok) throw new Error();
                                            return res.json();
                                          })
                                          .then(() => {
                                            showToast('Product deleted from catalog!');
                                            fetchProductsFromDB();
                                          })
                                          .catch(() => showToast('Failed to delete product.', 'error'));
                                      }
                                    }}
                                  >
                                    <i className="fa-solid fa-trash-can"></i>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {sellerActiveTab === 'add-product' && (
                    <div className="dashboard-tab-content">
                      <div className="dashboard-section-header">
                        <h3>Add New Product to Catalog</h3>
                      </div>
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        if (!sellerProductForm.name || !sellerProductForm.brand || !sellerProductForm.price || !sellerProductForm.description) {
                          showToast('Please fill all required fields.', 'info');
                          return;
                        }
                        const formData = new FormData();
                        formData.append('name', sellerProductForm.name);
                        formData.append('price', sellerProductForm.price);
                        formData.append('stock', sellerProductForm.stock);
                        if (sellerProductForm.imageFile) {
                          formData.append('image', sellerProductForm.imageFile);
                        }

                        fetch('/seller/add_product', {
                          method: 'POST',
                          headers: getAuthHeaders(),
                          body: formData
                        })
                          .then(async res => {
                            if (!res.ok) {
                              const errData = await res.json().catch(() => ({}));
                              throw new Error(errData.detail || 'Failed to add product.');
                            }
                            return res.json();
                          })
                          .then(() => {
                            showToast('Product added successfully!');
                            fetchProductsFromDB();
                            setSellerProductForm({
                              name: '',
                              brand: '',
                              price: '',
                              mrp: '',
                              stock: '100',
                              description: '',
                              category: 'makeup',
                              subcategory: '',
                              imageFile: null
                            });
                            setSellerActiveTab('inventory');
                          })
                          .catch((err) => showToast(err.message || 'Failed to add product to backend database.', 'error'));
                      }}>
                        <div className="db-form-row">
                          <div className="db-form-group">
                            <label>Product Name *</label>
                            <input type="text" placeholder="e.g. Matte Lipstick" value={sellerProductForm.name} onChange={(e) => setSellerProductForm(prev => ({ ...prev, name: e.target.value }))} required />
                          </div>
                          <div className="db-form-group">
                            <label>Brand Name *</label>
                            <input type="text" placeholder="e.g. Nykaa Cosmetics" value={sellerProductForm.brand} onChange={(e) => setSellerProductForm(prev => ({ ...prev, brand: e.target.value }))} required />
                          </div>
                        </div>

                        <div className="db-form-row">
                          <div className="db-form-group">
                            <label>Selling Price (INR) *</label>
                            <input type="number" placeholder="e.g. 499" value={sellerProductForm.price} onChange={(e) => setSellerProductForm(prev => ({ ...prev, price: e.target.value }))} required />
                          </div>
                          <div className="db-form-group">
                            <label>Original MRP (INR)</label>
                            <input type="number" placeholder="e.g. 599" value={sellerProductForm.mrp} onChange={(e) => setSellerProductForm(prev => ({ ...prev, mrp: e.target.value }))} />
                          </div>
                        </div>

                        <div className="db-form-row">
                          <div className="db-form-group">
                            <label>Category *</label>
                            <select value={sellerProductForm.category} onChange={(e) => setSellerProductForm(prev => ({ ...prev, category: e.target.value }))} required>
                              <option value="makeup">Makeup</option>
                              <option value="skin">Skin Care</option>
                              <option value="hair">Hair Care</option>
                              <option value="fragrance">Fragrance</option>
                            </select>
                          </div>
                          <div className="db-form-group">
                            <label>Subcategory (e.g. lips, face, serum)</label>
                            <input type="text" placeholder="e.g. lips" value={sellerProductForm.subcategory} onChange={(e) => setSellerProductForm(prev => ({ ...prev, subcategory: e.target.value }))} />
                          </div>
                        </div>

                        <div className="db-form-row">
                          <div className="db-form-group">
                            <label>Available Stock</label>
                            <input type="number" placeholder="100" value={sellerProductForm.stock} onChange={(e) => setSellerProductForm(prev => ({ ...prev, stock: e.target.value }))} />
                          </div>
                          <div className="db-form-group">
                            <label>Upload Image / Take Photo *</label>
                            <input type="file" accept="image/*" onChange={(e) => {
                              const file = e.target.files[0];
                              setSellerProductForm(prev => ({ ...prev, imageFile: file }));
                            }} required />
                          </div>
                        </div>

                        <div className="db-form-group full">
                          <label>Product Description *</label>
                          <textarea rows="4" placeholder="Describe key ingredients, application guidelines..." value={sellerProductForm.description} onChange={(e) => setSellerProductForm(prev => ({ ...prev, description: e.target.value }))} required></textarea>
                        </div>

                        <button type="submit" className="db-action-btn" style={{ width: '100%', marginTop: '10px' }}>Publish Product</button>
                      </form>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 6. ADMIN DASHBOARD VIEW */}
        {activeView === 'admin-dashboard' && (
          <section className="view-section active">
            <div className="container dashboard-container">
              <div className="dashboard-title-bar">
                <div>
                  <h2>Admin Control Center</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Monitor platform operations, user database, inventory control, and order status updates</p>
                </div>
                <button className="switch-dashboard-btn" onClick={() => { setActiveView('home'); window.location.hash = 'home'; }}>
                  <i className="fa-solid fa-arrow-left-long" style={{ marginRight: '6px' }}></i> Switch to Customer Store
                </button>
              </div>

              <div className="dashboard-layout">
                {/* Sidebar */}
                <aside className="dashboard-sidebar">
                  <button 
                    className={`sidebar-tab-btn ${adminActiveTab === 'overview' ? 'active' : ''}`}
                    onClick={() => setAdminActiveTab('overview')}
                  >
                    <i className="fa-solid fa-chart-pie"></i> Overview
                  </button>
                  <button 
                    className={`sidebar-tab-btn ${adminActiveTab === 'users' ? 'active' : ''}`}
                    onClick={() => setAdminActiveTab('users')}
                  >
                    <i className="fa-solid fa-users-gear"></i> Manage Users
                  </button>
                  <button 
                    className={`sidebar-tab-btn ${adminActiveTab === 'products' ? 'active' : ''}`}
                    onClick={() => setAdminActiveTab('products')}
                  >
                    <i className="fa-solid fa-list-check"></i> Manage Products
                  </button>
                  <button 
                    className={`sidebar-tab-btn ${adminActiveTab === 'orders' ? 'active' : ''}`}
                    onClick={() => setAdminActiveTab('orders')}
                  >
                    <i className="fa-solid fa-truck-ramp-box"></i> Manage Orders
                  </button>
                </aside>

                {/* Main Content Panel */}
                <div className="dashboard-main-panel">
                  {adminActiveTab === 'overview' && (
                    <div className="dashboard-tab-content">
                      <div className="stats-summary-grid">
                        <div className="stat-metric-card pink">
                          <h5>Total Platform Users</h5>
                          <div className="metric-value">{mockUsers.length}</div>
                          <i className="fa-solid fa-users"></i>
                        </div>
                        <div className="stat-metric-card purple">
                          <h5>Active Sellers</h5>
                          <div className="metric-value">{mockUsers.filter(u => u.role === 'seller').length}</div>
                          <i className="fa-solid fa-store-slash"></i>
                        </div>
                        <div className="stat-metric-card blue">
                          <h5>Total Orders</h5>
                          <div className="metric-value">{mockOrders.length}</div>
                          <i className="fa-solid fa-dolly"></i>
                        </div>
                        <div className="stat-metric-card green">
                          <h5>Platform Revenue</h5>
                          <div className="metric-value">₹{mockOrders.reduce((acc, o) => acc + o.total_amount, 0)}</div>
                          <i className="fa-solid fa-indian-rupee-sign"></i>
                        </div>
                      </div>

                      <div className="dashboard-section-header" style={{ marginTop: '30px' }}>
                        <h3>Platform Summary</h3>
                        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Active product listings: {productsList.length}</p>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
                        <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px' }}>
                          <h4 style={{ marginBottom: '12px', fontWeight: '700' }}>Recent Accounts</h4>
                          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {mockUsers.slice(0, 3).map(u => (
                              <li key={u.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                <span><strong>{u.name}</strong> ({u.email})</span>
                                <span style={{ textTransform: 'uppercase', fontWeight: '700', color: 'var(--nykaa-pink)' }}>{u.role}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '16px' }}>
                          <h4 style={{ marginBottom: '12px', fontWeight: '700' }}>Recent Orders</h4>
                          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {mockOrders.slice(0, 3).map(o => (
                              <li key={o.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                <span>Order NYK-{o.id} ({o.user})</span>
                                <strong style={{ color: '#00824b' }}>₹{o.total_amount}</strong>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                  {adminActiveTab === 'users' && (
                    <div className="dashboard-tab-content">
                      <div className="dashboard-section-header">
                        <h3>Registered Users Directory</h3>
                      </div>
                      <div className="db-table-wrapper">
                        <table className="db-table">
                          <thead>
                            <tr>
                              <th>ID</th>
                              <th>Name</th>
                              <th>Email</th>
                              <th>Phone</th>
                              <th>Role</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {mockUsers.map(u => (
                              <tr key={u.id}>
                                <td>{u.id}</td>
                                <td style={{ fontWeight: '700' }}>{u.name}</td>
                                <td>{u.email}</td>
                                <td>{u.phone}</td>
                                <td>
                                  <span style={{ 
                                    padding: '4px 8px', 
                                    borderRadius: '12px', 
                                    fontSize: '11px', 
                                    fontWeight: '700', 
                                    textTransform: 'uppercase',
                                    backgroundColor: u.role === 'admin' ? '#f8d7da' : u.role === 'seller' ? '#fff3cd' : '#d1ecf1',
                                    color: u.role === 'admin' ? '#721c24' : u.role === 'seller' ? '#856404' : '#0c5460'
                                  }}>
                                    {u.role}
                                  </span>
                                </td>
                                <td>
                                  {u.role !== 'admin' ? (
                                    <button 
                                      className="table-action-btn delete" 
                                      title="Suspend user account"
                                      onClick={() => {
                                        if (confirm(`Are you sure you want to suspend / delete user "${u.name}"?`)) {
                                          fetch(`/delete_user/${u.id}`, {
                                            method: 'DELETE',
                                            headers: getAuthHeaders()
                                          })
                                            .then(res => {
                                              if (!res.ok) throw new Error();
                                              return res.json();
                                            })
                                            .then(() => {
                                              showToast('User account suspended successfully!');
                                              fetchUsersFromDB();
                                            })
                                            .catch(() => showToast('Failed to suspend user.', 'error'));
                                        }
                                      }}
                                    >
                                      <i className="fa-solid fa-user-slash"></i>
                                    </button>
                                  ) : (
                                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Protected</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {adminActiveTab === 'products' && (
                    <div className="dashboard-tab-content">
                      <div className="dashboard-section-header">
                        <h3>Platform Catalog Directory</h3>
                      </div>
                      <div className="db-table-wrapper">
                        <table className="db-table">
                          <thead>
                            <tr>
                              <th>Image</th>
                              <th>Name</th>
                              <th>Brand</th>
                              <th>Category</th>
                              <th>Price</th>
                              <th>Stock</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {productsList.map(p => (
                              <tr key={p.id}>
                                <td>
                                  <img src={p.images?.[0] || getProductImage(p)} alt={p.name} />
                                </td>
                                <td>
                                  <div style={{ fontWeight: '700' }}>{p.name}</div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>ID: {p.id}</div>
                                </td>
                                <td>{p.brand}</td>
                                <td style={{ textTransform: 'capitalize' }}>{p.category}</td>
                                <td style={{ fontWeight: '700' }}>₹{p.price}</td>
                                <td>{p.stock || 100}</td>
                                <td>
                                  <button 
                                    className="table-action-btn delete" 
                                    title="Delete product"
                                    onClick={() => {
                                        if (confirm(`Are you sure you want to remove "${p.name}" from the platform?`)) {
                                          fetch(`/seller/product_delete/${p.id}`, {
                                            method: 'DELETE',
                                            headers: getAuthHeaders()
                                          })
                                            .then(res => {
                                              if (!res.ok) throw new Error();
                                              return res.json();
                                            })
                                            .then(() => {
                                              showToast('Product removed from platform catalog.');
                                              fetchProductsFromDB();
                                            })
                                            .catch(() => showToast('Failed to remove product.', 'error'));
                                        }
                                      }}
                                  >
                                    <i className="fa-solid fa-trash-can"></i>
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {adminActiveTab === 'orders' && (
                    <div className="dashboard-tab-content">
                      <div className="dashboard-section-header">
                        <h3>Orders Database Log</h3>
                      </div>
                      <div className="db-table-wrapper">
                        <table className="db-table">
                          <thead>
                            <tr>
                              <th>Order ID</th>
                              <th>Customer</th>
                              <th>Address</th>
                              <th>Amount</th>
                              <th>Status</th>
                              <th>Update Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {mockOrders.map(o => (
                              <tr key={o.id}>
                                <td>NYK-{o.id}</td>
                                <td>{o.user}</td>
                                <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={o.shipping_address}>{o.shipping_address}</td>
                                <td style={{ fontWeight: '700' }}>₹{o.total_amount}</td>
                                <td>
                                  <span className={`btn-status-badge ${o.status}`}>
                                    {o.status}
                                  </span>
                                </td>
                                <td>
                                  <select 
                                    className="select-status-dropdown" 
                                    value={o.status}
                                    onChange={(e) => {
                                      const newStatus = e.target.value;
                                      fetch(`/order/status/${o.id}`, {
                                        method: 'PUT',
                                        headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
                                        body: JSON.stringify({ status: newStatus })
                                      })
                                        .then(res => {
                                          if (!res.ok) throw new Error();
                                          return res.json();
                                        })
                                        .then(() => {
                                          showToast(`Order NYK-${o.id} status updated to ${newStatus}`);
                                          fetchAllOrdersFromDB();
                                        })
                                        .catch(() => showToast('Failed to update order status.', 'error'));
                                    }}
                                  >
                                    <option value="pending">Pending</option>
                                    <option value="shipped">Shipped</option>
                                    <option value="delivered">Delivered</option>
                                  </select>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

      </main>

      {/* CART DRAWER */}
      {isCartOpen && (
        <div className="cart-drawer-overlay active" onClick={() => setIsCartOpen(false)}>
          <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="cart-drawer-header">
              <div className="cart-drawer-title">
                <i className="fa-solid fa-bag-shopping text-pink"></i>
                <span>Shopping Bag ({cart.reduce((a,c) => a + c.quantity, 0)})</span>
              </div>
              <button className="cart-drawer-close" onClick={() => setIsCartOpen(false)}><i class="fa-solid fa-xmark"></i></button>
            </div>

            <div className="cart-items-container">
              {cart.length === 0 ? (
                <div className="cart-empty-state">
                  <i className="fa-solid fa-bag-shopping"></i>
                  <h4>Your bag is empty</h4>
                  <p>Add products to start your beauty ritual.</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <div className="cart-item-img">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="cart-item-details">
                      <div className="cart-item-brand">{item.brand}</div>
                      <div className="cart-item-name">{item.name}</div>
                      <div className="cart-item-price-qty">
                        <div className="cart-item-qty">
                          <button className="qty-btn" onClick={() => handleUpdateCartQty(item, -1)}>-</button>
                          <span className="qty-val">{item.quantity}</span>
                          <button className="qty-btn" onClick={() => handleUpdateCartQty(item, 1)}>+</button>
                        </div>
                        <div className="cart-item-price">₹{item.price * item.quantity}</div>
                      </div>
                    </div>
                    <button className="cart-item-delete" onClick={() => handleRemoveFromCart(item.id)}><i className="fa-solid fa-trash-can"></i></button>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <>
                <div className="cart-coupon-section" style={{ padding: '15px', borderTop: '1px solid var(--border-color)' }}>
                  <div className="coupon-input-wrapper" style={{ display: 'flex', gap: '8px' }}>
                    <input type="text" placeholder="Enter Coupon Code (NYKAA20)" value={couponInput} onChange={(e) => setCouponInput(e.target.value)} style={{ flex: 1, padding: '6px', border: '1px solid var(--border-color)', borderRadius: '4px' }} />
                    <button className="apply-coupon-btn" onClick={handleApplyCoupon} style={{ padding: '6px 12px', cursor: 'pointer', background: 'var(--nykaa-pink)', color: 'white', border: 'none', borderRadius: '4px' }}>Apply</button>
                  </div>
                  {couponMessage.text && (
                    <div className={`coupon-message ${couponMessage.type}`} style={{ fontSize: '11px', marginTop: '6px', color: couponMessage.type === 'success' ? '#00824b' : 'red' }}>{couponMessage.text}</div>
                  )}
                </div>

                <div className="cart-drawer-footer">
                  <div className="cart-summary-row">
                    <span>Bag Subtotal</span>
                    <span>₹{totals.subtotal}</span>
                  </div>
                  {totals.discount > 0 && (
                    <div className="cart-summary-row" style={{ color: '#00824b' }}>
                      <span>Coupon Discount ({couponApplied})</span>
                      <span>-₹{totals.discount}</span>
                    </div>
                  )}
                  <div className="cart-summary-row">
                    <span>Shipping Charges</span>
                    <span>{totals.shipping === 0 ? 'Free' : `₹${totals.shipping}`}</span>
                  </div>
                  <div className="cart-summary-row total">
                    <span>Grand Total</span>
                    <span>₹{totals.grandTotal}</span>
                  </div>
                  <button className="checkout-btn" onClick={handleCheckoutTrigger}>Proceed To Checkout <i className="fa-solid fa-arrow-right"></i></button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL */}
      {checkoutStep > 0 && (
        <div className="modal-overlay active" onClick={() => setCheckoutStep(0)}>
          <div className="modal-content checkout-modal" onClick={(e) => e.stopPropagation()} style={{ width: '450px', padding: '24px' }}>
            <button className="modal-close" onClick={() => setCheckoutStep(0)}><i className="fa-solid fa-xmark"></i></button>
            
            <div className="checkout-steps" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              {['Address', 'Payment', 'Confirm'].map((step, idx) => (
                <div key={step} className={`step-indicator ${checkoutStep === idx + 1 ? 'active' : checkoutStep > idx + 1 ? 'completed' : ''}`}>
                  <span>{step}</span>
                </div>
              ))}
            </div>

            {/* Step 1: Address form */}
            {checkoutStep === 1 && (
              <form onSubmit={handleAddressSubmit} className="review-form" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <h4 style={{ margin: '0 0 10px', fontSize: '16px', fontWeight: '700' }}>Shipping Details</h4>
                <input type="text" placeholder="Full Name *" value={checkoutAddress.name} onChange={(e) => setCheckoutAddress(prev => ({ ...prev, name: e.target.value }))} required />
                <input type="text" placeholder="Flat / House No. / Street *" value={checkoutAddress.address} onChange={(e) => setCheckoutAddress(prev => ({ ...prev, address: e.target.value }))} required />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <input type="text" placeholder="Pincode *" value={checkoutAddress.pincode} onChange={(e) => setCheckoutAddress(prev => ({ ...prev, pincode: e.target.value }))} required />
                  <input type="text" placeholder="City *" value={checkoutAddress.city} onChange={(e) => setCheckoutAddress(prev => ({ ...prev, city: e.target.value }))} required />
                </div>
                <input type="tel" placeholder="10-digit Phone Number *" value={checkoutAddress.phone} onChange={(e) => setCheckoutAddress(prev => ({ ...prev, phone: e.target.value }))} required />
                <button type="submit" className="checkout-btn" style={{ marginTop: '10px' }}>Proceed To Payment</button>
              </form>
            )}

            {/* Step 2: Payment */}
            {checkoutStep === 2 && (
              <div className="checkout-step-content active">
                <h4 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700' }}>Select Payment Method</h4>
                <div className="payment-options-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { id: 'card', label: 'Credit / Debit Card (Simulated)', icon: 'fa-solid fa-credit-card' },
                    { id: 'upi', label: 'UPI (GPay / PhonePe / Simulated)', icon: 'fa-solid fa-mobile-screen-button' },
                    { id: 'cod', label: 'Cash on Delivery (COD)', icon: 'fa-solid fa-hand-holding-dollar' }
                  ].map(opt => (
                    <div key={opt.id} className={`payment-option-card ${selectedPayment === opt.id ? 'active' : ''}`} onClick={() => setSelectedPayment(opt.id)} style={{ padding: '12px', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input type="radio" checked={selectedPayment === opt.id} readOnly />
                      <i className={`${opt.icon} ${selectedPayment === opt.id ? 'text-pink' : ''}`}></i>
                      <span>{opt.label}</span>
                    </div>
                  ))}
                </div>

                <div className="checkout-summary-box" style={{ marginTop: '20px', padding: '12px', background: '#fcfcfc', border: '1px dashed var(--border-color)' }}>
                  <div className="cart-summary-row" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700' }}>
                    <span>Grand Total:</span>
                    <strong className="text-pink">₹{totals.grandTotal}</strong>
                  </div>
                </div>

                <button className="checkout-btn" onClick={handlePlaceOrder} style={{ marginTop: '20px', width: '100%' }}>Pay & Place Order</button>
              </div>
            )}

            {/* Step 3: Success Screen */}
            {checkoutStep === 3 && (
              <div className="success-screen" style={{ textAlign: 'center', padding: '20px 0' }}>
                <div className="success-icon-wrap" style={{ fontSize: '48px', color: '#00824b', marginBottom: '12px' }}>
                  <i className="fa-solid fa-circle-check"></i>
                </div>
                <h3>Order Placed Successfully!</h3>
                <p style={{ margin: '8px 0 20px', color: 'var(--text-muted)' }}>Thank you for shopping with Nykaa. Your package will arrive in 2-3 working days.</p>
                <button className="checkout-btn" onClick={() => setCheckoutStep(0)}>Continue Shopping</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* AUTH MODAL */}
      {isAuthOpen && (
        <div className="modal-overlay active" onClick={() => setIsAuthOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ width: '360px', padding: '24px' }}>
            <button className="modal-close" onClick={() => setIsAuthOpen(false)}><i className="fa-solid fa-xmark"></i></button>
            
            {authMode === 'login' ? (
              <form onSubmit={handleLogin} className="auth-step">
                <div className="auth-header" style={{ marginBottom: '20px', textAlign: 'center' }}>
                  <h3>Welcome to Nykaa</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Login to manage your bag and wishlist</p>
                </div>
                <div className="auth-form-group" style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '700' }}>Email Address</label>
                  <input type="email" placeholder="Enter Email" value={loginForm.email} onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))} required />
                </div>
                <div className="auth-form-group" style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: '700' }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showLoginPassword ? "text" : "password"} 
                      placeholder="Enter Password" 
                      value={loginForm.password} 
                      onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))} 
                      style={{ width: '100%', paddingRight: '40px' }}
                      required 
                    />
                    <span 
                      onClick={() => setShowLoginPassword(prev => !prev)} 
                      style={{ 
                        position: 'absolute', 
                        right: '12px', 
                        top: '50%', 
                        transform: 'translateY(-50%)', 
                        cursor: 'pointer', 
                        color: 'var(--text-muted)',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <i className={showLoginPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}></i>
                    </span>
                  </div>
                </div>
                <button type="submit" className="auth-btn" style={{ width: '100%', padding: '10px', background: 'var(--nykaa-pink)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '700' }}>Login</button>
                <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px' }}>
                  Don't have an account? <span style={{ color: 'var(--nykaa-pink)', cursor: 'pointer', fontWeight: '700' }} onClick={() => setAuthMode('signup')}>Sign Up</span>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="auth-step">
                <div className="auth-header" style={{ marginBottom: '20px', textAlign: 'center' }}>
                  <h3>Create an Account</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Join us to start your beauty ritual</p>
                </div>
                
                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                  <button type="button" style={{ flex: 1, backgroundColor: authForm.role === 'user' ? 'var(--nykaa-pink)' : '#f3f4f6', color: authForm.role === 'user' ? 'white' : 'var(--text-main)', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }} onClick={() => setAuthForm(prev => ({ ...prev, role: 'user' }))}>Customer</button>
                  <button type="button" style={{ flex: 1, backgroundColor: authForm.role === 'seller' ? 'var(--nykaa-pink)' : '#f3f4f6', color: authForm.role === 'seller' ? 'white' : 'var(--text-main)', border: 'none', padding: '8px', borderRadius: '4px', cursor: 'pointer', fontWeight: '700', fontSize: '12px' }} onClick={() => setAuthForm(prev => ({ ...prev, role: 'seller' }))}>Seller</button>
                </div>

                <div className="auth-form-group" style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px', fontWeight: '700' }}>Full Name *</label>
                  <input type="text" placeholder="Full Name" value={authForm.name} onChange={(e) => setAuthForm(prev => ({ ...prev, name: e.target.value }))} required />
                </div>
                <div className="auth-form-group" style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px', fontWeight: '700' }}>Mobile Number *</label>
                  <input type="text" placeholder="10-digit Phone" value={authForm.phone} onChange={(e) => setAuthForm(prev => ({ ...prev, phone: e.target.value }))} required />
                </div>
                <div className="auth-form-group" style={{ marginBottom: '10px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px', fontWeight: '700' }}>Email Address *</label>
                  <input type="email" placeholder="Email Address" value={authForm.email} onChange={(e) => setAuthForm(prev => ({ ...prev, email: e.target.value }))} required />
                </div>
                
                {authForm.role === 'seller' && (
                  <>
                    <div className="auth-form-group" style={{ marginBottom: '10px' }}>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px', fontWeight: '700' }}>Company Name *</label>
                      <input type="text" placeholder="e.g. Nykaa Partners LLC" value={authForm.companyName || ''} onChange={(e) => setAuthForm(prev => ({ ...prev, companyName: e.target.value }))} required />
                    </div>
                    <div className="auth-form-group" style={{ marginBottom: '10px' }}>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px', fontWeight: '700' }}>Business Address *</label>
                      <input type="text" placeholder="e.g. Mumbai, India" value={authForm.companyAddress || ''} onChange={(e) => setAuthForm(prev => ({ ...prev, companyAddress: e.target.value }))} required />
                    </div>
                    <div className="auth-form-group" style={{ marginBottom: '10px' }}>
                      <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px', fontWeight: '700' }}>GSTIN / Tax ID</label>
                      <input type="text" placeholder="15-digit GSTIN (optional)" value={authForm.gstin || ''} onChange={(e) => setAuthForm(prev => ({ ...prev, gstin: e.target.value }))} />
                    </div>
                  </>
                )}

                <div className="auth-form-group" style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '11px', fontWeight: '700' }}>Password *</label>
                  <div style={{ position: 'relative' }}>
                    <input 
                      type={showSignupPassword ? "text" : "password"} 
                      placeholder="Password (min 6 characters)" 
                      value={authForm.password} 
                      onChange={(e) => setAuthForm(prev => ({ ...prev, password: e.target.value }))} 
                      style={{ width: '100%', paddingRight: '40px' }}
                      required 
                    />
                    <span 
                      onClick={() => setShowSignupPassword(prev => !prev)} 
                      style={{ 
                        position: 'absolute', 
                        right: '12px', 
                        top: '50%', 
                        transform: 'translateY(-50%)', 
                        cursor: 'pointer', 
                        color: 'var(--text-muted)',
                        zIndex: 10,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      <i className={showSignupPassword ? "fa-solid fa-eye-slash" : "fa-solid fa-eye"}></i>
                    </span>
                  </div>
                </div>
                <button type="submit" className="auth-btn" style={{ width: '100%', padding: '10px', background: 'var(--nykaa-pink)', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '700' }}>Register</button>
                <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '12px' }}>
                  Already have an account? <span style={{ color: 'var(--nykaa-pink)', cursor: 'pointer', fontWeight: '700' }} onClick={() => setAuthMode('login')}>Login</span>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MY ORDERS MODAL */}
      {isOrdersOpen && (
        <div className="modal-overlay active" onClick={() => setIsOrdersOpen(false)}>
          <div className="modal-content orders-modal" onClick={(e) => e.stopPropagation()} style={{ width: '500px', padding: '24px' }}>
            <button className="modal-close" onClick={() => setIsOrdersOpen(false)}><i className="fa-solid fa-xmark"></i></button>
            <div className="auth-header" style={{ marginBottom: '20px' }}>
              <h3>My Orders</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Your completed order history</p>
            </div>
            <div className="orders-list" style={{ maxHeight: '350px', overflowY: 'auto' }}>
              {ordersLoading ? (
                <div style={{ textAlign: 'center', padding: '30px' }}>Loading orders...</div>
              ) : orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                  <i className="fa-solid fa-box-open" style={{ fontSize: '36px', marginBottom: '12px' }}></i>
                  <p>No orders placed yet.</p>
                </div>
              ) : (
                orders.map(o => (
                  <div key={o.id} className="order-card" style={{ border: '1px solid var(--border-color)', borderRadius: '6px', padding: '14px', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid #eee', paddingBottom: '6px' }}>
                      <span style={{ fontWeight: '700', fontSize: '13px' }}>Order ID: NYK-{o.id}</span>
                      <strong style={{ color: 'var(--nykaa-pink)' }}>₹{o.total_amount}</strong>
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      <div><strong>Delivery Address:</strong> {o.shipping_address}</div>
                      <div style={{ marginTop: '4px' }}><strong>Status:</strong> {o.status.toUpperCase()} &middot; <strong>Payment Method:</strong> {o.payment_method}</div>
                    </div>
                    {o.items && o.items.length > 0 ? (
                      <div style={{ borderTop: '1px dashed #eee', paddingTop: '8px', marginTop: '8px' }}>
                        <div style={{ fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', color: '#888', marginBottom: '6px' }}>Items</div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {o.items.map((item, idx) => {
                            const imgSrc = item.imageurl && item.imageurl.startsWith('upload/')
                              ? `/${item.imageurl}`
                              : item.imageurl || 'https://via.placeholder.com/60?text=Product';
                            return (
                              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <img
                                  src={imgSrc}
                                  alt={item.name}
                                  style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #f0f0f0' }}
                                />
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#333', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                    {item.name}
                                  </div>
                                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                    Qty: {item.quantity} &middot; ₹{item.price}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer>
        <div className="container footer-top">
          <div className="footer-col footer-about">
            <h4 style={{ color: 'white', fontWeight: '800' }}>NYKAA</h4>
            <p>Your ultimate destination for makeup, clean skincare formulations, hair rituals, and elegant fragrances. Shop curated catalogs and glow daily.</p>
          </div>
          <div className="footer-col">
            <h4>Beauty Categories</h4>
            <ul>
              {['makeup', 'skin', 'hair', 'fragrance'].map(cat => (
                <li key={cat} onClick={() => {
                  setFilters(prev => ({ ...prev, category: [cat] }));
                  setActiveView('shop');
                }} style={{ cursor: 'pointer', textTransform: 'capitalize' }}>
                  {cat}
                </li>
              ))}
            </ul>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li onClick={() => setActiveView('home')} style={{ cursor: 'pointer' }}>Home Store</li>
              <li onClick={() => setActiveView('shop')} style={{ cursor: 'pointer' }}>All Products</li>
              <li onClick={() => setActiveView('wishlist')} style={{ cursor: 'pointer' }}>My Wishlist</li>
            </ul>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>&copy; 2026 Nykaa E-Retail Limited. All Rights Reserved. (Clone Demonstration)</span>
        </div>
      </footer>

    </div>
  );
}

// Subcomponent: Product Card
function ProductCard({ product, onAdd, onWishlist, wishlist, onNav, setView, fallbackImg }) {
  const isWishlisted = wishlist.includes(product.id);
  const mainImage = product.images && product.images.length > 0 ? product.images[0] : fallbackImg(product.brand, product.name);

  return (
    <div className="product-card">
      <button 
        className={`card-wishlist-btn ${isWishlisted ? 'active' : ''}`} 
        onClick={() => onWishlist(product.id)}
      >
        <i className={`${isWishlisted ? 'fa-solid' : 'fa-regular'} fa-heart`}></i>
      </button>
      <div 
        className="product-image-wrap" 
        onClick={() => { onNav(product.id); setView('product'); window.location.hash = `product?id=${product.id}`; }}
        style={{ cursor: 'pointer' }}
      >
        <img src={mainImage} alt={product.name} loading="lazy" />
      </div>
      <div className="product-info-wrap">
        <div className="product-brand">{product.brand}</div>
        <div 
          className="product-name" 
          onClick={() => { onNav(product.id); setView('product'); window.location.hash = `product?id=${product.id}`; }}
          style={{ cursor: 'pointer' }}
        >
          {product.name}
        </div>
        <div className="product-ratings">
          <span>{product.rating} <i className="fa-solid fa-star" style={{ fontSize: '10px' }}></i></span>
          <span className="ratings-count">({product.reviewsCount})</span>
        </div>
        <div className="product-price-row">
          <span className="selling-price">₹{product.price}</span>
          {product.discount > 0 && <span className="mrp-price">₹{product.mrp}</span>}
          {product.discount > 0 && <span className="discount-percent">{product.discount}% Off</span>}
        </div>
        <button className="add-bag-btn" onClick={() => onAdd(product.id, 1)}>
          <i className="fa-solid fa-bag-shopping"></i> Add to Bag
        </button>
      </div>
    </div>
  );
}

export default App;
