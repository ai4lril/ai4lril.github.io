import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding sentences...');

  const sentences = [
    // NER sentences
    { text: 'दिल्ली भारत की राजधानी है।', languageCode: 'hin_deva', difficulty: 'easy', taskType: 'ner' },
    { text: 'राहुल गांधी कांग्रेस पार्टी के नेता हैं।', languageCode: 'hin_deva', difficulty: 'medium', taskType: 'ner' },
    { text: 'महात्मा गांधी भारत के स्वतंत्रता सेनानी थे।', languageCode: 'hin_deva', difficulty: 'medium', taskType: 'ner' },
    { text: 'मुंबई महाराष्ट्राची राजधानी नाही.', languageCode: 'mar_deva', difficulty: 'easy', taskType: 'ner' },
    { text: 'पुणे महाराष्ट्रातील एक मोठा शहर आहे.', languageCode: 'mar_deva', difficulty: 'medium', taskType: 'ner' },
    { text: 'Sachin Tendulkar played for Mumbai Indians.', languageCode: 'eng_latn', difficulty: 'easy', taskType: 'ner' },
    { text: 'Google was founded by Larry Page and Sergey Brin.', languageCode: 'eng_latn', difficulty: 'medium', taskType: 'ner' },
    { text: 'The Eiffel Tower is located in Paris, France.', languageCode: 'eng_latn', difficulty: 'medium', taskType: 'ner' },
    { text: 'ಬೆಂಗಳೂರು ಕರ್ನಾಟಕದ ರಾಜಧಾನಿಯಾಗಿದೆ.', languageCode: 'kan_knda', difficulty: 'easy', taskType: 'ner' },
    { text: 'ಮೈಸೂರು ಕರ್ನಾಟಕದ ಪ್ರಸಿದ್ಧ ನಗರವಾಗಿದೆ.', languageCode: 'kan_knda', difficulty: 'medium', taskType: 'ner' },
    { text: 'Tum kosso assa?', languageCode: 'kok_latn', difficulty: 'easy', taskType: 'ner' },
    { text: 'Mhozo nav Ravindra.', languageCode: 'kok_latn', difficulty: 'easy', taskType: 'ner' },
    { text: 'Ponji Goenche rajdhani.', languageCode: 'kok_latn', difficulty: 'medium', taskType: 'ner' },

    // Translation source sentences
    { text: 'मैं स्कूल जाता हूं।', languageCode: 'hin_deva', difficulty: 'easy', taskType: 'translation' },
    { text: 'यह किताब बहुत अच्छी है।', languageCode: 'hin_deva', difficulty: 'easy', taskType: 'translation' },
    { text: 'भारत में कई भाषाएं बोली जाती हैं।', languageCode: 'hin_deva', difficulty: 'medium', taskType: 'translation' },
    { text: 'हम कल बाजार जाएंगे।', languageCode: 'hin_deva', difficulty: 'medium', taskType: 'translation' },
    { text: 'मी शाळेत जातो.', languageCode: 'mar_deva', difficulty: 'easy', taskType: 'translation' },
    { text: 'ही पुस्तक खूप चांगली आहे.', languageCode: 'mar_deva', difficulty: 'easy', taskType: 'translation' },
    { text: 'भारतात अनेक भाषा बोलल्या जातात.', languageCode: 'mar_deva', difficulty: 'medium', taskType: 'translation' },
    { text: 'आम्ही उद्या बाजारात जाऊ.', languageCode: 'mar_deva', difficulty: 'medium', taskType: 'translation' },
    { text: 'Han shalet gelo.', languageCode: 'kok_latn', difficulty: 'easy', taskType: 'translation' },
    { text: 'He pustok bori bori.', languageCode: 'kok_latn', difficulty: 'easy', taskType: 'translation' },
    { text: 'Bharatant bhou bhasan uloitat.', languageCode: 'kok_latn', difficulty: 'medium', taskType: 'translation' },
    { text: 'Amhi kall bazar gelle.', languageCode: 'kok_latn', difficulty: 'medium', taskType: 'translation' },
    { text: 'I go to school every day.', languageCode: 'eng_latn', difficulty: 'easy', taskType: 'translation' },
    { text: 'This book is very good.', languageCode: 'eng_latn', difficulty: 'easy', taskType: 'translation' },
    { text: 'Many languages are spoken in India.', languageCode: 'eng_latn', difficulty: 'medium', taskType: 'translation' },
    { text: 'We will go to the market tomorrow.', languageCode: 'eng_latn', difficulty: 'medium', taskType: 'translation' },
    { text: 'ನಾನು ದಿನನಿತ್ಯ ಶಾಲೆಗೆ ಹೋಗುತ್ತೇನೆ.', languageCode: 'kan_knda', difficulty: 'easy', taskType: 'translation' },
    { text: 'ಈ ಪುಸ್ತಕವು ತುಂಬಾ ಉತ್ತಮವಾಗಿದೆ.', languageCode: 'kan_knda', difficulty: 'easy', taskType: 'translation' },
    { text: 'ಭಾರತದಲ್ಲಿ ಅನೇಕ ಭಾಷೆಗಳನ್ನು ಮಾತನಾಡುತ್ತಾರೆ.', languageCode: 'kan_knda', difficulty: 'medium', taskType: 'translation' },
    { text: 'ನಾವು ನಾಳೆ ಮಾರುಕಟ್ಟೆಗೆ ಹೋಗುತ್ತೇವೆ.', languageCode: 'kan_knda', difficulty: 'medium', taskType: 'translation' },

    // Speech sentences (for speech recording tasks)
    { text: 'नमस्ते, मैं एक छात्र हूं।', languageCode: 'hin_deva', difficulty: 'easy', taskType: 'speech' },
    { text: 'मैं हिंदी बोलता हूं।', languageCode: 'hin_deva', difficulty: 'easy', taskType: 'speech' },
    { text: 'भारत एक विशाल देश है।', languageCode: 'hin_deva', difficulty: 'medium', taskType: 'speech' },
    { text: 'हम सब मिलकर काम करेंगे।', languageCode: 'hin_deva', difficulty: 'medium', taskType: 'speech' },
    { text: 'नमस्कार, मी विद्यार्थी आहे.', languageCode: 'mar_deva', difficulty: 'easy', taskType: 'speech' },
    { text: 'मी मराठी बोलतो.', languageCode: 'mar_deva', difficulty: 'easy', taskType: 'speech' },
    { text: 'भारत हा एक मोठा देश आहे.', languageCode: 'mar_deva', difficulty: 'medium', taskType: 'speech' },
    { text: 'आपण सर्वजण एकत्र काम करूया.', languageCode: 'mar_deva', difficulty: 'medium', taskType: 'speech' },
    { text: 'Namaste, I am a student.', languageCode: 'eng_latn', difficulty: 'easy', taskType: 'speech' },
    { text: 'I speak English.', languageCode: 'eng_latn', difficulty: 'easy', taskType: 'speech' },
    { text: 'India is a great country.', languageCode: 'eng_latn', difficulty: 'medium', taskType: 'speech' },
    { text: 'We will work together.', languageCode: 'eng_latn', difficulty: 'medium', taskType: 'speech' },

    // Question sentences for spontaneous speech
    { text: 'आपका नाम क्या है?', languageCode: 'hin_deva', difficulty: 'easy', taskType: 'question' },
    { text: 'आप कहां से हैं?', languageCode: 'hin_deva', difficulty: 'easy', taskType: 'question' },
    { text: 'आप क्या करते हैं?', languageCode: 'hin_deva', difficulty: 'easy', taskType: 'question' },
    { text: 'आपका पसंदीदा रंग क्या है?', languageCode: 'hin_deva', difficulty: 'easy', taskType: 'question' },
    { text: 'तुम्हारा नाव काय आहे?', languageCode: 'mar_deva', difficulty: 'easy', taskType: 'question' },
    { text: 'तुम्ही कुठून आलात?', languageCode: 'mar_deva', difficulty: 'easy', taskType: 'question' },
    { text: 'तुम्ही काय करता?', languageCode: 'mar_deva', difficulty: 'easy', taskType: 'question' },
    { text: 'तुमचा आवडता रंग कोणता?', languageCode: 'mar_deva', difficulty: 'easy', taskType: 'question' },
    { text: 'What is your name?', languageCode: 'eng_latn', difficulty: 'easy', taskType: 'question' },
    { text: 'Where are you from?', languageCode: 'eng_latn', difficulty: 'easy', taskType: 'question' },
    { text: 'What do you do?', languageCode: 'eng_latn', difficulty: 'easy', taskType: 'question' },
    { text: 'What is your favorite color?', languageCode: 'eng_latn', difficulty: 'easy', taskType: 'question' },
  ];

  for (const sentence of sentences) {
    await prisma.sentence.create({
      data: sentence,
    });
  }

  console.log('✅ Seeded sentences successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
