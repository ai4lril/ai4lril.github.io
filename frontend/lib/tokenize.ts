export type ScriptCode = 'roman' | 'devanagari' | 'kannada';

function splitPunctuation(token: string): string[] {
    // Split leading/trailing punctuation while keeping core intact
    const parts: string[] = [];
    const leading = token.match(/^[\p{P}\p{S}]+/u)?.[0] ?? '';
    const trailing = token.match(/[\p{P}\p{S}]+$/u)?.[0] ?? '';
    const core = token.slice(leading.length, token.length - trailing.length);
    if (leading) parts.push(...leading.split(''));
    if (core) parts.push(core);
    if (trailing) parts.push(...trailing.split(''));
    return parts.filter(Boolean);
}

export function tokenizeByScript(text: string, script: ScriptCode): string[] {
    const normalized = text
        // Remove zero-width joiners/non-joiners that break naive splits
        .replace(/[\u200C\u200D]/g, '')
        .trim();
    if (!normalized) return [];

    // Base split on whitespace
    const roughTokens = normalized.split(/\s+/);

    // For Indic scripts, keep combining marks with base characters; we already avoided splitting within word
    // Further refine by separating punctuation at boundaries
    const tokens: string[] = [];
    roughTokens.forEach(t => tokens.push(...splitPunctuation(t)));

    // Optionally, add script-specific tweaks
    if (script === 'devanagari') return tokens; // Merge common Devanagari abbreviations like 	3	4 with dot? (Keep simple for now)
    if (script === 'kannada') return tokens;
    return tokens;
}

export function detectScript(text: string): 'roman' | 'devanagari' | 'kannada' | undefined {
    // Devanagari: \u0900-\u097F, Kannada: \u0C80-\u0CFF
    if (/[\u0900-\u097F]/.test(text)) return 'devanagari';
    if (/[\u0C80-\u0CFF]/.test(text)) return 'kannada';
    return 'roman';
}
