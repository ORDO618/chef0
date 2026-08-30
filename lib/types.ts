export type IngredientCategory = 
  | 'sebze_meyve'
  | 'et_tavuk_balik'
  | 'sut_kahvaltilik'
  | 'kuru_gida'
  | 'baharat_sos'
  | 'icecek'
  | 'diger';

export interface Ingredient {
  id: string;
  name: string;
  category: IngredientCategory;
  amount: number;
  unit: 'adet' | 'gram' | 'kg' | 'ml' | 'litre' | 'paket' | 'yemek_kasigi' | 'su_bardagi' | 'tutam';
  daysUntilExpiry?: number; // Days left before spoiled
  isPriority?: boolean; // Consume soon
  addedAt: string;
  notes?: string;
}

export type MealCategory = 
  | 'kahvalti' 
  | 'hizli_yemek' 
  | 'ana_yemek' 
  | 'fit_hafif' 
  | 'tatli' 
  | 'icecek' 
  | 'dunya_mutfagi';

export type MetabolicGoal = 
  | 'tum'
  | 'high_protein'
  | 'low_glycemic'
  | 'microbiome'
  | 'circadian'
  | 'leftover_transform';

export interface CookingAnalysis {
  equipment: 'Airfryer' | 'Fırın' | 'Ocak / Tava' | 'Buhar / Tencere';
  timeMinutes: number;
  temperature?: string;
  healthBenefits: string;
  oilUsagePercent: number; // e.g., -70% less oil
  energySavingNote: string;
}

export interface NutritionMacros {
  calories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams?: number;
}

export interface UsedIngredient {
  name: string;
  amount: number;
  unit: string;
  inStock: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  subtitle?: string;
  category: MealCategory;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: 'Kolay' | 'Orta' | 'Usta';
  imageUrl?: string;
  imagePrompt?: string;
  ingredients: UsedIngredient[];
  steps: string[];
  airfryerVsOven: {
    airfryer: CookingAnalysis;
    oven: CookingAnalysis;
    stovetop?: CookingAnalysis;
    recommendation: string;
  };
  scientificBioTip: {
    title: string;
    fact: string;
    macroFocus: string;
  };
  macros: NutritionMacros;
  tags: string[];
  isCooked?: boolean;
  isFavorite?: boolean;
  metabolicFocus?: MetabolicGoal;
  isLeftoverRecipe?: boolean;
  leftoverBase?: string;
}

export interface Missing1Suggestion {
  id: string;
  missingIngredientName: string;
  missingIngredientCategory: IngredientCategory;
  unlocksRecipeTitle: string;
  prepTimeMinutes: number;
  recipeDescription: string;
  whyThisItem: string;
  estimatedPriceTl?: string;
  additionalRecipesCount: number;
}

export interface ShoppingItem {
  id: string;
  name: string;
  amount?: number;
  unit?: string;
  category: IngredientCategory;
  checked: boolean;
  source: 'auto_deducted' | 'missing_1' | 'manual';
  addedAt: string;
  estimatedPrice?: number;
}

export interface ZeroWasteStats {
  mealsCooked: number;
  ingredientsSaved: number;
  approxMoneySavedTl: number;
  co2SavedKg: number;
  streakDays: number;
  rescuedKg?: number;
  waterSavedLiters?: number;
}

export interface UserBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'eco' | 'speed' | 'culinary' | 'streak';
  unlocked: boolean;
  unlockedAt?: string;
  progressPercent: number;
  rewardText: string;
}

export interface PostComment {
  id: string;
  authorName: string;
  authorAvatar?: string;
  text: string;
  timestamp: string;
}

export interface CommunityPost {
  id: string;
  authorName: string;
  authorRole?: string;
  authorAvatar: string;
  recipeTitle: string;
  caption: string;
  imageUrl: string;
  savedIngredients: string[];
  equipmentUsed: 'Airfryer' | 'Fırın' | 'Ocak' | 'Tencere';
  likesCount: number;
  isLiked?: boolean;
  comments: PostComment[];
  timeAgo: string;
  moneySavedTl: number;
  tags: string[];
}

export interface TrendingRecipe {
  id: string;
  title: string;
  category: MealCategory;
  cookedCountThisWeek: number;
  approxSavedKg: number;
  rating: number;
  imageUrl: string;
  primaryEquipment: string;
  tag: string;
}

export interface ChefMasterclass {
  id: string;
  chefName: string;
  chefTitle: string;
  chefAvatar: string;
  chefBadge?: string;
  eventTitle: string;
  description: string;
  dateStr: string;
  timeStr: string;
  status: 'live_now' | 'upcoming' | 'replay';
  attendeesCount: number;
  isRegistered?: boolean;
  keyTopics: string[];
  sponsoredBy?: {
    brandName: string;
    logoText: string;
    offerText: string;
    discountCode: string;
  };
}

export interface KitchenHack {
  id: string;
  title: string;
  category: 'saklama' | 'canlandirma' | 'pratik' | 'temizlik';
  summary: string;
  readTime: string;
  icon: string;
  steps: string[];
  scientificReason: string;
  likes: number;
  likesCount?: number;
  isFavorite?: boolean;
}

export interface SponsoredDeal {
  id: string;
  brand: string;
  productName: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;
  couponCode: string;
  features: string[];
  imageUrl: string;
  affiliateUrl: string;
  ecoFeature: string;
}

export interface MonthlySavingsPoint {
  month: string;
  savedTl: number;
  wastedAvoidedKg: number;
  mealsCooked: number;
}

export interface ChefDiaryEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood: 'harika' | 'dengeli' | 'kurtarma' | 'deneme' | 'disarida';
  tags: string[];
  meals?: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
    snacks?: string;
  };
  shoppingTodos?: string[];
  createdAt: string;
}

export interface AdminMarketLink {
  id: string;
  name: string;
  baseUrl: string;
  commissionPercent: number;
  enabled: boolean;
  color: string;
}

export interface AdminMetabolicTag {
  id: string;
  label: string;
  active: boolean;
  color: string;
  description: string;
}

export interface AdminSettings {
  geminiModel: 'gemini-3.7-flash' | 'gemini-3.5-flash-lite' | 'gemini-2.5-pro';
  simulatedUserCount: number;
  developerUnlockAll: boolean;
  marketLinks: AdminMarketLink[];
  metabolicTags: AdminMetabolicTag[];
  allowCameraOCR: boolean;
  allowVoiceRecognition: boolean;
  autoDeductOnCook: boolean;
  systemLogs: Array<{ id: string; timestamp: string; event: string; details?: string }>;
}

export type CloudSyncState = 'connected' | 'offline_demo' | 'syncing' | 'error';

export interface CloudUserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'user';
  avatarUrl?: string;
  createdAt: string;
  lastSyncAt: string;
  connectedDevices: string[];
}

export interface CloudSyncEvent {
  type: 'PANTRY_SYNC' | 'SHOPPING_SYNC' | 'RECIPES_SYNC' | 'DIARY_SYNC' | 'STATS_SYNC' | 'FULL_MERGE';
  sourceDeviceId: string;
  sourceDeviceName: string;
  timestamp: string;
  data: unknown;
}

