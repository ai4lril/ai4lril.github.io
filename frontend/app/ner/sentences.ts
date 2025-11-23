export interface NerSentence {
    id: string;
    text: string;
    langCode: string;
}

export const nerSentences: NerSentence[] = [
    // Hindi sentences
    { id: 'hin_deva-1', text: 'दिल्ली भारत की राजधानी है।', langCode: 'hin_deva' },
    { id: 'hin_deva-2', text: 'राहुल गांधी कांग्रेस पार्टी के नेता हैं।', langCode: 'hin_deva' },
    { id: 'hin_deva-3', text: 'महात्मा गांधी भारत के स्वतंत्रता सेनानी थे।', langCode: 'hin_deva' },

    // Marathi sentences
    { id: 'mar_deva-1', text: 'मुंबई महाराष्ट्राची राजधानी नाही.', langCode: 'mar_deva' },
    { id: 'mar_deva-2', text: 'पुणे महाराष्ट्रातील एक मोठा शहर आहे.', langCode: 'mar_deva' },

    // English sentences
    { id: 'eng_latn-1', text: 'Sachin Tendulkar played for Mumbai Indians.', langCode: 'eng_latn' },
    { id: 'eng_latn-2', text: 'Google was founded by Larry Page and Sergey Brin.', langCode: 'eng_latn' },
    { id: 'eng_latn-3', text: 'The Eiffel Tower is located in Paris, France.', langCode: 'eng_latn' },

    // Kannada sentences
    { id: 'kan_knda-1', text: 'ಬೆಂಗಳೂರು ಕರ್ನಾಟಕದ ರಾಜಧಾನಿಯಾಗಿದೆ.', langCode: 'kan_knda' },
    { id: 'kan_knda-2', text: 'ಮೈಸೂರು ಕರ್ನಾಟಕದ ಪ್ರಸಿದ್ಧ ನಗರವಾಗಿದೆ.', langCode: 'kan_knda' },

    // Konkani sentences
    { id: 'kok_latn-1', text: 'Tum kosso assa?', langCode: 'kok_latn' },
    { id: 'kok_latn-2', text: 'Mhozo nav Ravindra.', langCode: 'kok_latn' },
    { id: 'kok_latn-3', text: 'Pune Goenche rajdhani.', langCode: 'kok_latn' },
];
