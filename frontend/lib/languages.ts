export interface Language {
    code: string;
    name: string;
    script: string;
    status: 'supported' | 'coming-soon';
}

export const LANGUAGES: Language[] = [
    // Assamese - ISO 639-3: asm, ISO 15924: Beng
    { code: "asm_Beng", name: "Assamese - Assamese", script: "Bengali-Assamese", status: "supported" },
    { code: "asm_Latn", name: "Assamese - Roman", script: "Latin/Roman", status: "supported" },

    // Bengali - ISO 639-3: ben, ISO 15924: Beng
    { code: "ben_Beng", name: "Bengali - Bengali", script: "Bengali-Assamese", status: "supported" },
    { code: "ben_Latn", name: "Bengali - Roman", script: "Latin/Roman", status: "supported" },

    // Bodo - ISO 639-3: brx, ISO 15924: Deva
    { code: "brx_Deva", name: "Bodo - Devanagari", script: "Devanagari", status: "supported" },
    { code: "brx_Latn", name: "Bodo - Roman", script: "Latin/Roman", status: "supported" },

    // Dogri - ISO 639-3: doi, ISO 15924: Deva
    { code: "doi_Deva", name: "Dogri - Devanagari", script: "Devanagari", status: "supported" },
    { code: "doi_Latn", name: "Dogri - Roman", script: "Latin/Roman", status: "supported" },

    // English - ISO 639-3: eng, ISO 15924: Latn
    { code: "eng_Latn", name: "English", script: "Latin", status: "supported" },

    // Gujarati - ISO 639-3: guj, ISO 15924: Gujr
    { code: "guj_Gujr", name: "Gujarati - Gujarati", script: "Gujarati", status: "supported" },
    { code: "guj_Latn", name: "Gujarati - Roman", script: "Latin/Roman", status: "supported" },

    // Hindi - ISO 639-3: hin, ISO 15924: Deva, Latn
    { code: "hin_Deva", name: "Hindi - Devanagari", script: "Devanagari", status: "supported" },
    { code: "hin_Latn", name: "Hindi - Roman", script: "Latin/Roman", status: "supported" },

    // Kannada - ISO 639-3: kan, ISO 15924: Knda
    { code: "kan_Knda", name: "Kannada - Kannada", script: "Kannada", status: "supported" },
    { code: "kan_Latn", name: "Kannada - Roman", script: "Latin/Roman", status: "supported" },

    // Konkani - ISO 639-3: kok, ISO 15924: Deva, Latn, Mlym
    { code: "kok_Deva", name: "Konkani - Devanagari", script: "Devanagari", status: "supported" },
    { code: "kok_Latn", name: "Konkani - Roman", script: "Latin/Roman", status: "supported" },
    { code: "kok_Mlym", name: "Konkani - Malayalam", script: "Malayalam", status: "supported" },

    // Malayalam - ISO 639-3: mal, ISO 15924: Mlym
    { code: "mal_Mlym", name: "Malayalam - Malayalam", script: "Malayalam", status: "supported" },
    { code: "mal_Latn", name: "Malayalam - Roman", script: "Latin/Roman", status: "supported" },

    // Marathi - ISO 639-3: mar, ISO 15924: Deva, Latn
    { code: "mar_Deva", name: "Marathi - Devanagari", script: "Devanagari", status: "supported" },
    { code: "mar_Latn", name: "Marathi - Roman", script: "Latin/Roman", status: "supported" },

    // Odia - ISO 639-3: ori, ISO 15924: Orya
    { code: "ori_Orya", name: "Odia - Odia", script: "Odia", status: "supported" },
    { code: "ori_Latn", name: "Odia - Roman", script: "Latin/Roman", status: "supported" },

    // Punjabi - ISO 639-3: pan, ISO 15924: Guru
    { code: "pan_Guru", name: "Punjabi - Gurmukhi", script: "Gurmukhi", status: "supported" },
    { code: "pan_Deva", name: "Punjabi - Devanagari", script: "Devanagari", status: "supported" },
    { code: "pan_Latn", name: "Punjabi - Roman", script: "Latin/Roman", status: "supported" },

    // Tamil - ISO 639-3: tam, ISO 15924: Taml
    { code: "tam_Taml", name: "Tamil - Tamil", script: "Tamil", status: "supported" },
    { code: "tam_Latn", name: "Tamil - Roman", script: "Latin/Roman", status: "supported" },

    // Telugu - ISO 639-3: tel, ISO 15924: Telu
    { code: "tel_Telu", name: "Telugu - Telugu", script: "Telugu", status: "supported" },
    { code: "tel_Latn", name: "Telugu - Roman", script: "Latin/Roman", status: "supported" },
];

// Helper function to get all language codes (with script variants)
export function getAllLanguageCodes(): string[] {
    return LANGUAGES.map(l => l.code);
}

// Helper function to get base language code (without script)
export function getBaseLanguageCode(code: string): string {
    return code.split('_')[0];
}

// Helper function to get script code
export function getScriptCode(code: string): string {
    const parts = code.split('_');
    return parts.length > 1 ? parts[1] : 'Latn'; // Default to Latin if no script specified
}

// Helper function to get ISO 639-3 language code (3-letter)
export function getLanguageCode(code: string): string {
    return code.split('_')[0];
}

// Helper function to get ISO 15924 script code (4-letter)
export function getISOScriptCode(code: string): string {
    const parts = code.split('_');
    return parts.length > 1 ? parts[1] : 'Latn';
}

export function codeToLabel(code: string | null): string {
    if (!code) return "All languages";
    const found = LANGUAGES.find(l => l.code === code);
    if (found) {
        return `${found.name} (${found.script})`;
    }
    return code;
}

// Get language name without script
export function codeToName(code: string | null): string {
    if (!code) return "All languages";
    const found = LANGUAGES.find(l => l.code === code);
    return found ? found.name : code;
}

// Get script name from code
export function codeToScript(code: string | null): string {
    if (!code) return "";
    const found = LANGUAGES.find(l => l.code === code);
    return found ? found.script : "";
}
