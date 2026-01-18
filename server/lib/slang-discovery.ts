/**
 * Self-Learning Slang Discovery Service
 *
 * This service enables Vibenicity to automatically discover and learn new slang terms
 * from music lyrics, Urban Dictionary, and real-time web searches via Gemini.
 *
 * Flow:
 * 1. Unknown term detected in user input
 * 2. Check database for previously learned term
 * 3. If not found, perform dynamic lookup:
 *    - Urban Dictionary API
 *    - Genius Lyrics API (future)
 *    - Gemini with Google Search grounding (future)
 * 4. Cache result in database
 * 5. Add to linguistics engine runtime cache
 */

import { storage } from '../storage';
import { engine } from '../../shared/linguistics';
import type { LinguisticCategory } from '../../shared/linguistics';

export interface SlangDiscoveryResult {
  found: boolean;
  term: string;
  meaning?: string;
  category?: LinguisticCategory;
  source?: 'static' | 'database' | 'urbandictionary' | 'genius' | 'gemini';
  sourceUrl?: string;
  confidence?: number;
}

/**
 * Check if a term exists in static or dynamic databases
 */
export async function findSlangTerm(term: string): Promise<SlangDiscoveryResult> {
  // Normalize term
  const normalized = term.toLowerCase().trim();

  // First check: Static database (instant, free)
  const staticResult = engine.translate(normalized);
  if (staticResult.terms.length > 0) {
    const found = staticResult.terms[0];
    return {
      found: true,
      term: found.term,
      meaning: found.meaning,
      category: found.category,
      source: 'static',
      confidence: 100
    };
  }

  // Second check: Dynamic database (cached from previous lookups)
  const dynamicTerm = await storage.findDynamicSlangTerm(normalized);
  if (dynamicTerm) {
    // Increment usage counter
    await storage.incrementSlangUsage(normalized);

    // Also add to runtime cache for faster future lookups
    engine.addDynamicTerm(dynamicTerm.term, dynamicTerm.meaning, dynamicTerm.category as LinguisticCategory);

    return {
      found: true,
      term: dynamicTerm.term,
      meaning: dynamicTerm.meaning,
      category: dynamicTerm.category as LinguisticCategory,
      source: 'database',
      sourceUrl: dynamicTerm.sourceUrl || undefined,
      confidence: dynamicTerm.confidence
    };
  }

  // Not found in any database
  return {
    found: false,
    term: normalized
  };
}

/**
 * Look up a slang term via Urban Dictionary API
 * (Free, unofficial API - no rate limits currently)
 */
export async function lookupUrbanDictionary(term: string): Promise<SlangDiscoveryResult> {
  try {
    const response = await fetch(`https://api.urbandictionary.com/v0/define?term=${encodeURIComponent(term)}`);

    if (!response.ok) {
      console.log(`[SlangDiscovery] Urban Dictionary API error: ${response.status}`);
      return { found: false, term };
    }

    const data = await response.json();

    if (!data.list || data.list.length === 0) {
      return { found: false, term };
    }

    // Get the top definition (most upvoted)
    const topDef = data.list[0];
    const meaning = topDef.definition
      .replace(/\[/g, '')  // Remove UD's bracket markup
      .replace(/\]/g, '')
      .trim()
      .split('\n')[0]  // Get first line only
      .slice(0, 150);  // Limit length

    return {
      found: true,
      term: topDef.word,
      meaning,
      category: 'GEN_Z', // Default category for UD terms
      source: 'urbandictionary',
      sourceUrl: topDef.permalink,
      confidence: Math.min(100, Math.max(50, topDef.thumbs_up - topDef.thumbs_down))
    };
  } catch (error) {
    console.error('[SlangDiscovery] Urban Dictionary lookup failed:', error);
    return { found: false, term };
  }
}

/**
 * Discover and cache a new slang term
 * This is the main entry point for unknown term discovery
 */
export async function discoverAndCacheSlang(term: string): Promise<SlangDiscoveryResult> {
  // First check if we already have it
  const existing = await findSlangTerm(term);
  if (existing.found) {
    return existing;
  }

  console.log(`[SlangDiscovery] Discovering new term: "${term}"`);

  // Try Urban Dictionary first (free, fast, comprehensive)
  const udResult = await lookupUrbanDictionary(term);

  if (udResult.found && udResult.meaning && udResult.category) {
    console.log(`[SlangDiscovery] Found "${term}" on Urban Dictionary: ${udResult.meaning}`);

    // Cache it in database
    try {
      await storage.createDynamicSlangTerm({
        term: udResult.term,
        meaning: udResult.meaning,
        category: udResult.category,
        source: 'urbandictionary',
        sourceUrl: udResult.sourceUrl,
        confidence: udResult.confidence || 80,
        usageCount: 1
      });

      // Add to runtime cache
      engine.addDynamicTerm(udResult.term, udResult.meaning, udResult.category);

      console.log(`[SlangDiscovery] Cached "${term}" for future use`);
    } catch (error) {
      console.error('[SlangDiscovery] Failed to cache term:', error);
    }

    return udResult;
  }

  // TODO: Future enhancements
  // - Try Genius API for song lyrics
  // - Try Gemini with Google Search grounding
  // - Try multiple sources and vote on best definition

  console.log(`[SlangDiscovery] Could not find definition for "${term}"`);
  return { found: false, term };
}

/**
 * Initialize the slang discovery service
 * Loads all dynamic terms from database into runtime cache
 */
export async function initializeSlangDiscovery(): Promise<void> {
  try {
    console.log('[SlangDiscovery] Loading dynamic terms from database...');
    const dynamicTerms = await storage.getAllDynamicSlang();

    console.log(`[SlangDiscovery] Found ${dynamicTerms.length} learned terms`);

    // Load them into the linguistics engine runtime cache
    engine.loadDynamicTerms(dynamicTerms.map(t => ({
      term: t.term,
      meaning: t.meaning,
      category: t.category
    })));

    console.log('[SlangDiscovery] Slang discovery service initialized');
  } catch (error) {
    console.error('[SlangDiscovery] Failed to initialize:', error);
  }
}
