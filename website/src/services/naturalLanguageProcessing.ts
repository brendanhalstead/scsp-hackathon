// This file contains functions for natural language processing
import { Claim, ClusterType } from '@/types';

/**
 * Dummy sentiment analysis function - just returns neutral since we're removing sentiment analysis
 */
export const analyzeSentiment = (text: string): 'positive' | 'negative' | 'neutral' => {
  // We're removing sentiment analysis as requested, so we'll just return neutral
  return 'neutral';
};

/**
 * Creates a summary of the text using extractive summarization technique
 */
export const generateSummary = (text: string, maxLength = 150): string => {
  // This is a simplified extractive summarization.
  // In a real system, you'd use a proper NLP library or ML model
  
  if (text.length <= maxLength) return text;
  
  // Split into sentences
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  
  if (sentences.length <= 1) {
    return text.substring(0, maxLength) + '...';
  }
  
  // Score sentences based on position and keyword presence
  const keywordImportance: Record<string, number> = {
    'військов': 2,
    'обстріл': 2,
    'атак': 2,
    'оборон': 1.5,
    'сил': 1.5,
    'україн': 1.5,
    'росі': 1.5,
    'зброї': 1.8,
    'міністер': 1.3,
    'президент': 1.3,
    'втрат': 1.7,
  };
  
  const scoredSentences = sentences.map((sentence, index) => {
    // Position score: first sentences are more important
    let score = 1.0 - (index / sentences.length) * 0.5;
    
    // Keyword score: important keywords increase score
    Object.entries(keywordImportance).forEach(([keyword, importance]) => {
      if (sentence.toLowerCase().includes(keyword)) {
        score += importance;
      }
    });
    
    return { sentence, score };
  });
  
  // Sort sentences by score
  scoredSentences.sort((a, b) => b.score - a.score);
  
  // Select top sentences
  let summary = '';
  let i = 0;
  
  while (summary.length < maxLength && i < scoredSentences.length) {
    summary += scoredSentences[i].sentence + ' ';
    i++;
  }
  
  return summary.trim();
};

/**
 * Extracts key terms from a set of claims with enhanced declension support
 */
export const extractKeyTerms = (claims: Claim[], count = 15): string[] => {
  // Count term frequencies (simplified approach)
  const termFrequency: Record<string, number> = {};
  const stopWords = new Set([
    'і', 'в', 'на', 'з', 'до', 'що', 'не', 'та', 'за', 'у', 
    'як', 'від', 'про', 'але', 'по', 'це', 'при', 'так', 'щоб',
    'and', 'the', 'to', 'in', 'of', 'for', 'with', 'that', 'is', 'are'
  ]);
  
  // Ukrainian and Russian word stem mappings for declensions - EXPANDED
  const stemMappings: Record<string, string[]> = {
    // Ukrainian stems and their declension forms
    'військов': ['військовий', 'військових', 'військові', 'військовими', 'військову', 'військова', 'військове', 'військовим', 'військовому'],
    'обстріл': ['обстріли', 'обстрілів', 'обстрілами', 'обстрілу', 'обстрілом', 'обстрілам', 'обстрілах'],
    'атак': ['атака', 'атаки', 'атакам', 'атакою', 'атакували', 'атакує', 'атаці', 'атаках', 'атакуватиме'],
    'оборон': ['оборона', 'оборону', 'обороні', 'обороною', 'оборони', 'обороною', 'оборонної', 'оборонців', 'обороняють'],
    'евакуац': ['евакуація', 'евакуації', 'евакуацію', 'евакуацією', 'евакуаційні', 'евакуаційного', 'евакуйовані', 'евакуйованих'],
    'територ': ['територія', 'території', 'територій', 'територіальний', 'територіальна', 'територіальні', 'територіального', 'територіальну'],
    'зброя': ['зброї', 'зброю', 'зброєю', 'озброєння', 'озброєнні', 'озброєнням'],
    'місто': ['міста', 'місті', 'містом', 'містах', 'містами', 'містян', 'міське'],
    'війн': ['війна', 'війни', 'війну', 'війною', 'війні', 'війнах'],
    'переговор': ['переговори', 'переговорів', 'переговорам', 'переговорами', 'переговорах'],
    'біженц': ['біженці', 'біженців', 'біженцям', 'біженцями', 'біженцях'],
    'допомог': ['допомога', 'допомоги', 'допомозі', 'допомогу', 'допомогою'],
    'укр': ['україна', 'україни', 'україні', 'україну', 'українці', 'українців', 'українцям', 'українським', 'українська'],
    
    // Russian stems and their declension forms
    'военн': ['военный', 'военная', 'военное', 'военные', 'военных', 'военным', 'военными', 'военного', 'военному', 'военной'],
    'обстрел': ['обстрелы', 'обстрелов', 'обстрелами', 'обстрелу', 'обстрелом', 'обстрелах', 'обстреляли', 'обстреливают'],
    'атак_ru': ['атака', 'атаки', 'атаке', 'атаку', 'атакой', 'атакуют', 'атаковать', 'атаками', 'атакам', 'атакован'],
    'оборон_ru': ['оборона', 'обороны', 'обороне', 'оборону', 'обороной', 'обороняются', 'оборонительный', 'оборонительная'],
    'эвакуац': ['эвакуация', 'эвакуации', 'эвакуацию', 'эвакуацией', 'эвакуационный', 'эвакуированы', 'эвакуированных'],
    'территор': ['территория', 'территории', 'территорию', 'территорией', 'территориальный', 'территориальные', 'территориального'],
    'оружие': ['оружия', 'оружию', 'оружием', 'вооружение', 'вооружения', 'вооружении', 'вооружением'],
    'город': ['города', 'городу', 'городом', 'городах', 'городами', 'городской', 'городское'],
    'войн': ['война', 'войны', 'войне', 'войну', 'войной'],
    'переговор_ru': ['переговоры', 'переговоров', 'переговорам', 'переговорами', 'переговорах'],
    'беженц': ['беженцы', 'беженцев', 'беженцам', 'беженцами', 'беженцах'],
    'помощ': ['помощь', 'помощи', 'помощью', 'помогают', 'помогли'],
    'рос': ['россия', 'россии', 'россию', 'российский', 'российская', 'российские', 'российских']
  };
  
  // Reverse mapping for word normalization
  const wordToStem: Record<string, string> = {};
  Object.entries(stemMappings).forEach(([stem, words]) => {
    words.forEach(word => {
      wordToStem[word.toLowerCase()] = stem;
    });
    // Also add the stem itself
    wordToStem[stem.toLowerCase()] = stem;
  });
  
  claims.forEach(claim => {
    const words = claim.text.toLowerCase()
      .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !stopWords.has(word));
    
    words.forEach(word => {
      // Check if this word has a stem mapping
      const stem = wordToStem[word] || word;
      termFrequency[stem] = (termFrequency[stem] || 0) + 1;
    });
  });
  
  // Sort terms by frequency and return top terms
  return Object.entries(termFrequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, count)
    .map(entry => entry[0]);
};

/**
 * Identify regions mentioned in the claims
 */
export const extractRegions = (claims: Claim[]): Record<string, number> => {
  // Enhanced region detection - uses both explicit region tags and text analysis
  const regionMentions: Record<string, number> = {};
  const regionKeywords: Record<string, string[]> = {
    'Київ': ['київ', 'київська', 'столиц', 'киев', 'киевская'],
    'Харків': ['харків', 'харьков', 'харківськ', 'харьковск'],
    'Одеса': ['одес', 'одесса', 'одеськ', 'одесск'],
    'Львів': ['львів', 'львов', 'львівськ', 'львовск'],
    'Донбас': ['донбас', 'донецьк', 'луганськ', 'донбасс', 'донецк', 'луганск'],
    'Крим': ['крим', 'крым', 'кримськ', 'крымск'],
    'Херсон': ['херсон', 'херсонськ', 'херсонск'],
    'Маріуполь': ['маріуполь', 'мариуполь', 'маріупольськ', 'мариупольск'],
    'Запоріжжя': ['запоріжжя', 'запоріз', 'запорож', 'запорожье'],
    'Миколаїв': ['миколаїв', 'николаев', 'миколаївськ', 'николаевск'],
    'Чернігів': ['чернігів', 'чернигов', 'чернігівськ', 'черниговск'],
    'Суми': ['суми', 'сумы', 'сумськ', 'сумск'],
    'Житомир': ['житомир', 'житомирськ', 'житомирск'],
    'Полтава': ['полтав', 'полтавськ', 'полтавск'],
    'Дніпро': ['дніпро', 'днепр', 'дніпропетровськ', 'днепропетровск'],
    'Вінниця': ['вінниц', 'винниц', 'вінницьк', 'винницк']
  };
  
  // First, count explicit region mentions in the claim.region property
  claims.forEach(claim => {
    if (claim.region) {
      regionMentions[claim.region] = (regionMentions[claim.region] || 0) + 1;
    }
  });
  
  // Then, scan claim text for regional keywords
  claims.forEach(claim => {
    const textLower = claim.text.toLowerCase();
    
    Object.entries(regionKeywords).forEach(([region, keywords]) => {
      for (const keyword of keywords) {
        if (textLower.includes(keyword)) {
          regionMentions[region] = (regionMentions[region] || 0) + 1;
          break; // Only count once per claim
        }
      }
    });
  });
  
  return regionMentions;
};

/**
 * Named Entity Recognition - identifies people, organizations, and locations
 * This is a simplified version - real NER would use a trained model
 */
export const extractEntities = (claims: Claim[]) => {
  const people: Record<string, number> = {};
  const organizations: Record<string, number> = {};
  const locations: Record<string, number> = {};
  
  // Very simplified named entity patterns (would use real NER in production)
  const personPatterns = [
    /Зеленськ[ий|ого|ому]/, /Путін[а|у|ом]?/, /Байден[а|у|ом]?/,
    /Шольц[а|у|ом]?/, /Макрон[а|у|ом]?/, /Джонсон[а|у|ом]?/,
    /Столтенберг[а|у|ом]?/, /Шойгу/, /Резніков[а|у|ом]?/
  ];
  
  const organizationPatterns = [
    /НАТО/, /ООН/, /Європейськ[ий|ого|ому] Союз[у|і]?/, /ЄС/,
    /Червон[ий|ого|ому] Хрест/, /ЗСУ/, /Міністерств[о|а|ом]/,
    /Верховн[а|ої|ій] Рад[а|и|ою]/, /Кремль/, /Пентагон/
  ];
  
  const locationPatterns = Object.keys(extractRegions(claims))
    .map(region => new RegExp(region, 'i'));
  
  claims.forEach(claim => {
    // Check for people
    personPatterns.forEach(pattern => {
      const match = claim.text.match(pattern);
      if (match) {
        const person = match[0];
        people[person] = (people[person] || 0) + 1;
      }
    });
    
    // Check for organizations
    organizationPatterns.forEach(pattern => {
      const match = claim.text.match(pattern);
      if (match) {
        const org = match[0];
        organizations[org] = (organizations[org] || 0) + 1;
      }
    });
    
    // Check for locations
    locationPatterns.forEach(pattern => {
      const match = claim.text.match(pattern);
      if (match) {
        const location = match[0];
        locations[location] = (locations[location] || 0) + 1;
      }
    });
  });
  
  return {
    people: Object.entries(people)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15),
    organizations: Object.entries(organizations)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10),
    locations: Object.entries(locations)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
  };
};

/**
 * Analyze claims to identify potential clusters
 */
export const performClusterAnalysis = (claims: Claim[]) => {
  // This is a simplified implementation - a real system would use
  // advanced clustering algorithms and embedding techniques
  
  const clusters = {
    figure: {} as Record<string, number>,
    place: {} as Record<string, number>
  } as Record<ClusterType, Record<string, number>>;
  
  // Define patterns for each cluster type
  const figurePatterns: Record<string, RegExp> = {
    'Zelensky': /Зеленськ[ийого]/i,
    'Putin': /Путін[а]?/i,
    'Biden': /Байден[а]?/i,
    'Stoltenberg': /Столтенберг[а]?/i,
    'Macron': /Макрон[а]?/i,
    'Scholz': /Шольц[а]?/i,
    'Kuleba': /Кулеб[а]?/i,
    'Syrsky': /Сирськ[ий]/i
  };
  
  const placePatterns: Record<string, RegExp> = {
    'Kyiv': /Київ|Киев/i,
    'Kharkiv': /Харків|Харьков/i,
    'Donbas': /Донбас|Донбасс|Донбасу/i,
    'Crimea': /Крим|Крым/i,
    'Mariupol': /Маріуполь|Мариуполь/i,
    'Odesa': /Одеса|Одесса/i,
    'Lviv': /Львів|Львов/i,
    'Donetsk': /Донецьк|Донецк/i,
    'Luhansk': /Луганськ|Луганск/i,
    'Kherson': /Херсон/i
  };
  
  // Scan each claim for patterns
  claims.forEach(claim => {
    const text = claim.text;
    
    // Check for figures
    Object.entries(figurePatterns).forEach(([figure, pattern]) => {
      if (pattern.test(text)) {
        clusters.figure[figure] = (clusters.figure[figure] || 0) + 1;
      }
    });
    
    // Check for places
    Object.entries(placePatterns).forEach(([place, pattern]) => {
      if (pattern.test(text)) {
        clusters.place[place] = (clusters.place[place] || 0) + 1;
      }
    });
  });
  
  return clusters;
};

/**
 * Simple abstractive summarization that generates a new summary
 * instead of extracting existing sentences
 * (In production, this would use a real language model)
 */
export const generateAbstractiveSummary = (text: string, maxLength = 100): string => {
  // This is just a placeholder for demonstration
  // Real implementation would use a transformer model like BART or T5
  
  // For now, we'll just use extractive summary and fake it
  const extractiveSummary = generateSummary(text, maxLength);
  
  // Simulate a more "abstractive" style by changing some patterns
  // (This is not real abstractive summarization, just for UI demo)
  return extractiveSummary
    .replace(/було повідомлено/g, 'джерела повідомляють')
    .replace(/заявив/g, 'зазначив')
    .replace(/сказав/g, 'підкреслив')
    .replace(/вважаю/g, 'є думка, що');
};

/**
 * Detect disinformation or suspicious patterns in claims
 * This is a placeholder for the actual implementation
 */
export const detectDisinformation = (claims: Claim[]) => {
  // Since we're removing sentiment analysis, we'll simplify this function
  // to just detect unusual activity patterns
  
  return claims.length > 0 ? [
    {
      id: '1',
      message: 'Spike in mentions detected around Kharkiv region',
      severity: 'high' as const,
      timestamp: new Date().toISOString()
    },
    {
      id: '2',
      message: 'New narrative detected: "Peacekeeping operation"',
      severity: 'medium' as const,
      timestamp: new Date(Date.now() - 7200000).toISOString() // 2 hours ago
    }
  ] : [];
};
