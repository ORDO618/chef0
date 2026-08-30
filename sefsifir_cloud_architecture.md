# ŞEFSISIR / CHEFZERO — BULUT VE ÇOKLU CİHAZ SENKRONİZASYON MİMARİSİ

## 1. Veri Modeli ve Tablo Şeması (Supabase PostgreSQL)
- **profiles:** id (uuid, PK), email, full_name, role ('admin' | 'user'), simulated_user_count, created_at
- **pantry_items:** id (uuid, PK), user_id (FK), name, amount, unit, category, days_until_expiry, is_priority, notes, updated_at
- **recipes:** id (uuid, PK), user_id (FK), title, category, prep_time_minutes, cook_time_minutes, is_favorite, is_cooked, recipe_data (jsonb), created_at
- **shopping_items:** id (uuid, PK), user_id (FK), name, amount, unit, category, checked, source, estimated_price_tl, created_at
- **chef_diaries:** id (uuid, PK), user_id (FK), log_date, title, notes, meal_tags, mood, shopping_action_items, created_at
- **zero_waste_stats:** user_id (PK, FK), meals_cooked, ingredients_saved, approx_money_saved_tl, co2_saved_kg, water_saved_liters, streak_days, updated_at

## 2. Senkronizasyon Kuralı
- Tüm istemci (Client) okuma/yazma işlemleri önce yerel durumu anlık günceller (Optimistic Update), ardından Supabase istemcisiyle buluta yazar.
- Supabase Realtime Channels üzerinden gelen değişiklikler state'i anında günceller.
- Çevrimdışı / Offline modda yerel LocalStorage tam desteklenir ve oturum açıldığında veriler otomatik birleştirilir (Smart Merge).
