import productsJson from "@/data/products.json";
import reviewsJson from "@/data/reviews.json";

export type Category =
  | "laptop"
  | "smartphone"
  | "headphone"
  | "shoes"
  | "clothing"
  | "skincare"
  | "furniture"
  | "books"
  | "groceries"
  | (string & {});

export interface Product {
  product_id: string;
  name: string;
  brand: string;
  category: Category;
  price_inr: number;
  rating: number;
  review_count: number;
  description: string;
  specifications: Record<string, string | number | boolean>;
  pros: string[];
  cons: string[];
  source: string;
  source_id?: string;
  source_url?: string;
}

export interface Review {
  review_id: string;
  product_id: string;
  rating: number;
  title: string;
  text: string;
  verified_purchase: boolean;
  helpful_votes: number;
  source?: string;
}

export const PRODUCTS = productsJson as unknown as Product[];
export const REVIEWS = reviewsJson as unknown as Review[];

export const CATEGORY_LABEL: Record<string, string> = {
  laptop: "Laptops",
  smartphone: "Smartphones",
  headphone: "Headphones",
  shoes: "Shoes",
  clothing: "Clothing",
  skincare: "Skincare",
  furniture: "Furniture",
  books: "Books",
  groceries: "Groceries",
};

export function categoryLabel(category: string): string {
  return (
    CATEGORY_LABEL[category] ?? category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

export function reviewsFor(productId: string): Review[] {
  return REVIEWS.filter((r) => r.product_id === productId);
}

export function formatINR(value: number): string {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

export function specLabel(key: string): string {
  const map: Record<string, string> = {
    ram_gb: "RAM (GB)",
    storage_gb: "Storage (GB)",
    storage_type: "Storage type",
    display_size: "Display size (in)",
    display_resolution: "Resolution",
    battery_hours: "Battery (hours)",
    battery_mah: "Battery (mAh)",
    battery_life_hours: "Battery (hours)",
    weight_kg: "Weight (kg)",
    weight_grams: "Weight (g)",
    operating_system: "Operating system",
    rear_camera_mp: "Rear camera (MP)",
    front_camera_mp: "Front camera (MP)",
    noise_cancellation: "Noise cancellation",
    driver_size_mm: "Driver size (mm)",
    upper_material: "Upper material",
    sole_material: "Sole material",
    closure: "Closure",
    gender: "Gender",
    skin_type: "Target skin type",
    volume_ml: "Volume (ml)",
    key_ingredients: "Key ingredients",
    fragrance_free: "Fragrance free",
    adjustable_height: "Adjustable height",
    warranty_years: "Warranty (years)",
    material: "Material",
    fabric: "Fabric",
    fit: "Fit",
    care: "Care instructions",
    pages: "Pages",
    author: "Author",
    publisher: "Publisher",
    format: "Format",
    language: "Language",
    dietary_type: "Dietary type",
    shelf_life: "Shelf life",
    net_quantity: "Net quantity",
    protein_per_serving: "Protein per serving",
  };
  return map[key] ?? key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function specKeysFor(products: Product[]): string[] {
  const keys: string[] = [];
  for (const p of products) {
    for (const k of Object.keys(p.specifications)) {
      if (!keys.includes(k)) keys.push(k);
    }
  }
  return keys;
}
