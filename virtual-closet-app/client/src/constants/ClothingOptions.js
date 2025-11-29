// Categories MUST match schema enum
export const CATEGORY_OPTIONS = [
  "Tops",
  "Bottoms",
  "Dresses",
  "Outerwear",
  "Shoes",
  "Accessories",
  "Uncategorized",
];

// Subcategories are optional (schema allows any string)
export const SUBCATEGORY_OPTIONS = {
  Tops: ["Dress Shirt", "Blouse", "T-Shirt", "Polo", "Sweater", "Hoodie"],
  Bottoms: ["Pants", "Jeans", "Skirt", "Shorts"],
  Dresses: ["Casual Dress", "Formal Dress"],
  Outerwear: ["Blazer", "Jacket", "Coat", "Cardigan"],
  Shoes: ["Dress Shoes", "Flats", "Heels", "Boots", "Sneakers"],
  Accessories: ["Tie", "Belt", "Scarf", "Hat"],
  Uncategorized: [],
};

// Gender enum from schema
export const GENDER_OPTIONS = ["Mens", "Womens", "Unisex"];

// Season enum from schema
export const SEASON_OPTIONS = ["Spring", "Summer", "Fall", "Winter", "All"];

// Sizes are NOT enumerated in schema (free text), so we propose standard ones:
export const SIZE_OPTIONS = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "2XL",
  "3XL",
  "One Size",
];

// Common color choices
export const COLOR_OPTIONS = [
  "Black",
  "White",
  "Gray",
  "Navy",
  "Brown",
  "Blue",
  "Red",
  "Green",
  "Tan/Khaki",
  "Other",
];
