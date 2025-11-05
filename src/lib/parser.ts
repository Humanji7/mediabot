/**
 * HTML Parser Utilities for SMM Data Extraction
 * Утилиты для извлечения SMM данных из HTML контента различных источников
 */

export interface ParsedContent {
  title: string;
  content: string;
  summary: string;
  category: "trend" | "stats" | "blogger" | "tip";
  tags: string[];
  relevance: number;
  viewCount?: number;
  engagementRate?: number;
}

export interface SourceConfig {
  name: string;
  url: string;
  selectors: {
    articleList: string;
    title: string;
    content: string;
    date?: string;
    author?: string;
    views?: string;
    engagement?: string;
  };
  categoryKeywords: {
    trend: string[];
    stats: string[];
    blogger: string[];
    tip: string[];
  };
}

/**
 * Конфигурация парсеров для различных источников
 */
export const SOURCE_CONFIGS: Record<string, SourceConfig> = {
  "vakas-tools": {
    name: "Vakas Tools",
    url: "https://vakas-tools.ru/blog",
    selectors: {
      articleList: "article, .post, .blog-item",
      title: "h1, h2, h3, .title, .post-title",
      content: ".content, .post-content, .article-content, p",
      date: ".date, .published, time",
      author: ".author, .by-author",
      views: ".views, .view-count",
      engagement: ".likes, .comments-count",
    },
    categoryKeywords: {
      trend: ["тренд", "популярно", "2025", "новинка", "актуально"],
      stats: ["статистика", "исследование", "данные", "процент", "рост"],
      blogger: ["блогер", "инфлюенсер", "контентмейкер", "создатель"],
      tip: ["совет", "лайфхак", "как", "способ", "метод"],
    },
  },

  smmbot: {
    name: "SMM Bot",
    url: "https://smmbot.net/blog",
    selectors: {
      articleList: ".blog-post, article, .post-item",
      title: "h1, h2, .post-title, .entry-title",
      content: ".post-content, .entry-content, .content",
      date: ".post-date, .entry-date",
      author: ".post-author, .author",
      views: ".view-count, .views",
      engagement: ".social-count, .engagement",
    },
    categoryKeywords: {
      trend: ["reels", "stories", "тик-ток", "вирусно", "хайп"],
      stats: ["конверсия", "охват", "вовлечение", "ctr", "roas"],
      blogger: ["блогер", "микро-инфлюенсер", "nano-инфлюенсер"],
      tip: ["стратегия", "продвижение", "оптимизация", "настройка"],
    },
  },

  popsters: {
    name: "Popsters",
    url: "https://popsters.com/blog",
    selectors: {
      articleList: ".post, .article, .blog-item",
      title: "h1, h2, .title",
      content: ".text, .content, .post-text",
      date: ".date, .time",
      author: ".author",
      views: ".views",
      engagement: ".reactions, .likes",
    },
    categoryKeywords: {
      trend: ["анализ", "исследование", "тренды", "соцсети"],
      stats: ["метрики", "аналитика", "данные", "отчет"],
      blogger: ["кейс", "успех", "топ-блогер"],
      tip: ["аудит", "анализ", "стратегия"],
    },
  },

  "russia-promo": {
    name: "Russia Promo",
    url: "https://russia-promo.com/blog",
    selectors: {
      articleList: ".news-item, .post, article",
      title: "h1, h2, .news-title, .post-title",
      content: ".news-content, .post-content, .text",
      date: ".news-date, .date",
      author: ".author, .news-author",
      views: ".views",
      engagement: ".likes, .shares",
    },
    categoryKeywords: {
      trend: ["российский", "рынок", "тенденция", "новость"],
      stats: ["рейтинг", "топ", "исследование", "опрос"],
      blogger: ["эксперт", "специалист", "кейс"],
      tip: ["практика", "опыт", "рекомендация"],
    },
  },
};

/**
 * Парсит HTML и извлекает текстовый контент
 */
export function parseHTML(html: string): {
  title: string;
  content: string;
  links: string[];
} {
  // Удаляем script и style теги
  const cleanHtml = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, "");

  // Извлекаем title
  const titleMatch = cleanHtml.match(/<title[^>]*>(.*?)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : "";

  // Извлекаем основной текстовый контент
  const content = cleanHtml
    .replace(/<[^>]+>/g, " ") // Удаляем все HTML теги
    .replace(/\s+/g, " ") // Схлопываем множественные пробелы
    .trim();

  // Извлекаем ссылки
  const linkMatches =
    cleanHtml.match(/<a[^>]+href=["']([^"']+)["'][^>]*>/gi) || [];
  const links = linkMatches
    .map((match) => {
      const hrefMatch = match.match(/href=["']([^"']+)["']/i);
      return hrefMatch ? hrefMatch[1] : null;
    })
    .filter(Boolean) as string[];

  return { title, content, links };
}

/**
 * Извлекает статьи из HTML контента блога
 */
export function extractArticles(
  html: string,
  sourceConfig: SourceConfig,
): ParsedContent[] {
  const { title, content } = parseHTML(html);

  // Простой парсинг для MVP - разбиваем контент на блоки
  const blocks = content
    .split("\n")
    .filter((block) => block.trim().length > 50);

  const articles: ParsedContent[] = [];

  for (const block of blocks.slice(0, 10)) {
    // Берем первые 10 блоков
    const parsedArticle = parseContentBlock(block, sourceConfig);
    if (parsedArticle) {
      articles.push(parsedArticle);
    }
  }

  return articles;
}

/**
 * Парсит отдельный блок контента
 */
function parseContentBlock(
  block: string,
  sourceConfig: SourceConfig,
): ParsedContent | null {
  const words = block.toLowerCase().split(/\s+/);

  // Фильтруем слишком короткие блоки
  if (words.length < 10) return null;

  // Определяем категорию по ключевым словам
  const category = determineCategory(block, sourceConfig.categoryKeywords);

  // Извлекаем заголовок (первые 8-12 слов)
  const titleWords = block.split(/\s+/).slice(0, 10);
  const title = titleWords
    .join(" ")
    .replace(/[^\w\sа-яё]/gi, "")
    .trim();

  // Создаем краткое описание (первые 2-3 предложения)
  const sentences = block.split(/[.!?]+/).filter((s) => s.trim().length > 20);
  const summary =
    sentences.slice(0, 2).join(". ").trim() +
    (sentences.length > 2 ? "..." : "");

  // Извлекаем теги/ключевые слова
  const tags = extractTags(block);

  // Рассчитываем релевантность
  const relevance = calculateRelevance(block, category, tags);

  return {
    title: title.substring(0, 200), // Ограничиваем длину заголовка
    content: block,
    summary: summary.substring(0, 500), // Ограничиваем длину описания
    category,
    tags,
    relevance,
    viewCount: extractViewCount(block),
    engagementRate: extractEngagementRate(block),
  };
}

/**
 * Определяет категорию контента по ключевым словам
 */
function determineCategory(
  content: string,
  keywords: SourceConfig["categoryKeywords"],
): "trend" | "stats" | "blogger" | "tip" {
  const lowerContent = content.toLowerCase();

  const scores = {
    trend: keywords.trend.reduce(
      (score, keyword) =>
        score + (lowerContent.includes(keyword.toLowerCase()) ? 1 : 0),
      0,
    ),
    stats: keywords.stats.reduce(
      (score, keyword) =>
        score + (lowerContent.includes(keyword.toLowerCase()) ? 1 : 0),
      0,
    ),
    blogger: keywords.blogger.reduce(
      (score, keyword) =>
        score + (lowerContent.includes(keyword.toLowerCase()) ? 1 : 0),
      0,
    ),
    tip: keywords.tip.reduce(
      (score, keyword) =>
        score + (lowerContent.includes(keyword.toLowerCase()) ? 1 : 0),
      0,
    ),
  };

  // Возвращаем категорию с наивысшим счетом
  const maxCategory = Object.entries(scores).reduce(
    (max, [category, score]) =>
      score > max.score
        ? { category: category as keyof typeof scores, score }
        : max,
    { category: "tip" as keyof typeof scores, score: 0 },
  );

  return maxCategory.category;
}

/**
 * Извлекает теги/ключевые слова из контента
 */
function extractTags(content: string): string[] {
  const lowerContent = content.toLowerCase();

  // Общие SMM теги
  const smmKeywords = [
    "instagram",
    "reels",
    "stories",
    "тик-ток",
    "tiktok",
    "youtube",
    "контент",
    "блогер",
    "инфлюенсер",
    "таргет",
    "реклама",
    "smm",
    "продвижение",
    "хэштег",
    "вирусный",
    "тренд",
    "аналитика",
    "метрики",
    "охват",
    "вовлечение",
    "конверсия",
  ];

  const foundTags = smmKeywords.filter((keyword) =>
    lowerContent.includes(keyword.toLowerCase()),
  );

  // Добавляем хэштеги если есть
  const hashtagMatches = content.match(/#[а-яёa-z0-9_]+/gi) || [];
  const hashtags = hashtagMatches.map((tag) => tag.substring(1));

  return [...foundTags, ...hashtags].slice(0, 10); // Ограничиваем 10 тегами
}

/**
 * Рассчитывает релевантность контента (0.0 - 1.0)
 */
function calculateRelevance(
  content: string,
  category: string,
  tags: string[],
): number {
  let relevance = 0.5; // Базовая релевантность

  // Бонус за количество релевантных тегов
  relevance += Math.min(tags.length * 0.05, 0.3);

  // Бонус за длину контента (оптимальная длина 200-800 символов)
  const length = content.length;
  if (length >= 200 && length <= 800) {
    relevance += 0.1;
  }

  // Бонус за категорию тренд
  if (category === "trend") {
    relevance += 0.1;
  }

  // Бонус за актуальность (содержит 2024, 2025)
  if (content.includes("2024") || content.includes("2025")) {
    relevance += 0.1;
  }

  return Math.min(Math.max(relevance, 0.0), 1.0);
}

/**
 * Извлекает количество просмотров из текста
 */
function extractViewCount(content: string): number | undefined {
  const viewMatches = content.match(
    /(\d+(?:\.\d+)?[km]?)\s*(?:просмотр|view|к|тыс)/i,
  );
  if (!viewMatches) return undefined;

  const value = viewMatches[1].toLowerCase();
  const number = parseFloat(value);

  if (value.includes("k") || value.includes("к") || value.includes("тыс")) {
    return Math.round(number * 1000);
  }
  if (value.includes("m") || value.includes("млн")) {
    return Math.round(number * 1000000);
  }

  return Math.round(number);
}

/**
 * Извлекает процент вовлечения из текста
 */
function extractEngagementRate(content: string): number | undefined {
  const engagementMatches = content.match(
    /(\d+(?:\.\d+)?)\s*%\s*(?:вовлечен|engagement|er)/i,
  );
  if (!engagementMatches) return undefined;

  return parseFloat(engagementMatches[1]);
}
