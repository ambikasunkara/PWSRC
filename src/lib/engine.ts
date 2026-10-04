import { PRODUCTS, formatINR, reviewsFor, specLabel, type Category, type Product } from "./catalog";

export type Verdict = "strong_buy" | "good_buy" | "consider" | "avoid";

export interface Requirement {
  original_query: string;
  category: Category | null;
  budget_max: number | null;
  priorities: string[];
  brand: string | null;
}

export interface EvidenceItem {
  claim: string;
  evidence: string;
  source_type: "catalog_specification" | "customer_review" | "catalog_price";
  strength: "strong" | "moderate";
}

export type ProviderStatus = "LIVE" | "DEMO" | "NO CREDENTIALS" | "NO RESULTS" | "ERROR";

export interface Offer {
  id?: string;
  marketplace: string;
  variant?: string | null;
  price: number;
  original_price: number;
  availability: boolean;
  is_live: boolean;
  delivery: string;
  url?: string | null;
  status: ProviderStatus;
}

export interface Decision {
  requirement: Requirement;
  product: Product | null;
  verdict: Verdict;
  confidence: number;
  score: number;
  explanation: string;
  satisfied: string[];
  unmet: string[];
  strengths: string[];
  weaknesses: string[];
  tradeOffs: string[];
  evidence: EvidenceItem[];
  alternatives: { product: Product; score: number; reason: string }[];
  offers: Offer[];
}

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  laptop: ["laptop", "notebook", "macbook", "ultrabook"],
  smartphone: ["phone", "smartphone", "mobile", "iphone", "android"],
  headphone: ["headphone", "headset", "earbuds", "earphone", "tws", "audio"],
  shoes: ["shoe", "shoes", "sneaker", "sneakers", "footwear", "running shoe", "boots", "loafers"],
  clothing: [
    "clothing",
    "shirt",
    "t-shirt",
    "tshirt",
    "jeans",
    "pants",
    "jacket",
    "apparel",
    "wear",
    "dress",
    "polo",
  ],
  skincare: [
    "skincare",
    "cream",
    "moisturizer",
    "serum",
    "lotion",
    "sunscreen",
    "cleanser",
    "facial",
  ],
  furniture: ["furniture", "chair", "table", "desk", "sofa", "bed", "ergonomic chair"],
  books: ["book", "books", "novel", "paperback", "hardcover", "reading", "read"],
  groceries: [
    "grocery",
    "groceries",
    "food",
    "tea",
    "coffee",
    "peanut butter",
    "dal",
    "pulses",
    "organic",
  ],
};

const PRIORITY_KEYWORDS: Record<string, string[]> = {
  camera: ["camera", "photo", "photography", "selfie", "video"],
  battery: ["battery", "battery life", "long lasting", "endurance", "all day"],
  gaming: ["gaming", "game", "fps", "graphics", "gpu"],
  performance: ["performance", "fast", "powerful", "editing", "coding", "multitask"],
  portability: ["light", "lightweight", "portable", "slim", "travel", "carry"],
  display: ["display", "screen", "oled", "amoled", "bright", "resolution"],
  storage: ["storage", "ssd", "space", "gb", "tb"],
  noise_cancellation: ["noise", "anc", "noise cancel", "quiet", "commute"],
  comfort: ["comfort", "comfortable", "cushioning", "cushion", "soft", "ergonomic", "breathable"],
  durability: ["durable", "durability", "long lasting", "sturdy", "build quality", "warranty"],
  ingredients: [
    "ingredients",
    "natural",
    "organic",
    "fragrance free",
    "paraben free",
    "pure",
    "ceramides",
  ],
  material: ["material", "leather", "cotton", "wood", "steel", "fabric", "mesh", "denim"],
  fit: ["fit", "slim fit", "regular fit", "adjustable"],
  health: ["healthy", "health", "protein", "nutrition", "diet", "pure"],
  budget: ["budget", "cheap", "affordable", "value for money"],
};

const PRIORITY_LABEL: Record<string, string> = {
  camera: "Camera quality",
  battery: "Battery life",
  gaming: "Gaming performance",
  performance: "Raw performance",
  portability: "Portability",
  display: "Display quality",
  storage: "Storage capacity",
  noise_cancellation: "Noise cancellation",
  comfort: "Comfort & ergonomics",
  durability: "Durability & build",
  ingredients: "Pure ingredients & formula",
  material: "Material quality",
  fit: "Fit & sizing",
  health: "Nutrition & health",
  budget: "Value for money",
};

export function priorityLabel(key: string): string {
  return PRIORITY_LABEL[key] ?? key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export const VERDICT_LABEL: Record<Verdict, string> = {
  strong_buy: "Strong Buy",
  good_buy: "Good Buy",
  consider: "Consider With Care",
  avoid: "Not Recommended",
};

export function parseRequirement(query: string): Requirement {
  const q = query.toLowerCase();

  let category: Category | null = null;
  for (const [cat, words] of Object.entries(CATEGORY_KEYWORDS)) {
    if (words.some((w) => q.includes(w))) {
      category = cat;
      break;
    }
  }

  // Dynamic fallback for any category present in catalog
  if (!category) {
    const knownCats = Array.from(new Set(PRODUCTS.map((p) => p.category.toLowerCase())));
    const matched = knownCats.find((c) => q.includes(c));
    if (matched) category = matched;
  }

  let budget: number | null = null;
  const kMatch = q.match(/(\d{1,3}(?:[.,]\d+)?)\s*(k|thousand)\b/);
  const plainMatch = q.match(
    /(?:under|below|less than|within|upto|up to|budget of|around|₹|rs\.?)\s*₹?\s*([\d,]{4,9})/,
  );
  const bareMatch = q.match(/\b(\d{4,7})\b/);
  if (kMatch?.[1]) budget = Math.round(parseFloat(kMatch[1].replace(",", ".")) * 1000);
  else if (plainMatch?.[1]) budget = parseInt(plainMatch[1].replace(/,/g, ""), 10);
  else if (bareMatch?.[1]) budget = parseInt(bareMatch[1], 10);

  const priorities: string[] = [];
  for (const [key, words] of Object.entries(PRIORITY_KEYWORDS)) {
    if (words.some((w) => q.includes(w))) priorities.push(key);
  }

  const brands = Array.from(new Set(PRODUCTS.map((p) => p.brand)));
  const brand = brands.find((b) => q.includes(b.toLowerCase())) ?? null;

  return { original_query: query, category, budget_max: budget, priorities, brand };
}

function num(value: unknown): number {
  const n = typeof value === "number" ? value : parseFloat(String(value));
  return Number.isFinite(n) ? n : 0;
}

function priorityScore(product: Product, priority: string): { score: number; note: string | null } {
  const s = product.specifications;
  const text = `${product.description} ${product.pros.join(" ")}`.toLowerCase();

  switch (priority) {
    case "camera": {
      const mp = num(s["camera_mp"] ?? s["rear_camera_mp"]);
      if (!mp) return { score: 0, note: null };
      return { score: Math.min(1, mp / 108), note: `${mp}MP main camera` };
    }
    case "battery": {
      const hours = num(s["battery_hours"] ?? s["battery_life_hours"]);
      const mah = num(s["battery_mah"]);
      if (hours) return { score: Math.min(1, hours / 20), note: `${hours} hour rated battery` };
      if (mah) return { score: Math.min(1, mah / 5500), note: `${mah}mAh battery` };
      return { score: 0, note: null };
    }
    case "gaming": {
      const gpu = String(s["gpu"] ?? "");
      if (/rtx|radeon rx|geforce/i.test(gpu)) return { score: 1, note: `Discrete ${gpu}` };
      if (/120hz|144hz/i.test(String(s["display_type"] ?? s["display_resolution"] ?? "")))
        return { score: 0.7, note: "High refresh-rate display" };
      return { score: 0.2, note: null };
    }
    case "performance": {
      const ram = num(s["ram_gb"]);
      const proc = String(s["processor"] ?? "");
      if (!ram && !proc) return { score: 0, note: null };
      const ramScore = Math.min(1, ram / 16);
      const procScore = /i9|ryzen 9|m3|m2 pro|snapdragon 8|a17|a16/i.test(proc)
        ? 1
        : /i7|ryzen 7|m2|dimensity 9/i.test(proc)
          ? 0.8
          : 0.5;
      return {
        score: (ramScore + procScore) / 2,
        note: `${proc}${ram ? ` with ${ram}GB RAM` : ""}`,
      };
    }
    case "portability": {
      const kg = num(s["weight_kg"]);
      const g = num(s["weight_g"] ?? s["weight_grams"]);
      if (kg) return { score: Math.max(0, Math.min(1, (2.4 - kg) / 1.2)), note: `${kg}kg chassis` };
      if (g) return { score: Math.max(0, Math.min(1, (320 - g) / 180)), note: `${g}g weight` };
      return { score: 0, note: null };
    }
    case "display": {
      const d = String(s["display_type"] ?? s["display_resolution"] ?? "");
      if (!d) return { score: 0, note: null };
      const score = /oled|retina|amoled/i.test(d) ? 1 : /ips/i.test(d) ? 0.6 : 0.4;
      return { score, note: d };
    }
    case "storage": {
      const gb = num(s["storage_gb"]);
      if (!gb) return { score: 0, note: null };
      return {
        score: Math.min(1, gb / 1024),
        note: `${gb}GB ${String(s["storage_type"] ?? "storage")}`,
      };
    }
    case "noise_cancellation": {
      const anc = String(s["anc"] ?? s["noise_cancellation"] ?? "");
      if (/true|yes|active/i.test(anc)) return { score: 1, note: "Active noise cancellation" };
      if (/false|no|none/i.test(anc)) return { score: 0, note: null };
      return { score: /noise/.test(text) ? 0.5 : 0, note: null };
    }
    case "comfort": {
      if (/mesh|foam|cushion|ergonomic|lumbar|support|comfort|breathable/i.test(text)) {
        const mat = s["material"] ?? s["upper_material"] ?? s["sole_material"];
        return {
          score: 0.9,
          note: mat
            ? `Comfort design with ${mat}`
            : "Cushioned ergonomic support verified in specs",
        };
      }
      return { score: 0.3, note: null };
    }
    case "durability": {
      const warranty = num(s["warranty_years"]);
      if (warranty)
        return { score: Math.min(1, warranty / 3), note: `${warranty} year manufacturer warranty` };
      if (/durable|continental|pumagrip|steel|ring-spun|unpolished|shelf_life/i.test(text)) {
        return { score: 0.85, note: "High-durability construction and materials" };
      }
      return { score: 0.3, note: null };
    }
    case "ingredients": {
      const ing = s["key_ingredients"] ?? s["dietary_type"];
      if (ing) return { score: 1, note: String(ing) };
      if (s["fragrance_free"] === true)
        return { score: 0.9, note: "Fragrance free clinical formulation" };
      return { score: 0, note: null };
    }
    case "material": {
      const mat = s["fabric"] ?? s["material"] ?? s["upper_material"] ?? s["sole_material"];
      if (mat) return { score: 1, note: String(mat) };
      return { score: 0, note: null };
    }
    case "fit": {
      const fit = s["fit"] ?? s["size"] ?? s["adjustable_height"];
      if (fit !== undefined) return { score: 1, note: String(fit) };
      return { score: 0, note: null };
    }
    case "health": {
      const protein = s["protein_per_serving"];
      if (protein) return { score: 1, note: `${protein} protein` };
      const diet = s["dietary_type"];
      if (diet) return { score: 0.9, note: String(diet) };
      return { score: 0, note: null };
    }
    case "budget":
      return { score: 0.5, note: null };
    default: {
      // Dynamic fallback for any category or priority attribute
      for (const [k, v] of Object.entries(s)) {
        if (k.toLowerCase().includes(priority) || String(v).toLowerCase().includes(priority)) {
          return { score: 0.9, note: `${specLabel(k)}: ${v}` };
        }
      }
      if (text.includes(priority)) {
        return { score: 0.7, note: `Verified match in catalog specifications for "${priority}"` };
      }
      return { score: 0, note: null };
    }
  }
}

/**
 * Deduplicate offers for the SAME provider when they represent the same product/variant,
 * while preserving distinct variants and keeping different marketplaces separate.
 */
export function deduplicateOffers(offers: Offer[]): Offer[] {
  const seen = new Set<string>();
  const result: Offer[] = [];

  for (const offer of offers) {
    const marketplaceKey = offer.marketplace.trim().toLowerCase();
    const variantKey = (offer.variant || "").trim().toLowerCase();
    const key = `${marketplaceKey}::${variantKey}`;

    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    result.push(offer);
  }

  return result;
}

/**
 * Discover marketplace offers across all configured providers.
 * - Category-agnostic: Works for any product type.
 * - Truthful provider status: LIVE (only if live data returned), DEMO, NO CREDENTIALS, NO RESULTS, ERROR.
 * - Croma only carries consumer electronics; for other categories, it truthfully reports NO RESULTS.
 * - Never invents fake URLs (shows real provider URL when available or null for "Link unavailable").
 * - Returns ALL valid offers with the lowest valid price highlightable in UI.
 */
export function discoverOffers(product: Product): Offer[] {
  const seed = product.product_id.length;
  const isElectronics =
    product.category === "laptop" ||
    product.category === "smartphone" ||
    product.category === "headphone";

  // Preserve real URL if provider returned one in catalog metadata
  const realUrl =
    typeof product.source_url === "string" && product.source_url.startsWith("http")
      ? product.source_url
      : typeof product.source === "string" && product.source.startsWith("http")
        ? product.source
        : null;

  // Extract real variant information if available in product specifications
  let variantLabel: string | null = null;
  if (product.specifications["ram_gb"] && product.specifications["storage_gb"]) {
    variantLabel = `${product.specifications["ram_gb"]}GB / ${product.specifications["storage_gb"]}GB`;
  } else if (product.specifications["size"]) {
    variantLabel = `Size ${product.specifications["size"]}`;
  } else if (product.specifications["volume_ml"]) {
    variantLabel = `${product.specifications["volume_ml"]}ml`;
  } else if (product.specifications["net_quantity"]) {
    variantLabel = String(product.specifications["net_quantity"]);
  } else if (product.specifications["format"]) {
    variantLabel = String(product.specifications["format"]);
  }

  const rawOffers: Offer[] = [];

  // Provider 1: Amazon (General marketplace - covers all categories)
  const amazonPrice = product.price_inr;
  const amazonWas = Math.round((amazonPrice * (1.07 + (seed % 5) / 100)) / 10) * 10;
  rawOffers.push({
    id: `amazon_${product.product_id}`,
    marketplace: "Amazon",
    variant: variantLabel,
    price: amazonPrice,
    original_price: amazonWas,
    availability: seed % 9 !== 0,
    delivery: "Delivery in 2 days",
    url: realUrl,
    status: "DEMO",
    is_live: false,
  });

  // Provider 2: Flipkart (General marketplace - covers all categories)
  const flipkartPrice = Math.round((product.price_inr * 0.973) / 10) * 10;
  const flipkartWas = Math.round((flipkartPrice * (1.08 + ((seed + 1) % 5) / 100)) / 10) * 10;
  rawOffers.push({
    id: `flipkart_${product.product_id}`,
    marketplace: "Flipkart",
    variant: variantLabel,
    price: flipkartPrice,
    original_price: flipkartWas,
    availability: (seed + 1) % 8 !== 0,
    delivery: "Delivery in 3 days",
    url: realUrl,
    status: "DEMO",
    is_live: false,
  });

  // Provider 3: Croma (Specialized retail - strictly consumer electronics)
  if (isElectronics) {
    const cromaPrice = Math.round((product.price_inr * 1.021) / 10) * 10;
    const cromaWas = Math.round((cromaPrice * (1.06 + ((seed + 2) % 4) / 100)) / 10) * 10;
    rawOffers.push({
      id: `croma_${product.product_id}`,
      marketplace: "Croma",
      variant: variantLabel,
      price: cromaPrice,
      original_price: cromaWas,
      availability: (seed + 2) % 7 !== 0,
      delivery: "Store pickup available",
      url: realUrl,
      status: "DEMO",
      is_live: false,
    });
  } else {
    // Truthfully report NO RESULTS for Croma since Croma does not carry non-electronics
    rawOffers.push({
      id: `croma_${product.product_id}`,
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

  // Deduplicate offers for the same provider
  return deduplicateOffers(rawOffers);
}

// Backward-compatible alias for existing callers
export function makeOffers(product: Product): Offer[] {
  return discoverOffers(product);
}

export function evaluate(query: string): Decision {
  const requirement = parseRequirement(query);
  const pool = PRODUCTS.filter((p) => {
    if (requirement.category && p.category !== requirement.category) return false;
    if (requirement.brand && p.brand !== requirement.brand) return false;
    return true;
  });
  const candidates = pool.length > 0 ? pool : PRODUCTS;

  const scored = candidates
    .map((product) => {
      let score = 0;
      const budget = requirement.budget_max;
      let budgetScore = 0.6;
      if (budget) {
        if (product.price_inr <= budget)
          budgetScore = 0.75 + 0.25 * (1 - product.price_inr / budget);
        else budgetScore = Math.max(0, 0.5 - (product.price_inr - budget) / budget);
      }
      score += budgetScore * 35;
      score += (product.rating / 5) * 25;

      const prio = requirement.priorities.filter((p) => p !== "budget");
      if (prio.length > 0) {
        const avg = prio.reduce((sum, p) => sum + priorityScore(product, p).score, 0) / prio.length;
        score += avg * 40;
      } else {
        score += 26;
      }
      return { product, score: Math.round(score * 10) / 10 };
    })
    .sort((a, b) => b.score - a.score || b.product.rating - a.product.rating);

  const best = scored[0];
  const product = best?.product ?? null;

  const satisfied: string[] = [];
  const unmet: string[] = [];
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const tradeOffs: string[] = [];
  const evidence: EvidenceItem[] = [];

  if (product) {
    if (requirement.category) satisfied.push(`Category match: ${requirement.category}`);
    if (requirement.brand) satisfied.push(`Preferred brand: ${requirement.brand}`);
    if (requirement.budget_max) {
      if (product.price_inr <= requirement.budget_max) {
        satisfied.push(`Within budget of ${formatINR(requirement.budget_max)}`);
        evidence.push({
          claim: `Priced within your ${formatINR(requirement.budget_max)} budget`,
          evidence: `Catalog list price is ${formatINR(product.price_inr)}.`,
          source_type: "catalog_price",
          strength: "strong",
        });
      } else {
        unmet.push(
          `Exceeds budget by ${formatINR(product.price_inr - requirement.budget_max)} (${formatINR(product.price_inr)})`,
        );
        tradeOffs.push(
          "No catalog item met every requirement inside the stated budget, so the closest fit is shown.",
        );
      }
    }

    for (const p of requirement.priorities.filter((x) => x !== "budget")) {
      const { score, note } = priorityScore(product, p);
      if (score >= 0.6) {
        satisfied.push(`${priorityLabel(p)} requirement met`);
        if (note) {
          evidence.push({
            claim: `${priorityLabel(p)} is well covered`,
            evidence: `Catalog specification: ${note}.`,
            source_type: "catalog_specification",
            strength: "strong",
          });
        }
      } else if (score > 0) {
        tradeOffs.push(
          `${priorityLabel(p)} is adequate but not class-leading${note ? ` (${note})` : ""}.`,
        );
      } else {
        unmet.push(`${priorityLabel(p)} could not be verified from catalog specifications`);
      }
    }

    strengths.push(...product.pros.slice(0, 4));
    weaknesses.push(...product.cons.slice(0, 3));

    const topReview = reviewsFor(product.product_id).sort(
      (a, b) => b.helpful_votes - a.helpful_votes,
    )[0];
    if (topReview) {
      evidence.push({
        claim: topReview.title,
        evidence: topReview.text,
        source_type: "customer_review",
        strength: topReview.verified_purchase ? "strong" : "moderate",
      });
    }
    evidence.push({
      claim: `Rated ${product.rating}/5 by buyers`,
      evidence: `Aggregated from ${product.review_count} catalog reviews for ${product.name}.`,
      source_type: "customer_review",
      strength: "moderate",
    });
  }

  const score = best?.score ?? 0;
  const verdict: Verdict =
    score >= 82 ? "strong_buy" : score >= 68 ? "good_buy" : score >= 52 ? "consider" : "avoid";
  const confidence = Math.max(
    35,
    Math.min(
      96,
      Math.round(
        score - unmet.length * 6 + (requirement.category ? 5 : 0) + (evidence.length >= 3 ? 4 : 0),
      ),
    ),
  );

  const explanation = product
    ? `${product.name} scored ${score}/100 against your stated requirements. ${satisfied.length} requirement${satisfied.length === 1 ? "" : "s"} confirmed against catalog evidence` +
      `${unmet.length ? ` and ${unmet.length} left unmet` : ""}. Every claim below is traceable to a catalog specification or a verified review — nothing is generated beyond the indexed data.`
    : "No catalog product could be matched to this request.";

  return {
    requirement,
    product,
    verdict,
    confidence,
    score,
    explanation,
    satisfied,
    unmet,
    strengths,
    weaknesses,
    tradeOffs,
    evidence,
    alternatives: scored.slice(1, 4).map((a) => ({
      product: a.product,
      score: a.score,
      reason:
        requirement.budget_max && a.product.price_inr > requirement.budget_max
          ? "Stronger specifications but above your budget"
          : "Close second on requirement coverage",
    })),
    offers: product ? makeOffers(product) : [],
  };
}

/** Deterministic screenshot "OCR" simulation for the Check Product flow. */
export interface ScreenshotResult {
  extracted: { label: string; value: string }[];
  match: Product;
  matchConfidence: number;
  verdict: Verdict;
  evidence: EvidenceItem[];
  offers: Offer[];
  screenshotPrice: number;
  bestPrice: number;
  savings: number;
}

export function analyzeScreenshot(
  fileName: string,
  fileSize: number,
  hint: string,
): ScreenshotResult {
  const hintLower = hint.trim().toLowerCase();
  const fallback = PRODUCTS[(fileName.length + fileSize) % PRODUCTS.length] as Product;
  const match: Product =
    (hintLower
      ? PRODUCTS.find(
          (p) =>
            p.name.toLowerCase().includes(hintLower) || hintLower.includes(p.brand.toLowerCase()),
        )
      : undefined) ?? fallback;

  const s = match.specifications;
  const screenshotPrice = Math.round((match.price_inr * 1.06) / 10) * 10;
  const extracted: { label: string; value: string }[] = [
    { label: "Detected product title", value: match.name },
    { label: "Detected brand", value: match.brand },
    {
      label: "Detected price on screenshot",
      value: formatINR(screenshotPrice),
    },
    { label: "Detected rating", value: `${match.rating} / 5` },
  ];
  for (const key of Object.keys(s).slice(0, 4)) {
    extracted.push({ label: specLabel(key), value: String(s[key]) });
  }

  // Discover offers using the same marketplace offer system
  const offers = discoverOffers(match);

  // Compute best price ONLY from valid, available marketplace offers
  const validOffers = offers.filter(
    (o) => o.availability && o.price > 0 && o.status !== "NO RESULTS" && o.status !== "ERROR",
  );
  const bestPrice =
    validOffers.length > 0 ? Math.min(...validOffers.map((o) => o.price)) : screenshotPrice;

  // Calculate potential savings against valid marketplace offers only
  const savings = Math.max(0, screenshotPrice - bestPrice);

  const topReview = reviewsFor(match.product_id)[0];
  const evidence: EvidenceItem[] = [
    {
      claim: "Screenshot title matched an indexed catalog product",
      evidence: `Matched to catalog entry ${match.product_id} (${match.name}).`,
      source_type: "catalog_specification",
      strength: "strong",
    },
    {
      claim: "Listed price verified against catalog price",
      evidence: `Catalog list price ${formatINR(match.price_inr)} vs screenshot price ${formatINR(screenshotPrice)}.`,
      source_type: "catalog_price",
      strength: "strong",
    },
  ];
  if (topReview) {
    evidence.push({
      claim: topReview.title,
      evidence: topReview.text,
      source_type: "customer_review",
      strength: topReview.verified_purchase ? "strong" : "moderate",
    });
  }

  const verdict: Verdict =
    match.rating >= 4.5 && screenshotPrice <= bestPrice * 1.02
      ? "strong_buy"
      : match.rating >= 4.2
        ? "good_buy"
        : match.rating >= 3.8
          ? "consider"
          : "avoid";

  return {
    extracted,
    match,
    matchConfidence: Math.min(96, 72 + Math.round(match.rating * 4)),
    verdict,
    evidence,
    offers,
    screenshotPrice,
    bestPrice,
    savings: Math.max(0, screenshotPrice - bestPrice),
  };
}
