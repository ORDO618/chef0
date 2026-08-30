/**
 * Feature Gating & Gradual Rollout Architecture for ŞefSıfır / ChefZero
 * Defines phased unlocking thresholds, active user targets, and teaser showcases.
 */

export interface FeatureGateConfig {
  id: 'social' | 'chef' | 'expert';
  phaseNumber: number;
  title: string;
  shortTitle: string;
  targetCount: number;
  currentCount: number;
  badgeLabel: string;
  tagline: string;
  description: string;
  highlights: Array<{
    title: string;
    description: string;
    iconName: 'camera' | 'award' | 'flame' | 'video' | 'sparkles' | 'gift' | 'heartHandshake';
  }>;
}

export const FEATURE_GATES: Record<'social' | 'chef' | 'expert', FeatureGateConfig> = {
  social: {
    id: 'social',
    phaseNumber: 2,
    title: 'Topluluk & Trendler Lansmanı',
    shortTitle: 'Topluluk',
    targetCount: 100,
    currentCount: 61,
    badgeLabel: '100 Aktif Şefe Ulaşıldığında Açılacak',
    tagline: 'Mutfaktaki sıfır atık başarılarını paylaş, komşularla yarış ve rozetleri topla.',
    description: 'Boş bir sosyal akış yerine, ilk 100 öncü şefimiz aramıza katıldığında topluluk beslemesi aktif hale gelecektir. Şimdiden yerinizi ayırtın!',
    highlights: [
      {
        title: 'Şef Tabaklarını & Kurtarılanları Paylaş',
        description: 'Dolabından kurtardığın yaratıcı tariflerin fotoğraflarını yayınla, topluluktan beğeni ve yorum topla.',
        iconName: 'camera',
      },
      {
        title: 'Sıfır İsraf Rozetleri & İtibar',
        description: 'Kurtardığın her kilogram malzeme ve karbon tasarrufu ile seviye atla, liderlik tablosuna adını yazdır.',
        iconName: 'award',
      },
      {
        title: 'Günün En Çok Beğenilen Menüleri',
        description: 'Topluluğun en lezzetli bulduğu sıfır atık tariflerini tek tıkla kendi dolabındaki malzemelere uyarla.',
        iconName: 'flame',
      },
    ],
  },
  chef: {
    id: 'chef',
    phaseNumber: 3,
    title: 'Şef Sahnesi & Masterclass Lansmanı',
    shortTitle: 'Şef Sahnesi',
    targetCount: 500,
    currentCount: 61,
    badgeLabel: '500 Aktif Şefe Ulaşıldığında Açılacak',
    tagline: 'Usta şeflerden canlı yayınlar, 60 saniyelik video mutfak hileleri ve özel kuponlar.',
    description: 'Profesyonel şeflerin katılımıyla gerçekleşecek interaktif mutfak yayınları ve video ipuçları 500 aktif şef hedefimize ulaştığımızda kapılarını açacak.',
    highlights: [
      {
        title: 'İnteraktif Canlı Mutfak Masterclass’ları',
        description: 'Michelin deneyimli şefler ve biyo-beslenme uzmanlarıyla canlı yayında eş zamanlı yemek pişirme.',
        iconName: 'video',
      },
      {
        title: '60 Saniye Pratik Mutfak Hileleri',
        description: 'Bıçak bilemeden sebze saplarını değerlendirmeye, mikro video formatında hap bilgiler.',
        iconName: 'sparkles',
      },
      {
        title: 'Özel Şef Ekipman & Tohum Kuponları',
        description: 'Sponsorlu akıllı mutfak aletleri, organik tohum setleri ve atıksız saklama kaplarında %40’a varan indirimler.',
        iconName: 'gift',
      },
    ],
  },
  expert: {
    id: 'expert',
    phaseNumber: 4,
    title: 'Birebir Uzman & Diyetisyen Ekosistemi',
    shortTitle: 'Uzman Paneli',
    targetCount: 2000,
    currentCount: 61,
    badgeLabel: '2.000 Aktif Şefe Ulaşıldığında Açılacak',
    tagline: 'Kişiselleştirilmiş kan tahlili odaklı diyetisyen desteği ve B2B kurumsal entegrasyonlar.',
    description: 'Metabolik sağlık ve sıfır israfı birleştiren birebir uzman konsültasyon sistemi 2.000 aktif kullanıcı sonrasında devreye alınacaktır.',
    highlights: [
      {
        title: 'Birebir Fonksiyonel Beslenme Danışmanlığı',
        description: 'Metabolik hedeflerinize ve dolabınıza özel diyetisyen eşleşmesi.',
        iconName: 'heartHandshake',
      },
    ],
  },
};
