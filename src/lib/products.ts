
export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  rating: number;
  reviewsCount: number;
  description: string;
  details: string[];
  tags: string[];
  offers: string[];
  stock: number;
};

export const categories = [
  "Electronics",
  "Fashion",
  "Home & Kitchen",
  "Books",
  "Groceries",
  "Photography",
];

export const products: Product[] = [
  {
    id: "prod-1",
    name: "QuantumCore Laptop 15 Pro",
    category: "Electronics",
    price: 1299.99,
    image: "https://placehold.co/600x600.png",
    rating: 4.8,
    reviewsCount: 256,
    description: "Experience unparalleled performance with the QuantumCore Laptop. Featuring a 15-inch Retina display, the latest 12-core processor, and all-day battery life.",
    details: [
        "15.6-inch 4K OLED Display",
        "12th Gen Intel Core i9 Processor",
        "32GB DDR5 RAM",
        "1TB NVMe SSD",
        "NVIDIA GeForce RTX 4070"
    ],
    tags: ["laptop", "pro", "workstation"],
    offers: ["10% off with partner bank", "Free carrying case"],
    stock: 50,
  },
  {
    id: "prod-2",
    name: "AeroSound Noise-Cancelling Headphones",
    category: "Electronics",
    price: 349.99,
    image: "https://placehold.co/600x600.png",
    rating: 4.9,
    reviewsCount: 841,
    description: "Immerse yourself in pure audio. AeroSound headphones offer industry-leading noise cancellation, high-fidelity sound, and a comfortable, lightweight design.",
    details: [
        "Active Noise Cancellation",
        "40-hour battery life",
        "Bluetooth 5.2 Connectivity",
        "Built-in microphone for calls",
        "Foldable design"
    ],
    tags: ["headphones", "audio", "travel"],
    offers: ["Buy one get one 50% off"],
    stock: 120,
  },
  {
    id: "prod-3",
    name: "Urban Explorer Backpack",
    category: "Fashion",
    price: 89.99,
    image: "https://placehold.co/600x600.png",
    rating: 4.6,
    reviewsCount: 432,
    description: "The perfect companion for your daily commute or weekend adventures. Water-resistant, durable, with multiple compartments including a padded laptop sleeve.",
    details: [
        "30L Capacity",
        "Water-resistant nylon fabric",
        "Padded sleeve for 15-inch laptop",
        "Anti-theft back pocket",
        "USB charging port"
    ],
    tags: ["backpack", "fashion", "utility"],
    offers: [],
    stock: 200,
  },
  {
    id: "prod-4",
    name: "SmartBrew Coffee Maker",
    category: "Home & Kitchen",
    price: 129.99,
    image: "https://placehold.co/600x600.png",
    rating: 4.7,
    reviewsCount: 312,
    description: "Brew the perfect cup every time. The SmartBrew connects to your phone, allowing you to schedule brewing, adjust strength, and get maintenance alerts.",
    details: [
        "12-cup capacity",
        "Wi-Fi and App enabled",
        "Programmable timer",
        "Keep warm function",
        "Permanent gold-tone filter"
    ],
    tags: ["coffee", "smart home", "kitchen"],
    offers: ["Free 1lb of premium coffee beans"],
    stock: 75,
  },
  {
    id: "prod-5",
    name: "The Infinite Labyrinth - Hardcover",
    category: "Books",
    price: 24.99,
    image: "https://placehold.co/600x600.png",
    rating: 4.9,
    reviewsCount: 1024,
    description: "The latest bestseller from acclaimed author Jane Doe. A thrilling fantasy epic that will keep you on the edge of your seat.",
    details: [
        "Hardcover, 512 pages",
        "Author: Jane Doe",
        "Genre: Fantasy Fiction",
        "Published by Quill & Page",
        "Includes a map of the realm"
    ],
    tags: ["book", "fantasy", "bestseller"],
    offers: ["Signed copies available for a limited time"],
    stock: 300,
  },
  {
    id: "prod-6",
    name: "Organic Quinoa Grain",
    category: "Groceries",
    price: 9.99,
    image: "https://placehold.co/600x600.png",
    rating: 4.8,
    reviewsCount: 576,
    description: "A versatile and nutritious superfood. Our organic quinoa is pre-washed and ready to cook. Perfect for salads, bowls, and side dishes.",
     details: [
        "1kg (2.2 lbs) Pack",
        "USDA Certified Organic",
        "Gluten-Free and Non-GMO",
        "Pre-washed",
        "Sustainably sourced"
    ],
    tags: ["organic", "healthy", "groceries"],
    offers: ["Subscribe and save 15%"],
    stock: 500,
  },
    {
    id: "prod-7",
    name: "Zenith Smartwatch Series 5",
    category: "Electronics",
    price: 499.00,
    image: "https://placehold.co/600x600.png",
    rating: 4.7,
    reviewsCount: 620,
    description: "Stay connected and track your fitness with the Zenith Smartwatch. Features a vibrant always-on display, ECG app, and customizable watch faces.",
    details: [
        "Always-On OLED Display",
        "ECG and Blood Oxygen monitoring",
        "GPS and Cellular models available",
        "Water-resistant up to 50 meters",
        "7-day battery life on a single charge"
    ],
    tags: ["smartwatch", "fitness", "wearable"],
    offers: ["Extra strap included"],
    stock: 90,
  },
  {
    id: "prod-8",
    name: "Classic Denim Jacket",
    category: "Fashion",
    price: 119.50,
    image: "https://placehold.co/600x600.png",
    rating: 4.5,
    reviewsCount: 350,
    description: "A timeless wardrobe staple. This classic denim jacket is made from 100% premium cotton for a comfortable fit that gets better with age.",
    details: [
        "100% Cotton Denim",
        "Button-front closure",
        "Two chest pockets with button flaps",
        "Adjustable waist tabs",
        "Machine washable"
    ],
    tags: ["jacket", "denim", "classic"],
    offers: [],
    stock: 150,
  },
  {
    id: "prod-9",
    name: "Pro-Grade Camera Drone",
    category: "Photography",
    price: 799.00,
    image: "https://placehold.co/600x600.png",
    rating: 4.9,
    reviewsCount: 450,
    description: "Capture stunning aerial shots with this professional-grade drone. Features a 4K camera, 3-axis gimbal for smooth footage, and a 30-minute flight time.",
    details: [
        "4K HDR Video Recording",
        "1-inch CMOS Sensor",
        "30-minute Max Flight Time",
        "5-mile Transmission Range",
        "Includes controller and spare battery"
    ],
    tags: ["drone", "camera", "photography"],
    offers: ["Free 128GB MicroSD Card"],
    stock: 60,
  },
];
