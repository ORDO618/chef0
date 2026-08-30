'use client';

import React, { useState } from 'react';
import {
  Users,
  Award,
  Flame,
  Heart,
  MessageCircle,
  Share2,
  TrendingUp,
  Plus,
  Send,
  Sparkles,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Leaf,
  Trophy,
  ChefHat,
  Camera,
  Image as ImageIcon,
  Clock,
  ThumbsUp,
} from 'lucide-react';
import { CommunityPost, TrendingRecipe, UserBadge, ZeroWasteStats, Recipe } from '@/lib/types';
import { playKitchenSound } from '@/lib/sound';
import { triggerConfetti } from '@/lib/confetti';

interface SocialTabProps {
  posts: CommunityPost[];
  trendingRecipes: TrendingRecipe[];
  badges: UserBadge[];
  stats: ZeroWasteStats;
  onAddPost: (post: Omit<CommunityPost, 'id' | 'likesCount' | 'comments' | 'timeAgo'>) => void;
  onLikePost: (postId: string) => void;
  onAddComment: (postId: string, commentText: string) => void;
  onSelectTrendingRecipe: (trendingTitle: string) => void;
  soundEnabled: boolean;
}

export function SocialTab({
  posts,
  trendingRecipes,
  badges,
  stats,
  onAddPost,
  onLikePost,
  onAddComment,
  onSelectTrendingRecipe,
  soundEnabled,
}: SocialTabProps) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [openComments, setOpenComments] = useState<Record<string, boolean>>({});

  // Share form state
  const [newTitle, setNewTitle] = useState('');
  const [newCaption, setNewCaption] = useState('');
  const [newIngredients, setNewIngredients] = useState('');
  const [newEquipment, setNewEquipment] = useState<'Airfryer' | 'Fırın' | 'Ocak' | 'Tencere'>('Airfryer');
  const [newMoneySaved, setNewMoneySaved] = useState<number>(75);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);

  const SAMPLE_FOOD_IMAGES = [
    { url: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800&auto=format&fit=crop&q=80', label: 'Airfryer Menemen & Sebze' },
    { url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80', label: 'Tavuklu & Sebzeli Fit Kase' },
    { url: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800&auto=format&fit=crop&q=80', label: 'Şekersiz Muzlu Yulaf Kurabiye' },
    { url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&auto=format&fit=crop&q=80', label: 'İpeksi Detoks Çorba' },
    { url: 'https://images.unsplash.com/photo-1510693206972-df098062cb71?w=800&auto=format&fit=crop&q=80', label: 'Akdeniz Usulü Frittata' },
  ];

  const handlePublishPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newCaption.trim()) return;

    const ingArray = newIngredients
      .split(',')
      .map((i) => i.trim())
      .filter(Boolean);

    onAddPost({
      authorName: 'Şef Serhan Alpler',
      authorRole: 'Sıfır İsraf Şampiyonu',
      authorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      recipeTitle: newTitle.trim(),
      caption: newCaption.trim(),
      imageUrl: SAMPLE_FOOD_IMAGES[selectedImageIndex].url,
      savedIngredients: ingArray.length > 0 ? ingArray : ['Evdeki Kalan Malzemeler'],
      equipmentUsed: newEquipment,
      moneySavedTl: newMoneySaved || 75,
      tags: ['Sıfırİsraf', 'KitchZero', newEquipment, 'GıdaKurtarma'],
    });

    triggerConfetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#10b981', '#f59e0b', '#3b82f6'],
    });

    playKitchenSound('badge_unlock', soundEnabled);
    setShowShareModal(false);
    setNewTitle('');
    setNewCaption('');
    setNewIngredients('');
  };

  const handleSendComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;
    onAddComment(postId, text);
    playKitchenSound('pop', soundEnabled);
    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  const toggleCommentsDrawer = (postId: string) => {
    setOpenComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
    playKitchenSound('click', soundEnabled);
  };

  const unlockedBadgesCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* User Eco Profile & Badges Showcase Strip */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
        
        {/* Profile Card Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500 to-amber-400 p-0.5 shadow-lg shadow-emerald-500/20">
                <div className="w-full h-full rounded-2xl bg-slate-950 flex items-center justify-center text-xl font-black text-emerald-400">
                  ŞS
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[10px] font-black border-2 border-slate-950">
                4
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-100">Şef Serhan Alpler</h2>
                <span className="px-2.5 py-0.5 text-[10px] font-extrabold uppercase rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Gezegen Koruyucusu (Seviye 4)
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Toplulukta gıda israfını önleyen <strong>12.400+ şef</strong> arasındasınız.
              </p>
            </div>
          </div>

          {/* Quick Stats Counter */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Kurtarılan Gıda</div>
              <div className="text-sm font-black text-emerald-400">{stats.ingredientsSaved} Ürün</div>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Tasarruf</div>
              <div className="text-sm font-black text-amber-400">{stats.approxMoneySavedTl} ₺</div>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-500 font-semibold uppercase">Sıfır İsraf Serisi</div>
              <div className="text-sm font-black text-rose-400 flex items-center justify-center gap-1">
                <Flame className="w-3.5 h-3.5 fill-current" /> {stats.streakDays} Gün
              </div>
            </div>
            <div className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-center">
              <div className="text-[10px] text-slate-500 font-semibold uppercase">CO₂ Engeli</div>
              <div className="text-sm font-black text-cyan-400">{stats.co2SavedKg} kg</div>
            </div>
          </div>
        </div>

        {/* Gamified Badges Grid ("Kurtarılan Gıda Rozetleri") */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-bold text-slate-200">Kurtarılan Gıda Rozetleri</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/20 font-bold">
                {unlockedBadgesCount} / {badges.length} Kazanıldı
              </span>
            </div>
            <span className="text-[11px] text-slate-400">Yemek pişirdikçe ve tasarruf ettikçe yeni rozetler açılır</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`p-3 rounded-2xl border transition-all flex flex-col justify-between ${
                  badge.unlocked
                    ? 'bg-slate-950/90 border-amber-500/30 hover:border-amber-500/60 shadow-lg shadow-amber-500/5'
                    : 'bg-slate-950/40 border-slate-800 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-2xl">{badge.icon}</span>
                    {badge.unlocked ? (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                        Açık
                      </span>
                    ) : (
                      <span className="text-[9px] font-medium text-slate-500">%{badge.progressPercent}</span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-200 line-clamp-1">{badge.name}</h4>
                  <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 leading-tight">
                    {badge.description}
                  </p>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-800/80">
                  {badge.unlocked ? (
                    <div className="text-[9px] font-semibold text-amber-300 truncate">
                      🎁 {badge.rewardText}
                    </div>
                  ) : (
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-400 h-full rounded-full"
                        style={{ width: `${badge.progressPercent}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* "Haftanın En Çok Yapılan Yemekleri" (Trending Zero-Waste Leaderboard) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-slate-100">Haftanın En Çok Yapılan Sıfır İsraf Yemekleri</h3>
          </div>
          <span className="text-xs text-slate-400">Türkiye genelinde bu hafta kurtarılan popüler tarifler</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {trendingRecipes.map((trend, idx) => (
            <div
              key={trend.id}
              onClick={() => onSelectTrendingRecipe(trend.title)}
              className="group cursor-pointer bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl overflow-hidden shadow-xl transition-all hover:-translate-y-1"
            >
              {/* Image thumbnail */}
              <div className="relative h-36 w-full bg-slate-950 overflow-hidden">
                <img
                  src={trend.imageUrl}
                  alt={trend.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />
                
                {/* Ranking Tag */}
                <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[10px] font-black uppercase">
                  #{idx + 1} Trend
                </div>

                <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-xs text-slate-200">
                  <span className="font-bold text-emerald-300">🔥 {trend.cookedCountThisWeek} Tabak</span>
                  <span className="text-[10px] text-slate-400">{trend.approxSavedKg} kg kurtarıldı</span>
                </div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-2">
                <h4 className="text-xs font-bold text-slate-100 group-hover:text-amber-300 transition-colors line-clamp-2">
                  {trend.title}
                </h4>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                  <span className="flex items-center gap-1 text-cyan-300">
                    <Zap className="w-3 h-3" /> {trend.primaryEquipment}
                  </span>
                  <span className="text-amber-400 font-bold">★ {trend.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* "Topluluk Tabakları" (Community Plates Feed) */}
      <div className="space-y-6">
        
        {/* Feed Header and Share Trigger */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 bg-slate-900/90 border border-slate-800 rounded-2xl">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-slate-100">Topluluk Tabakları & Paylaşımlar</h3>
              <span className="px-2 py-0.5 text-xs rounded-full bg-slate-800 text-slate-300">Canlı Akış</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Diğer şeflerin dolaplarındaki malzemelerle hazırladığı ilham verici sıfır atık tabakları
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              playKitchenSound('click', soundEnabled);
              setShowShareModal(true);
            }}
            className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black rounded-xl shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Tabağını Paylaş</span>
          </button>
        </div>

        {/* Posts Stream */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => {
            const isCommentsOpen = openComments[post.id];
            const currentComment = commentInputs[post.id] || '';

            return (
              <div
                key={post.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl overflow-hidden shadow-xl transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Post Author Header */}
                  <div className="p-4 flex items-center justify-between border-b border-slate-800/80">
                    <div className="flex items-center gap-3">
                      <img
                        src={post.authorAvatar}
                        alt={post.authorName}
                        className="w-10 h-10 rounded-full object-cover border border-slate-700"
                      />
                      <div>
                        <h4 className="text-xs font-bold text-slate-200">{post.authorName}</h4>
                        <span className="text-[10px] text-emerald-400 font-medium">
                          {post.authorRole || 'Sıfır İsraf Aşçısı'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-500">{post.timeAgo}</span>
                      <div className="text-[10px] font-bold text-amber-400">~{post.moneySavedTl} ₺ Kurtardı</div>
                    </div>
                  </div>

                  {/* Post Image */}
                  <div className="relative h-56 w-full bg-slate-950">
                    <img
                      src={post.imageUrl}
                      alt={post.recipeTitle}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md text-[11px] font-bold text-slate-200 border border-slate-700">
                      ⚡ {post.equipmentUsed}
                    </div>
                  </div>

                  {/* Post Content */}
                  <div className="p-4 space-y-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">{post.recipeTitle}</h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">{post.caption}</p>
                    </div>

                    {/* Rescued Ingredients Badges */}
                    <div className="space-y-1">
                      <div className="text-[10px] uppercase font-bold text-slate-500">Kurtarılan Malzemeler</div>
                      <div className="flex flex-wrap gap-1.5">
                        {post.savedIngredients.map((item, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 text-[10px] font-medium rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-500/30"
                          >
                            ✓ {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Hashtags */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {post.tags.map((tag, idx) => (
                        <span key={idx} className="text-[10px] text-slate-400 hover:text-emerald-400 cursor-pointer">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Post Actions & Comments Drawer */}
                <div className="border-t border-slate-800 bg-slate-950/60 p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {/* Like Button */}
                      <button
                        type="button"
                        onClick={() => {
                          playKitchenSound('like', soundEnabled);
                          onLikePost(post.id);
                        }}
                        className={`flex items-center gap-1.5 text-xs font-bold transition-all ${
                          post.isLiked ? 'text-rose-400 scale-105' : 'text-slate-400 hover:text-rose-400'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current' : ''}`} />
                        <span>{post.likesCount} Beğeni</span>
                      </button>

                      {/* Comments count */}
                      <button
                        type="button"
                        onClick={() => toggleCommentsDrawer(post.id)}
                        className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.comments.length} Yorum</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        playKitchenSound('click', soundEnabled);
                        navigator.clipboard?.writeText(window.location.href);
                        alert('Paylaşım linki panoya kopyalandı!');
                      }}
                      className="text-slate-400 hover:text-slate-200 p-1"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Expandable Comments Drawer */}
                  {isCommentsOpen && (
                    <div className="pt-3 border-t border-slate-800/80 space-y-3 animate-in fade-in duration-150">
                      {post.comments.length > 0 && (
                        <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                          {post.comments.map((c) => (
                            <div key={c.id} className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 text-xs">
                              <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                                <strong className="text-slate-200">{c.authorName}</strong>
                                <span>{c.timestamp}</span>
                              </div>
                              <p className="text-slate-300 leading-snug">{c.text}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Comment Input */}
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={currentComment}
                          onChange={(e) => setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSendComment(post.id);
                          }}
                          placeholder="Yorumunuzu veya tüyolarınızı yazın..."
                          className="flex-1 px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleSendComment(post.id)}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center transition-colors"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* "Tabağını Paylaş" Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-emerald-400" />
                <h3 className="text-base font-bold text-slate-100">Sıfır İsraf Tabağını Paylaş</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowShareModal(false)}
                className="text-slate-400 hover:text-slate-200 text-xs font-bold"
              >
                Kapat
              </button>
            </div>

            <form onSubmit={handlePublishPost} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Yemek / Tarif Adı
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Örn: Köz Domatesli Airfryer Menemeni"
                  className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Açıklama & Mutfak Hikayen
                </label>
                <textarea
                  required
                  rows={3}
                  value={newCaption}
                  onChange={(e) => setNewCaption(e.target.value)}
                  placeholder="Hangi malzemeleri çöp olmaktan kurtardınız? Nasıl lezzet kattınız?"
                  className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kurtarılan Malzemeler (Virgülle)
                  </label>
                  <input
                    type="text"
                    value={newIngredients}
                    onChange={(e) => setNewIngredients(e.target.value)}
                    placeholder="Domates, Biber, Kaşar..."
                    className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Kullanılan Ekipman
                  </label>
                  <select
                    value={newEquipment}
                    onChange={(e) => setNewEquipment(e.target.value as any)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Airfryer">Airfryer</option>
                    <option value="Fırın">Fırın</option>
                    <option value="Ocak">Ocak / Tava</option>
                    <option value="Tencere">Tencere</option>
                  </select>
                </div>
              </div>

              {/* Image selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Fotoğraf Seçimi
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {SAMPLE_FOOD_IMAGES.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`cursor-pointer rounded-xl overflow-hidden border-2 h-14 transition-all ${
                        selectedImageIndex === idx
                          ? 'border-emerald-400 ring-2 ring-emerald-500/50'
                          : 'border-slate-800 opacity-60'
                      }`}
                    >
                      <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20"
                >
                  Paylaşımı Yayınla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
