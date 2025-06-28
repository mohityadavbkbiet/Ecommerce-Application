// server.js - Main application file for the E-commerce Backend
// This file sets up the Express server, connects to MongoDB, defines Mongoose schemas,
// implements authentication and authorization middleware, and sets up API routes
// for products, user authentication, and shopping cart management.

// --- Dependencies ---
// Import necessary modules for the Express application.
const express = require('express');        // Fast, unopinionated, minimalist web framework for Node.js
const mongoose = require('mongoose');      // MongoDB object modeling tool designed to work in an asynchronous environment.
const dotenv = require('dotenv');          // Loads environment variables from a .env file into process.env
const cors = require('cors');              // Node.js middleware for providing a Connect/Express middleware that can be used to enable CORS with various options.
const morgan = require('morgan');          // HTTP request logger middleware for node.js
const helmet = require('helmet');          // Helps secure Express apps by setting various HTTP headers.
const bcrypt = require('bcryptjs');        // Library for hashing passwords.
const jwt = require('jsonwebtoken');       // JSON Web Token implementation for Node.js, used for secure authentication.

// Load environment variables from .env file
// This makes sure that sensitive information like database URIs and JWT secrets
// are not hardcoded directly into the application, promoting better security practices.
dotenv.config();

// Initialize the Express application.
const app = express();

// --- Middleware Setup ---

// CORS (Cross-Origin Resource Sharing) Configuration:
// This middleware enables the server to accept requests from different origins (domains).
// In development, it's common to allow all origins. In production, you should restrict
// this to only the domain(s) where your frontend application is hosted for security.
// Example for production:
// const corsOptions = {
//   origin: 'http://localhost:3000', // Replace with your actual frontend URL (e.g., 'https://your-frontend-domain.com')
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // Allowed HTTP methods
//   credentials: true, // Allow cookies/authorization headers to be sent across origins
//   optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
// };
// app.use(cors(corsOptions));
app.use(cors()); // For this example, allowing all origins for ease of testing.

// Helmet Middleware:
// Helmet helps secure your Express apps by setting various HTTP headers.
// It's a collection of 14 smaller middlewares.
app.use(helmet());

// Morgan Middleware for Request Logging:
// Logs HTTP requests to the console. 'dev' format is concise and colored, useful for development.
app.use(morgan('dev'));

// Body Parser Middleware:
// These middlewares are essential for parsing incoming request bodies in various formats.
app.use(express.json()); // Parses incoming requests with JSON payloads. This is crucial for API requests.
app.use(express.urlencoded({ extended: true })); // Parses incoming requests with URL-encoded payloads.

// --- Database Connection (MongoDB with Mongoose) ---
// Define the MongoDB connection URI. It first tries to get it from environment variables
// (important for production deployment) and falls back to a local MongoDB instance.
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommercedb';

// Connect to MongoDB using Mongoose.
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully!')) // Success callback
  .catch(err => {
    // If connection fails, log the error and exit the process.
    console.error('MongoDB connection error:', err.message);
    process.exit(1); // Exit with a non-zero code to indicate an error
  });

// --- Mongoose Schemas and Models ---
// Define the structure of your data in MongoDB using Mongoose schemas.
// These schemas enforce data consistency and provide methods for interacting with the database.

// 1. Product Schema (models/Product.js conceptual separation)
// Represents the structure of a product in the database.
const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,      // Product name is mandatory
    trim: true,          // Removes whitespace from both ends of a string
    minlength: 3         // Minimum length for the name
  },
  description: {
    type: String,
    required: true,      // Short description is mandatory
    trim: true
  },
  longDescription: {
    type: String,
    trim: true,
    default: ''          // Detailed description, optional
  },
  price: {
    type: Number,
    required: true,      // Price is mandatory
    min: 0               // Price cannot be negative
  },
  imageUrl: {
    type: String,
    required: true,      // Main image URL is mandatory
    trim: true
  },
  carouselImages: [{     // Array of additional image URLs for carousels
    type: String,
    trim: true
  }],
  category: {
    type: String,
    required: true,      // Product category is mandatory
    trim: true
  },
  rating: {
    type: Number,
    default: 0,          // Average rating, defaults to 0
    min: 0,              // Rating must be between 0 and 5
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0,          // Number of reviews, defaults to 0
    min: 0
  },
  stock: {
    type: Number,
    required: true,      // Quantity in stock is mandatory
    min: 0               // Stock cannot be negative
  },
  specifications: {
    type: mongoose.Schema.Types.Mixed // Allows for a flexible object to store various product specifications
  },
  reviews: [             // Array of embedded review documents
    {
      author: { type: String, required: true },
      rating: { type: Number, required: true, min: 1, max: 5 },
      comment: { type: String, trim: true },
      date: { type: Date, default: Date.now } // Date the review was left
    }
  ],
  createdAt: {           // Timestamp for document creation
    type: Date,
    default: Date.now
  },
  updatedAt: {           // Timestamp for last document update
    type: Date,
    default: Date.now
  }
});

// Mongoose Pre-save Middleware for Product:
// Automatically updates the 'updatedAt' field whenever a Product document is saved.
productSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next(); // Call next to proceed with the save operation
});

// Create the Product model from the schema.
const Product = mongoose.model('Product', productSchema);

// 2. User Schema (models/User.js conceptual separation)
// Represents the structure of a user in the database, including their authentication details and cart.
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,        // Username must be unique
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    required: true,
    unique: true,        // Email must be unique
    trim: true,
    lowercase: true,     // Store emails in lowercase
    match: /^\S+@\S+\.\S+$/ // Regex for basic email validation
  },
  password: {
    type: String,
    required: true,
    minlength: 6         // Minimum password length for security
  },
  memberSince: {
    type: Date,
    default: Date.now    // Date the user registered
  },
  isAdmin: {
    type: Boolean,
    default: false       // Flag to distinguish regular users from administrators
  },
  cart: [                // Array to store items in the user's shopping cart
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId, // Reference to the Product model
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        default: 1,      // Default quantity for a cart item
        min: 1
      }
    }
  ]
}, { timestamps: true }); // Mongoose automatically adds `createdAt` and `updatedAt` fields.

// Mongoose Pre-save Middleware for User:
// Hash the user's password before saving the user document to the database.
// This is crucial for security to prevent storing plaintext passwords.
userSchema.pre('save', async function (next) {
  // Only hash if the password field has been modified (or is new).
  if (!this.isModified('password')) {
    return next();
  }
  // Generate a salt (random string) to add to the password before hashing.
  const salt = await bcrypt.genSalt(10); // 10 rounds is a good balance for security and performance.
  // Hash the password with the generated salt.
  this.password = await bcrypt.hash(this.password, salt);
  next(); // Proceed with saving the user.
});

// User Schema Method: `matchPassword`
// Compares an entered plaintext password with the hashed password stored in the database.
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// User Schema Method: `generateAuthToken`
// Generates a JSON Web Token (JWT) for the user upon successful login or registration.
// JWTs are used for stateless authentication.
userSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    { id: this._id, isAdmin: this.isAdmin }, // Payload: user ID and admin status
    process.env.JWT_SECRET,                  // Secret key for signing the token (should be strong and kept secret)
    {
      expiresIn: '1h',                       // Token expiration time (e.g., 1 hour for sessions)
    }
  );
};

// Create the User model from the schema.
const User = mongoose.model('User', userSchema);

// --- Authentication Middleware (middleware/auth.js conceptual separation) ---
// These functions are used to protect routes, ensuring only authenticated and authorized users can access them.

// `protect` Middleware:
// Verifies the JWT sent with requests to ensure the user is authenticated.
const protect = (req, res, next) => {
  let token;

  // Check if the Authorization header is present and starts with 'Bearer'
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Extract the token from the "Bearer <token>" string
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using the secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach the decoded user information (id, isAdmin) to the request object.
      // This makes user data available to subsequent middleware and route handlers.
      req.user = decoded;
      next(); // Proceed to the next middleware/route handler
    } catch (error) {
      console.error('Token verification failed:', error.message);
      return res.status(401).json({ message: 'Not authorized, token failed or expired' });
    }
  }

  // If no token is found in the header.
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token provided' });
  }
};

// `authorizeAdmin` Middleware:
// Checks if the authenticated user has administrative privileges.
// This middleware should be used after the `protect` middleware.
const authorizeAdmin = (req, res, next) => {
  // Check if `req.user` exists (meaning `protect` middleware ran successfully)
  // and if the user is an admin.
  if (req.user && req.user.isAdmin) {
    next(); // User is an admin, proceed.
  } else {
    // User is not authorized as an admin.
    res.status(403).json({ message: 'Not authorized: Admin access required' });
  }
};

// --- API Routes ---
// Define the API endpoints for different resources (Authentication, Products, Cart).

// 1. Authentication Routes (routes/authRoutes.js conceptual separation)
const authRoutes = express.Router(); // Create a new router for authentication routes.

// @route   POST /api/auth/register
// @desc    Register a new user account.
// @access  Public (no authentication required)
authRoutes.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  // Basic server-side validation for required fields.
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please enter all required fields: username, email, and password.' });
  }

  try {
    // Check if a user with the given email or username already exists.
    const userExists = await User.findOne({ $or: [{ email }, { username }] });

    if (userExists) {
      return res.status(400).json({ message: 'User with that email or username already exists. Please choose different credentials.' });
    }

    // Create a new user instance. The password will be hashed by the pre-save hook.
    const user = new User({ username, email, password });
    await user.save(); // Save the new user to the database.

    // Respond with success message and user details including a new JWT.
    res.status(201).json({
      message: 'User registered successfully!',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        token: user.generateAuthToken(), // Generate a JWT for the newly registered user
      },
    });
  } catch (error) {
    console.error('Error during user registration:', error.message);
    res.status(500).json({ message: 'Server error: Could not complete user registration. Please try again later.' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user and provide a JWT.
// @access  Public (no authentication required)
authRoutes.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by their email address.
    const user = await User.findOne({ email });

    // If user does not exist or password does not match, return invalid credentials.
    if (!user || !(await user.matchPassword(password))) {
      return res.status(400).json({ message: 'Invalid email or password. Please check your credentials.' });
    }

    // If authentication is successful, respond with user details and a JWT.
    res.json({
      message: 'Logged in successfully!',
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        token: user.generateAuthToken(), // Generate a new JWT for the logged-in user
      },
    });
  } catch (error) {
    console.error('Error during user login:', error.message);
    res.status(500).json({ message: 'Server error: Could not log in. Please try again later.' });
  }
});

// 2. Product Routes (routes/productRoutes.js conceptual separation)
const productRoutes = express.Router(); // Create a new router for product-related routes.

// @route   GET /api/products
// @desc    Get all products available in the store.
// @access  Public (accessible by anyone)
productRoutes.get('/', async (req, res) => {
  try {
    // Fetch all products from the database.
    const products = await Product.find({});
    res.json(products); // Send the products as a JSON response.
  } catch (error) {
    console.error('Error fetching products:', error.message);
    res.status(500).json({ message: 'Server error: Failed to retrieve products.' });
  }
});

// @route   GET /api/products/:id
// @desc    Get a single product by its ID.
// @access  Public (accessible by anyone)
productRoutes.get('/:id', async (req, res) => {
  try {
    // Find a product by its MongoDB ObjectId.
    const product = await Product.findById(req.params.id);
    if (product) {
      res.json(product); // Send the found product as a JSON response.
    } else {
      // If no product is found with the given ID.
      res.status(404).json({ message: 'Product not found. The requested product ID does not exist.' });
    }
  } catch (error) {
    // Handle cases where the ID format is invalid or other database errors.
    console.error('Error fetching product by ID:', error.message);
    res.status(500).json({ message: 'Server error: Could not fetch product. Please check the ID format.' });
  }
});

// @route   POST /api/products
// @desc    Create a new product.
// @access  Private/Admin (only authenticated administrators can create products)
productRoutes.post('/', protect, authorizeAdmin, async (req, res) => {
  const { name, description, longDescription, price, imageUrl, carouselImages, category, rating, numReviews, stock, specifications } = req.body;

  // Validate required fields for product creation.
  if (!name || !description || !price || !imageUrl || !category || stock === undefined) {
    return res.status(400).json({ message: 'Missing required product fields. Please provide name, description, price, imageUrl, category, and stock.' });
  }

  try {
    // Create a new Product instance with data from the request body.
    const product = new Product({
      name,
      description,
      longDescription: longDescription || '', // Default to empty string if not provided
      price,
      imageUrl,
      carouselImages: carouselImages || [],  // Default to empty array if not provided
      category,
      rating: rating || 0,                   // Default rating to 0
      numReviews: numReviews || 0,           // Default numReviews to 0
      stock,
      specifications: specifications || {}   // Default specifications to empty object
    });

    // Save the new product to the database.
    const createdProduct = await product.save();
    res.status(201).json(createdProduct); // Respond with the newly created product and 201 status (Created).
  } catch (error) {
    console.error('Error creating product:', error.message);
    res.status(500).json({ message: 'Server error: Could not create product. Please check input data.' });
  }
});

// @route   PUT /api/products/:id
// @desc    Update an existing product by its ID.
// @access  Private/Admin (only authenticated administrators can update products)
productRoutes.put('/:id', protect, authorizeAdmin, async (req, res) => {
  const { name, description, longDescription, price, imageUrl, carouselImages, category, rating, numReviews, stock, specifications, reviews } = req.body;

  try {
    // Find the product to be updated by its ID.
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found. Cannot update a non-existent product.' });
    }

    // Update product fields with values from the request body.
    // Use logical OR (||) or ternary operator to retain existing values if new ones are not provided.
    product.name = name !== undefined ? name : product.name;
    product.description = description !== undefined ? description : product.description;
    product.longDescription = longDescription !== undefined ? longDescription : product.longDescription;
    product.price = price !== undefined ? price : product.price;
    product.imageUrl = imageUrl !== undefined ? imageUrl : product.imageUrl;
    product.carouselImages = carouselImages !== undefined ? carouselImages : product.carouselImages;
    product.category = category !== undefined ? category : product.category;
    product.rating = rating !== undefined ? rating : product.rating;
    product.numReviews = numReviews !== undefined ? numReviews : product.numReviews;
    product.stock = stock !== undefined ? stock : product.stock;
    product.specifications = specifications !== undefined ? specifications : product.specifications;
    // Note: Reviews are typically added via a separate endpoint, not updated en masse this way.
    // For this example, we'll allow it, but in production, consider a dedicated review route.
    product.reviews = reviews !== undefined ? reviews : product.reviews;


    // Save the updated product document. The `updatedAt` field will be automatically updated.
    const updatedProduct = await product.save();
    res.json(updatedProduct); // Respond with the updated product.
  } catch (error) {
    console.error('Error updating product:', error.message);
    res.status(500).json({ message: 'Server error: Could not update product. Please check the provided data and product ID.' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete a product by its ID.
// @access  Private/Admin (only authenticated administrators can delete products)
productRoutes.delete('/:id', protect, authorizeAdmin, async (req, res) => {
  try {
    // Find the product to be deleted.
    const product = await Product.findById(req.params.id);

    if (product) {
      await product.deleteOne(); // Delete the product document from the database.
      res.json({ message: 'Product successfully removed.' }); // Respond with success message.
    } else {
      // If no product is found with the given ID.
      res.status(404).json({ message: 'Product not found. No product to delete with the provided ID.' });
    }
  } catch (error) {
    console.error('Error deleting product:', error.message);
    res.status(500).json({ message: 'Server error: Could not delete product. Please check the product ID.' });
  }
});

// 3. Cart Routes (routes/cartRoutes.js conceptual separation)
const cartRoutes = express.Router(); // Create a new router for shopping cart routes.

// @route   GET /api/cart
// @desc    Get the current user's shopping cart contents.
// @access  Private (only authenticated users can view their cart)
cartRoutes.get('/', protect, async (req, res) => {
  try {
    // Find the user by their ID (obtained from the JWT in `req.user.id`).
    // Populate the `cart.productId` field to get full product details for each item in the cart.
    const user = await User.findById(req.user.id).populate('cart.productId');
    if (user) {
      res.json(user.cart); // Respond with the user's populated cart.
    } else {
      // This case should ideally not happen if `protect` middleware works correctly,
      // but included for robustness.
      res.status(404).json({ message: 'User not found. Could not retrieve cart.' });
    }
  } catch (error) {
    console.error('Error fetching cart:', error.message);
    res.status(500).json({ message: 'Server error: Failed to retrieve shopping cart details.' });
  }
});

// @route   POST /api/cart/add
// @desc    Add a product to the cart or update its quantity if already present.
// @access  Private (only authenticated users can modify their cart)
cartRoutes.post('/add', protect, async (req, res) => {
  const { productId, quantity } = req.body;

  // Validate incoming data.
  if (!productId || quantity === undefined || quantity <= 0) {
    return res.status(400).json({ message: 'Invalid product ID or quantity. Quantity must be a positive number.' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found. Cannot add to cart for an unrecognized user.' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found. The product you are trying to add does not exist.' });
    }

    let itemFound = false;
    // Iterate through the cart to find if the product already exists.
    user.cart = user.cart.map(item => {
      if (item.productId.toString() === productId) {
        itemFound = true;
        // Check for sufficient stock before adding
        if (product.stock < item.quantity + quantity) {
          throw new Error(`Insufficient stock for ${product.name}. Only ${product.stock} available.`);
        }
        item.quantity += quantity; // Increase quantity if found.
      }
      return item;
    });

    // If the product was not found in the cart, add it as a new item.
    if (!itemFound) {
      if (product.stock < quantity) {
        throw new Error(`Insufficient stock for ${product.name}. Only ${product.stock} available.`);
      }
      user.cart.push({ productId, quantity });
    }

    await user.save(); // Save the updated user document (with modified cart).
    // Re-populate the cart items with full product details before sending the response.
    await user.populate('cart.productId');
    res.json(user.cart); // Respond with the updated cart.
  } catch (error) {
    console.error('Error adding to cart:', error.message);
    if (error.message.includes('Insufficient stock')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error: Could not add item to cart. Please try again.' });
  }
});

// @route   PUT /api/cart/update/:productId
// @desc    Update the quantity of a specific item in the user's cart.
// @access  Private (only authenticated users can modify their cart)
cartRoutes.put('/update/:productId', protect, async (req, res) => {
  const { quantity } = req.body;
  const { productId } = req.params;

  // Validate incoming quantity. It can be 0 to remove the item.
  if (quantity === undefined || quantity < 0) {
    return res.status(400).json({ message: 'Invalid quantity. Quantity must be a non-negative number.' });
  }

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found. Could not update cart.' });
    }

    const itemIndex = user.cart.findIndex(item => item.productId.toString() === productId);

    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Product not found in cart. Cannot update a non-existent cart item.' });
    }

    const product = await Product.findById(productId);
    if (!product) { // Should not happen if productId is valid and from a real product
      return res.status(404).json({ message: 'Product linked to cart item not found in database.' });
    }

    if (quantity === 0) {
      user.cart.splice(itemIndex, 1); // Remove the item if new quantity is 0.
    } else {
      // Check for sufficient stock before updating quantity
      if (product.stock < quantity) {
        throw new Error(`Insufficient stock for ${product.name}. Only ${product.stock} available.`);
      }
      user.cart[itemIndex].quantity = quantity; // Update the quantity.
    }

    await user.save(); // Save the updated user document.
    await user.populate('cart.productId'); // Re-populate to send full product details.
    res.json(user.cart); // Respond with the updated cart.
  } catch (error) {
    console.error('Error updating cart item:', error.message);
    if (error.message.includes('Insufficient stock')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error: Could not update cart item. Please check the provided data.' });
  }
});

// @route   DELETE /api/cart/remove/:productId
// @desc    Remove a specific item from the user's cart.
// @access  Private (only authenticated users can modify their cart)
cartRoutes.delete('/remove/:productId', protect, async (req, res) => {
  const { productId } = req.params;

  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found. Could not remove item from cart.' });
    }

    // Filter out the item to be removed from the cart array.
    user.cart = user.cart.filter(item => item.productId.toString() !== productId);

    await user.save(); // Save the updated user document.
    await user.populate('cart.productId'); // Re-populate to send full product details (though not strictly necessary for remove).
    res.json(user.cart); // Respond with the updated cart.
  } catch (error) {
    console.error('Error removing from cart:', error.message);
    res.status(500).json({ message: 'Server error: Could not remove item from cart. Please check the product ID.' });
  }
});

// @route   DELETE /api/cart/clear
// @desc    Clear the entire shopping cart for the current user.
// @access  Private (only authenticated users can clear their cart)
cartRoutes.delete('/clear', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found. Could not clear cart.' });
    }

    user.cart = []; // Set the cart array to empty.

    await user.save(); // Save the user document with an empty cart.
    res.json({ message: 'Cart cleared successfully!' }); // Respond with a success message.
  } catch (error) {
    console.error('Error clearing cart:', error.message);
    res.status(500).json({ message: 'Server error: Could not clear cart. Please try again.' });
  }
});

// --- Apply Routers to the Express Application ---
// Mount the defined routers at their respective base paths.
app.use('/api/products', productRoutes); // All product routes start with /api/products
app.use('/api/auth', authRoutes);       // All authentication routes start with /api/auth
app.use('/api/cart', cartRoutes);       // All cart routes start with /api/cart

// --- Global Error Handling Middleware ---
// This middleware catches any errors that occur during request processing
// and sends a generic 500 server error response.
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the full error stack to the console for debugging purposes.
  res.status(500).send('Something broke! A server-side error occurred.'); // Send a generic error message to the client.
});

// --- Server Listener ---
// Define the port the Express server will listen on.
// It uses the PORT environment variable if set, otherwise defaults to 5000.
const PORT = process.env.PORT || 5000;

// Start the Express server.
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  // In a real application, you might uncomment the seedProducts() call here for initial setup
  // or run it as a separate script.
  seedProducts(); // Uncomment this line to seed data when the server starts
});

// --- Example Data Seeding (Optional - for initial setup) ---
// This function populates your MongoDB with initial product data and a default admin user.
// This is typically run once to set up your database for development or testing.
// IMPORTANT: In a production environment, you should remove or secure access to this function.
// Also, change the default admin password immediately after seeding.


// This array should match the structure of your Product schema.
// It's a copy of your frontend mock data, adjusted for backend persistence.
const mockProductsForSeeding = [
  {
    name: 'Wireless Bluetooth Headphones',
    description: 'Immerse yourself in high-fidelity audio with these premium wireless headphones. Featuring comfortable earcups and a long-lasting battery, perfect for music lovers and gamers.',
    longDescription: 'Experience superior sound quality and comfort with our state-of-the-art wireless Bluetooth headphones. Equipped with active noise cancellation, these headphones deliver crystal-clear audio, rich bass, and balanced trebles. The ergonomic design ensures a comfortable fit for extended listening sessions, while the intuitive controls allow for easy management of music and calls. With up to 30 hours of battery life on a single charge and quick pairing technology, you can enjoy uninterrupted audio enjoyment wherever you go. Ideal for daily commutes, workouts, and relaxing at home.',
    price: 79.99,
    imageUrl: 'https://placehold.co/400x300/e0e0e0/333333?text=Headphones',
    carouselImages: [
      'https://placehold.co/800x600/1e90ff/f0f8ff?text=Headphones+View+1',
      'https://placehold.co/800x600/007bff/f0f8ff?text=Headphones+View+2',
      'https://placehold.co/800x600/0056b3/f0f8ff?text=Headphones+View+3'
    ],
    specifications: {
      Connectivity: 'Bluetooth 5.0',
      BatteryLife: 'Up to 30 hours',
      NoiseCancellation: 'Active',
      Weight: '250g',
      Color: 'Black'
    },
    reviews: [
      { author: 'Alice Smith', rating: 5, comment: 'Amazing sound quality and super comfortable! Battery lasts forever.' },
      { author: 'Bob Johnson', rating: 4, comment: 'Good value for money. Noise cancellation works well, but fit could be slightly better for long sessions.' }
    ],
    category: 'Electronics',
    rating: 4.5,
    numReviews: 120,
    stock: 50,
  },
  {
    name: 'Smart Fitness Tracker',
    description: 'Monitor your health and activity with this advanced fitness tracker. Tracks steps, heart rate, sleep, and more. Waterproof design, ideal for active lifestyles.',
    longDescription: 'Take control of your health with our intelligent fitness tracker. This sleek device accurately monitors your daily steps, distance covered, calories burned, heart rate, and sleep patterns, providing valuable insights into your well-being. Its waterproof design makes it suitable for swimming and other water activities. The tracker seamlessly syncs with your smartphone to display notifications and call alerts, ensuring you stay connected while on the go. With a vibrant display and customizable watch faces, it\'s the perfect companion for anyone looking to improve their fitness journey.',
    price: 49.99,
    imageUrl: 'https://placehold.co/400x300/d0d0d0/222222?text=Fitness+Tracker',
    carouselImages: [
      'https://placehold.co/800x600/1e90ff/f0f8ff?text=Tracker+View+1',
      'https://placehold.co/800x600/007bff/f0f8ff?text=Tracker+View+2',
      'https://placehold.co/800x600/0056b3/f0f8ff?text=Tracker+View+3'
    ],
    specifications: {
      WaterResistance: '50m',
      BatteryLife: 'Up to 7 days',
      Sensors: 'Heart Rate, Accelerometer',
      Display: 'Color AMOLED'
    },
    reviews: [
      { author: 'Charlie Brown', rating: 4, comment: 'Accurate tracking, good battery life. App could be more user-friendly.' },
      { author: 'Diana Prince', rating: 5, comment: 'Love this tracker! It motivates me to stay active and the sleep tracking is fascinating.' }
    ],
    category: 'Wearables',
    rating: 4.2,
    numReviews: 85,
    stock: 75,
  },
  {
    name: 'Portable Espresso Maker',
    description: 'Enjoy rich, delicious espresso wherever you are. Compact and easy to use, perfect for travel, camping, or the office.',
    longDescription: 'Savor the perfect cup of espresso anytime, anywhere with our revolutionary portable espresso maker. Designed for coffee enthusiasts on the move, this compact device requires no electricity, operating solely on manual pressure to extract a rich, aromatic shot of espresso. Its lightweight and durable construction make it an ideal companion for travel, camping, or a quick coffee break at the office. Easy to clean and maintain, it\'s a must-have for anyone who refuses to compromise on their coffee quality, even when away from home.',
    price: 34.50,
    imageUrl: 'https://placehold.co/400x300/c0c0c0/111111?text=Espresso+Maker',
    carouselImages: [
      'https://placehold.co/800x600/1e90ff/f0f8ff?text=Espresso+View+1',
      'https://placehold.co/800x600/007bff/f0f8ff?text=Espresso+View+2',
      'https://placehold.co/800x600/0056b3/f0f8ff?text=Espresso+View+3'
    ],
    specifications: {
      Operation: 'Manual Pump',
      Capacity: '60ml water, 7g ground coffee',
      Material: 'Food-grade Plastic, Stainless Steel'
    },
    reviews: [
      { author: 'Eve Adams', rating: 5, comment: 'Produces surprisingly good espresso! Perfect for my morning commute.' },
      { author: 'Frank Green', rating: 4, comment: 'A bit of a learning curve, but once you get it, it\'s great. Very portable.' }
    ],
    category: 'Home & Kitchen',
    rating: 4.8,
    numReviews: 210,
    stock: 30,
  },
  {
    name: 'Ultra-Slim Power Bank 10000mAh',
    description: 'Keep your devices charged on the go with this high-capacity power bank. Features dual USB outputs and fast charging technology.',
    longDescription: 'Never run out of battery again with our ultra-slim 10000mAh power bank. This compact and lightweight portable charger is designed to fit seamlessly into your pocket or bag, providing reliable power for your smartphone, tablet, and other USB-powered devices. Equipped with dual USB outputs, it allows you to charge two devices simultaneously, and its fast-charging technology ensures quick power-ups. The sleek aluminum alloy casing not only looks great but also provides enhanced durability. An essential accessory for commuters, travelers, and anyone who needs reliable power throughout their day.',
    price: 29.99,
    imageUrl: 'https://placehold.co/400x300/b0b0b0/000000?text=Power+Bank',
    carouselImages: [
      'https://placehold.co/800x600/1e90ff/f0f8ff?text=PowerBank+View+1',
      'https://placehold.co/800x600/007bff/f0f8ff?text=PowerBank+View+2',
      'https://placehold.co/800x600/0056b3/f0f8ff?text=PowerBank+View+3'
    ],
    specifications: {
      Capacity: '10000mAh',
      OutputPorts: '2x USB-A',
      FastCharging: 'Yes (18W)',
      Dimensions: '140 x 68 x 15 mm'
    },
    reviews: [
      { author: 'Grace Lee', rating: 5, comment: 'Charges my phone multiple times. Slim design is a huge plus!' },
      { author: 'Henry Wang', rating: 4, comment: 'Reliable power bank. Gets a bit warm during fast charging, but nothing concerning.' }
    ],
    category: 'Electronics',
    rating: 4.6,
    numReviews: 155,
    stock: 90,
  },
  {
    name: 'Ergonomic Office Chair',
    description: 'Enhance your comfort and productivity with this fully adjustable ergonomic office chair. Designed for long hours of work.',
    longDescription: 'Upgrade your workspace with our advanced ergonomic office chair, meticulously designed to provide unparalleled comfort and support during long working hours. Featuring multiple adjustment points, including lumbar support, armrest height, seat depth, and tilt tension, you can customize the chair to perfectly fit your body and preferred posture. The high-density mesh back promotes airflow, keeping you cool, while the padded seat cushion offers superior comfort. Built with a sturdy steel frame and smooth-rolling casters, this chair combines durability with effortless mobility, making it an essential addition to any home or professional office.',
    price: 189.99,
    imageUrl: 'https://placehold.co/400x300/a0a0a0/EEEEEE?text=Office+Chair',
    carouselImages: [
      'https://placehold.co/800x600/1e90ff/f0f8ff?text=Chair+View+1',
      'https://placehold.co/800x600/007bff/f0f8ff?text=Chair+View+2',
      'https://placehold.co/800x600/0056b3/f0f8ff?text=Chair+View+3'
    ],
    specifications: {
      Material: 'Mesh, Fabric, Steel',
      Adjustments: 'Lumbar, Armrest, Tilt, Height',
      WeightCapacity: '120kg',
      AssemblyRequired: 'Yes'
    },
    reviews: [
      { author: 'Ivy Davis', rating: 5, comment: 'Transformed my home office! So comfortable for long hours.' },
      { author: 'Jack Wilson', rating: 4, comment: 'Great chair for the price. Assembly took a little time, but worth it.' }
    ],
    category: 'Furniture',
    rating: 4.7,
    numReviews: 98,
    stock: 20,
  },
  {
    name: 'Smart LED Light Strips',
    description: 'Transform your space with vibrant, customizable lighting. Control via app or voice assistant, perfect for ambient lighting.',
    longDescription: 'Bring your home to life with our versatile smart LED light strips. These flexible strips can be easily installed behind TVs, under cabinets, or along walls to create stunning ambient lighting effects. With millions of colors and various dynamic modes to choose from, you can set the perfect mood for any occasion. Control them effortlessly via a dedicated smartphone app, or integrate them with popular voice assistants like Alexa and Google Assistant for hands-free operation. The lights are also dimmable and schedule-friendly, allowing for ultimate personalization of your home\'s atmosphere.',
    price: 24.99,
    imageUrl: 'https://placehold.co/400x300/909090/DDDDDD?text=LED+Strips',
    carouselImages: [
      'https://placehold.co/800x600/1e90ff/f0f8ff?text=LED+Strip+View+1',
      'https://placehold.co/800x600/007bff/f0f8ff?text=LED+Strip+View+2',
      'https://placehold.co/800x600/0056b3/f0f8ff?text=LED+Strip+View+3'
    ],
    specifications: {
      Length: '5 meters',
      Colors: 'RGB (16 million)',
      Control: 'App, Voice, Remote',
      Power: 'USB Powered'
    },
    reviews: [
      { author: 'Karen Miller', rating: 4, comment: 'Easy to install and great colors. Integration with Alexa is seamless.' },
      { author: 'Liam Garcia', rating: 5, comment: 'Transformed my gaming setup! Highly recommend for ambient lighting.' }
    ],
    category: 'Smart Home',
    rating: 4.3,
    numReviews: 65,
    stock: 120,
  },
  {
    name: 'Noise-Cancelling Earbuds',
    description: 'Compact and powerful, these earbuds deliver exceptional sound quality and effective noise cancellation for on-the-go listening.',
    longDescription: 'Experience pure audio bliss with our cutting-edge noise-cancelling earbuds. Designed for supreme portability and comfort, these earbuds fit snugly in your ears, providing an immersive listening experience by actively blocking out ambient noise. Enjoy crisp highs, deep lows, and balanced mids across all your favorite tracks. With intuitive touch controls, you can manage music playback, answer calls, and activate your voice assistant with ease. The compact charging case offers multiple additional charges, extending your listening time throughout the day. Perfect for commuters, travelers, and anyone seeking an escape into their music.',
    price: 129.00,
    imageUrl: 'https://placehold.co/400x300/808080/CCCCCC?text=Earbuds',
    carouselImages: [
      'https://placehold.co/800x600/1e90ff/f0f8ff?text=Earbuds+View+1',
      'https://placehold.co/800x600/007bff/f0f8ff?text=Earbuds+View+2',
      'https://placehold.co/800x600/0056b3/f0f8ff?text=Earbuds+View+3'
    ],
    specifications: {
      ANC: 'Yes',
      BatteryLife: '6 hours (earbuds), 24 hours (case)',
      Bluetooth: '5.2',
      WaterResistance: 'IPX4'
    },
    reviews: [
      { author: 'Mia Rodriguez', rating: 4, comment: 'Great sound and decent noise cancellation for the price. Comfortable fit.' },
      { author: 'Noah Martinez', rating: 5, comment: 'Fantastic earbuds for travel. Blocks out airplane noise effectively.' }
    ],
    category: 'Electronics',
    rating: 4.4,
    numReviews: 180,
    stock: 60,
  },
  {
    name: 'Digital Drawing Tablet',
    description: 'Unleash your creativity with this professional digital drawing tablet. High-resolution screen and pressure-sensitive pen.',
    longDescription: 'Elevate your digital art to the next level with our professional-grade digital drawing tablet. Featuring a high-resolution, glare-free screen and an ultra-responsive, battery-free pen with thousands of levels of pressure sensitivity, this tablet provides a natural and precise drawing experience. Compatible with major creative software, it\'s perfect for illustrators, graphic designers, and photographers. The customizable express keys and touch ring streamline your workflow, allowing you to access frequently used functions with ease. Its slim profile and durable construction make it a reliable tool for both studio work and on-the-go creativity.',
    price: 249.99,
    imageUrl: 'https://placehold.co/400x300/707070/BBBBBB?text=Drawing+Tablet',
    carouselImages: [
      'https://placehold.co/800x600/1e90ff/f0f8ff?text=Tablet+View+1',
      'https://placehold.co/800x600/007bff/f0f8ff?text=Tablet+View+2',
      'https://placehold.co/800x600/0056b3/f0f8ff?text=Tablet+View+3'
    ],
    specifications: {
      ScreenSize: '15.6 inch',
      Resolution: '1920x1080',
      PressureSensitivity: '8192 Levels',
      Compatibility: 'Windows, MacOS'
    },
    reviews: [
      { author: 'Olivia White', rating: 5, comment: 'Perfect for digital painting! The pen feels so natural.' },
      { author: 'Peter Hall', rating: 4, comment: 'Great tablet, good value. Software setup was a bit tricky.' }
    ],
    category: 'Electronics',
    rating: 4.9,
    numReviews: 75,
    stock: 25,
  },
  {
    name: 'Automatic Pet Feeder',
    description: 'Ensure your pet is fed on schedule with this smart automatic feeder. Programmable meal times and portion control.',
    longDescription: 'Never worry about missing a feeding time again with our smart automatic pet feeder. This intelligent device allows you to program up to 4 meals per day with customizable portion sizes, ensuring your pet maintains a healthy diet even when you\'re not home. Its large capacity food container can hold several days\' worth of dry food, and the anti-clogging design prevents dispensing issues. You can even record a personalized message to call your pet to meals, making feeding a comforting experience. Easy to clean and powered by both DC adapter and backup batteries, it provides peace of mind for busy pet owners.',
    price: 65.00,
    imageUrl: 'https://placehold.co/400x300/606060/AAAAAA?text=Pet+Feeder',
    carouselImages: [
      'https://placehold.co/800x600/1e90ff/f0f8ff?text=Feeder+View+1',
      'https://placehold.co/800x600/007bff/f0f8ff?text=Feeder+View+2',
      'https://placehold.co/800x600/0056b3/f0f8ff?text=Feeder+View+3'
    ],
    specifications: {
      Capacity: '6L',
      FeedingSchedule: 'Up to 4 meals/day',
      PowerSource: 'DC Adapter, 3x D-batteries',
      VoiceRecording: '10 seconds'
    },
    reviews: [
      { author: 'Quinn Taylor', rating: 5, comment: 'A lifesaver for busy mornings! My cat loves the voice recording.' },
      { author: 'Rachel King', rating: 4, comment: 'Works as advertised. Setup was straightforward.' }
    ],
    category: 'Pet Supplies',
    rating: 4.1,
    numReviews: 50,
    stock: 40,
  },
  {
    name: 'Compact Travel Backpack',
    description: 'Lightweight and durable, this travel backpack offers ample storage and comfortable carrying for your adventures.',
    longDescription: 'Embark on your next adventure with our compact and versatile travel backpack. Designed for efficiency and comfort, this backpack features multiple compartments and pockets to organize your essentials, including a dedicated laptop sleeve and exterior water bottle pockets. The lightweight yet durable water-resistant fabric protects your belongings from the elements, while the padded shoulder straps and breathable back panel ensure comfortable carrying, even on long journeys. Its sleek design makes it suitable for both urban exploration and outdoor excursions. Perfect for day trips, weekend getaways, or as a convenient carry-on.',
    price: 55.00,
    imageUrl: 'https://placehold.co/400x300/505050/999999?text=Backpack',
    carouselImages: [
      'https://placehold.co/800x600/1e90ff/f0f8ff?text=Backpack+View+1',
      'https://placehold.co/800x600/007bff/f0f8ff?text=Backpack+View+2',
      'https://placehold.co/800x600/0056b3/f0f8ff?text=Backpack+View+3'
    ],
    specifications: {
      Capacity: '25L',
      Material: 'Water-resistant Polyester',
      LaptopSleeve: 'Up to 15 inch',
      Weight: '0.8kg'
    },
    reviews: [
      { author: 'Sam Lee', rating: 5, comment: 'Perfect size for weekend trips. Very comfortable to carry.' },
      { author: 'Tina Chen', rating: 4, comment: 'Good quality, lots of pockets. Wish it had a bit more padding on the back.' }
    ],
    category: 'Travel',
    rating: 4.5,
    numReviews: 110,
    stock: 80,
  },
  {
    name: '4K Ultra HD Smart TV',
    description: 'Stunning 4K resolution with smart features. Enjoy your favorite shows and movies in breathtaking detail.',
    longDescription: 'Immerse yourself in a world of stunning visuals with our 4K Ultra HD Smart TV. Boasting four times the resolution of Full HD, every scene comes to life with incredible clarity and vibrant colors. The integrated smart platform provides effortless access to popular streaming services, live TV, and a world of entertainment. With multiple HDMI and USB ports, you can easily connect all your favorite devices. Its sleek, bezel-less design adds a touch of elegance to any living room, making it the centerpiece of your home entertainment system.',
    price: 499.99,
    imageUrl: 'https://placehold.co/400x300/a0a0a0/EEEEEE?text=Smart+TV',
    carouselImages: [
      'https://placehold.co/800x600/1e90ff/f0f8ff?text=TV+View+1',
      'https://placehold.co/800x600/007bff/f0f8ff?text=TV+View+2',
      'https://placehold.co/800x600/0056b3/f0f8ff?text=TV+View+3'
    ],
    specifications: {
      Resolution: '3840 x 2160 (4K UHD)',
      ScreenSize: '55 inch',
      SmartFeatures: 'Built-in Wi-Fi, Streaming Apps',
      Ports: '3x HDMI, 2x USB'
    },
    reviews: [
      { author: 'Umar Khan', rating: 5, comment: 'Picture quality is incredible! Very happy with this purchase.' },
      { author: 'Vera Popov', rating: 4, comment: 'Great TV for the price, smart features work well. Sound could be better, but I use a soundbar.' }
    ],
    category: 'Electronics',
    rating: 4.6,
    numReviews: 250,
    stock: 35,
  },
  {
    name: 'Robot Vacuum Cleaner',
    description: 'Keep your floors spotless effortlessly. Smart navigation, app control, and automatic charging.',
    longDescription: 'Experience the future of home cleaning with our intelligent robot vacuum cleaner. Featuring advanced smart navigation, it efficiently maps your home, avoiding obstacles and ensuring thorough cleaning on various floor types. Control it effortlessly from your smartphone app, setting schedules, cleaning modes, and even defining no-go zones. When the battery runs low, it automatically returns to its charging dock, ready for the next cleaning session. With powerful suction and a slim design, it reaches under furniture and into corners, leaving your home impeccably clean without lifting a finger.',
    price: 249.00,
    imageUrl: 'https://placehold.co/400x300/b0b0b0/000000?text=Robot+Vacuum',
    carouselImages: [
      'https://placehold.co/800x600/1e90ff/f0f8ff?text=Vacuum+View+1',
      'https://placehold.co/800x600/007bff/f0f8ff?text=Vacuum+View+2',
      'https://placehold.co/800x600/0056b3/f0f8ff?text=Vacuum+View+3'
    ],
    specifications: {
      Navigation: 'Lidar Smart Mapping',
      Control: 'App, Voice Assistant',
      BatteryLife: 'Up to 120 mins',
      DustbinCapacity: '0.6L'
    },
    reviews: [
      { author: 'William Jones', rating: 5, comment: 'This vacuum is a game changer! My floors have never been cleaner.' },
      { author: 'Xenia Kim', rating: 4, comment: 'Works well, but sometimes gets stuck on high carpets. Overall happy.' }
    ],
    category: 'Home & Kitchen',
    rating: 4.3,
    numReviews: 190,
    stock: 45,
  },
  {
    name: 'Premium Stainless Steel Cookware Set',
    description: 'Durable and elegant cookware for every kitchen. Even heat distribution for perfect cooking results.',
    longDescription: 'Elevate your culinary experience with our premium 10-piece stainless steel cookware set. Crafted from high-grade stainless steel, these pots and pans offer exceptional durability, corrosion resistance, and a stunning mirror finish. The encapsulated aluminum base ensures rapid and even heat distribution, eliminating hot spots for consistent cooking results. Compatible with all cooktops, including induction, and oven-safe, this set is designed for versatility. The ergonomic, stay-cool handles provide a comfortable and secure grip, making cooking a pleasure. A perfect addition for both aspiring chefs and seasoned cooks.',
    price: 189.00,
    imageUrl: 'https://placehold.co/400x300/c0c0c0/111111?text=Cookware+Set',
    carouselImages: [
      'https://placehold.co/800x600/1e90ff/f0f8ff?text=Cookware+View+1',
      'https://placehold.co/800x600/007bff/f0f8ff?text=Cookware+View+2',
      'https://placehold.co/800x600/0056b3/f0f8ff?text=Cookware+View+3'
    ],
    specifications: {
      Material: 'Stainless Steel with Aluminum Core',
      Pieces: '10 (Pots, Pans, Lids)',
      CooktopCompatibility: 'All, including Induction',
      OvenSafe: 'Up to 260°C'
    },
    reviews: [
      { author: 'Yara Ahmed', rating: 5, comment: 'Beautiful set, very sturdy and cooks evenly. Easy to clean too.' },
      { author: 'Zackary Brown', rating: 4, comment: 'Good quality, but handles can get a bit hot if left on high heat for too long.' }
    ],
    category: 'Home & Kitchen',
    rating: 4.7,
    numReviews: 115,
    stock: 28,
  },
  {
    name: 'Gaming Laptop RTX 4080',
    description: 'Unleash ultimate gaming performance. Powerful processor, NVIDIA RTX 4080 graphics, and high refresh rate display.',
    longDescription: 'Dominate the battlefield with our high-performance Gaming Laptop, engineered for the most demanding games and creative tasks. Powered by the latest Intel Core i9 processor and NVIDIA GeForce RTX 4080 graphics, it delivers unparalleled speed and breathtaking visuals. The vibrant 17-inch QHD display with a 240Hz refresh rate ensures silky-smooth gameplay without tearing. Advanced cooling technology keeps performance optimal during intense sessions, while the customizable RGB keyboard adds flair to your setup. With ample RAM and lightning-fast SSD storage, load times are virtually nonexistent, putting you ahead of the competition.',
    price: 2499.00,
    imageUrl: 'https://placehold.co/400x300/d0d0d0/222222?text=Gaming+Laptop',
    carouselImages: [
      'https://placehold.co/800x600/1e90ff/f0f8ff?text=Laptop+View+1',
      'https://placehold.co/800x600/007bff/f0f8ff?text=Laptop+View+2',
      'https://placehold.co/800x600/0056b3/f0f8ff?text=Laptop+View+3'
    ],
    specifications: {
      Processor: 'Intel Core i9',
      Graphics: 'NVIDIA GeForce RTX 4080',
      RAM: '32GB DDR5',
      Storage: '1TB NVMe SSD',
      Display: '17.3" QHD 240Hz'
    },
    reviews: [
      { author: 'Alex Chen', rating: 5, comment: 'This laptop is an absolute beast! Runs everything flawlessly.' },
      { author: 'Brenda Lee', rating: 5, comment: 'Super fast and the display is gorgeous. Worth every penny for gaming.' }
    ],
    category: 'Electronics',
    rating: 4.9,
    numReviews: 60,
    stock: 15,
  },
  {
    name: 'Smart Doorbell Camera',
    description: 'See, hear, and speak to visitors from anywhere. HD video, motion detection, and cloud storage.',
    longDescription: 'Enhance your home security with our smart doorbell camera. Enjoy crystal-clear 1080p HD video, allowing you to see every detail at your doorstep, day or night, with infrared night vision. Two-way audio lets you communicate with visitors or deter unwanted guests from your smartphone, no matter where you are. Receive instant alerts on your phone when motion is detected, and review recorded footage with cloud storage options. Easy to install and connect to your existing Wi-Fi, it provides peace of mind and keeps your home safe.',
    price: 119.00,
    imageUrl: 'https://placehold.co/400x300/a0a0a0/EEEEEE?text=Smart+Doorbell',
    carouselImages: [
      'https://placehold.co/800x600/1e90ff/f0f8ff?text=Doorbell+View+1',
      'https://placehold.co/800x600/007bff/f0f8ff?text=Doorbell+View+2',
      'https://placehold.co/800x600/0056b3/f0f8ff?text=Doorbell+View+3'
    ],
    specifications: {
      Resolution: '1080p HD',
      Features: 'Motion Detection, Two-Way Audio, Night Vision',
      Power: 'Wired (existing doorbell wiring)',
      Storage: 'Cloud (subscription required)'
    },
    reviews: [
      { author: 'Chris Evans', rating: 4, comment: 'Clear video and audio. Motion detection is a bit sensitive but adjustable.' },
      { author: 'Debra Morgan', rating: 5, comment: 'Feel much safer with this doorbell. Easy to use app.' }
    ],
    category: 'Smart Home',
    rating: 4.5,
    numReviews: 130,
    stock: 40,
  },
  {
    name: 'Professional DSLR Camera Kit',
    description: 'Capture breathtaking photos and videos. High-resolution sensor, versatile lens, and advanced features.',
    longDescription: 'Unleash your inner photographer with our professional DSLR camera kit. Equipped with a high-resolution 24.2MP APS-C sensor and a versatile 18-55mm lens, it delivers stunning image quality with exceptional detail and vibrant colors. Capture sharp, blur-free photos even in challenging conditions with its advanced autofocus system and high ISO range. Record cinematic Full HD videos with manual control over exposure and focus. The intuitive controls and comfortable grip make it easy to use for both beginners and experienced photographers. Perfect for portraits, landscapes, travel, and more.',
    price: 699.00,
    imageUrl: 'https://placehold.co/400x300/d0d0d0/222222?text=DSLR+Camera',
    carouselImages: [
      'https://placehold.co/800x600/1e90ff/f0f8ff?text=Camera+View+1',
      'https://placehold.co/800x600/007bff/f0f8ff?text=Camera+View+2',
      'https://placehold.co/800x600/0056b3/f0f8ff?text=Camera+View+3'
    ],
    specifications: {
      Sensor: '24.2MP APS-C CMOS',
      VideoRecording: 'Full HD 1080p',
      LensMount: 'Canon EF/EF-S',
      IncludedLens: '18-55mm IS STM',
      Connectivity: 'Wi-Fi, Bluetooth'
    },
    reviews: [
      { author: 'Ethan Hunt', rating: 5, comment: 'Excellent camera for the price. Takes amazing photos.' },
      { author: 'Fiona Glenanne', rating: 4, comment: 'Great for beginners, but I wish it had a better low-light performance.' }
    ],
    category: 'Electronics',
    rating: 4.8,
    numReviews: 70,
    stock: 20,
  },
  {
    name: 'Electric Kettle with Temperature Control',
    description: 'Boil water precisely for various beverages. Fast heating and keep-warm function.',
    longDescription: 'Prepare your favorite hot beverages with perfect precision using our electric kettle with temperature control. Whether it\'s delicate green tea, robust black tea, or French press coffee, you can select the optimal temperature for your brew. The powerful heating element brings water to a boil in minutes, while the keep-warm function maintains your desired temperature for up to 30 minutes. Made with food-grade stainless steel interior, it ensures pure taste. The sleek design and intuitive digital display make it a stylish and functional addition to any kitchen.',
    price: 45.00,
    imageUrl: 'https://placehold.co/400x300/e0e0e0/333333?text=Electric+Kettle',
    carouselImages: [
      'https://placehold.co/800x600/1e90ff/f0f8ff?text=Kettle+View+1',
      'https://placehold.co/800x600/007bff/f0f8ff?text=Kettle+View+2',
      'https://placehold.co/800x600/0056b3/f0f8ff?text=Kettle+View+3'
    ],
    specifications: {
      Capacity: '1.7 Liters',
      TemperatureSettings: 'Variable (40-100°C)',
      Material: 'Stainless Steel, BPA-Free Plastic',
      Features: 'Keep Warm Function, Auto Shut-off'
    },
    reviews: [
      { author: 'George Clooney', rating: 5, comment: 'Perfect for my pour-over coffee. Precise temperature control is a game changer.' },
      { author: 'Hannah Montana', rating: 4, comment: 'Boils fast and looks good. The lid can be a bit stiff to open sometimes.' }
    ],
    category: 'Home & Kitchen',
    rating: 4.3,
    numReviews: 95,
    stock: 55,
  },
  {
    name: 'Yoga Mat with Carrying Strap',
    description: 'Non-slip and extra-thick for ultimate comfort during yoga, Pilates, and floor exercises.',
    longDescription: 'Enhance your practice with our premium yoga mat, designed for comfort, stability, and durability. Its extra-thick, high-density foam provides superior cushioning for your joints during yoga, Pilates, and various floor exercises. The double-sided non-slip surface ensures excellent grip on any floor, preventing slips and injuries. Lightweight and easy to roll up, it comes with a convenient carrying strap for effortless transport to the studio, gym, or outdoors. Made from eco-friendly, non-toxic materials, it\'s a safe and supportive choice for your fitness journey.',
    price: 25.00,
    imageUrl: 'https://placehold.co/400x300/c0c0c0/111111?text=Yoga+Mat',
    carouselImages: [
      'https://placehold.co/800x600/1e90ff/f0f8ff?text=Yoga+Mat+View+1',
      'https://placehold.co/800x600/007bff/f0f8ff?text=Yoga+Mat+View+2',
      'https://placehold.co/800x600/0056b3/f0f8ff?text=Yoga+Mat+View+3'
    ],
    specifications: {
      Material: 'Eco-friendly NBR Foam',
      Thickness: '6mm',
      Dimensions: '183 x 61 cm',
      Features: 'Non-slip, Lightweight, Carrying Strap'
    },
    reviews: [
      { author: 'Isabella Ross', rating: 5, comment: 'Very comfortable and doesn\'t slip at all. Perfect for my yoga sessions.' },
      { author: 'Jacob Black', rating: 4, comment: 'Good quality mat, though it had a slight odor when first opened. It dissipated quickly.' }
    ],
    category: 'Sports & Outdoors',
    rating: 4.6,
    numReviews: 70,
    stock: 90,
  },
  {
    name: 'Bestselling Novel: The Midnight Library',
    description: 'A captivating story about second chances and choosing a different life. A must-read.',
    longDescription: 'Between life and death there is a library, and within that library, the shelves go on forever. Every book provides a chance to try another life you could have lived. To see how things would be if you had made other choices… Would you have done anything different, if you had the chance to undo your regrets? A captivating and profound novel that explores themes of regret, choice, and the meaning of life, inviting readers to ponder their own paths. This internationally bestselling book is a heartwarming and thought-provoking journey that resonates deeply with its audience.',
    price: 15.99,
    imageUrl: 'https://placehold.co/400x300/a0a0a0/EEEEEE?text=Book+Cover',
    carouselImages: [
      'https://placehold.co/800x600/1e90ff/f0f8ff?text=Book+Cover+1',
      'https://placehold.co/800x600/007bff/f0f8ff?text=Book+Spine+2',
      'https://placehold.co/800x600/0056b3/f0f8ff?text=Book+Page+3'
    ],
    specifications: {
      Author: 'Matt Haig',
      Genre: 'Fiction, Fantasy',
      Pages: '304',
      Publisher: 'Canongate Books',
      Format: 'Paperback'
    },
    reviews: [
      { author: 'Kate Winslet', rating: 5, comment: 'Absolutely loved this book! A beautiful and thought-provoking story.' },
      { author: 'Leo DiCaprio', rating: 5, comment: 'A truly unique concept. It made me reflect on my own life choices.' }
    ],
    category: 'Books & Media',
    rating: 4.7,
    numReviews: 300,
    stock: 150,
  },
  {
    name: 'Gardening Tool Set (5-Piece)',
    description: 'Essential tools for every gardener. Durable, ergonomic, and perfect for planting and weeding.',
    longDescription: 'Cultivate your garden with ease using our comprehensive 5-piece gardening tool set. Crafted from high-quality stainless steel, these tools are rust-resistant and built to last, providing reliable performance season after season. The ergonomic, non-slip handles ensure a comfortable grip, reducing hand fatigue during extended use. This set includes a trowel, transplanter, cultivator, hand rake, and weeding fork – everything you need for planting, digging, weeding, and aerating. Ideal for both beginners and seasoned gardeners, it\'s the perfect companion for maintaining a beautiful and thriving outdoor space.',
    price: 39.99,
    imageUrl: 'https://placehold.co/400x300/909090/DDDDDD?text=Gardening+Tools',
    carouselImages: [
      'https://placehold.co/800x600/1e90ff/f0f8ff?text=Tools+View+1',
      'https://placehold.co/800x600/007bff/f0f8ff?text=Tools+View+2',
      'https://placehold.co/800x600/0056b3/f0f8ff?text=Tools+View+3'
    ],
    specifications: {
      Material: 'Stainless Steel, Ergonomic Handles',
      Pieces: '5 (Trowel, Transplanter, Cultivator, Hand Rake, Weeding Fork)',
      Application: 'Gardening, Planting, Weeding'
    },
    reviews: [
      { author: 'Maria Garcia', rating: 4, comment: 'Sturdy and well-made tools. Great for my small garden.' },
      { author: 'Noah Davies', rating: 5, comment: 'Love these! Comfortable to use and very effective for various tasks.' }
    ],
    category: 'Home & Kitchen',
    rating: 4.4,
    numReviews: 80,
    stock: 65,
  },
  {
    name: 'Adjustable Dumbbell Set (5-52.5 lbs)',
    description: 'Compact and versatile for full-body workouts. Replaces multiple dumbbells.',
    longDescription: 'Optimize your home gym with our innovative adjustable dumbbell set, designed to save space and provide versatile workout options. Each dumbbell quickly adjusts from 5 to 52.5 pounds, replacing up to 15 sets of traditional dumbbells with a simple dial turn. This allows for seamless transitions between exercises and accommodates various strength levels. The durable construction and secure locking mechanism ensure safety during your heaviest lifts. Perfect for strength training, bodybuilding, and general fitness, it\'s an all-in-one solution for a complete full-body workout.',
    price: 299.99,
    imageUrl: 'https://placehold.co/400x300/a0a0a0/EEEEEE?text=Dumbbell+Set',
    carouselImages: [
      'https://placehold.co/800x600/1e90ff/f0f8ff?text=Dumbbell+View+1',
      'https://placehold.co/800x600/007bff/f0f8ff?text=Dumbbell+View+2',
      'https://placehold.co/800x600/0056b3/f0f8ff?text=Dumbbell+View+3'
    ],
    specifications: {
      WeightRange: '5-52.5 lbs (2.27-23.8 kg)',
      Adjustments: 'Increments via Dial',
      Material: 'Steel, Durable Plastic',
      Replaces: '15 sets of dumbbells'
    },
    reviews: [
      { author: 'Oscar Perez', rating: 5, comment: 'Best investment for my home gym! Easy to adjust and feels solid.' },
      { author: 'Paula Becker', rating: 4, comment: 'Saves so much space. A bit clunky to change weights sometimes, but overall great.' }
    ],
    category: 'Sports & Outdoors',
    rating: 4.8,
    numReviews: 100,
    stock: 25,
  },
  {
    name: 'Bluetooth Shower Speaker',
    description: 'Waterproof speaker for music in the shower. Strong suction cup and clear sound.',
    longDescription: 'Turn your shower into a concert hall with our waterproof Bluetooth shower speaker! Designed to withstand splashes and sprays, this durable speaker features a strong suction cup that easily attaches to any smooth surface. Enjoy crystal-clear audio and surprisingly powerful bass for its compact size, making your shower routine more enjoyable. Connect it wirelessly to your smartphone or tablet via Bluetooth, and effortlessly control music playback and calls with the integrated buttons. Its long-lasting battery ensures hours of uninterrupted music, perfect for singing along to your favorite tunes.',
    price: 19.99,
    imageUrl: 'https://placehold.co/400x300/d0d0d0/222222?text=Shower+Speaker',
    carouselImages: [
      'https://placehold.co/800x600/1e90ff/f0f8ff?text=Speaker+View+1',
      'https://placehold.co/800x600/007bff/f0f8ff?text=Speaker+View+2',
      'https://placehold.co/800x600/0056b3/f0f8ff?text=Speaker+View+3'
    ],
    specifications: {
      WaterResistance: 'IPX7 (Waterproof)',
      Connectivity: 'Bluetooth',
      BatteryLife: 'Up to 6 hours',
      Mounting: 'Suction Cup'
    },
    reviews: [
      { author: 'Quincy Adams', rating: 4, comment: 'Great sound for a shower speaker. Suction cup holds strong.' },
      { author: 'Rebecca Lynn', rating: 5, comment: 'Love this! My showers are so much better with music.' }
    ],
    category: 'Electronics',
    rating: 4.2,
    numReviews: 140,
    stock: 110,
  },
  {
    name: 'Air Fryer (5.8-Quart)',
    description: 'Healthy cooking with less oil. Large capacity for family meals, easy to use and clean.',
    longDescription: 'Cook your favorite foods to crispy perfection with up to 80% less fat using our versatile 5.8-quart air fryer. Enjoy guilt-free fries, chicken wings, roasted vegetables, and more, all with a delicious crispy exterior and tender interior. Its large capacity is perfect for family-sized meals, and the intuitive digital touchscreen offers preset programs for popular dishes. The non-stick basket is dishwasher-safe for quick and easy cleanup. Experience a healthier way to cook without compromising on taste or texture.',
    price: 89.99,
    imageUrl: 'https://placehold.co/400x300/b0b0b0/000000?text=Air+Fryer',
    carouselImages: [
      'https://placehold.co/800x600/1e90ff/f0f8ff?text=Air+Fryer+View+1',
      'https://placehold.co/800x600/007bff/f0f8ff?text=Air+Fryer+View+2',
      'https://placehold.co/800x600/0056b3/f0f8ff?text=Air+Fryer+View+3'
    ],
    specifications: {
      Capacity: '5.8 Quart',
      CookingModes: 'Air Fry, Roast, Bake, Grill',
      Control: 'Digital Touchscreen',
      DishwasherSafe: 'Basket'
    },
    reviews: [
      { author: 'Steve Rogers', rating: 5, comment: 'My new favorite kitchen appliance! So easy to use and everything comes out great.' },
      { author: 'Natasha Romanoff', rating: 4, comment: 'Cooks food quickly and evenly. A bit bulky on the counter, but worth it.' }
    ],
    category: 'Home & Kitchen',
    rating: 4.6,
    numReviews: 210,
    stock: 40,
  },
  {
    name: 'Noise Cancelling Wireless Microphone',
    description: 'Crystal-clear audio for recording, streaming, and online calls. Advanced noise cancellation.',
    longDescription: 'Achieve pristine audio quality with our Noise Cancelling Wireless Microphone. Engineered for professional-grade sound, this microphone features advanced active noise cancellation technology that eliminates background distractions, ensuring your voice is heard clearly. Its wireless design provides ultimate freedom of movement, perfect for presentations, content creation, and online meetings. Easy to set up with plug-and-play compatibility across various devices. The long-lasting battery ensures hours of continuous use, making it an indispensable tool for anyone who demands superior audio performance.',
    price: 75.00,
    imageUrl: 'https://placehold.co/400x300/a0a0a0/EEEEEE?text=Wireless+Mic',
    carouselImages: [
      'https://placehold.co/800x600/1e90ff/f0f8ff?text=Mic+View+1',
      'https://placehold.co/800x600/007bff/f0f8ff?text=Mic+View+2',
      'https://placehold.co/800x600/0056b3/f0f8ff?text=Mic+View+3'
    ],
    specifications: {
      Connectivity: '2.4GHz Wireless',
      NoiseCancellation: 'Active',
      BatteryLife: '8 hours',
      Compatibility: 'PC, Mac, Smartphones (with adapter)'
    },
    reviews: [
      { author: 'Tony Stark', rating: 5, comment: 'Fantastic mic for streaming! Noise cancellation is top-notch.' },
      { author: 'Wanda Maximoff', rating: 4, comment: 'Good quality for the price. Occasional minor interference but generally clear.' }
    ],
    category: 'Electronics',
    rating: 4.4,
    numReviews: 88,
    stock: 60,
  },
  {
    name: 'Portable Mini Projector',
    description: 'Compact and powerful for movies anywhere. 1080p support, built-in speaker, HDMI/USB input.',
    longDescription: 'Transform any room into a cinematic experience with our portable mini projector. Despite its compact size, it supports up to 1080p resolution, delivering crisp and vibrant images. Enjoy your favorite movies, TV shows, and games on a big screen with its built-in speaker or connect to external audio devices. With HDMI, USB, and AV inputs, it\'s compatible with a wide range of devices, including laptops, gaming consoles, and streaming sticks. Perfect for home entertainment, outdoor movie nights, or even business presentations on the go. Its long-lasting lamp ensures years of vivid projection.',
    price: 99.00,
    imageUrl: 'https://placehold.co/400x300/c0c0c0/111111?text=Mini+Projector',
    carouselImages: [
      'https://placehold.co/800x600/1e90ff/f0f8ff?text=Projector+View+1',
      'https://placehold.co/800x600/007bff/f0f8ff?text=Projector+View+2',
      'https://placehold.co/800x600/0056b3/f0f8ff?text=Projector+View+3'
    ],
    specifications: {
      ResolutionSupport: '1920x1080p (Native 800x480)',
      Brightness: '2000 Lumens',
      Inputs: 'HDMI, USB, AV',
      LampLife: '50,000 hours',
      BuiltInSpeaker: 'Yes'
    },
    reviews: [
      { author: 'Bruce Banner', rating: 4, comment: 'Good for the price, especially for casual movie nights. Not super bright, but acceptable.' },
      { author: 'Carol Danvers', rating: 5, comment: 'Exceeded my expectations for a mini projector. Great for camping trips!' }
    ],
    category: 'Electronics',
    rating: 4.0,
    numReviews: 105,
    stock: 70,
  },
];


const seedProducts = async () => {
  try {
    console.log('Attempting to seed products...');
    // Clear existing products and users to ensure a clean slate for seeding.
    // Use with extreme caution in a production environment as it will delete all data.
    await Product.deleteMany({});
    await User.deleteMany({});
    console.log('Existing products and users cleared from database.');

    // Insert the mock product data into the Product collection.
    const createdProducts = await Product.insertMany(mockProductsForSeeding);
    console.log(`${createdProducts.length} products seeded successfully!`);

    // Create a default admin user.
    // Remember to change this default password in a real application and for security.
    const adminUser = new User({
      username: 'admin',
      email: 'admin@example.com',
      password: 'adminpassword123', // This password will be hashed by the pre-save hook in the User schema.
      isAdmin: true, // Mark this user as an administrator.
      memberSince: new Date()
    });
    await adminUser.save(); // Save the admin user to the database.
    console.log('Default admin user "admin@example.com" created.');

    // Create a default regular user
    const regularUser = new User({
      username: 'user',
      email: 'user@example.com',
      password: 'userpassword123', // This password will be hashed
      isAdmin: false,
      memberSince: new Date()
    });
    await regularUser.save();
    console.log('Default regular user "user@example.com" created.');

    console.log('Database seeding complete.');
  } catch (error) {
    console.error('Error during database seeding:', error.message);
  }
};

// To run the seeding function automatically when the server starts, uncomment the line below.
// This is typically for development convenience.
 seedProducts(); // This line was commented out. UNCOMMENT THIS LINE.

