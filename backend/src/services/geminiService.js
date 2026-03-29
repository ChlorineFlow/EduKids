const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;

const getGenAI = () => {
  if (!genAI) {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
  return genAI;
};

const askGemini = async (question, classLevel = 3, subject = '', language = 'en') => {
  const ai = getGenAI();
  const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const langInstruction = {
    en: 'Respond in simple English.',
    hi: 'हिंदी में जवाब दो। सरल हिंदी का उपयोग करें।',
    pa: 'ਪੰਜਾਬੀ ਵਿੱਚ ਜਵਾਬ ਦਿਓ। ਸਰਲ ਪੰਜਾਬੀ ਵਰਤੋ।',
  };

  const prompt = `You are a friendly, encouraging teacher named "Buddy" for kids in Class ${classLevel}. 
Your student is asking about ${subject || 'a topic'}.

RULES:
- Use very simple, easy-to-understand language appropriate for a ${classLevel + 4} year old child
- Always be positive, encouraging, and fun! Use emojis 🌟
- Give one clear example to explain the concept
- Keep answers short (3-5 sentences max)
- Never use technical jargon
- End with a motivational sentence
- ${langInstruction[language] || langInstruction.en}

Student's Question: ${question}

Please answer in a friendly, simple way:`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};

const getQuizHint = async (question, options, classLevel = 3, language = 'en') => {
  const ai = getGenAI();
  const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const langInstruction = {
    en: 'Give the hint in simple English.',
    hi: 'हिंदी में संकेत दो।',
    pa: 'ਪੰਜਾਬੀ ਵਿੱਚ ਸੰਕੇਤ ਦਿਓ।',
  };

  const prompt = `You are a helpful teacher for Class ${classLevel} students.
Give a helpful HINT (not the answer) for this quiz question. Keep it to 1-2 sentences. Be encouraging! 😊

Question: ${question}
Options: ${options.join(', ')}

${langInstruction[language] || langInstruction.en}
Give only the hint, nothing else:`;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};

module.exports = { askGemini, getQuizHint };