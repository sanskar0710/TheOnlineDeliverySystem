const PIZZA_MENU = [
  {
    id: "pizza-margherita",
    name: "Classic Margherita",
    description: "Classic delight with 100% real mozzarella cheese, tangy tomato sauce, and fresh basil leaves on a freshly baked crust.",
    basePrice: 9.99,
    category: "veg-pizza",
    image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?auto=format&fit=crop&w=600&q=80",
    tags: ["Best Seller", "Classic"],
    rating: 4.8
  },
  {
    id: "pizza-blazing-onion",
    name: "Blazing Onion & Paprika",
    description: "Hot & spicy pizza loaded with caramelized onions, hot red paprika, and a rich garlic herb sauce.",
    basePrice: 11.99,
    category: "veg-pizza",
    image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80",
    tags: ["Spicy", "New"],
    rating: 4.6
  },
  {
    id: "pizza-peppy-paneer",
    name: "Peppy Paneer",
    description: "Chunky paneer cubes marinated in spicy herbs, crunchy capsicum, and spicy red paprika topped with gooey cheese.",
    basePrice: 13.49,
    category: "veg-pizza",
    image: "https://images.unsplash.com/photo-1594007654729-407ededc414a?auto=format&fit=crop&w=600&q=80",
    tags: ["Best Seller", "Spicy"],
    rating: 4.7
  },
  {
    id: "pizza-veggie-paradise",
    name: "Veggie Paradise",
    description: "A garden fresh feast with gold corn, black olives, crisp capsicum, fresh red paprika, and red onions.",
    basePrice: 12.99,
    category: "veg-pizza",
    image: "https://images.unsplash.com/photo-1571066811602-71683a3f680d?auto=format&fit=crop&w=600&q=80",
    tags: ["Healthy", "Popular"],
    rating: 4.5
  },
  {
    id: "pizza-mexican-wave",
    name: "Mexican Green Wave",
    description: "A super-spicy pizza inspired by Mexican flavors, topped with jalapenos, sweet corn, onions, capsicum, and Mexican herbs.",
    basePrice: 13.99,
    category: "veg-pizza",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80",
    tags: ["Spicy", "Exotic"],
    rating: 4.4
  },
  {
    id: "pizza-double-cheese",
    name: "Double Cheese Margherita",
    description: "Extra gooey pizza with double the amount of mozzarella cheese and loaded with seasoned liquid cheese.",
    basePrice: 12.49,
    category: "veg-pizza",
    image: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=600&q=80",
    tags: ["Cheese Burst", "Indulgent"],
    rating: 4.9
  },
  {
    id: "pizza-fiery-sausage",
    name: "Fiery Sausage & Paprika",
    description: "Spiced chicken sausage chunks, sliced hot red paprika, and dynamic cheese drizzle on a spicy marinara base.",
    basePrice: 14.49,
    category: "nonveg-pizza",
    image: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=600&q=80",
    tags: ["Chef's Special", "Spicy"],
    rating: 4.8
  },
  {
    id: "pizza-chicken-supreme",
    name: "Chicken Supreme",
    description: "Loaded with grilled chicken rashers, double chicken meatballs, chicken pepperoni, and a double layer of cheese.",
    basePrice: 15.99,
    category: "nonveg-pizza",
    image: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=600&q=80",
    tags: ["Ultimate Meat", "Best Seller"],
    rating: 4.9
  },
  {
    id: "pizza-pepperoni",
    name: "Classic Chicken Pepperoni",
    description: "An all-time favorite! Spicy chicken pepperoni slices loaded with extra mozzarella cheese.",
    basePrice: 15.49,
    category: "nonveg-pizza",
    image: "https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&w=600&q=80",
    tags: ["Classic", "Popular"],
    rating: 4.7
  },
  {
    id: "side-garlic-bread",
    name: "Garlic Breadsticks",
    description: "Baked fresh garlic breadsticks seasoned with garlic butter and signature Italian herbs, served with cheesy dip.",
    basePrice: 4.49,
    category: "sides",
    image: "https://images.unsplash.com/photo-1544982503-9f984c14501a?auto=format&fit=crop&w=600&q=80",
    tags: ["Sides", "Classic"],
    rating: 4.6
  },
  {
    id: "side-stuffed-bread",
    name: "Stuffed Garlic Bread",
    description: "Freshly baked garlic bread stuffed with sweet corn, spicy jalapenos, and rich mozzarella cheese.",
    basePrice: 5.99,
    category: "sides",
    image: "https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?auto=format&fit=crop&w=600&q=80",
    tags: ["Indulgent", "Spicy"],
    rating: 4.7
  },
  {
    id: "dessert-lava-cake",
    name: "Chocolate Lava Cake",
    description: "Delectable chocolate cake with a warm, gooey, molten chocolate center that flows with every bite.",
    basePrice: 3.99,
    category: "desserts",
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80",
    tags: ["Sweet", "Best Seller"],
    rating: 4.9
  },
  {
    id: "drink-pepsi",
    name: "Cold Pepsi (500ml)",
    description: "A chilled, refreshing 500ml bottle of Pepsi to complete your pizza meal.",
    basePrice: 1.99,
    category: "drinks",
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80",
    tags: ["Refreshing"],
    rating: 4.5
  }
];

const PIZZA_SIZES = {
  regular: { name: "Personal (9\")", priceModifier: 0 },
  medium: { name: "Medium (12\")", priceModifier: 3.00 },
  large: { name: "Large (15\")", priceModifier: 5.50 }
};

const PIZZA_CRUSTS = {
  classic: { name: "Classic Hand Tossed", priceModifier: 0 },
  cheese_burst: { name: "Cheese Burst", priceModifier: 2.49 },
  thin: { name: "Wheat Thin Crust", priceModifier: 1.00 }
};

const EXTRA_TOPPINGS = {
  cheese: { name: "Extra Cheese", price: 1.99 },
  pepperoni: { name: "Chicken Pepperoni", price: 2.49 },
  mushroom: { name: "Fresh Mushroom", price: 1.29 },
  onion: { name: "Sliced Onion", price: 0.99 },
  jalapeno: { name: "Spicy Jalapeno", price: 1.29 },
  olives: { name: "Black Olives", price: 1.29 }
};
