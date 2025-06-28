import { useState, useEffect, createContext, useContext, useRef } from 'react';

// You would typically link Bootstrap and Font Awesome in your public/index.html
// For this immersive, we'll assume they are available globally.

// Custom CSS for enhanced aesthetics and blue theme
const customStyles = `
  body {
    font-family: 'Inter', sans-serif;
    background-color: #f0f8ff; /* A very light blue background */
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .rounded-lg {
    border-radius: 0.75rem !important; /* Larger border-radius for cards */
  }
  .rounded-top-lg {
    border-top-left-radius: 0.75rem !important;
    border-top-right-radius: 0.75rem !important;
  }
  .rounded-bottom-lg {
    border-bottom-left-radius: 0.75rem !important;
    border-bottom-right-radius: 0.75rem !important;
  }

  /* Custom shadow for cards and buttons */
  .shadow-hover {
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  }
  .shadow-hover:hover {
    transform: translateY(-5px);
    box-shadow: 0 0.75rem 1.5rem rgba(0, 0, 0, 0.15) !important;
  }

  /* Gradient buttons - Blue theme */
  .btn-primary-gradient {
    background: linear-gradient(45deg, #1e90ff, #007bff); /* Dodger Blue to Bootstrap Primary Blue */
    border: none;
    transition: background 0.3s ease-in-out;
  }
  .btn-primary-gradient:hover {
    background: linear-gradient(45deg, #007bff, #0056b3); /* Darker blue on hover */
  }
  .btn-primary-gradient:focus, .btn-primary-gradient.focus {
    box-shadow: 0 0 0 0.25rem rgba(30, 144, 255, 0.5); /* Focus ring for blue theme */
  }

  .btn-outline-primary-gradient {
    border: 2px solid #1e90ff; /* Dodger Blue border */
    color: #1e90ff;
    background-color: transparent;
    transition: background-color 0.3s ease-in-out, color 0.3s ease-in-out;
  }
  .btn-outline-primary-gradient:hover {
    background-color: #1e90ff; /* Dodger Blue background on hover */
    color: #fff;
  }
  .btn-outline-primary-gradient:focus, .btn-outline-primary-gradient.focus {
    box-shadow: 0 0 0 0.25rem rgba(30, 144, 255, 0.5); /* Focus ring for blue theme */
  }

  /* Hero section background overlay */
  .hero-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 50, 0.5); /* Darker blue overlay */
    border-radius: 0.75rem;
  }

  .hero-content {
    position: relative;
    z-index: 1; /* Ensure content is above overlay */
  }

  /* Category card hover effect */
  .category-card {
    transition: transform 0.2s ease-in-out, background-color 0.2s ease-in-out;
    cursor: pointer;
  }
  .category-card:hover {
    transform: translateY(-3px);
    background-color: #e0f2f7; /* Lighter blue on hover */
  }

  /* Text color for primary elements */
  .text-primary {
    color: #007bff !important; /* Bootstrap primary blue */
  }
  .text-info-blue {
      color: #17a2b8 !important; /* A default Bootstrap info blue, adjust if needed */
  }

  /* Darker background for header and footer to contrast with blue theme */
  .bg-dark {
    background-color: #212529 !important; /* Keep original dark for contrast */
  }

  /* Custom toast styling */
  .custom-toast {
    background-color: #007bff; /* Primary blue for toasts */
    color: white;
    border: none;
    border-radius: 0.5rem;
    box-shadow: 0 0.5rem 1rem rgba(0,0,0,.15);
  }
  .custom-toast .btn-close {
    filter: invert(1); /* White close button for dark background */
  }
`;

// Base URL for your backend API
const API_BASE_URL = 'http://localhost:5000/api';

// Context for managing application state
const AppContext = createContext();

// AppProvider component to wrap the entire application
const AppProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [cartItems, setCartItems] = useState([]);
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      return null;
    }
  });
  const [toasts, setToasts] = useState([]); // For managing toast notifications

  // Function to add a toast notification
  const addToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  // Function to remove a toast notification
  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  // Effect to fetch products when the component mounts
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/products`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products:", error);
        addToast("Failed to load products. Please try again later.", "danger");
      }
    };
    fetchProducts();
  }, []);

  // Effect to fetch cart items when user or page loads
  useEffect(() => {
    const fetchCartItems = async () => {
      if (user && user.token) {
        try {
          const response = await fetch(`${API_BASE_URL}/cart`, {
            headers: {
              'Authorization': `Bearer ${user.token}`
            }
          });
          if (!response.ok) {
            // If token is invalid or expired, log out the user
            if (response.status === 401 || response.status === 403) {
              logout();
              addToast("Your session has expired. Please log in again.", "warning");
              return;
            }
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const data = await response.json();
          // Ensure product details are available for cart items
          const populatedCartItems = data.map(item => ({
            ...item.productId, // This assumes populate('cart.productId') works correctly on backend
            quantity: item.quantity,
            id: item.productId._id // Use backend's product ID for consistency
          }));
          setCartItems(populatedCartItems);
        } catch (error) {
          console.error("Failed to fetch cart items:", error);
          addToast("Failed to load cart. Please try again.", "danger");
        }
      } else {
        setCartItems([]); // Clear cart if no user is logged in
      }
    };
    fetchCartItems();
  }, [user]); // Re-fetch cart when user changes (login/logout)

  // Save user and cart to local storage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error("Failed to save user to localStorage", error);
    }
  }, [user]);

  const addToCart = async (product, quantity = 1) => {
    if (!user || !user.token) {
      addToast("Please log in to add items to your cart.", "info");
      navigateTo('login');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/cart/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ productId: product._id, quantity }) // Changed product.id to product._id
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      // Re-populate the cart items with full product details
      const populatedCartItems = data.map(item => ({
        ...item.productId, // This assumes populate('cart.productId') works correctly on backend
        quantity: item.quantity,
        id: item.productId._id // Use backend's product ID for consistency
      }));
      setCartItems(populatedCartItems);
      addToast(`${quantity} of "${product.name}" added to cart!`, 'success');
    } catch (error) {
      console.error("Failed to add to cart:", error);
      addToast(`Error adding "${product.name}" to cart: ${error.message}`, "danger");
    }
  };

  const updateCartQuantity = async (productId, newQuantity) => {
    if (!user || !user.token) {
      addToast("Please log in to update your cart.", "info");
      navigateTo('login');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/cart/update/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ quantity: newQuantity })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      // Re-populate the cart items with full product details
      const populatedCartItems = data.map(item => ({
        ...item.productId, // This assumes populate('cart.productId') works correctly on backend
        quantity: item.quantity,
        id: item.productId._id // Use backend's product ID for consistency
      }));
      setCartItems(populatedCartItems);
      const updatedItem = populatedCartItems.find(item => item.id === productId);
      if (newQuantity === 0) {
        addToast(`"${updatedItem?.name || 'Item'}" removed from cart.`, 'info');
      } else {
        addToast(`Quantity of "${updatedItem?.name || 'Item'}" updated to ${newQuantity}.`, 'info');
      }

    } catch (error) {
      console.error("Failed to update cart quantity:", error);
      addToast(`Error updating cart: ${error.message}`, "danger");
    }
  };

  const removeFromCart = async (productId) => {
    if (!user || !user.token) {
      addToast("Please log in to modify your cart.", "info");
      navigateTo('login');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/cart/remove/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      const itemToRemove = cartItems.find(item => item.id === productId);
      setCartItems(data.map(item => ({
        ...item.productId,
        quantity: item.quantity,
        id: item.productId._id
      })));
      addToast(`"${itemToRemove?.name || 'Item'}" removed from cart.`, 'info');
    } catch (error) {
      console.error("Failed to remove from cart:", error);
      addToast(`Error removing item from cart: ${error.message}`, "danger");
    }
  };

  const clearCart = async () => {
    if (!user || !user.token) {
      addToast("Please log in to clear your cart.", "info");
      navigateTo('login');
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/cart/clear`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }
      setCartItems([]);
      addToast('Cart cleared!', 'info');
    } catch (error) {
      console.error("Failed to clear cart:", error);
      addToast(`Error clearing cart: ${error.message}`, "danger");
    }
  };

  const getTotalCartItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalCartPrice = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const navigateTo = (page, productId = null) => {
    setCurrentPage(page);
    setSelectedProductId(productId);
    // Scroll to top when navigating
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Login failed.');
      }
      setUser(data.user); // Store user info including token
      addToast('Logged in successfully!', 'success');
      navigateTo('home');
      return true;
    } catch (error) {
      console.error("Login error:", error);
      addToast(`Login failed: ${error.message}`, "danger");
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setCartItems([]); // Clear cart on logout
    addToast('Logged out.', 'info');
    navigateTo('home');
  };

  return (
    <AppContext.Provider
      value={{
        products,
        cartItems,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        getTotalCartItems,
        getTotalCartPrice,
        currentPage,
        navigateTo,
        selectedProductId,
        user,
        login,
        logout,
        addToast,
        toasts,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// --- Toast Notification Component ---
const Toast = ({ id, message, type, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(id);
    }, 3000); // Auto-dismiss after 3 seconds
    return () => clearTimeout(timer);
  }, [id, onRemove]);

  const alertClass = {
    info: 'alert-info',
    success: 'alert-success',
    danger: 'alert-danger',
    warning: 'alert-warning',
  }[type] || 'alert-info';

  return (
    <div
      className={`alert ${alertClass} alert-dismissible fade show custom-toast`}
      role="alert"
      style={{
        position: 'relative',
        marginBottom: '10px',
        maxWidth: '350px',
        width: '100%',
        zIndex: 1050,
      }}
    >
      {message}
      <button type="button" className="btn-close" aria-label="Close" onClick={() => onRemove(id)}></button>
    </div>
  );
};

const ToastContainer = () => {
  const { toasts, removeToast } = useContext(AppContext);

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1050,
        display: 'flex',
        flexDirection: 'column-reverse', // Stack toasts from bottom up
        gap: '10px',
      }}
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onRemove={removeToast} />
      ))}
    </div>
  );
};

// Header Component
const Header = () => {
  const { navigateTo, getTotalCartItems, user, logout, addToast } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    // In a full app, this would filter products or navigate to a search results page
    console.log('Searching for:', searchTerm);
    addToast("Search functionality is not fully implemented in this demo.", "info");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark sticky-top shadow-sm">
      <div className="container-fluid">
        <a className="navbar-brand d-flex align-items-center" href="#" onClick={() => navigateTo('home')}>
          <i className="fas fa-shopping-bag me-2"></i>
          <span className="fw-bold">MyStore</span>
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <a className="nav-link active" aria-current="page" href="#" onClick={() => navigateTo('home')}>
                Home
              </a>
            </li>
            {/* Add more navigation links here */}
          </ul>
          <form className="d-flex flex-grow-1 mx-lg-4" onSubmit={handleSearch}>
            <input
              className="form-control me-2 rounded-pill"
              type="search"
              placeholder="Search products..."
              aria-label="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn btn-outline-light rounded-pill" type="submit">
              <i className="fas fa-search"></i>
            </button>
          </form>
          <ul className="navbar-nav mb-2 mb-lg-0">
            <li className="nav-item">
              <a className="nav-link position-relative" href="#" onClick={() => navigateTo('cart')}>
                <i className="fas fa-shopping-cart"></i> Cart
                {getTotalCartItems() > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {getTotalCartItems()}
                    <span className="visually-hidden">items in cart</span>
                  </span>
                )}
              </a>
            </li>
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="navbarDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="fas fa-user-circle"></i> {user ? user.username : 'Account'}
              </a>
              <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="navbarDropdown">
                {user ? (
                  <>
                    <li><a className="dropdown-item" href="#" onClick={() => navigateTo('profile')}>My Profile</a></li>
                    <li><a className="dropdown-item" href="#" onClick={() => addToast("Order History functionality not implemented", "info")}>Order History</a></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><a className="dropdown-item" href="#" onClick={logout}>Logout</a></li>
                  </>
                ) : (
                  <li><a className="dropdown-item" href="#" onClick={() => navigateTo('login')}>Login</a></li>
                )}
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

// Footer Component
const Footer = () => {
  return (
    <footer className="bg-dark text-white-50 py-4 mt-5 shadow-lg">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-3 mb-md-0">
            <h5>About Us</h5>
            <p>MyStore is your one-stop shop for all your needs. We offer a wide range of high-quality products at competitive prices.</p>
          </div>
          <div className="col-md-4 mb-3 mb-md-0">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><a href="#" className="text-white-50 text-decoration-none">Privacy Policy</a></li>
              <li><a href="#" className="text-white-50 text-decoration-none">Terms of Service</a></li>
              <li><a href="#" className="text-white-50 text-decoration-none">FAQ</a></li>
              <li><a href="#" className="text-white-50 text-decoration-none">Contact Us</a></li>
            </ul>
          </div>
          <div className="col-md-4">
            <h5>Follow Us</h5>
            <ul className="list-unstyled d-flex">
              <li className="me-3"><a href="#" className="text-white-50"><i className="fab fa-facebook fa-lg"></i></a></li>
              <li className="me-3"><a href="#" className="text-white-50"><i className="fab fa-twitter fa-lg"></i></a></li>
              <li><a href="#" className="text-white-50"><i className="fab fa-instagram fa-lg"></i></a></li>
            </ul>
          </div>
        </div>
        <div className="text-center mt-4 border-top border-secondary pt-3">
          <p className="mb-0">&copy; {new Date().getFullYear()} MyStore. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

// Product Card Component
const ProductCard = ({ product }) => {
  const { addToCart, navigateTo } = useContext(AppContext);

  return (
    <div className="col-sm-6 col-md-4 col-lg-3 mb-4">
      <div className="card h-100 shadow-sm rounded-lg border-0 shadow-hover">
        <img
          src={product.imageUrl}
          className="card-img-top rounded-top-lg"
          alt={product.name}
          onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x300/e0e0e0/333333?text=Image+Error`; }}
          style={{ objectFit: 'cover', height: '200px' }}
        />
        <div className="card-body d-flex flex-column">
          <h5 className="card-title text-truncate">{product.name}</h5>
          <p className="card-text text-muted small mb-2">{product.category}</p>
          <p className="card-text flex-grow-1" style={{ fontSize: '0.9em', maxHeight: '3em', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {product.description}
          </p>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <span className="h6 mb-0 text-primary">${product.price.toFixed(2)}</span>
            <small className="text-warning">
              {[...Array(Math.floor(product.rating))].map((_, i) => <i key={i} className="fas fa-star"></i>)}
              {product.rating % 1 !== 0 && <i className="fas fa-star-half-alt"></i>}
              {product.rating < 5 && [...Array(5 - Math.ceil(product.rating))].map((_, i) => <i key={i} className="far fa-star"></i>)}
              <span className="ms-1 text-muted">({product.numReviews})</span>
            </small>
          </div>
          <div className="d-grid gap-2">
            <button
              className="btn btn-outline-primary-gradient btn-sm rounded-pill"
              onClick={() => navigateTo('product', product._id)}
            >
              View Details
            </button>
            <button
              className="btn btn-primary-gradient btn-sm rounded-pill"
              onClick={() => addToCart(product)}
              disabled={product.stock === 0}
            >
              <i className="fas fa-cart-plus me-1"></i>
              {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Home Page Component
const HomePage = () => {
  const { products, navigateTo } = useContext(AppContext);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name-asc'); // Default sort

  // Get unique categories
  const categories = ['All', ...new Set(products.map(p => p.category))];

  useEffect(() => {
    let tempProducts = [...products];

    // Filter by category
    if (selectedCategory !== 'All') {
      tempProducts = tempProducts.filter(p => p.category === selectedCategory);
    }

    // Sort products
    tempProducts.sort((a, b) => {
      switch (sortBy) {
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating-desc':
          return b.rating - a.rating;
        default:
          return 0;
      }
    });

    setFilteredProducts(tempProducts);
  }, [products, selectedCategory, sortBy]);


  const newArrivals = products.slice(0, 4); // First 4 as new arrivals
  const popularProducts = [...products].sort((a, b) => b.numReviews - a.numReviews).slice(0, 4); // Most reviewed as popular


  return (
    <div className="container mt-4">
      {/* Hero Section */}
      <div className="p-4 p-md-5 mb-4 text-white rounded-3 bg-dark shadow-lg position-relative overflow-hidden" style={{ backgroundImage: `url('https://placehold.co/1200x400/1e90ff/f0f8ff?text=Shop+Blue+Today!')`, backgroundSize: 'cover', backgroundPosition: 'center', minHeight: '300px' }}>
        <div className="hero-overlay"></div>
        <div className="col-md-8 px-0 hero-content">
          <h1 className="display-4 fst-italic animate__animated animate__fadeInDown">Discover Your Next Favorite Item!</h1>
          <p className="lead my-3 animate__animated animate__fadeInUp animate__delay-0.5s">Explore a wide range of products from electronics to home essentials. Find the best deals and newest arrivals.</p>
          <p className="lead mb-0 animate__animated animate__fadeInUp animate__delay-1s">
            <a href="#" className="text-white fw-bold text-decoration-none" onClick={() => navigateTo('home')}>
              Continue exploring... <i className="fas fa-arrow-right ms-2"></i>
            </a>
          </p>
        </div>
      </div>

      {/* Featured Categories */}
      <h2 className="mb-4 text-center fw-bold text-dark">Shop by Category</h2>
      <div className="row row-cols-1 row-cols-md-3 g-4 mb-5">
        <div className="col">
          <div className="card bg-light text-center h-100 rounded-3 shadow-sm category-card" onClick={() => { setSelectedCategory('Electronics'); window.scrollTo({ top: document.querySelector('.product-listing-section').offsetTop, behavior: 'smooth' }); }}>
            <div className="card-body py-4">
              <i className="fas fa-laptop fa-3x text-primary mb-3"></i>
              <h5 className="card-title fw-bold">Electronics</h5>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card bg-light text-center h-100 rounded-3 shadow-sm category-card" onClick={() => { setSelectedCategory('Home & Kitchen'); window.scrollTo({ top: document.querySelector('.product-listing-section').offsetTop, behavior: 'smooth' }); }}>
            <div className="card-body py-4">
              <i className="fas fa-couch fa-3x text-success mb-3"></i>
              <h5 className="card-title fw-bold">Home & Living</h5>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card bg-light text-center h-100 rounded-3 shadow-sm category-card" onClick={() => { setSelectedCategory('Books & Media'); window.scrollTo({ top: document.querySelector('.product-listing-section').offsetTop, behavior: 'smooth' }); }}>
            <div className="card-body py-4">
              <i className="fas fa-book-open fa-3x text-info-blue mb-3"></i>
              <h5 className="card-title fw-bold">Books & Media</h5>
            </div>
          </div>
        </div>
      </div>

      {/* New Arrivals Section */}
      <h2 className="mb-4 text-center fw-bold text-dark">New Arrivals</h2>
      <div className="row mb-5">
        {newArrivals.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {/* Popular Products Section */}
      <h2 className="mb-4 text-center fw-bold text-dark">Popular Products</h2>
      <div className="row mb-5">
        {popularProducts.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>

      {/* Product Listings with Filters */}
      <h2 className="mb-4 text-center fw-bold text-dark product-listing-section">All Products</h2>
      <div className="row mb-4 align-items-center">
        <div className="col-md-6 mb-3 mb-md-0">
          <label htmlFor="categoryFilter" className="form-label me-2">Filter by Category:</label>
          <select
            id="categoryFilter"
            className="form-select rounded-pill d-inline-block w-auto shadow-sm"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="col-md-6 text-md-end">
          <label htmlFor="sortBy" className="form-label me-2">Sort by:</label>
          <select
            id="sortBy"
            className="form-select rounded-pill d-inline-block w-auto shadow-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="price-asc">Price (Low to High)</option>
            <option value="price-desc">Price (High to Low)</option>
            <option value="rating-desc">Rating (High to Low)</option>
          </select>
        </div>
      </div>
      <div className="row">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))
        ) : (
          <div className="col-12 text-center py-5">
            <h4 className="text-muted">No products found matching your criteria.</h4>
          </div>
        )}
      </div>
    </div>
  );
};

// Product Detail Page Component
const ProductDetailPage = ({ productId }) => {
  const { products, addToCart, navigateTo, addToast } = useContext(AppContext);
  const product = products.find((p) => p._id === productId); // Use _id for lookup
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    // Reset quantity when product changes
    setQuantity(1);
  }, [productId]);

  if (!product) {
    return (
      <div className="container mt-5 text-center">
        <h2 className="text-danger">Product Not Found</h2>
        <p>The product you are looking for does not exist.</p>
        <button className="btn btn-primary-gradient btn-lg rounded-pill" onClick={() => navigateTo('home')}>
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb bg-white p-2 rounded-lg shadow-sm">
          <li className="breadcrumb-item"><a href="#" onClick={() => navigateTo('home')} className="text-decoration-none">Home</a></li>
          <li className="breadcrumb-item"><a href="#" onClick={() => navigateTo('home')} className="text-decoration-none">{product.category}</a></li>
          <li className="breadcrumb-item active" aria-current="page">{product.name}</li>
        </ol>
      </nav>

      <div className="row g-4 mb-5">
        <div className="col-md-6 col-lg-5">
          <div id={`productCarousel-${product._id}`} className="carousel slide shadow-lg rounded-3" data-bs-ride="carousel">
            <div className="carousel-inner rounded-3">
              {product.carouselImages && product.carouselImages.length > 0 ? (
                product.carouselImages.map((img, index) => (
                  <div key={index} className={`carousel-item ${index === 0 ? 'active' : ''}`}>
                    <img
                      src={img}
                      className="d-block w-100 img-fluid rounded-3"
                      alt={`Product image ${index + 1}`}
                      style={{ objectFit: 'cover', maxHeight: '500px' }}
                      onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/800x600/e0e0e0/333333?text=Image+Error`; }}
                    />
                  </div>
                ))
              ) : (
                <div className="carousel-item active">
                  <img
                    src={product.imageUrl}
                    className="d-block w-100 img-fluid rounded-3"
                    alt={product.name}
                    style={{ objectFit: 'cover', maxHeight: '500px' }}
                    onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/800x600/e0e0e0/333333?text=Image+Error`; }}
                  />
                </div>
              )}
            </div>
            {product.carouselImages && product.carouselImages.length > 1 && (
              <>
                <button className="carousel-control-prev" type="button" data-bs-target={`#productCarousel-${product._id}`} data-bs-slide="prev">
                  <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Previous</span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target={`#productCarousel-${product._id}`} data-bs-slide="next">
                  <span className="carousel-control-next-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Next</span>
                </button>
              </>
            )}
          </div>
        </div>
        <div className="col-md-6 col-lg-7">
          <div className="p-3">
            <h1 className="mb-2 fw-bold">{product.name}</h1>
            <p className="text-muted mb-2 fs-5">{product.category}</p>
            <div className="mb-3 d-flex align-items-center">
              <span className="h3 text-primary me-3">${product.price.toFixed(2)}</span>
              <span className="text-warning fs-5">
                {[...Array(Math.floor(product.rating))].map((_, i) => <i key={`star-${i}`} className="fas fa-star"></i>)}
                {product.rating % 1 !== 0 && <i className="fas fa-star-half-alt"></i>}
                {product.rating < 5 && [...Array(5 - Math.ceil(product.rating))].map((_, i) => <i key={`empty-star-${i}`} className="far fa-star"></i>)}
                <span className="ms-2 text-muted fs-6">({product.numReviews} reviews)</span>
              </span>
            </div>
            <hr />
            <p className="lead fw-normal">{product.description}</p>
            <p className="text-secondary">{product.longDescription}</p>

            {product.specifications && Object.keys(product.specifications).length > 0 && (
              <>
                <h4 className="mt-4 mb-3 fw-bold">Specifications</h4>
                <ul className="list-group list-group-flush mb-4">
                  {Object.entries(product.specifications).map(([key, value]) => (
                    <li key={key} className="list-group-item d-flex justify-content-between align-items-center bg-transparent px-0">
                      <span className="fw-bold">{key}:</span>
                      <span>{value}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <div className="d-flex align-items-center mb-4">
              <span className="me-3 fw-bold">Quantity:</span>
              <div className="input-group" style={{ width: '150px' }}>
                <button
                  className="btn btn-outline-secondary rounded-start-pill"
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </button>
                <input
                  type="text"
                  className="form-control text-center"
                  value={quantity}
                  readOnly
                />
                <button
                  className="btn btn-outline-secondary rounded-end-pill"
                  type="button"
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                >
                  +
                </button>
              </div>
              <span className="ms-3 text-muted">({product.stock} in stock)</span>
            </div>

            <div className="d-grid gap-2 d-md-block">
              <button
                className="btn btn-primary-gradient btn-lg rounded-pill px-5 me-md-3"
                onClick={() => {
                  addToCart(product, quantity);
                  // navigateTo('cart'); // Optionally navigate to cart after adding
                }}
                disabled={product.stock === 0 || quantity > product.stock}
              >
                <i className="fas fa-cart-plus me-2"></i> Add to Cart
              </button>
              <button
                className="btn btn-outline-secondary-gradient btn-lg rounded-pill px-5"
                onClick={() => addToast("Buy now functionality not implemented", "info")}
              >
                Buy Now
              </button>
              <button
                className="btn btn-outline-info rounded-pill ms-md-3"
                onClick={() => addToast("Added to Wishlist (placeholder)", "info")}
              >
                <i className="far fa-heart me-1"></i> Add to Wishlist
              </button>
            </div>
          </div>
        </div>
      </div>

      {product.reviews && product.reviews.length > 0 && (
        <div className="mt-5">
          <h3 className="mb-4 fw-bold text-dark">Customer Reviews ({product.numReviews})</h3>
          {product.reviews.map(review => (
            <div key={review._id || review.id} className="card mb-3 shadow-sm rounded-lg"> {/* Use _id or id */}
              <div className="card-body">
                <h5 className="card-title mb-1">{review.author}</h5>
                <small className="text-warning">
                  {[...Array(review.rating)].map((_, i) => <i key={i} className="fas fa-star"></i>)}
                  {[...Array(5 - review.rating)].map((_, i) => <i key={i} className="far fa-star"></i>)}
                </small>
                <p className="card-text mt-2">{review.comment}</p>
              </div>
            </div>
          ))}
          <button className="btn btn-outline-primary-gradient rounded-pill mt-3" onClick={() => addToast("Write a review functionality (placeholder)", "info")}>
            Write a Review
          </button>
        </div>
      )}

      {/* Related Products Section */}
      <h3 className="mb-4 mt-5 fw-bold text-dark">You might also like</h3>
      <div className="row">
        {products.filter(p => p._id !== productId && p.category === product.category).slice(0, 4).map(relatedProduct => (
          <ProductCard key={relatedProduct._id} product={relatedProduct} />
        ))}
      </div>
    </div>
  );
};

// Cart Page Component
const CartPage = () => {
  const { cartItems, updateCartQuantity, removeFromCart, getTotalCartPrice, navigateTo, addToast } = useContext(AppContext);

  if (cartItems.length === 0) {
    return (
      <div className="container mt-5 text-center">
        <i className="fas fa-shopping-cart fa-5x text-muted mb-3 animate__animated animate__bounceIn"></i>
        <h2 className="mb-3 fw-bold">Your Cart is Empty</h2>
        <p className="lead">Looks like you haven't added anything to your cart yet. Start shopping now!</p>
        <button className="btn btn-primary-gradient btn-lg rounded-pill" onClick={() => navigateTo('home')}>
          <i className="fas fa-store me-2"></i> Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5">
      <h2 className="mb-4 fw-bold text-dark">Shopping Cart ({cartItems.length} items)</h2>
      <div className="row">
        <div className="col-lg-8">
          {cartItems.map((item) => (
            <div key={item.id} className="card mb-3 shadow-sm rounded-lg shadow-hover">
              <div className="row g-0">
                <div className="col-md-3">
                  <img
                    src={item.imageUrl}
                    className="img-fluid rounded-start-lg"
                    alt={item.name}
                    style={{ objectFit: 'cover', height: '150px', width: '100%' }}
                    onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/150x150/e0e0e0/333333?text=Image+Error`; }}
                  />
                </div>
                <div className="col-md-9">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h5 className="card-title fw-bold mb-1">{item.name}</h5>
                      <button
                        className="btn btn-danger btn-sm rounded-pill"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <i className="fas fa-trash-alt"></i> Remove
                      </button>
                    </div>
                    <p className="card-text text-primary fw-bold mb-2 fs-5">${item.price.toFixed(2)}</p>
                    <div className="d-flex align-items-center">
                      <label htmlFor={`quantity-${item.id}`} className="me-2 fw-bold">Quantity:</label>
                      <div className="input-group" style={{ width: '120px' }}>
                        <button
                          className="btn btn-outline-secondary rounded-start-pill"
                          type="button"
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                        >
                          -
                        </button>
                        <input
                          type="text"
                          className="form-control text-center"
                          value={item.quantity}
                          readOnly
                        />
                        <button
                          className="btn btn-outline-secondary rounded-end-pill"
                          type="button"
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <span className="ms-3 text-muted">Subtotal: <span className="fw-bold">${(item.price * item.quantity).toFixed(2)}</span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="col-lg-4">
          <div className="card shadow-lg rounded-lg sticky-top" style={{ top: '15px' }}>
            <div className="card-body">
              <h4 className="card-title mb-3 fw-bold">Order Summary</h4>
              <ul className="list-group list-group-flush mb-3">
                <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                  Items ({cartItems.length})
                  <span>${getTotalCartPrice().toFixed(2)}</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center px-0">
                  Shipping
                  <span className="text-success">FREE</span>
                </li>
                <li className="list-group-item d-flex justify-content-between align-items-center px-0 fw-bold fs-5">
                  Total
                  <span>${getTotalCartPrice().toFixed(2)}</span>
                </li>
              </ul>
              <div className="d-grid gap-2">
                <button
                  className="btn btn-primary-gradient btn-lg rounded-pill"
                  onClick={() => navigateTo('checkout')}
                  disabled={getTotalCartItems() === 0}
                >
                  <i className="fas fa-credit-card me-2"></i> Proceed to Checkout
                </button>
                <button
                  className="btn btn-outline-secondary rounded-pill"
                  onClick={() => navigateTo('home')}
                >
                  <i className="fas fa-shopping-basket me-2"></i> Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Checkout Page Components
const ShippingAddressForm = ({ onNext }) => {
  const { addToast } = useContext(AppContext);
  const [address, setAddress] = useState({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onNext) {
      // Basic validation
      if (!address.fullName || !address.addressLine1 || !address.city || !address.state || !address.zipCode || !address.country) {
        addToast("Please fill in all required shipping address fields.", "danger");
        return;
      }
      onNext(address);
    }
  };

  return (
    <div className="card shadow-sm rounded-lg p-4">
      <h4 className="mb-4 fw-bold">Shipping Address</h4>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="fullName" className="form-label">Full Name</label>
          <input type="text" className="form-control rounded-pill" id="fullName" name="fullName" value={address.fullName} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label htmlFor="addressLine1" className="form-label">Address Line 1</label>
          <input type="text" className="form-control rounded-pill" id="addressLine1" name="addressLine1" value={address.addressLine1} onChange={handleChange} required />
        </div>
        <div className="mb-3">
          <label htmlFor="addressLine2" className="form-label">Address Line 2 (Optional)</label>
          <input type="text" className="form-control rounded-pill" id="addressLine2" name="addressLine2" value={address.addressLine2} onChange={handleChange} />
        </div>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="city" className="form-label">City</label>
            <input type="text" className="form-control rounded-pill" id="city" name="city" value={address.city} onChange={handleChange} required />
          </div>
          <div className="col-md-6 mb-3">
            <label htmlFor="state" className="form-label">State/Province</label>
            <input type="text" className="form-control rounded-pill" id="state" name="state" value={address.state} onChange={handleChange} required />
          </div>
        </div>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="zipCode" className="form-label">Zip/Postal Code</label>
            <input type="text" className="form-control rounded-pill" id="zipCode" name="zipCode" value={address.zipCode} onChange={handleChange} required />
          </div>
          <div className="col-md-6 mb-3">
            <label htmlFor="country" className="form-label">Country</label>
            <input type="text" className="form-control rounded-pill" id="country" name="country" value={address.country} onChange={handleChange} required />
          </div>
        </div>
        <div className="d-grid">
          <button type="submit" className="btn btn-primary-gradient rounded-pill btn-lg">
            Continue to Payment
          </button>
        </div>
      </form>
    </div>
  );
};

const PaymentMethodSelection = ({ onNext, onBack }) => {
  const { addToast } = useContext(AppContext);
  const [paymentMethod, setPaymentMethod] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (paymentMethod) {
      if (onNext) onNext(paymentMethod);
    } else {
      addToast("Please select a payment method.", "danger");
    }
  };

  return (
    <div className="card shadow-sm rounded-lg p-4">
      <h4 className="mb-4 fw-bold">Payment Method</h4>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <div className="form-check">
            <input className="form-check-input" type="radio" name="paymentMethod" id="creditCard" value="Credit Card" checked={paymentMethod === 'Credit Card'} onChange={(e) => setPaymentMethod(e.target.value)} />
            <label className="form-check-label" htmlFor="creditCard">
              <i className="fas fa-credit-card me-2"></i> Credit Card (Placeholder)
            </label>
          </div>
        </div>
        <div className="mb-3">
          <div className="form-check">
            <input className="form-check-input" type="radio" name="paymentMethod" id="paypal" value="PayPal" checked={paymentMethod === 'PayPal'} onChange={(e) => setPaymentMethod(e.target.value)} />
            <label className="form-check-label" htmlFor="paypal">
              <i className="fab fa-paypal me-2"></i> PayPal (Placeholder)
            </label>
          </div>
        </div>
        <div className="d-flex justify-content-between mt-4">
          <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={onBack}>
            Back to Shipping
          </button>
          <button type="submit" className="btn btn-primary-gradient rounded-pill px-4">
            Review Order
          </button>
        </div>
      </form>
    </div>
  );
};

const OrderSummaryConfirmation = ({ shippingAddress, paymentMethod, onPlaceOrder, onBack }) => {
  const { cartItems, getTotalCartPrice, getTotalCartItems } = useContext(AppContext);

  return (
    <div className="card shadow-sm rounded-lg p-4">
      <h4 className="mb-4 fw-bold">Order Summary</h4>

      <div className="mb-4">
        <h5 className="fw-bold">Shipping To:</h5>
        <p className="mb-1">{shippingAddress.fullName}</p>
        <p className="mb-1">{shippingAddress.addressLine1}</p>
        {shippingAddress.addressLine2 && <p className="mb-1">{shippingAddress.addressLine2}</p>}
        <p className="mb-1">{shippingAddress.city}, {shippingAddress.state} {shippingAddress.zipCode}</p>
        <p className="mb-1">{shippingAddress.country}</p>
      </div>

      <div className="mb-4">
        <h5 className="fw-bold">Payment Method:</h5>
        <p>{paymentMethod || 'Not selected'}</p>
      </div>

      <h5 className="fw-bold">Items in Cart:</h5>
      <ul className="list-group list-group-flush mb-4">
        {cartItems.map(item => (
          <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center px-0">
            <span>{item.name} x {item.quantity}</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </li>
        ))}
      </ul>

      <ul className="list-group list-group-flush mb-4">
        <li className="list-group-item d-flex justify-content-between align-items-center px-0">
          Subtotal ({getTotalCartItems()} items)
          <span>${getTotalCartPrice().toFixed(2)}</span>
        </li>
        <li className="list-group-item d-flex justify-content-between align-items-center px-0">
          Shipping
          <span className="text-success">FREE</span>
        </li>
        <li className="list-group-item d-flex justify-content-between align-items-center px-0 fw-bold fs-5">
          Order Total
          <span>${getTotalCartPrice().toFixed(2)}</span>
        </li>
      </ul>

      <div className="d-flex justify-content-between mt-4">
        <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={onBack}>
          Back to Payment
        </button>
        <button type="button" className="btn btn-primary-gradient rounded-pill px-4" onClick={onPlaceOrder}>
          Place Order
        </button>
      </div>
    </div>
  );
};

const CheckoutPage = () => {
  const { navigateTo, clearCart, addToast } = useContext(AppContext);
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: Shipping, 2: Payment, 3: Review
  const [shippingAddress, setShippingAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleShippingSubmit = (address) => {
    setShippingAddress(address);
    setCheckoutStep(2);
  };

  const handlePaymentSubmit = (method) => {
    setPaymentMethod(method);
    setCheckoutStep(3);
  };

  const handlePlaceOrder = () => {
    setLoading(true);
    // Simulate API call for placing order
    setTimeout(() => {
      addToast('Order placed successfully!', 'success');
      clearCart();
      setLoading(false);
      navigateTo('order-confirmation'); // Navigate to a dedicated confirmation page or home
    }, 2000);
  };

  const renderStep = () => {
    switch (checkoutStep) {
      case 1:
        return <ShippingAddressForm onNext={handleShippingSubmit} />;
      case 2:
        return <PaymentMethodSelection onNext={handlePaymentSubmit} onBack={() => setCheckoutStep(1)} />;
      case 3:
        return (
          <OrderSummaryConfirmation
            shippingAddress={shippingAddress}
            paymentMethod={paymentMethod}
            onPlaceOrder={handlePlaceOrder}
            onBack={() => setCheckoutStep(2)}
          />
        );
      default:
        return <ShippingAddressForm onNext={handleShippingSubmit} />;
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-3 fs-5">Placing your order, please wait...</p>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5">
      <h2 className="mb-4 fw-bold text-dark text-center">Checkout</h2>
      <div className="progress mb-4" style={{ height: '25px' }}>
        <div
          className={`progress-bar ${checkoutStep >= 1 ? 'bg-primary' : 'bg-light text-dark'}`}
          role="progressbar"
          style={{ width: '33.33%' }}
          aria-valuenow="33"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          {checkoutStep === 1 ? 'Shipping' : ''}
        </div>
        <div
          className={`progress-bar ${checkoutStep >= 2 ? 'bg-primary' : 'bg-light text-dark'}`}
          role="progressbar"
          style={{ width: '33.33%' }}
          aria-valuenow="66"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          {checkoutStep === 2 ? 'Payment' : ''}
        </div>
        <div
          className={`progress-bar ${checkoutStep >= 3 ? 'bg-primary' : 'bg-light text-dark'}`}
          role="progressbar"
          style={{ width: '33.33%' }}
          aria-valuenow="100"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          {checkoutStep === 3 ? 'Review' : ''}
        </div>
      </div>
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {renderStep()}
        </div>
      </div>
    </div>
  );
};

// Order Confirmation Page
const OrderConfirmationPage = () => {
  const { navigateTo, addToast } = useContext(AppContext);
  return (
    <div className="container mt-5 text-center py-5">
      <i className="fas fa-check-circle fa-5x text-success mb-3 animate__animated animate__bounceIn"></i>
      <h2 className="mb-3 fw-bold text-dark">Thank You for Your Order!</h2>
      <p className="lead">Your order has been placed successfully and will be processed shortly.</p>
      <p>A confirmation email has been sent to your registered email address.</p>
      <button className="btn btn-primary-gradient btn-lg rounded-pill mt-3" onClick={() => navigateTo('home')}>
        <i className="fas fa-home me-2"></i> Continue Shopping
      </button>
      <button className="btn btn-outline-secondary rounded-pill mt-3 ms-3" onClick={() => addToast("View Order Details (placeholder)", "info")}>
        <i className="fas fa-receipt me-2"></i> View Order Details
      </button>
    </div>
  );
};

// User Profile Page (Placeholder)
const UserProfilePage = () => {
  const { user, navigateTo, logout, addToast } = useContext(AppContext);

  if (!user) {
    return (
      <div className="container mt-5 text-center">
        <h2 className="text-danger">Access Denied</h2>
        <p>Please log in to view your profile.</p>
        <button className="btn btn-primary-gradient rounded-pill" onClick={() => navigateTo('login')}>
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="container mt-4 mb-5">
      <div className="card shadow-lg rounded-lg p-4">
        <h2 className="card-title mb-4 fw-bold text-dark text-center">Your Profile</h2>
        <div className="row justify-content-center">
          <div className="col-md-8">
            <ul className="list-group list-group-flush mb-4">
              <li className="list-group-item d-flex justify-content-between align-items-center">
                <span className="fw-bold">Username:</span>
                <span>{user.username}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between align-items-center">
                <span className="fw-bold">Email:</span>
                <span>{user.email}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between align-items-center">
                <span className="fw-bold">Member Since:</span>
                <span>{new Date(user.memberSince).toLocaleDateString()}</span> {/* Format date */}
              </li>
            </ul>
            <div className="d-flex justify-content-center gap-3">
              <button className="btn btn-primary-gradient rounded-pill px-4" onClick={() => addToast("Edit Profile (placeholder)", "info")}>
                <i className="fas fa-edit me-2"></i> Edit Profile
              </button>
              <button className="btn btn-outline-danger rounded-pill px-4" onClick={logout}>
                <i className="fas fa-sign-out-alt me-2"></i> Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Login Page Component
const LoginPage = () => {
  const { login, navigateTo, user, addToast } = useContext(AppContext);
  const [email, setEmail] = useState(''); // Changed to email for backend
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigateTo('home'); // Redirect if already logged in
    }
  }, [user, navigateTo]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const success = await login(email, password);
    setLoading(false);
    if (!success) {
      // Error message already handled by addToast in login function
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-75">
      <div className="card shadow-lg rounded-3 animate__animated animate__fadeInDown" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="card-body p-4">
          <h2 className="card-title text-center mb-4 fw-bold text-primary">Login to MyStore</h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="emailInput" className="form-label text-muted">Email</label> {/* Changed to Email */}
              <input
                type="email" // Changed type to email
                className="form-control rounded-pill py-2"
                id="emailInput"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label htmlFor="passwordInput" className="form-label text-muted">Password</label>
              <input
                type="password"
                className="form-control rounded-pill py-2"
                id="passwordInput"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="d-grid gap-2 mb-3">
              <button type="submit" className="btn btn-primary-gradient btn-lg rounded-pill" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Logging in...
                  </>
                ) : (
                  'Login'
                )}
              </button>
            </div>
            <p className="text-center text-muted">
              Don't have an account? <a href="#" onClick={() => addToast("Sign up functionality not implemented", "info")} className="text-primary text-decoration-none fw-bold">Sign Up</a>
            </p>
            <p className="text-center text-muted small">
              Hint: Try email "user@example.com" and password "userpassword123" (from `server.js` seeding)
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};


// The core application content, now wrapped by AppProvider in the main App component
const AppContent = () => {
  const { currentPage, selectedProductId } = useContext(AppContext);

  // Render content based on current page
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'product':
        return <ProductDetailPage productId={selectedProductId} />;
      case 'cart':
        return <CartPage />;
      case 'login':
        return <LoginPage />;
      case 'checkout':
        return <CheckoutPage />;
      case 'order-confirmation':
        return <OrderConfirmationPage />;
      case 'profile':
        return <UserProfilePage />;
      default:
        return <HomePage />;
    }
  };

  return (
    // Inject custom styles into the head for better control over aesthetics
    <>
      <style>{customStyles}</style>
      <div className="d-flex flex-column min-vh-100 bg-light">
        <Header />
        <main className="flex-grow-1">
          {renderPage()}
        </main>
        <Footer />
        <ToastContainer /> {/* Toast notifications are rendered here */}
      </div>
    </>
  );
}

// The main App component, which now wraps AppContent with AppProvider
function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
