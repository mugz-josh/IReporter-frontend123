import axios from 'axios';

const LIBRE_TRANSLATE_URL = 'https://libretranslate.com/translate';

export const translateText = async (text: string, targetLang: string, sourceLang: string = 'en'): Promise<string> => {
  try {
    const response = await axios.post(LIBRE_TRANSLATE_URL, {
      q: text,
      source: sourceLang,
      target: targetLang,
      format: 'text'
    });

    return response.data.translatedText;
  } catch (error) {
    console.error('Translation error:', error);
    return text; // Fallback to original text
  }
};

export const getLanguageCode = (lang: string): string => {
  const langMap: { [key: string]: string } = {
    'en': 'en',
    'sw': 'sw',
    'lg': 'lg',
    'rn': 'rn',
    'xog': 'xog',
    'ar': 'ar',
    'pt': 'pt',
    'zu': 'zu',
    'fr': 'fr',
    'yo': 'yo',
    'am': 'am',
    'ha': 'ha',
    'luo': 'luo',
    'teo': 'teo',
    'ig': 'ig',
    'rw': 'rw',
    'sn': 'sn',
    'st': 'st',
    'tn': 'tn',
    'ts': 'ts',
    've': 've',
    'xh': 'xh',
    'af': 'af',
    'so': 'so',
    'ti': 'ti',
    'om': 'om',
    'ss': 'ss',
    'nr': 'nr',
    'nd': 'nd'
  };
  return langMap[lang] || 'en';
};
