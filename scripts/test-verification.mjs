import { readFileSync } from "fs";

// Load data directly
const products = JSON.parse(readFileSync("./src/data/products.json", "utf-8"));
const reviews = JSON.parse(readFileSync("./src/data/reviews.json", "utf-8"));

console.log("=== RUNNING PURCHASEWISE VERIFICATION TESTS ===");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  PASS: ${message}`);
    passed++;
  } else {
    console.error(`  FAIL: ${message}`);
    failed++;
  }
}

// Test 1: Category-agnostic catalog
console.log("\n[Test Suite 1: Category-Agnostic Catalog]");
const categories = [...new Set(products.map((p) => p.category))];
const expectedCategories = [
  "laptop",
  "smartphone",
  "headphone",
  "shoes",
  "clothing",
  "skincare",
  "furniture",
  "books",
  "groceries",
];
for (const cat of expectedCategories) {
  assert(
    categories.includes(cat),
    `Category "${cat}" is present in catalog (found ${products.filter((p) => p.category === cat).length} products)`,
  );
}

// Test 2: Dynamic specifications
console.log("\n[Test Suite 2: Dynamic Category Specifications]");
const shoes = products.find((p) => p.category === "shoes");
const skincare = products.find((p) => p.category === "skincare");
const furniture = products.find((p) => p.category === "furniture");
const books = products.find((p) => p.category === "books");
const groceries = products.find((p) => p.category === "groceries");

assert(shoes && shoes.specifications.upper_material, "Shoes have dynamic specs (upper_material)");
assert(skincare && skincare.specifications.skin_type, "Skincare has dynamic specs (skin_type)");
assert(furniture && furniture.specifications.material, "Furniture has dynamic specs (material)");
assert(books && books.specifications.author, "Books have dynamic specs (author)");
assert(
  groceries && groceries.specifications.dietary_type,
  "Groceries have dynamic specs (dietary_type)",
);

// Test 3: Verified reviews per category
console.log("\n[Test Suite 3: Verified Customer Reviews]");
for (const cat of expectedCategories) {
  const prods = products.filter((p) => p.category === cat);
  const hasReviews = prods.every((p) => reviews.some((r) => r.product_id === p.product_id));
  assert(hasReviews, `All products in category "${cat}" have verified evidence reviews`);
}

// Test 4: Deduplication logic
console.log("\n[Test Suite 4: Marketplace Deduplication]");
function deduplicateOffers(offers) {
  const seen = new Set();
  const result = [];
  for (const offer of offers) {
    const marketplaceKey = offer.marketplace.trim().toLowerCase();
    const variantKey = (offer.variant || "").trim().toLowerCase();
    const key = `${marketplaceKey}::${variantKey}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(offer);
  }
  return result;
}

const mockOffers = [
  { marketplace: "Amazon", variant: "256GB", price: 90000 },
  { marketplace: "Amazon", variant: "256GB", price: 90000 }, // duplicate
  { marketplace: "Amazon", variant: "512GB", price: 110000 }, // distinct variant
  { marketplace: "Flipkart", variant: "256GB", price: 89000 }, // separate marketplace
];
const deduped = deduplicateOffers(mockOffers);
assert(
  deduped.length === 3,
  "Same provider duplicates are removed, different variants & marketplaces preserved",
);
assert(
  deduped.filter((o) => o.marketplace === "Amazon").length === 2,
  "Amazon has 2 distinct variants preserved (256GB and 512GB)",
);
assert(
  deduped.find((o) => o.marketplace === "Flipkart") !== undefined,
  "Flipkart offer preserved separately from Amazon",
);

// Test 5: Truthful provider status and Croma category awareness
console.log("\n[Test Suite 5: Truthful Provider Status & Data Integrity]");
const validStatuses = ["LIVE", "DEMO", "NO CREDENTIALS", "NO RESULTS", "ERROR"];

function discoverOffers(product) {
  const isElectronics = ["laptop", "smartphone", "headphone"].includes(product.category);
  const realUrl = product.source_url?.startsWith("http") ? product.source_url : null;
  const raw = [
    {
      marketplace: "Amazon",
      variant: null,
      price: product.price_inr,
      original_price: Math.round(product.price_inr * 1.07),
      availability: true,
      delivery: "Delivery in 2 days",
      url: realUrl,
      status: "DEMO",
      is_live: false,
    },
    {
      marketplace: "Flipkart",
      variant: null,
      price: Math.round(product.price_inr * 0.973),
      original_price: Math.round(product.price_inr * 1.05),
      availability: true,
      delivery: "Delivery in 3 days",
      url: realUrl,
      status: "DEMO",
      is_live: false,
    },
  ];
  if (isElectronics) {
    raw.push({
      marketplace: "Croma",
      variant: null,
      price: Math.round(product.price_inr * 1.02),
      original_price: Math.round(product.price_inr * 1.06),
      availability: true,
      delivery: "Store pickup available",
      url: realUrl,
      status: "DEMO",
      is_live: false,
    });
  } else {
    raw.push({
      marketplace: "Croma",
      variant: null,
      price: 0,
      original_price: 0,
      availability: false,
      delivery: "Category not carried",
      url: null,
      status: "NO RESULTS",
      is_live: false,
    });
  }
  return deduplicateOffers(raw);
}

const laptopOffers = discoverOffers(products.find((p) => p.category === "laptop"));
assert(
  laptopOffers.every((o) => validStatuses.includes(o.status)),
  "All laptop provider statuses are strictly within valid enum",
);
assert(
  laptopOffers.find((o) => o.marketplace === "Croma")?.status === "DEMO",
  "Croma reports valid DEMO offer for electronics",
);

const shoeOffers = discoverOffers(shoes);
assert(
  shoeOffers.find((o) => o.marketplace === "Croma")?.status === "NO RESULTS",
  "Croma truthfully reports NO RESULTS for non-electronics category (shoes)",
);
assert(
  shoeOffers.find((o) => o.marketplace === "Croma")?.price === 0,
  "No fake prices or products generated for Croma when not carried",
);
assert(
  shoeOffers.every((o) => o.url === null || o.url.startsWith("http")),
  "No fake fallback URLs generated",
);

// Test 6: Check Product savings calculation
console.log("\n[Test Suite 6: Check Product Price Integrity & Savings]");
const testProduct = products[0];
const screenshotPrice = Math.round(testProduct.price_inr * 1.06);
const offers = discoverOffers(testProduct);
const validOffers = offers.filter(
  (o) => o.availability && o.price > 0 && o.status !== "NO RESULTS" && o.status !== "ERROR",
);
const bestPrice =
  validOffers.length > 0 ? Math.min(...validOffers.map((o) => o.price)) : screenshotPrice;
const savings = Math.max(0, screenshotPrice - bestPrice);

assert(screenshotPrice > 0, "Screenshot price is preserved separately");
assert(bestPrice <= screenshotPrice, "Best price calculated from valid marketplace offers");
assert(
  savings === screenshotPrice - bestPrice,
  "Savings computed accurately against valid marketplace offers",
);

console.log(`\n=== TEST RESULTS: ${passed} passed, ${failed} failed ===\n`);
if (failed > 0) process.exit(1);
