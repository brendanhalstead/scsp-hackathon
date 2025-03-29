
import { AnalysisResult, Claim, Source, SourceCategory } from '@/types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Generates realistic mock claims based on the search query
 * This allows testing the application without expensive API costs
 */
export const generateMockClaims = (query: string): Claim[] => {
  // Base set of claims that will be returned regardless of query
  const baseTwitterClaims: Claim[] = [
    {
      id: uuidv4(),
      source: 'twitter',
      text: `Повідомляють про серйозні пошкодження інфраструктури в Харківській області після останніх обстрілів. Місцева влада закликає до евакуації цивільних з прикордонних районів.`,
      summary: `Reports of significant infrastructure damage in Kharkiv region after recent shelling. Local authorities urging civilian evacuation from border areas.`,
      sentiment: 'negative',
      relevanceScore: 0.94,
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      username: 'UkrInform',
      platform: 'Twitter',
      followers: 780000,
      category: 'government',
      language: 'uk',
      verified: true,
      region: 'Kharkiv'
    },
    {
      id: uuidv4(),
      source: 'twitter',
      text: `Зенітні підрозділи Повітряних сил збили 11 із 16 безпілотників "Шахед" та 2 крилаті ракети минулої ночі. Протиповітряна оборона працювала в кількох областях.`,
      summary: `Air defense units intercepted 11 of 16 Shahed drones and 2 cruise missiles overnight. Air defense systems were active across several regions.`,
      sentiment: 'positive',
      relevanceScore: 0.88,
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      username: 'GeneralStaff_UA',
      platform: 'Twitter',
      followers: 450000,
      category: 'military_affiliated',
      language: 'uk',
      verified: true,
      region: 'Multiple'
    },
    {
      id: uuidv4(),
      source: 'twitter',
      text: `Надзвичайна гуманітарна ситуація у Вовчанську. Волонтери повідомляють про нестачу питної води та медикаментів. Необхідна термінова допомога.`,
      summary: `Critical humanitarian situation in Vovchansk. Volunteers report shortages of drinking water and medical supplies. Urgent aid needed.`,
      sentiment: 'negative',
      relevanceScore: 0.92,
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      username: 'Humanitarian_Aid',
      platform: 'Twitter',
      followers: 125000,
      category: 'independent_journalist',
      language: 'uk',
      verified: false,
      region: 'Kharkiv'
    },
    {
      id: uuidv4(),
      source: 'twitter',
      text: `Ситуація на сході залишається напруженою. За останню добу зафіксовано 78 обстрілів у напрямку Лиману та Куп'янська. Наші захисники тримають оборону.`,
      summary: `Situation in the east remains tense. 78 shellings recorded in the direction of Lyman and Kupyansk in the past day. Our defenders are holding the defense.`,
      sentiment: 'neutral',
      relevanceScore: 0.87,
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      username: 'WarMonitor',
      platform: 'Twitter',
      followers: 340000,
      category: 'independent_journalist',
      language: 'uk',
      verified: true,
      region: 'Donetsk'
    }
  ];

  const baseTelegramClaims: Claim[] = [
    {
      id: uuidv4(),
      source: 'telegram',
      text: `Термінове повідомлення: в результаті ударів по енергетичній інфраструктурі можливі відключення електроенергії в Дніпропетровській та Запорізькій областях. Будьте готові та зарядіть пристрої.`,
      summary: `Urgent alert: Power outages possible in Dnipropetrovsk and Zaporizhzhia regions due to energy infrastructure strikes. Be prepared and charge devices.`,
      sentiment: 'negative',
      relevanceScore: 0.96,
      timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      username: 'Emergency_Channel',
      platform: 'Telegram',
      followers: 1250000,
      category: 'government',
      language: 'uk',
      region: 'Dnipropetrovsk'
    },
    {
      id: uuidv4(),
      source: 'telegram',
      text: `Сьогодні відбулася відправка чергової партії гуманітарної допомоги у звільнені території. 5 вантажівок з продуктами, водою та генераторами вирушили до Херсонської області.`,
      summary: `Another batch of humanitarian aid dispatched to liberated territories today. 5 trucks with food, water, and generators headed to Kherson region.`,
      sentiment: 'positive',
      relevanceScore: 0.81,
      timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      username: 'VolunteersUnited',
      platform: 'Telegram',
      followers: 85000,
      category: 'independent_journalist',
      language: 'uk',
      region: 'Kherson'
    },
    {
      id: uuidv4(),
      source: 'telegram',
      text: `Увага! Термінова евакуація з населених пунктів: Торецьк, Часів Яр, Костянтинівка. Збір о 09:00 біля міської адміністрації. З собою мати документи та найнеобхідніші речі.`,
      summary: `Attention! Urgent evacuation from settlements: Toretsk, Chasiv Yar, Kostiantynivka. Assembly at 09:00 near city administration. Bring documents and essential items.`,
      sentiment: 'negative',
      relevanceScore: 0.98,
      timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      username: 'Evacuation_Donetsk',
      platform: 'Telegram',
      followers: 320000,
      category: 'government',
      language: 'uk',
      region: 'Donetsk'
    },
    {
      id: uuidv4(),
      source: 'telegram',
      text: `Аналіз супутникових знімків виявив переміщення військової техніки в напрямку Бєлгородської області. Можливе посилення ворожого угруповання на північно-східному напрямку.`,
      summary: `Satellite imagery analysis reveals military equipment movement toward Belgorod region. Possible reinforcement of enemy forces in northeastern direction.`,
      sentiment: 'neutral',
      relevanceScore: 0.89,
      timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      username: 'Intel_Observer',
      platform: 'Telegram',
      followers: 430000,
      category: 'military_affiliated',
      language: 'uk',
      region: 'Belgorod Border'
    },
    {
      id: uuidv4(),
      source: 'telegram',
      text: `Місцеві жителі повідомляють про сильні вибухи в районі Скадовська. Офіційного підтвердження поки немає. Чекаємо на інформацію від військової адміністрації.`,
      summary: `Local residents report powerful explosions in Skadovsk area. No official confirmation yet. Awaiting information from military administration.`,
      sentiment: 'neutral',
      relevanceScore: 0.77,
      timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      username: 'LocalNews_Kherson',
      platform: 'Telegram',
      followers: 58000,
      category: 'local_source',
      language: 'uk',
      region: 'Kherson'
    }
  ];

  // If the query is very specific, add a few query-specific claims
  const queryLower = query.toLowerCase();
  const querySpecificClaims: Claim[] = [];

  // Handle queries related to specific regions
  if (queryLower.includes('kharkiv') || queryLower.includes('харків')) {
    querySpecificClaims.push({
      id: uuidv4(),
      source: Math.random() > 0.5 ? 'twitter' : 'telegram',
      text: `Нові дані про ситуацію в Харківській області: населені пункти поблизу кордону регулярно обстрілюються, проте лінія фронту залишається стабільною.`,
      summary: `New data on the situation in Kharkiv region: settlements near the border are regularly shelled, but the front line remains stable.`,
      sentiment: 'neutral',
      relevanceScore: 0.93,
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      username: 'Kharkiv_Updates',
      platform: Math.random() > 0.5 ? 'Twitter' : 'Telegram',
      followers: 230000,
      category: 'local_source',
      language: 'uk',
      verified: false,
      region: 'Kharkiv'
    });
  }

  // Handle queries related to evacuations
  if (queryLower.includes('evacuat') || queryLower.includes('евакуац')) {
    querySpecificClaims.push({
      id: uuidv4(),
      source: Math.random() > 0.5 ? 'twitter' : 'telegram',
      text: `Оновлення щодо евакуації: сьогодні з небезпечних районів вивезено понад 300 цивільних, включаючи 45 дітей. Евакуація триває.`,
      summary: `Evacuation update: More than 300 civilians, including 45 children, were evacuated from dangerous areas today. Evacuation ongoing.`,
      sentiment: 'positive',
      relevanceScore: 0.91,
      timestamp: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      username: 'Evacuation_Coordinator',
      platform: Math.random() > 0.5 ? 'Twitter' : 'Telegram',
      followers: 178000,
      category: 'government',
      language: 'uk',
      verified: true,
      region: 'Multiple'
    });
  }

  // Handle queries related to humanitarian aid
  if (queryLower.includes('aid') || queryLower.includes('humanitarian') || queryLower.includes('гуманітар')) {
    querySpecificClaims.push({
      id: uuidv4(),
      source: Math.random() > 0.5 ? 'twitter' : 'telegram',
      text: `Міжнародні організації збільшують обсяги гуманітарної допомоги для постраждалих регіонів. Цього тижня очікується прибуття 20 вантажівок з медикаментами та продуктами.`,
      summary: `International organizations are increasing humanitarian aid for affected regions. 20 trucks with medicines and food are expected to arrive this week.`,
      sentiment: 'positive',
      relevanceScore: 0.86,
      timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      username: 'HumanitarianAid_UA',
      platform: Math.random() > 0.5 ? 'Twitter' : 'Telegram',
      followers: 195000,
      category: 'independent_journalist',
      language: 'uk',
      verified: false,
      region: 'Kyiv'
    });
  }

  return [...baseTwitterClaims, ...baseTelegramClaims, ...querySpecificClaims];
};

/**
 * Analyzes social media data using mock data
 * This avoids expensive API calls during development or when API keys are unavailable
 */
export const analyzeSocialMedia = async (query: string): Promise<AnalysisResult> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  const claims = generateMockClaims(query);
  
  // Calculate sentiment breakdown
  const sentimentCounts = claims.reduce(
    (acc, claim) => {
      acc[claim.sentiment] += 1;
      return acc;
    },
    { positive: 0, negative: 0, neutral: 0 }
  );
  
  // Calculate source breakdown
  const sourceCounts = claims.reduce(
    (acc, claim) => {
      acc[claim.source] += 1;
      return acc;
    },
    { twitter: 0, telegram: 0 } as Record<Source, number>
  );

  // Calculate source categories
  const categoryBreakdown = claims.reduce(
    (acc, claim) => {
      if (claim.category) {
        acc[claim.category] = (acc[claim.category] || 0) + 1;
      }
      return acc;
    },
    {} as Record<SourceCategory, number>
  );

  // Calculate region breakdown
  const regionBreakdown = claims.reduce(
    (acc, claim) => {
      if (claim.region) {
        acc[claim.region] = (acc[claim.region] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>
  );

  // Generate key terms
  const keyTerms = [
    "обстріли", "евакуація", "гуманітарна допомога", "протиповітряна оборона", 
    "енергетична інфраструктура", "військова техніка", "Харківська область", 
    "Донецька область", "Херсонська область"
  ];
  
  // Add query-specific terms
  if (query) {
    keyTerms.push(query);
  }
  
  return {
    claims,
    totalPosts: claims.length + Math.floor(Math.random() * 50), // Simulate additional posts that weren't returned
    sources: sourceCounts,
    sentimentBreakdown: sentimentCounts,
    sourceCategories: categoryBreakdown,
    keyTerms: keyTerms,
    regions: regionBreakdown
  };
};
