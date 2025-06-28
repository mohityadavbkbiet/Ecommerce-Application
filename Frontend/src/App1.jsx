import { useState, useEffect, createContext, useContext, useRef } from 'react';

// Bootstrap CDN links (will be placed in index.html in a real setup, but included here for completeness within the React app context)
// This is illustrative. In a real React app, you'd typically manage Bootstrap via npm packages or include these in your public/index.html.
// For Canvas preview, it's often more reliable to assume these are added globally or dynamically inject them.
// For this immersive, we'll imagine they are externally linked or managed by a build tool.
// <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" xintegrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">
// <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" xintegrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>

// Font Awesome for icons (e.g., cart icon)
// <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css" xintegrity="sha512-SnH5WK+bZxgPHs44uWIX+LLJAJ9/2PkPKZ5QiAj6Ta86w+fsb2TkcmfRyVX3pBnMFcV7oQPJkl9QevSCWr3W6A==" crossorigin="anonymous" referrerpolicy="no-referrer" />

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

// Mock Data (Expanded)
const mockProducts = [
  {
    id: 'p101',
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
      { id: 1, author: 'Alice Smith', rating: 5, comment: 'Amazing sound quality and super comfortable! Battery lasts forever.' },
      { id: 2, author: 'Bob Johnson', rating: 4, comment: 'Good value for money. Noise cancellation works well, but fit could be slightly better for long sessions.' }
    ],
    category: 'Electronics',
    rating: 4.5,
    numReviews: 120,
    stock: 50,
  },
  {
    id: 'p102',
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
      { id: 3, author: 'Charlie Brown', rating: 4, comment: 'Accurate tracking, good battery life. App could be more user-friendly.' },
      { id: 4, author: 'Diana Prince', rating: 5, comment: 'Love this tracker! It motivates me to stay active and the sleep tracking is fascinating.' }
    ],
    category: 'Wearables',
    rating: 4.2,
    numReviews: 85,
    stock: 75,
  },
  {
    id: 'p103',
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
      { id: 5, author: 'Eve Adams', rating: 5, comment: 'Produces surprisingly good espresso! Perfect for my morning commute.' },
      { id: 6, author: 'Frank Green', rating: 4, comment: 'A bit of a learning curve, but once you get it, it\'s great. Very portable.' }
    ],
    category: 'Home & Kitchen',
    rating: 4.8,
    numReviews: 210,
    stock: 30,
  },
  {
    id: 'p104',
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
      { id: 7, author: 'Grace Lee', rating: 5, comment: 'Charges my phone multiple times. Slim design is a huge plus!' },
      { id: 8, author: 'Henry Wang', rating: 4, comment: 'Reliable power bank. Gets a bit warm during fast charging, but nothing concerning.' }
    ],
    category: 'Electronics',
    rating: 4.6,
    numReviews: 155,
    stock: 90,
  },
  {
    id: 'p105',
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
      { id: 9, author: 'Ivy Davis', rating: 5, comment: 'Transformed my home office! So comfortable for long hours.' },
      { id: 10, author: 'Jack Wilson', rating: 4, comment: 'Great chair for the price. Assembly took a little time, but worth it.' }
    ],
    category: 'Furniture',
    rating: 4.7,
    numReviews: 98,
    stock: 20,
  },
  {
    id: 'p106',
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
      { id: 11, author: 'Karen Miller', rating: 4, comment: 'Easy to install and great colors. Integration with Alexa is seamless.' },
      { id: 12, author: 'Liam Garcia', rating: 5, comment: 'Transformed my gaming setup! Highly recommend for ambient lighting.' }
    ],
    category: 'Smart Home',
    rating: 4.3,
    numReviews: 65,
    stock: 120,
  },
  {
    id: 'p107',
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
      { id: 13, author: 'Mia Rodriguez', rating: 4, comment: 'Great sound and decent noise cancellation for the price. Comfortable fit.' },
      { id: 14, author: 'Noah Martinez', rating: 5, comment: 'Fantastic earbuds for travel. Blocks out airplane noise effectively.' }
    ],
    category: 'Electronics',
    rating: 4.4,
    numReviews: 180,
    stock: 60,
  },
  {
    id: 'p108',
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
      { id: 15, author: 'Olivia White', rating: 5, comment: 'Perfect for digital painting! The pen feels so natural.' },
      { id: 16, author: 'Peter Hall', rating: 4, comment: 'Great tablet, good value. Software setup was a bit tricky.' }
    ],
    category: 'Electronics',
    rating: 4.9,
    numReviews: 75,
    stock: 25,
  },
  {
    id: 'p109',
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
      { id: 17, author: 'Quinn Taylor', rating: 5, comment: 'A lifesaver for busy mornings! My cat loves the voice recording.' },
      { id: 18, author: 'Rachel King', rating: 4, comment: 'Works as advertised. Setup was straightforward.' }
    ],
    category: 'Pet Supplies',
    rating: 4.1,
    numReviews: 50,
    stock: 40,
  },
  {
    id: 'p110',
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
      { id: 19, author: 'Sam Lee', rating: 5, comment: 'Perfect size for weekend trips. Very comfortable to carry.' },
      { id: 20, author: 'Tina Chen', rating: 4, comment: 'Good quality, lots of pockets. Wish it had a bit more padding on the back.' }
    ],
    category: 'Travel',
    rating: 4.5,
    numReviews: 110,
    stock: 80,
  },
  {
    id: 'p111',
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
      { id: 21, author: 'Umar Khan', rating: 5, comment: 'Picture quality is incredible! Very happy with this purchase.' },
      { id: 22, author: 'Vera Popov', rating: 4, comment: 'Great TV for the price, smart features work well. Sound could be better, but I use a soundbar.' }
    ],
    category: 'Electronics',
    rating: 4.6,
    numReviews: 250,
    stock: 35,
  },
  {
    id: 'p112',
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
      { id: 23, author: 'William Jones', rating: 5, comment: 'This vacuum is a game changer! My floors have never been cleaner.' },
      { id: 24, author: 'Xenia Kim', rating: 4, comment: 'Works well, but sometimes gets stuck on high carpets. Overall happy.' }
    ],
    category: 'Home & Kitchen',
    rating: 4.3,
    numReviews: 190,
    stock: 45,
  },
  {
    id: 'p113',
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
      { id: 25, author: 'Yara Ahmed', rating: 5, comment: 'Beautiful set, very sturdy and cooks evenly. Easy to clean too.' },
      { id: 26, author: 'Zackary Brown', rating: 4, comment: 'Good quality, but handles can get a bit hot if left on high heat for too long.' }
    ],
    category: 'Home & Kitchen',
    rating: 4.7,
    numReviews: 115,
    stock: 28,
  },
  {
    id: 'p114',
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
      { id: 27, author: 'Alex Chen', rating: 5, comment: 'This laptop is an absolute beast! Runs everything flawlessly.' },
      { id: 28, author: 'Brenda Lee', rating: 5, comment: 'Super fast and the display is gorgeous. Worth every penny for gaming.' }
    ],
    category: 'Electronics',
    rating: 4.9,
    numReviews: 60,
    stock: 15,
  },
  {
    id: 'p115',
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
      { id: 29, author: 'Chris Evans', rating: 4, comment: 'Clear video and audio. Motion detection is a bit sensitive but adjustable.' },
      { id: 30, author: 'Debra Morgan', rating: 5, comment: 'Feel much safer with this doorbell. Easy to use app.' }
    ],
    category: 'Smart Home',
    rating: 4.5,
    numReviews: 130,
    stock: 40,
  },
  {
    id: 'p116',
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
      { id: 31, author: 'Ethan Hunt', rating: 5, comment: 'Excellent camera for the price. Takes amazing photos.' },
      { id: 32, author: 'Fiona Glenanne', rating: 4, comment: 'Great for beginners, but I wish it had a better low-light performance.' }
    ],
    category: 'Electronics',
    rating: 4.8,
    numReviews: 70,
    stock: 20,
  },
  {
    id: 'p117',
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
      { id: 33, author: 'George Clooney', rating: 5, comment: 'Perfect for my pour-over coffee. Precise temperature control is a game changer.' },
      { id: 34, author: 'Hannah Montana', rating: 4, comment: 'Boils fast and looks good. The lid can be a bit stiff to open sometimes.' }
    ],
    category: 'Home & Kitchen',
    rating: 4.3,
    numReviews: 95,
    stock: 55,
  },
  {
    id: 'p118',
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
      { id: 35, author: 'Isabella Ross', rating: 5, comment: 'Very comfortable and doesn\'t slip at all. Perfect for my yoga sessions.' },
      { id: 36, author: 'Jacob Black', rating: 4, comment: 'Good quality mat, though it had a slight odor when first opened. It dissipated quickly.' }
    ],
    category: 'Sports & Outdoors',
    rating: 4.6,
    numReviews: 70,
    stock: 90,
  },
  {
    id: 'p119',
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
      { id: 37, author: 'Kate Winslet', rating: 5, comment: 'Absolutely loved this book! A beautiful and thought-provoking story.' },
      { id: 38, author: 'Leo DiCaprio', rating: 5, comment: 'A truly unique concept. It made me reflect on my own life choices.' }
    ],
    category: 'Books & Media',
    rating: 4.7,
    numReviews: 300,
    stock: 150,
  },
  {
    id: 'p120',
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
      { id: 39, author: 'Maria Garcia', rating: 4, comment: 'Sturdy and well-made tools. Great for my small garden.' },
      { id: 40, author: 'Noah Davies', rating: 5, comment: 'Love these! Comfortable to use and very effective for various tasks.' }
    ],
    category: 'Home & Kitchen',
    rating: 4.4,
    numReviews: 80,
    stock: 65,
  },
  {
    id: 'p121',
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
      { id: 41, author: 'Oscar Perez', rating: 5, comment: 'Best investment for my home gym! Easy to adjust and feels solid.' },
      { id: 42, author: 'Paula Becker', rating: 4, comment: 'Saves so much space. A bit clunky to change weights sometimes, but overall great.' }
    ],
    category: 'Sports & Outdoors',
    rating: 4.8,
    numReviews: 100,
    stock: 25,
  },
  {
    id: 'p122',
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
      { id: 43, author: 'Quincy Adams', rating: 4, comment: 'Great sound for a shower speaker. Suction cup holds strong.' },
      { id: 44, author: 'Rebecca Lynn', rating: 5, comment: 'Love this! My showers are so much better with music.' }
    ],
    category: 'Electronics',
    rating: 4.2,
    numReviews: 140,
    stock: 110,
  },
  {
    id: 'p123',
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
      { id: 45, author: 'Steve Rogers', rating: 5, comment: 'My new favorite kitchen appliance! So easy to use and everything comes out great.' },
      { id: 46, author: 'Natasha Romanoff', rating: 4, comment: 'Cooks food quickly and evenly. A bit bulky on the counter, but worth it.' }
    ],
    category: 'Home & Kitchen',
    rating: 4.6,
    numReviews: 210,
    stock: 40,
  },
  {
    id: 'p124',
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
      { id: 47, author: 'Tony Stark', rating: 5, comment: 'Fantastic mic for streaming! Noise cancellation is top-notch.' },
      { id: 48, author: 'Wanda Maximoff', rating: 4, comment: 'Good quality for the price. Occasional minor interference but generally clear.' }
    ],
    category: 'Electronics',
    rating: 4.4,
    numReviews: 88,
    stock: 60,
  },
  {
    id: 'p125',
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
      { id: 49, author: 'Bruce Banner', rating: 4, comment: 'Good for the price, especially for casual movie nights. Not super bright, but acceptable.' },
      { id: 50, author: 'Carol Danvers', rating: 5, comment: 'Exceeded my expectations for a mini projector. Great for camping trips!' }
    ],
    category: 'Electronics',
    rating: 4.0,
    numReviews: 105,
    stock: 70,
  },
];

// Context for managing application state
const AppContext = createContext();

// AppProvider component to wrap the entire application
const AppProvider = ({ children }) => {
  const [products] = useState(mockProducts);
  const [cartItems, setCartItems] = useState(() => {
    try {
      const storedCart = localStorage.getItem('cartItems');
      return storedCart ? JSON.parse(storedCart) : [];
    } catch (error) {
      console.error("Failed to parse cart from localStorage", error);
      return [];
    }
  });
  const [currentPage, setCurrentPage] = useState('home'); // 'home', 'product', 'cart', 'login', 'checkout', 'profile'
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [user, setUser] = useState(null); // Mock user authentication
  const [toasts, setToasts] = useState([]); // For managing toast notifications

  // Save cart items to local storage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
    } catch (error) {
      console.error("Failed to save cart to localStorage", error);
    }
  }, [cartItems]);

  const addToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  const addToCart = (product, quantity = 1) => {
    setCartItems((prevItems) => {
      const existingItem = prevItems.find((item) => item.id === product.id);
      if (existingItem) {
        addToast(`${quantity} more of "${product.name}" added to cart!`, 'success');
        return prevItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      } else {
        addToast(`"${product.name}" added to cart!`, 'success');
        return [...prevItems, { ...product, quantity }];
      }
    });
  };

  const updateCartQuantity = (productId, newQuantity) => {
    setCartItems((prevItems) => {
      if (newQuantity <= 0) {
        const itemToRemove = prevItems.find(item => item.id === productId);
        if (itemToRemove) addToast(`"${itemToRemove.name}" removed from cart.`, 'info');
        return prevItems.filter((item) => item.id !== productId);
      }
      return prevItems.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  const removeFromCart = (productId) => {
    const itemToRemove = cartItems.find(item => item.id === productId);
    if (itemToRemove) addToast(`"${itemToRemove.name}" removed from cart.`, 'info');
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
    addToast('Cart cleared!', 'info');
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

  const login = (username, password) => {
    // Mock login logic
    if (username === 'user' && password === 'password') {
      setUser({ username: 'user', email: 'user@example.com', memberSince: 'Jan 2023' });
      addToast('Logged in successfully!', 'success');
      navigateTo('home');
      return true;
    }
    setError('Invalid username or password.'); // Assuming setError exists in Login component, this is handled there
    return false;
  };

  const logout = () => {
    setUser(null);
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
  const { navigateTo, getTotalCartItems, user, logout } = useContext(AppContext);
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    // In a full app, this would filter products or navigate to a search results page
    console.log('Searching for:', searchTerm);
    alert("Search functionality is not fully implemented in this demo."); // Using alert per previous instructions for simple messages
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
                    <li><a className="dropdown-item" href="#">Order History</a></li>
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
              onClick={() => navigateTo('product', product.id)}
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
  const [filteredProducts, setFilteredProducts] = useState(products);
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
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {/* Popular Products Section */}
      <h2 className="mb-4 text-center fw-bold text-dark">Popular Products</h2>
      <div className="row mb-5">
        {popularProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
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
            <ProductCard key={product.id} product={product} />
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
  const { products, addToCart, navigateTo } = useContext(AppContext);
  const product = products.find((p) => p.id === productId);
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
          <div id={`productCarousel-${product.id}`} className="carousel slide shadow-lg rounded-3" data-bs-ride="carousel">
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
                <button className="carousel-control-prev" type="button" data-bs-target={`#productCarousel-${product.id}`} data-bs-slide="prev">
                  <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                  <span className="visually-hidden">Previous</span>
                </button>
                <button className="carousel-control-next" type="button" data-bs-target={`#productCarousel-${product.id}`} data-bs-slide="next">
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
                {[...Array(Math.floor(product.rating))].map((_, i) => <i key={i} className="fas fa-star" key={`star-${i}`}></i>)}
                {product.rating % 1 !== 0 && <i className="fas fa-star-half-alt"></i>}
                {product.rating < 5 && [...Array(5 - Math.ceil(product.rating))].map((_, i) => <i key={i} className="far fa-star" key={`empty-star-${i}`}></i>)}
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
                  navigateTo('cart'); // Go to cart after adding
                }}
                disabled={product.stock === 0 || quantity > product.stock}
              >
                <i className="fas fa-cart-plus me-2"></i> Add to Cart
              </button>
              <button
                className="btn btn-outline-secondary-gradient btn-lg rounded-pill px-5"
                onClick={() => alert("Buy now functionality not implemented")}
              >
                Buy Now
              </button>
              <button
                className="btn btn-outline-info rounded-pill ms-md-3"
                onClick={() => alert("Added to Wishlist (placeholder)")}
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
            <div key={review.id} className="card mb-3 shadow-sm rounded-lg">
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
          <button className="btn btn-outline-primary-gradient rounded-pill mt-3" onClick={() => alert("Write a review functionality (placeholder)")}>
            Write a Review
          </button>
        </div>
      )}


      {/* Related Products Section */}
      <h3 className="mb-4 mt-5 fw-bold text-dark">You might also like</h3>
      <div className="row">
        {products.filter(p => p.id !== productId && p.category === product.category).slice(0, 4).map(relatedProduct => (
          <ProductCard key={relatedProduct.id} product={relatedProduct} />
        ))}
      </div>
    </div>
  );
};

// Cart Page Component
const CartPage = () => {
  const { cartItems, updateCartQuantity, removeFromCart, getTotalCartPrice, navigateTo } = useContext(AppContext);

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
    if (onNext) onNext(address);
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
  const [paymentMethod, setPaymentMethod] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (paymentMethod) {
      if (onNext) onNext(paymentMethod);
    } else {
      alert("Please select a payment method.");
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
  const { navigateTo } = useContext(AppContext);
  return (
    <div className="container mt-5 text-center py-5">
      <i className="fas fa-check-circle fa-5x text-success mb-3 animate__animated animate__bounceIn"></i>
      <h2 className="mb-3 fw-bold text-dark">Thank You for Your Order!</h2>
      <p className="lead">Your order has been placed successfully and will be processed shortly.</p>
      <p>A confirmation email has been sent to your registered email address.</p>
      <button className="btn btn-primary-gradient btn-lg rounded-pill mt-3" onClick={() => navigateTo('home')}>
        <i className="fas fa-home me-2"></i> Continue Shopping
      </button>
      <button className="btn btn-outline-secondary rounded-pill mt-3 ms-3" onClick={() => alert("View Order Details (placeholder)")}>
        <i className="fas fa-receipt me-2"></i> View Order Details
      </button>
    </div>
  );
};

// User Profile Page (Placeholder)
const UserProfilePage = () => {
  const { user, navigateTo, logout } = useContext(AppContext);

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
                <span>{user.memberSince}</span>
              </li>
            </ul>
            <div className="d-flex justify-content-center gap-3">
              <button className="btn btn-primary-gradient rounded-pill px-4" onClick={() => alert("Edit Profile (placeholder)")}>
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
  const { login, navigateTo, user } = useContext(AppContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      navigateTo('home'); // Redirect if already logged in
    }
  }, [user, navigateTo]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (login(username, password)) {
      // Login successful, context handles navigation and toast
    } else {
      setError('Invalid username or password.');
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-75">
      <div className="card shadow-lg rounded-3 animate__animated animate__fadeInDown" style={{ maxWidth: '400px', width: '100%' }}>
        <div className="card-body p-4">
          <h2 className="card-title text-center mb-4 fw-bold text-primary">Login to MyStore</h2>
          {error && <div className="alert alert-danger text-center" role="alert">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="usernameInput" className="form-label text-muted">Username</label>
              <input
                type="text"
                className="form-control rounded-pill py-2"
                id="usernameInput"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
              <button type="submit" className="btn btn-primary-gradient btn-lg rounded-pill">
                Login
              </button>
            </div>
            <p className="text-center text-muted">
              Don't have an account? <a href="#" onClick={() => alert("Sign up functionality not implemented")} className="text-primary text-decoration-none fw-bold">Sign Up</a>
            </p>
            <p className="text-center text-muted small">
              Hint: Try username "user" and password "password"
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};


// The core application content, now wrapped by AppProvider in the main App component
const AppContent = () => {
  const { currentPage, selectedProductId, navigateTo } = useContext(AppContext);

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
