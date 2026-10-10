import { promises as fs } from 'fs';
import path from 'path';

/**
 * Rules Cache - loads X/Twitter rules and user preferences from files ONCE,
 * then caches them in memory for fast subsequent access.
 */

interface CachedRules {
  xRules: string;
  userPreferences: string;
  loadedAt: number;
}

let rulesCache: CachedRules | null = null;

const RULES_FILE = path.join(process.cwd(), 'data', 'x-rules.md');
const PREFERENCES_FILE = path.join(process.cwd(), 'data', 'user-preferences.md');

/**
 * Load the X/Twitter rules and user preferences from disk.
 * After the first load, results are cached in memory.
 */
export async function loadRules(forceRefresh = false): Promise<CachedRules> {
  if (rulesCache && !forceRefresh) {
    return rulesCache;
  }

  try {
    const [xRules, userPreferences] = await Promise.all([
      fs.readFile(RULES_FILE, 'utf-8').catch(() => ''),
      fs.readFile(PREFERENCES_FILE, 'utf-8').catch(() => ''),
    ]);

    rulesCache = {
      xRules,
      userPreferences,
      loadedAt: Date.now(),
    };

    console.log('[rules-cache] Rules loaded from disk and cached in memory.');
    return rulesCache;
  } catch (error) {
    console.error('[rules-cache] Failed to load rules:', error);
    rulesCache = {
      xRules: '',
      userPreferences: '',
      loadedAt: Date.now(),
    };
    return rulesCache;
  }
}

/**
 * Get the cached rules (loads if not yet cached).
 */
export async function getRules(): Promise<CachedRules> {
  return loadRules();
}

/**
 * Force a reload of rules from disk (e.g., after the user edits the file).
 */
export async function reloadRules(): Promise<CachedRules> {
  return loadRules(true);
}

/**
 * Save updated rules to the file and refresh the cache.
 */
export async function saveXRules(content: string): Promise<void> {
  await fs.writeFile(RULES_FILE, content, 'utf-8');
  rulesCache = null;
  await loadRules();
}

/**
 * Save updated user preferences to the file and refresh the cache.
 */
export async function saveUserPreferences(content: string): Promise<void> {
  await fs.writeFile(PREFERENCES_FILE, content, 'utf-8');
  rulesCache = null;
  await loadRules();
}
