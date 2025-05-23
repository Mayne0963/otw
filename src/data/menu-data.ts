import type { CustomizationCategory } from "../types";

export const categories = [
  { id: "burgers", name: "Burgers" },
  { id: "wings", name: "Wings" },
  { id: "tacos", name: "Tacos" },
  { id: "sandwiches", name: "Sandwiches" },
  { id: "sides", name: "Sides" },
  { id: "desserts", name: "Desserts" },
  { id: "drinks", name: "Drinks" },
  { id: "infused", name: "Infused" },
];

export const menuItems = [
  {
    id: "luxury-burger",
    name: "Luxury Burger",
    description:
      "Premium beef patty with truffle aioli, aged cheddar, and caramelized onions on a brioche bun.",
    price: 18.99,
    image: "/images/menu-1.jpg",
    category: "burgers",
    popular: true,
    dietary: {
      dairyFree: false,
      glutenFree: false,
      vegetarian: false,
      vegan: false,
    },
  },
  {
    id: "gourmet-tacos",
    name: "Gourmet Street Tacos",
    description:
      "Three street-style tacos with premium fillings and house-made salsas.",
    price: 14.99,
    image: "/images/menu-3.jpg",
    category: "tacos",
    popular: true,
    dietary: {
      dairyFree: false,
      glutenFree: false,
      vegetarian: false,
      vegan: false,
    },
  },
  {
    id: "truffle-fries",
    name: "Truffle Parmesan Fries",
    description:
      "Hand-cut fries tossed with truffle oil, parmesan cheese, and fresh herbs.",
    price: 9.99,
    image: "/images/truffle-fries.jpg",
    category: "sides",
    dietary: {
      dairyFree: false,
      glutenFree: true,
      vegetarian: true,
      vegan: false,
    },
  },
  {
    id: "wagyu-sandwich",
    name: "Wagyu Beef Sandwich",
    description:
      "Thinly sliced wagyu beef with horseradish cream, arugula, and caramelized onions on artisan bread.",
    price: 22.99,
    image: "/images/wagyu-sandwich.jpg",
    category: "sandwiches",
    popular: true,
    dietary: {
      dairyFree: false,
      glutenFree: false,
      vegetarian: false,
      vegan: false,
    },
  },
  {
    id: "vegan-burger",
    name: "Luxury Vegan Burger",
    description:
      "Plant-based patty with vegan truffle aioli, dairy-free cheese, and caramelized onions on a vegan brioche bun.",
    price: 17.99,
    image: "/images/vegan-burger.jpg",
    category: "burgers",
    new: true,
    dietary: {
      dairyFree: true,
      glutenFree: false,
      vegetarian: true,
      vegan: true,
    },
  },
  {
    id: "buffalo-cauliflower",
    name: "Buffalo Cauliflower",
    description:
      "Crispy cauliflower florets tossed in buffalo sauce, served with vegan ranch dressing.",
    price: 13.99,
    image: "/images/buffalo-cauliflower.jpg",
    category: "sides",
    dietary: {
      dairyFree: true,
      glutenFree: true,
      vegetarian: true,
      vegan: true,
    },
  },
  {
    id: "lobster-tacos",
    name: "Lobster Tacos",
    description:
      "Butter-poached lobster, avocado crema, mango salsa, and micro greens on corn tortillas.",
    price: 24.99,
    image: "/images/lobster-tacos.jpg",
    category: "tacos",
    new: true,
    dietary: {
      dairyFree: false,
      glutenFree: true,
      vegetarian: false,
      vegan: false,
    },
  },
  {
    id: "gold-cheesecake",
    name: "24K Gold Cheesecake",
    description:
      "New York style cheesecake topped with edible 24K gold leaf and berry compote.",
    price: 14.99,
    image: "/images/gold-cheesecake.jpg",
    category: "desserts",
    popular: true,
    dietary: {
      dairyFree: false,
      glutenFree: false,
      vegetarian: true,
      vegan: false,
    },
  },
  {
    id: "korean-wings",
    name: "Korean Gochujang Wings",
    description:
      "Crispy wings glazed with sweet and spicy gochujang sauce, topped with sesame seeds and green onions.",
    price: 15.99,
    image: "/images/korean-wings.jpg",
    category: "wings",
    dietary: {
      dairyFree: true,
      glutenFree: true,
      vegetarian: false,
      vegan: false,
    },
  },
  {
    id: "loaded-nachos",
    name: "Luxury Loaded Nachos",
    description:
      "House-made tortilla chips topped with premium beef, queso, guacamole, pico de gallo, jalapeños, and sour cream.",
    price: 16.99,
    image: "/images/loaded-nachos.jpg",
    category: "sides",
    popular: true,
    dietary: {
      dairyFree: false,
      glutenFree: false,
      vegetarian: false,
      vegan: false,
    },
  },
  {
    id: "mushroom-burger",
    name: "Truffle Mushroom Burger",
    description:
      "Premium beef patty topped with sautéed wild mushrooms, truffle butter, and Swiss cheese on a brioche bun.",
    price: 19.99,
    image: "/images/mushroom-burger.jpg",
    category: "burgers",
    dietary: {
      dairyFree: false,
      glutenFree: false,
      vegetarian: false,
      vegan: false,
    },
  },
  {
    id: "fish-tacos",
    name: "Blackened Fish Tacos",
    description:
      "Blackened mahi-mahi with cabbage slaw, chipotle crema, and pickled red onions on corn tortillas.",
    price: 16.99,
    image: "/images/fish-tacos.jpg",
    category: "tacos",
    dietary: {
      dairyFree: false,
      glutenFree: true,
      vegetarian: false,
      vegan: false,
    },
  },
];

// Create a new array for infused menu items
export const infusedMenuItems = [
  {
    id: "infused-wings",
    name: "Infused Wings",
    description:
      "Crispy chicken wings tossed in our signature sauce with a special infusion.",
    price: 16.99,
    image: "/images/menu-2.jpg",
    category: "wings",
    infused: true,
    dietary: {
      dairyFree: true,
      glutenFree: true,
      vegetarian: false,
      vegan: false,
    },
  },
  {
    id: "infused-brownie",
    name: "Infused Chocolate Brownie",
    description:
      "Rich chocolate brownie with a special infusion, topped with gold flakes.",
    price: 12.99,
    image: "/images/infused-brownie.jpg",
    category: "desserts",
    infused: true,
    new: true,
    dietary: {
      dairyFree: false,
      glutenFree: false,
      vegetarian: true,
      vegan: false,
    },
  },
  {
    id: "infused-margarita",
    name: "Infused Luxury Margarita",
    description:
      "Premium tequila, fresh lime juice, agave nectar, and a special infusion with gold rim.",
    price: 15.99,
    image: "/images/infused-margarita.jpg",
    category: "drinks",
    infused: true,
    dietary: {
      dairyFree: true,
      glutenFree: true,
      vegetarian: true,
      vegan: true,
    },
  },
  {
    id: "infused-chocolate",
    name: "Infused Luxury Chocolate Bar",
    description:
      "Premium dark chocolate with a special infusion, sea salt, and gold flakes.",
    price: 18.99,
    image: "/images/infused-chocolate.jpg",
    category: "desserts",
    infused: true,
    dietary: {
      dairyFree: false,
      glutenFree: true,
      vegetarian: true,
      vegan: false,
    },
  },
];

export const customizationOptions: { [key: string]: CustomizationCategory[] } =
  {
    burgers: [
      {
        id: "patty-type",
        name: "Patty Type",
        required: true,
        multiple: false,
        options: [
          { id: "beef", name: "Premium Beef", price: 0 },
          { id: "wagyu", name: "Wagyu Beef", price: 5.99 },
          { id: "beyond", name: "Beyond Meat", price: 2.99 },
        ],
      },
      {
        id: "patty-cook",
        name: "Cooking Preference",
        required: true,
        multiple: false,
        options: [
          { id: "medium-rare", name: "Medium Rare", price: 0 },
          { id: "medium", name: "Medium", price: 0 },
          { id: "medium-well", name: "Medium Well", price: 0 },
          { id: "well-done", name: "Well Done", price: 0 },
        ],
      },
      {
        id: "toppings",
        name: "Extra Toppings",
        required: false,
        multiple: true,
        options: [
          { id: "bacon", name: "Bacon", price: 1.99 },
          { id: "avocado", name: "Avocado", price: 1.99 },
          { id: "egg", name: "Fried Egg", price: 1.49 },
          { id: "cheese", name: "Extra Cheese", price: 0.99 },
          { id: "caramelized-onions", name: "Caramelized Onions", price: 0.99 },
        ],
      },
      {
        id: "sauces",
        name: "Sauces",
        required: false,
        multiple: true,
        options: [
          { id: "truffle-aioli", name: "Truffle Aioli", price: 0 },
          { id: "spicy-mayo", name: "Spicy Mayo", price: 0 },
          { id: "bbq", name: "BBQ Sauce", price: 0 },
          { id: "ranch", name: "Ranch", price: 0 },
        ],
      },
    ],
    tacos: [
      {
        id: "protein",
        name: "Protein",
        required: true,
        multiple: false,
        options: [
          { id: "beef", name: "Beef", price: 0 },
          { id: "chicken", name: "Chicken", price: 0 },
          { id: "shrimp", name: "Shrimp", price: 2.99 },
          { id: "fish", name: "Fish", price: 1.99 },
          { id: "veggie", name: "Vegetarian", price: 0 },
        ],
      },
      {
        id: "toppings",
        name: "Extra Toppings",
        required: false,
        multiple: true,
        options: [
          { id: "guacamole", name: "Guacamole", price: 1.99 },
          { id: "queso", name: "Queso", price: 1.49 },
          { id: "pico", name: "Extra Pico de Gallo", price: 0.99 },
          { id: "jalapenos", name: "Jalapeños", price: 0.49 },
        ],
      },
      {
        id: "spice-level",
        name: "Spice Level",
        required: false,
        multiple: false,
        options: [
          { id: "mild", name: "Mild", price: 0 },
          { id: "medium", name: "Medium", price: 0 },
          { id: "hot", name: "Hot", price: 0 },
          { id: "extra-hot", name: "Extra Hot", price: 0 },
        ],
      },
    ],
    wings: [
      {
        id: "sauce",
        name: "Sauce",
        required: true,
        multiple: false,
        options: [
          { id: "buffalo", name: "Buffalo", price: 0 },
          { id: "bbq", name: "BBQ", price: 0 },
          { id: "honey-garlic", name: "Honey Garlic", price: 0 },
          { id: "lemon-pepper", name: "Lemon Pepper", price: 0 },
          { id: "korean-gochujang", name: "Korean Gochujang", price: 0 },
        ],
      },
      {
        id: "spice-level",
        name: "Spice Level",
        required: false,
        multiple: false,
        options: [
          { id: "mild", name: "Mild", price: 0 },
          { id: "medium", name: "Medium", price: 0 },
          { id: "hot", name: "Hot", price: 0 },
          { id: "extra-hot", name: "Extra Hot", price: 0 },
        ],
      },
      {
        id: "extras",
        name: "Extras",
        required: false,
        multiple: true,
        options: [
          { id: "ranch", name: "Ranch Dip", price: 0.99 },
          { id: "blue-cheese", name: "Blue Cheese Dip", price: 0.99 },
          { id: "celery", name: "Celery Sticks", price: 0.99 },
          { id: "carrots", name: "Carrot Sticks", price: 0.99 },
        ],
      },
    ],
    sides: [
      {
        id: "size",
        name: "Size",
        required: true,
        multiple: false,
        options: [
          { id: "regular", name: "Regular", price: 0 },
          { id: "large", name: "Large", price: 2.99 },
        ],
      },
      {
        id: "extras",
        name: "Extras",
        required: false,
        multiple: true,
        options: [
          { id: "cheese", name: "Extra Cheese", price: 1.99 },
          { id: "bacon", name: "Bacon Bits", price: 1.99 },
          { id: "truffle", name: "Truffle Oil", price: 2.99 },
          { id: "garlic", name: "Garlic", price: 0.99 },
        ],
      },
    ],
    sandwiches: [
      {
        id: "bread",
        name: "Bread Type",
        required: true,
        multiple: false,
        options: [
          { id: "artisan", name: "Artisan", price: 0 },
          { id: "ciabatta", name: "Ciabatta", price: 0 },
          { id: "sourdough", name: "Sourdough", price: 0 },
          { id: "gluten-free", name: "Gluten-Free", price: 1.99 },
        ],
      },
      {
        id: "toppings",
        name: "Extra Toppings",
        required: false,
        multiple: true,
        options: [
          { id: "bacon", name: "Bacon", price: 1.99 },
          { id: "avocado", name: "Avocado", price: 1.99 },
          { id: "cheese", name: "Extra Cheese", price: 0.99 },
          { id: "caramelized-onions", name: "Caramelized Onions", price: 0.99 },
        ],
      },
      {
        id: "sides",
        name: "Side",
        required: false,
        multiple: false,
        options: [
          { id: "fries", name: "Fries", price: 2.99 },
          { id: "salad", name: "Side Salad", price: 3.99 },
          { id: "chips", name: "Chips", price: 1.99 },
        ],
      },
    ],
    desserts: [
      {
        id: "size",
        name: "Size",
        required: true,
        multiple: false,
        options: [
          { id: "regular", name: "Regular", price: 0 },
          { id: "large", name: "Large", price: 2.99 },
        ],
      },
      {
        id: "toppings",
        name: "Toppings",
        required: false,
        multiple: true,
        options: [
          { id: "whipped-cream", name: "Whipped Cream", price: 0.99 },
          { id: "chocolate-sauce", name: "Chocolate Sauce", price: 0.99 },
          { id: "caramel", name: "Caramel", price: 0.99 },
          { id: "berries", name: "Fresh Berries", price: 1.99 },
          { id: "gold-leaf", name: "Gold Leaf", price: 4.99 },
        ],
      },
    ],
    drinks: [
      {
        id: "size",
        name: "Size",
        required: true,
        multiple: false,
        options: [
          { id: "regular", name: "Regular", price: 0 },
          { id: "large", name: "Large", price: 1.99 },
        ],
      },
      {
        id: "ice",
        name: "Ice",
        required: false,
        multiple: false,
        options: [
          { id: "normal", name: "Normal Ice", price: 0 },
          { id: "light", name: "Light Ice", price: 0 },
          { id: "no-ice", name: "No Ice", price: 0 },
        ],
      },
      {
        id: "extras",
        name: "Extras",
        required: false,
        multiple: true,
        options: [
          { id: "boba", name: "Boba Pearls", price: 1.99 },
          { id: "whipped-cream", name: "Whipped Cream", price: 0.99 },
          { id: "extra-shot", name: "Extra Espresso Shot", price: 1.49 },
        ],
      },
    ],
    infused: [
      {
        id: "potency",
        name: "Potency",
        required: true,
        multiple: false,
        options: [
          { id: "mild", name: "Mild (5mg)", price: 0 },
          { id: "medium", name: "Medium (10mg)", price: 2.99 },
          { id: "strong", name: "Strong (15mg)", price: 4.99 },
        ],
      },
      {
        id: "type",
        name: "Type",
        required: false,
        multiple: false,
        options: [
          { id: "sativa", name: "Sativa Dominant", price: 0 },
          { id: "indica", name: "Indica Dominant", price: 0 },
          { id: "hybrid", name: "Hybrid", price: 0 },
        ],
      },
    ],
  };

// Update the menuItems export to include a function to get customization options
export const getItemCustomizationOptions = (item: any) => {
  return customizationOptions[item.category] || [];
};
