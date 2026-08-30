'use client';

import React, { useState, useEffect } from 'react';
import {
  UtensilsCrossed,
  Sparkles,
  ShoppingBag,
  ChefHat,
  Leaf,
  Layers,
  Flame,
  CheckCircle,
  Users,
  Radio,
  Timer,
  Clock,
  Award,
  Lock,
  Unlock,
  BookOpen,
  ShieldCheck as ShieldCheckIcon,
} from 'lucide-react';
import { usePersistentState } from '@/lib/usePersistentState';
import { Header } from '@/components/Header';
import { ApiKeyModal } from '@/components/ApiKeyModal';
import { PantryTab } from '@/components/PantryTab';
import { MealsTab } from '@/components/MealsTab';
import { MarketTab } from '@/components/MarketTab';
import { SocialTab } from '@/components/SocialTab';
import { ChefStageTab } from '@/components/ChefStageTab';
import { ChefDiaryTab } from '@/components/ChefDiaryTab';
import { AdminModal } from '@/components/AdminModal';
import { CookingTimer } from '@/components/CookingTimer';
import { EcoImpactStoryModal } from '@/components/EcoImpactStoryModal';
import { BrandHeroAccent } from '@/components/BrandHeroAccent';
import { AlphaFeedbackModal } from '@/components/AlphaFeedbackModal';
import { LockedTabTeaser } from '@/components/LockedTabTeaser';
import { TourGuide } from '@/components/TourGuide';
import { AuthSyncModal } from '@/components/AuthSyncModal';
import { FEATURE_GATES } from '@/lib/featureGating';
import { getRecipeCulinaryVisual } from '@/lib/recipeVisuals';
import {
  subscribeToSyncEvents,
  syncPantryToSupabase,
  syncShoppingToSupabase,
  syncDiariesToSupabase,
  syncRecipesToSupabase,
  syncStatsToSupabase,
  isSupabaseConfigured,
  mergePantryItems,
  mergeShoppingItems,
  mergeDiaries,
  mergeRecipes,
} from '@/lib/supabaseClient';
import {
  Ingredient,
  Recipe,
  Missing1Suggestion,
  ShoppingItem,
  ZeroWasteStats,
  MealCategory,
  IngredientCategory,
  CommunityPost,
  TrendingRecipe,
  UserBadge,
  ChefMasterclass,
  KitchenHack,
  SponsoredDeal,
  MonthlySavingsPoint,
  MetabolicGoal,
  ChefDiaryEntry,
  AdminSettings,
} from '@/lib/types';
import {
  INITIAL_INGREDIENTS,
  INITIAL_RECIPES,
  INITIAL_MISSING_1_SUGGESTIONS,
  INITIAL_SHOPPING_ITEMS,
  INITIAL_ZERO_WASTE_STATS,
  INITIAL_COMMUNITY_POSTS,
  INITIAL_TRENDING_RECIPES,
  INITIAL_USER_BADGES,
  INITIAL_CHEF_MASTERCLASSES,
  INITIAL_KITCHEN_HACKS,
  INITIAL_SPONSORED_DEALS,
  INITIAL_MONTHLY_SAVINGS,
} from '@/lib/sampleData';
import { INITIAL_DIARY_ENTRIES, INITIAL_ADMIN_SETTINGS } from '@/lib/diaryAndAdminDefaults';
import { playKitchenSound } from '@/lib/sound';
import { fetchWithRetry, ApiError } from '@/lib/apiRetry';

type ActiveTab = 'pantry' | 'meals' | 'diary' | 'social' | 'chef' | 'market';

export default function Home() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<ActiveTab>('pantry');

  // Persistent state synced with localStorage using useSyncExternalStore (SSR-safe & Hydration-safe)
  const [ingredients, setIngredients] = usePersistentState<Ingredient[]>('kitchzero_ingredients', INITIAL_INGREDIENTS);
  const [recipes, setRecipes] = usePersistentState<Recipe[]>('kitchzero_recipes', INITIAL_RECIPES);
  const [missingSuggestions, setMissingSuggestions] = usePersistentState<Missing1Suggestion[]>('kitchzero_missing', INITIAL_MISSING_1_SUGGESTIONS);
  const [shoppingList, setShoppingList] = usePersistentState<ShoppingItem[]>('kitchzero_shopping', INITIAL_SHOPPING_ITEMS);
  const [stats, setStats] = usePersistentState<ZeroWasteStats>('kitchzero_stats', INITIAL_ZERO_WASTE_STATS);
  const [communityPosts, setCommunityPosts] = usePersistentState<CommunityPost[]>('kitchzero_posts', INITIAL_COMMUNITY_POSTS);
  const [trendingRecipes, setTrendingRecipes] = useState<TrendingRecipe[]>(INITIAL_TRENDING_RECIPES);
  const [userBadges, setUserBadges] = usePersistentState<UserBadge[]>('kitchzero_badges', INITIAL_USER_BADGES);
  const [masterclasses, setMasterclasses] = useState<ChefMasterclass[]>(INITIAL_CHEF_MASTERCLASSES);
  const [kitchenHacks, setKitchenHacks] = useState<KitchenHack[]>(INITIAL_KITCHEN_HACKS);
  const [sponsoredDeals, setSponsoredDeals] = useState<SponsoredDeal[]>(INITIAL_SPONSORED_DEALS);
  const [monthlySavings, setMonthlySavings] = useState<MonthlySavingsPoint[]>(INITIAL_MONTHLY_SAVINGS);

  // Dedicated Floating / Overlay Timer State
  const [timerModalState, setTimerModalState] = useState<{
    isOpen: boolean;
    minutes: number;
    label: string;
  }>({
    isOpen: false,
    minutes: 15,
    label: 'Pişirme Geri Sayımı',
  });

  // Settings & Modals
  const [customApiKey, setCustomApiKey] = usePersistentState<string>('kitchzero_gemini_key', '');
  const [isKeyModalOpen, setIsKeyModalOpen] = useState<boolean>(false);
  const [isEcoStoryOpen, setIsEcoStoryOpen] = useState<boolean>(false);
  const [isAuthSyncOpen, setIsAuthSyncOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = usePersistentState<boolean>('kitchzero_sound', true);
  const [isTourGuideOpen, setIsTourGuideOpen] = useState<boolean>(false);

  // Auto-prompt Tour Guide on very first visit
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const tourShown = localStorage.getItem('kitchzero_tour_seen');
      if (!tourShown) {
        const timer = setTimeout(() => {
          setIsTourGuideOpen(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, []);

  // Feature Gating & Phased Growth Controls
  const [developerUnlockAll, setDeveloperUnlockAll] = usePersistentState<boolean>('kitchzero_dev_unlock_all', false);
  const [simulatedUserCount, setSimulatedUserCount] = usePersistentState<number>('kitchzero_simulated_users', 61);

  // Chef Diary & Admin Settings Persistent States
  const [diaryEntries, setDiaryEntries] = usePersistentState<ChefDiaryEntry[]>('kitchzero_diary', INITIAL_DIARY_ENTRIES);
  const [adminSettings, setAdminSettings] = usePersistentState<AdminSettings>('kitchzero_admin_settings', INITIAL_ADMIN_SETTINGS);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState<boolean>(false);

  const effectiveSimulatedUsers = adminSettings.simulatedUserCount ?? simulatedUserCount;
  const effectiveDeveloperUnlock = adminSettings.developerUnlockAll || developerUnlockAll;
  const isSocialUnlocked = effectiveDeveloperUnlock || effectiveSimulatedUsers >= FEATURE_GATES.social.targetCount;
  const isChefUnlocked = effectiveDeveloperUnlock || effectiveSimulatedUsers >= FEATURE_GATES.chef.targetCount;

  const [isGeneratingRecipes, setIsGeneratingRecipes] = useState<boolean>(false);
  const [isRefreshingMissing, setIsRefreshingMissing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);

  // Show Temporary Toast
  const showToast = (text: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Cross-device & Multi-tab realtime synchronization subscriber
  useEffect(() => {
    const unsubscribe = subscribeToSyncEvents((event) => {
      if (!event || !event.data) return;

      if (event.type === 'PANTRY_SYNC') {
        const cloudPantry = event.data as Ingredient[];
        if (Array.isArray(cloudPantry)) {
          setIngredients((prev) => mergePantryItems(prev, cloudPantry));
          showToast(`⚡ ${event.sourceDeviceName || 'Diğer cihazdan'} kiler senkronize edildi.`, 'info');
        }
      } else if (event.type === 'SHOPPING_SYNC') {
        const cloudShopping = event.data as ShoppingItem[];
        if (Array.isArray(cloudShopping)) {
          setShoppingList((prev) => mergeShoppingItems(prev, cloudShopping));
          showToast(`🛒 ${event.sourceDeviceName || 'Diğer cihazdan'} alışveriş listesi güncellendi.`, 'info');
        }
      } else if (event.type === 'DIARY_SYNC') {
        const cloudDiaries = event.data as ChefDiaryEntry[];
        if (Array.isArray(cloudDiaries)) {
          setDiaryEntries((prev) => mergeDiaries(prev, cloudDiaries));
          showToast(`👨‍🍳 ${event.sourceDeviceName || 'Diğer cihazdan'} mutfak günlüğü eşitlendi.`, 'info');
        }
      } else if (event.type === 'RECIPES_SYNC') {
        const cloudRecipes = event.data as Recipe[];
        if (Array.isArray(cloudRecipes)) {
          setRecipes((prev) => mergeRecipes(prev, cloudRecipes));
        }
      } else if (event.type === 'STATS_SYNC') {
        const cloudStats = event.data as ZeroWasteStats;
        if (cloudStats && typeof cloudStats === 'object') {
          setStats((prev) => ({ ...prev, ...cloudStats }));
        }
      } else if (event.type === 'FULL_MERGE') {
        const payload = event.data as {
          ingredients?: Ingredient[];
          shoppingList?: ShoppingItem[];
          diaries?: ChefDiaryEntry[];
          recipes?: Recipe[];
          stats?: ZeroWasteStats;
        };
        if (payload.ingredients && Array.isArray(payload.ingredients)) {
          setIngredients((prev) => mergePantryItems(prev, payload.ingredients!));
        }
        if (payload.shoppingList && Array.isArray(payload.shoppingList)) {
          setShoppingList((prev) => mergeShoppingItems(prev, payload.shoppingList!));
        }
        if (payload.diaries && Array.isArray(payload.diaries)) {
          setDiaryEntries((prev) => mergeDiaries(prev, payload.diaries!));
        }
        if (payload.recipes && Array.isArray(payload.recipes)) {
          setRecipes((prev) => mergeRecipes(prev, payload.recipes!));
        }
        if (payload.stats && typeof payload.stats === 'object') {
          setStats((prev) => ({ ...prev, ...payload.stats! }));
        }
        showToast(`☁️ ${event.sourceDeviceName || 'Diğer cihazla'} tam bulut senkronizasyonu sağlandı!`, 'success');
      }
    });

    return () => {
      unsubscribe();
    };
  }, [setIngredients, setShoppingList, setDiaryEntries, setRecipes, setStats]);

  // Timer Trigger from any recipe step or modal
  const handleOpenTimer = (minutes: number, label: string) => {
    playKitchenSound('click', soundEnabled);
    setTimerModalState({
      isOpen: true,
      minutes: Math.max(1, minutes || 10),
      label: label || 'Mutfak Zamanlayıcısı',
    });
  };

  // 1. Pantry Actions
  const handleAddIngredient = (item: Omit<Ingredient, 'id' | 'addedAt'>) => {
    const newItem: Ingredient = {
      ...item,
      id: `ing-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      addedAt: new Date().toISOString(),
    };
    setIngredients((prev) => [newItem, ...prev]);
    showToast(`"${newItem.name}" dolaba eklendi!`, 'success');
  };

  const handleAddMultipleIngredients = (items: Omit<Ingredient, 'id' | 'addedAt'>[]) => {
    const newItems: Ingredient[] = items.map((item, idx) => ({
      ...item,
      id: `ing-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
      addedAt: new Date().toISOString(),
    }));
    setIngredients((prev) => [...newItems, ...prev]);
    showToast(`${newItems.length} yeni malzeme dolaba eklendi!`, 'success');
  };

  const handleRemoveIngredient = (id: string) => {
    const item = ingredients.find((i) => i.id === id);
    setIngredients((prev) => prev.filter((i) => i.id !== id));
    if (item) showToast(`"${item.name}" silindi.`, 'info');
  };

  const handleUpdateAmount = (id: string, delta: number) => {
    setIngredients((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newAmount = Math.max(0, item.amount + delta);
            return { ...item, amount: newAmount };
          }
          return item;
        })
        .filter((item) => item.amount > 0)
    );
  };

  const handleLoadPreset = (items: any[]) => {
    const newItems: Ingredient[] = items.map((item, idx) => ({
      ...item,
      id: `ing-${Date.now()}-${idx}`,
      addedAt: new Date().toISOString(),
    }));
    setIngredients(newItems);
    showToast('Hazır örnek dolap yüklendi!', 'success');
  };

  const handleResetPantry = () => {
    if (confirm('Dolabınızı ve tarifleri varsayılan demo durumuna sıfırlamak istiyor musunuz?')) {
      setIngredients(INITIAL_INGREDIENTS);
      setRecipes(INITIAL_RECIPES);
      setMissingSuggestions(INITIAL_MISSING_1_SUGGESTIONS);
      setShoppingList(INITIAL_SHOPPING_ITEMS);
      setStats(INITIAL_ZERO_WASTE_STATS);
      setCommunityPosts(INITIAL_COMMUNITY_POSTS);
      setUserBadges(INITIAL_USER_BADGES);
      showToast('Sistem varsayılan verilere sıfırlandı.', 'info');
    }
  };

  // 2. Recipe & Cooking Actions
  const handleGenerateRecipes = async (
    category: MealCategory,
    servings: number,
    customPrompt: string,
    metabolicGoal?: MetabolicGoal,
    isLeftoverMode?: boolean,
    leftoverItems?: string[],
    emergencyRescue?: boolean
  ) => {
    if (!ingredients || ingredients.length === 0) {
      showToast('Dolabınızda henüz malzeme yok! Lütfen önce "Mutfağım" sekmesinden malzeme ekleyin.', 'info');
      setActiveTab('pantry');
      return;
    }

    setIsGeneratingRecipes(true);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (customApiKey) headers['x-custom-gemini-key'] = customApiKey;

      const res = await fetchWithRetry('/api/gemini/kitchen', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'generate_recipes',
          ingredients,
          category,
          servings,
          customPrompt,
          metabolicGoal: metabolicGoal || 'tum',
          isLeftoverMode: !!isLeftoverMode,
          leftoverItems: leftoverItems || [],
          emergencyRescue: !!emergencyRescue,
        }),
        maxRetries: 2,
        timeoutMs: 35000,
      });

      const data = await res.json();
      if (data.recipes && data.recipes.length > 0) {
        const withIds = data.recipes.map((r: any, idx: number) => {
          const visual = getRecipeCulinaryVisual(
            r.title,
            (r.ingredients || []).map((i: any) => i.name),
            r.category || category
          );
          return {
            ...r,
            id: `rec-${Date.now()}-${idx}`,
            category: r.category || category,
            imageUrl: r.imageUrl || visual.imageUrl,
          };
        });
        setRecipes(withIds);
        showToast(
          emergencyRescue
            ? `🚨 ${withIds.length} adet 15 Dk'lık Acil Kurtarma Menüsü hazır!`
            : `${withIds.length} yeni sıfır israf tarif üretildi!`,
          'success'
        );
      } else {
        showToast('Tarif üretilemedi, mevcut tarifler gösteriliyor.', 'warning');
      }
    } catch (err: any) {
      console.error('Recipe generation error:', err);
      const msg = err instanceof ApiError ? err.userMessage : 'Yapay zeka bağlantısında bir aksaklık oldu. Tekrar deneniyor...';
      showToast(msg, 'warning');
    } finally {
      setIsGeneratingRecipes(false);
    }
  };

  // 15 Dk'lık Acil Kurtarma Menüsü Tetikleyicisi
  const handleGenerateRescueMenu = async (urgentIngredients: Ingredient[]) => {
    setActiveTab('meals');
    const urgentNames = urgentIngredients.map((i) => i.name).join(', ');
    showToast(`🚨 Acil kurtarılacak [${urgentNames}] için 15 dk'lık menü tasarlanıyor...`, 'info');
    await handleGenerateRecipes(
      'hizli_yemek',
      2,
      `Acil kurtarılması gereken malzemeler: ${urgentNames}. 15 dakikada pratik ve israfı önleyen lezzetli bir menü oluştur.`,
      'tum',
      false,
      [],
      true
    );
  };

  // "Pişirdim (Stoktan Düş)" Auto-Deduction Engine
  const handleCookRecipe = (recipe: Recipe) => {
    let depletedNames: string[] = [];
    let savedCount = 0;

    // Deduct each used ingredient from pantry
    setIngredients((prev) => {
      let updated = [...prev];

      recipe.ingredients.forEach((used) => {
        const matchIndex = updated.findIndex(
          (ing) => ing.name.toLowerCase() === used.name.toLowerCase() ||
            ing.name.toLowerCase().includes(used.name.toLowerCase()) ||
            used.name.toLowerCase().includes(ing.name.toLowerCase())
        );

        if (matchIndex !== -1) {
          const current = updated[matchIndex];
          const remaining = Math.max(0, current.amount - (used.amount || 1));
          savedCount++;

          if (remaining <= 0) {
            depletedNames.push(current.name);
            updated.splice(matchIndex, 1); // remove completely
          } else {
            updated[matchIndex] = { ...current, amount: remaining };
          }
        }
      });

      return updated;
    });

    // Mark recipe as cooked
    setRecipes((prev) =>
      prev.map((r) => (r.id === recipe.id ? { ...r, isCooked: true } : r))
    );

    // If any items depleted completely, append to Shopping List automatically!
    if (depletedNames.length > 0) {
      depletedNames.forEach((name) => {
        handleAddShoppingItem(name, 'sebze_meyve', 1, 'adet', 30, 'auto_deducted');
      });
      showToast(`Tükenen [${depletedNames.join(', ')}] Pazarım listesine eklendi!`, 'info');
    }

    // Update Zero Waste Impact Stats & Badges
    setStats((prev) => {
      const nextMeals = prev.mealsCooked + 1;
      const nextSaved = prev.ingredientsSaved + (savedCount || 3);
      const nextMoney = prev.approxMoneySavedTl + 125;
      const nextCo2 = Number((prev.co2SavedKg + 1.4).toFixed(1));
      const nextWater = (prev.waterSavedLiters || 4850) + 650;
      const nextRescued = Number(((prev.rescuedKg || 5.8) + 0.85).toFixed(1));
      const nextStreak = prev.streakDays + 1;

      // Update badge unlock progress
      setUserBadges((currentBadges) =>
        currentBadges.map((b) => {
          if (b.id === 'badge-1' && nextSaved >= 20) return { ...b, unlocked: true, progressPercent: 100 };
          if (b.id === 'badge-2') return { ...b, unlocked: true, progressPercent: 100 };
          if (b.id === 'badge-4' && nextMeals >= 10) return { ...b, unlocked: true, progressPercent: 100 };
          return b;
        })
      );

      return {
        mealsCooked: nextMeals,
        ingredientsSaved: nextSaved,
        approxMoneySavedTl: nextMoney,
        co2SavedKg: nextCo2,
        waterSavedLiters: nextWater,
        rescuedKg: nextRescued,
        streakDays: nextStreak,
      };
    });

    showToast(`Tebrikler! "${recipe.title}" pişirildi ve ekolojik etkiniz güncellendi.`, 'success');
  };

  // 2.2 Toggle Favorite Recipe
  const handleToggleFavoriteRecipe = (recipeId: string) => {
    setRecipes((prev) =>
      prev.map((r) => {
        if (r.id === recipeId) {
          const nextState = !r.isFavorite;
          showToast(
            nextState
              ? `⭐ "${r.title}" favorilerine eklendi!`
              : `"${r.title}" favorilerden çıkarıldı.`,
            nextState ? 'success' : 'info'
          );
          return { ...r, isFavorite: nextState };
        }
        return r;
      })
    );
  };

  // 3. Social & Community Actions
  const handleAddCommunityPost = (post: Omit<CommunityPost, 'id' | 'likesCount' | 'comments' | 'timeAgo'>) => {
    const newPost: CommunityPost = {
      ...post,
      id: `post-${Date.now()}`,
      likesCount: 1,
      isLiked: true,
      timeAgo: 'Az önce',
      comments: [
        {
          id: `c-init-${Date.now()}`,
          authorName: 'ŞefSıfır Asistanı',
          text: 'Harika bir sıfır israf tabağı! Ellerinize sağlık 🎉',
          timestamp: 'Az önce',
        },
      ],
    };
    setCommunityPosts((prev) => [newPost, ...prev]);
    showToast('Tabağınız Topluluk akışında yayınlandı!', 'success');
  };

  const handleLikeCommunityPost = (postId: string) => {
    setCommunityPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const isLiked = !post.isLiked;
          return {
            ...post,
            isLiked,
            likesCount: isLiked ? post.likesCount + 1 : Math.max(0, post.likesCount - 1),
          };
        }
        return post;
      })
    );
  };

  const handleAddCommunityComment = (postId: string, commentText: string) => {
    setCommunityPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [
              ...post.comments,
              {
                id: `comm-${Date.now()}`,
                authorName: 'Şef Serhan Alpler',
                text: commentText,
                timestamp: 'Az önce',
              },
            ],
          };
        }
        return post;
      })
    );
    showToast('Yorumunuz eklendi!', 'info');
  };

  const handleSelectTrendingRecipe = (trendingTitle: string) => {
    setActiveTab('meals');
    playKitchenSound('click', soundEnabled);
    showToast(`"${trendingTitle}" için tarifler taranıyor...`, 'info');
  };

  // 4. Chef Stage Actions
  const handleToggleRegisterMasterclass = (id: string) => {
    setMasterclasses((prev) =>
      prev.map((cls) => {
        if (cls.id === id) {
          const isRegistered = !cls.isRegistered;
          showToast(isRegistered ? `"${cls.eventTitle}" için hatırlatıcı kuruldu!` : 'Kayıt iptal edildi.', 'info');
          return { ...cls, isRegistered };
        }
        return cls;
      })
    );
  };

  const handleLikeHack = (id: string) => {
    setKitchenHacks((prev) =>
      prev.map((h) =>
        h.id === id
          ? {
              ...h,
              likes: (h.likes || 0) + 1,
              likesCount: ((h.likesCount ?? h.likes) || 0) + 1,
            }
          : h
      )
    );
    showToast('İpucu beğenildi!', 'success');
  };

  const handleToggleFavoriteHack = (id: string) => {
    setKitchenHacks((prev) =>
      prev.map((h) => {
        if (h.id === id) {
          const isFavorite = !h.isFavorite;
          showToast(isFavorite ? 'İpucu favorilere eklendi!' : 'Favorilerden çıkarıldı.', 'info');
          return { ...h, isFavorite };
        }
        return h;
      })
    );
  };

  // 5. Market & Shopping List Actions
  const handleAddShoppingItem = (
    name: string,
    category: IngredientCategory,
    amount = 1,
    unit = 'adet',
    price = 30,
    source: 'auto_deducted' | 'missing_1' | 'manual' = 'manual'
  ) => {
    const newItem: ShoppingItem = {
      id: `shop-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name,
      amount,
      unit,
      category,
      checked: false,
      source,
      addedAt: new Date().toISOString(),
      estimatedPrice: price,
    };
    setShoppingList((prev) => [newItem, ...prev]);
  };

  const handleToggleShoppingItem = (id: string) => {
    setShoppingList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleRemoveShoppingItem = (id: string) => {
    setShoppingList((prev) => prev.filter((item) => item.id !== id));
  };

  // "Satın Aldım (Mutfağa Geri Yükle)"
  const handleRestockCheckedItems = () => {
    const checkedItems = shoppingList.filter((i) => i.checked);
    if (checkedItems.length === 0) return;

    const restoredIngredients: Ingredient[] = checkedItems.map((item, idx) => ({
      id: `ing-restocked-${Date.now()}-${idx}`,
      name: item.name,
      category: item.category || 'diger',
      amount: item.amount || 1,
      unit: (item.unit as any) || 'adet',
      daysUntilExpiry: 7, // Freshly bought
      isPriority: false,
      addedAt: new Date().toISOString(),
    }));

    setIngredients((prev) => [...restoredIngredients, ...prev]);
    setShoppingList((prev) => prev.filter((i) => !i.checked));
    showToast(`${checkedItems.length} satın alınan ürün Mutfağım dolabına aktarıldı!`, 'success');
  };

  const handleAddMissingToShoppingList = (suggestion: Missing1Suggestion) => {
    handleAddShoppingItem(
      suggestion.missingIngredientName,
      suggestion.missingIngredientCategory,
      1,
      'paket',
      parseInt(suggestion.estimatedPriceTl?.replace(/\D/g, '') || '35') || 35,
      'missing_1'
    );
    showToast(`"${suggestion.missingIngredientName}" alışveriş listenize eklendi!`, 'success');
  };

  const handleRefreshMissingSuggestions = async () => {
    if (!ingredients || ingredients.length === 0) {
      showToast('Dolabınızda malzeme bulunamadı. Lütfen önce birkaç malzeme ekleyin.', 'info');
      return;
    }

    setIsRefreshingMissing(true);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (customApiKey) headers['x-custom-gemini-key'] = customApiKey;

      const res = await fetchWithRetry('/api/gemini/kitchen', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'analyze_missing_1',
          ingredients,
        }),
        maxRetries: 2,
        timeoutMs: 30000,
      });

      const data = await res.json();
      if (data.suggestions && data.suggestions.length > 0) {
        const withIds = data.suggestions.map((s: any, idx: number) => ({
          ...s,
          id: `miss-${Date.now()}-${idx}`,
        }));
        setMissingSuggestions(withIds);
        showToast('Yeni 1-Eksik malzeme önerileri yüklendi!', 'success');
      }
    } catch (err: any) {
      console.error('Missing analysis error:', err);
      const msg = err instanceof ApiError ? err.userMessage : '1-Eksik malzeme önerileri yüklenirken bir sorun oluştu.';
      showToast(msg, 'warning');
    } finally {
      setIsRefreshingMissing(false);
    }
  };

  const handleSaveApiKey = (key: string) => {
    setCustomApiKey(key);
    localStorage.setItem('kitchzero_gemini_key', key);
    showToast(key ? 'Özel Gemini API Anahtarı aktif edildi.' : 'Varsayılan sunucu API anahtarı devrede.', 'info');
  };

  const handleToggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem('kitchzero_sound', String(next));
    if (next) playKitchenSound('pop', true);
  };

  // Chef Diary Handlers
  const handleAddDiaryEntry = (entry: Omit<ChefDiaryEntry, 'id' | 'createdAt'>) => {
    const newEntry: ChefDiaryEntry = {
      ...entry,
      id: `diary-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setDiaryEntries((prev) => [newEntry, ...prev]);
  };

  const handleUpdateDiaryEntry = (id: string, updated: Partial<ChefDiaryEntry>) => {
    setDiaryEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updated } : e))
    );
  };

  const handleDeleteDiaryEntry = (id: string) => {
    setDiaryEntries((prev) => prev.filter((e) => e.id !== id));
  };

  const handleResetPantryToClean = () => {
    setIngredients([]);
  };

  const handleResetPantryToDemo = () => {
    setIngredients(INITIAL_INGREDIENTS);
  };

  const handleUpdateAdminSettings = (updated: Partial<AdminSettings>) => {
    setAdminSettings((prev) => {
      const next = { ...prev, ...updated };
      if (updated.simulatedUserCount !== undefined) {
        setSimulatedUserCount(updated.simulatedUserCount);
      }
      if (updated.developerUnlockAll !== undefined) {
        setDeveloperUnlockAll(updated.developerUnlockAll);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Global Header */}
      <Header
        stats={stats}
        customApiKey={customApiKey}
        onSaveApiKey={handleSaveApiKey}
        onOpenKeyModal={() => setIsKeyModalOpen(true)}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onResetPantry={handleResetPantry}
        onOpenEcoStory={() => setIsEcoStoryOpen(true)}
        onOpenAdminModal={() => setIsAdminModalOpen(true)}
        onNavigateToDiary={() => {
          setActiveTab('diary');
          playKitchenSound('click', soundEnabled);
        }}
        onOpenTourGuide={() => {
          setIsTourGuideOpen(true);
          playKitchenSound('pop', soundEnabled);
        }}
        onOpenAuthSync={() => {
          setIsAuthSyncOpen(true);
          playKitchenSound('click', soundEnabled);
        }}
        isCloudActive={isSupabaseConfigured()}
        activeTab={activeTab}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        
        {/* Brand Slogan & Hero Accent Bar */}
        <BrandHeroAccent
          activeTab={activeTab}
          onQuickAddClick={() => {
            setActiveTab('pantry');
            playKitchenSound('pop', soundEnabled);
          }}
        />

        {/* 6 Tab Navigation Bar with warm accents */}
        <div className="flex items-center justify-center sm:justify-start overflow-x-auto pb-1">
          <nav className="inline-flex p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl gap-1 shrink-0">
            
            {/* Tab 1: Mutfağım */}
            <button
              onClick={() => {
                setActiveTab('pantry');
                playKitchenSound('click', soundEnabled);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'pantry'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span>Mutfağım</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[11px] ${
                activeTab === 'pantry' ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-slate-800 text-emerald-400'
              }`}>
                {ingredients.length}
              </span>
            </button>

            {/* Tab 2: Öğünüm */}
            <button
              onClick={() => {
                setActiveTab('meals');
                playKitchenSound('click', soundEnabled);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'meals'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <ChefHat className="w-4 h-4" />
              <span>Öğünüm</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[11px] ${
                activeTab === 'meals' ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-slate-800 text-emerald-400'
              }`}>
                {recipes.length}
              </span>
            </button>

            {/* Tab 3: Kürşad Günlüğü 📝 */}
            <button
              onClick={() => {
                setActiveTab('diary');
                playKitchenSound('click', soundEnabled);
              }}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'diary'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Kürşad Günlüğü</span>
              <span className={`px-1.5 py-0.2 rounded-md text-[11px] ${
                activeTab === 'diary' ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-slate-800 text-emerald-400'
              }`}>
                {diaryEntries.length}
              </span>
            </button>

            {/* Tab 4: Topluluk & Trendler (Feature Gated: Phase 2 - 100 Users) */}
            <button
              onClick={() => {
                setActiveTab('social');
                playKitchenSound(isSocialUnlocked ? 'click' : 'pop', soundEnabled);
              }}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'social'
                  ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Topluluk & Trendler</span>
              {isSocialUnlocked ? (
                <span className={`px-1.5 py-0.2 rounded-md text-[11px] ${
                  activeTab === 'social' ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-slate-800 text-amber-400'
                }`}>
                  {communityPosts.length}
                </span>
              ) : (
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-950/90 border border-amber-500/40 text-amber-300">
                  <Lock className="w-2.5 h-2.5" />
                  <span>{effectiveSimulatedUsers}/100</span>
                </span>
              )}
            </button>

            {/* Tab 5: Şef Sahnesi & Canlı (Feature Gated: Phase 3 - 500 Users) */}
            <button
              onClick={() => {
                setActiveTab('chef');
                playKitchenSound(isChefUnlocked ? 'click' : 'pop', soundEnabled);
              }}
              className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'chef'
                  ? 'bg-rose-500 text-slate-950 shadow-lg shadow-rose-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Radio className="w-4 h-4" />
              <span>Şef Sahnesi</span>
              {isChefUnlocked ? (
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
              ) : (
                <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-950/90 border border-rose-500/40 text-rose-300">
                  <Lock className="w-2.5 h-2.5" />
                  <span>{effectiveSimulatedUsers}/500</span>
                </span>
              )}
            </button>

            {/* Tab 6: Pazarım */}
            <button
              onClick={() => {
                setActiveTab('market');
                playKitchenSound('click', soundEnabled);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'market'
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Pazarım</span>
              {shoppingList.length > 0 && (
                <span className={`px-1.5 py-0.2 rounded-md text-[11px] ${
                  activeTab === 'market' ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-slate-800 text-amber-400'
                }`}>
                  {shoppingList.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Tab Views */}
        {activeTab === 'pantry' && (
          <PantryTab
            ingredients={ingredients}
            onAddIngredient={handleAddIngredient}
            onAddMultipleIngredients={handleAddMultipleIngredients}
            onRemoveIngredient={handleRemoveIngredient}
            onUpdateAmount={handleUpdateAmount}
            onLoadPreset={handleLoadPreset}
            onGenerateRescueMenu={handleGenerateRescueMenu}
            customApiKey={customApiKey}
            soundEnabled={soundEnabled}
            missingSuggestions={missingSuggestions}
            shoppingList={shoppingList}
            onAddMissingToShoppingList={handleAddMissingToShoppingList}
            onToggleCheckShoppingItem={handleToggleShoppingItem}
            onNavigateToMarket={() => setActiveTab('market')}
            onToast={showToast}
          />
        )}

        {activeTab === 'meals' && (
          <MealsTab
            recipes={recipes}
            ingredients={ingredients}
            onGenerateRecipes={handleGenerateRecipes}
            onCookRecipe={handleCookRecipe}
            onOpenTimer={handleOpenTimer}
            onShareToCommunity={(recipe) => {
              setActiveTab('social');
              showToast(`"${recipe.title}" için topluluk paylaşım penceresi açıldı!`, 'info');
            }}
            onToggleFavoriteRecipe={handleToggleFavoriteRecipe}
            isGenerating={isGeneratingRecipes}
            soundEnabled={soundEnabled}
          />
        )}

        {activeTab === 'diary' && (
          <ChefDiaryTab
            entries={diaryEntries}
            onAddEntry={handleAddDiaryEntry}
            onUpdateEntry={handleUpdateDiaryEntry}
            onDeleteEntry={handleDeleteDiaryEntry}
            onResetPantryToClean={handleResetPantryToClean}
            onResetPantryToDemo={handleResetPantryToDemo}
            onAddShoppingItem={(name) => handleAddShoppingItem(name, 'diger', 1, 'adet', 30, 'manual')}
            soundEnabled={soundEnabled}
            onToast={showToast}
            ingredientsCount={ingredients.length}
          />
        )}

        {activeTab === 'social' && (
          isSocialUnlocked ? (
            <SocialTab
              posts={communityPosts}
              trendingRecipes={trendingRecipes}
              badges={userBadges}
              stats={stats}
              onAddPost={handleAddCommunityPost}
              onLikePost={handleLikeCommunityPost}
              onAddComment={handleAddCommunityComment}
              onSelectTrendingRecipe={handleSelectTrendingRecipe}
              soundEnabled={soundEnabled}
            />
          ) : (
            <LockedTabTeaser
              config={FEATURE_GATES.social}
              userSimulatedCount={effectiveSimulatedUsers}
              soundEnabled={soundEnabled}
              onBypassUnlock={() => {
                handleUpdateAdminSettings({ developerUnlockAll: true });
                playKitchenSound('badge_unlock', soundEnabled);
                showToast('👑 Geliştirici Modu: Topluluk & Trendler kilidi açıldı!', 'success');
              }}
              onToast={showToast}
            />
          )
        )}

        {activeTab === 'chef' && (
          isChefUnlocked ? (
            <ChefStageTab
              masterclasses={masterclasses}
              hacks={kitchenHacks}
              deals={sponsoredDeals}
              onToggleRegister={handleToggleRegisterMasterclass}
              onLikeHack={handleLikeHack}
              onToggleFavoriteHack={handleToggleFavoriteHack}
              soundEnabled={soundEnabled}
            />
          ) : (
            <LockedTabTeaser
              config={FEATURE_GATES.chef}
              userSimulatedCount={effectiveSimulatedUsers}
              soundEnabled={soundEnabled}
              onBypassUnlock={() => {
                handleUpdateAdminSettings({ developerUnlockAll: true });
                playKitchenSound('badge_unlock', soundEnabled);
                showToast('👑 Geliştirici Modu: Şef Sahnesi & Masterclass kilidi açıldı!', 'success');
              }}
              onToast={showToast}
            />
          )
        )}

        {activeTab === 'market' && (
          <MarketTab
            shoppingList={shoppingList}
            missingSuggestions={missingSuggestions}
            monthlySavings={monthlySavings}
            onToggleShoppingItem={handleToggleShoppingItem}
            onRemoveShoppingItem={handleRemoveShoppingItem}
            onAddShoppingItem={handleAddShoppingItem}
            onRestockCheckedItems={handleRestockCheckedItems}
            onAddMissingToShoppingList={handleAddMissingToShoppingList}
            onRefreshMissingSuggestions={handleRefreshMissingSuggestions}
            isRefreshingMissing={isRefreshingMissing}
            soundEnabled={soundEnabled}
          />
        )}
      </main>

      {/* Floating Action Button for Quick Cooking Timer */}
      <div className="fixed bottom-6 left-6 z-40">
        <button
          type="button"
          onClick={() => handleOpenTimer(15, 'Mutfak Zamanlayıcısı')}
          className="p-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 rounded-2xl shadow-2xl shadow-amber-500/30 flex items-center gap-2 font-black text-xs transition-all hover:scale-105 active:scale-95"
          title="Pişirme Sayacını Aç"
        >
          <Timer className="w-5 h-5 stroke-[2.5]" />
          <span className="hidden sm:inline">Sayaç & Alarm</span>
        </button>
      </div>

      {/* Floating Dedicated Cooking Timer Modal */}
      {timerModalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4">
            <CookingTimer
              isOpen={timerModalState.isOpen}
              initialMinutes={timerModalState.minutes}
              label={timerModalState.label}
              onClose={() => setTimerModalState((prev) => ({ ...prev, isOpen: false }))}
              soundEnabled={soundEnabled}
            />
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 duration-300">
          <div className={`flex items-center gap-2.5 px-4 py-3 bg-slate-900/95 border text-slate-100 rounded-2xl shadow-2xl backdrop-blur-md text-xs font-semibold ${
            toastMessage.type === 'error'
              ? 'border-rose-500/40'
              : toastMessage.type === 'warning'
              ? 'border-amber-500/40'
              : toastMessage.type === 'info'
              ? 'border-sky-500/40'
              : 'border-emerald-500/40'
          }`}>
            <CheckCircle className={`w-4 h-4 shrink-0 ${
              toastMessage.type === 'error'
                ? 'text-rose-400'
                : toastMessage.type === 'warning'
                ? 'text-amber-400'
                : toastMessage.type === 'info'
                ? 'text-sky-400'
                : 'text-emerald-400'
            }`} />
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* ESG Eco Impact Story Modal */}
      <EcoImpactStoryModal
        isOpen={isEcoStoryOpen}
        onClose={() => setIsEcoStoryOpen(false)}
        stats={stats}
        badges={userBadges}
        soundEnabled={soundEnabled}
        onToast={showToast}
      />

      {/* API Key Modal */}
      <ApiKeyModal
        isOpen={isKeyModalOpen}
        onClose={() => setIsKeyModalOpen(false)}
        customApiKey={customApiKey}
        onSaveKey={handleSaveApiKey}
      />

      {/* Cloud & Device Sync Modal (Supabase PostgreSQL Realtime) */}
      <AuthSyncModal
        isOpen={isAuthSyncOpen}
        onClose={() => setIsAuthSyncOpen(false)}
        onToast={showToast}
        ingredients={ingredients}
        shoppingList={shoppingList}
        diaries={diaryEntries}
        recipes={recipes}
        stats={stats}
        onPerformFullSync={() => {
          syncPantryToSupabase(ingredients);
          syncShoppingToSupabase(shoppingList);
          syncDiariesToSupabase(diaryEntries);
          syncRecipesToSupabase(recipes);
          syncStatsToSupabase(stats);
        }}
        soundEnabled={soundEnabled}
      />

      {/* Super Admin Control Tower Modal */}
      <AdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        settings={adminSettings}
        onUpdateSettings={handleUpdateAdminSettings}
        ingredients={ingredients}
        diaryEntries={diaryEntries}
        stats={stats}
        soundEnabled={soundEnabled}
        onToast={showToast}
      />

      {/* Floating Alpha Test Mode & Feedback Logger */}
      <AlphaFeedbackModal
        soundEnabled={soundEnabled}
        developerUnlockAll={developerUnlockAll}
        onToggleDeveloperUnlock={setDeveloperUnlockAll}
        simulatedUserCount={simulatedUserCount}
        onUpdateSimulatedUserCount={setSimulatedUserCount}
        ingredients={ingredients}
        recipes={recipes}
        settings={adminSettings}
        stats={stats}
        diaryEntries={diaryEntries}
        onToast={showToast}
      />

      {/* Interactive Tour Guide Modal */}
      <TourGuide
        isOpen={isTourGuideOpen}
        onClose={() => {
          setIsTourGuideOpen(false);
          if (typeof window !== 'undefined') {
            localStorage.setItem('kitchzero_tour_seen', 'true');
          }
        }}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          playKitchenSound('click', soundEnabled);
        }}
        soundEnabled={soundEnabled}
      />
    </div>
  );
}
