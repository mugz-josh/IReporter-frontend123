import React from 'react';
import { useTranslation } from 'react-i18next';

interface ClickableTextProps {
  translationKey: string;
}

const ClickableText: React.FC<ClickableTextProps> = ({ translationKey }) => {
  const { t, i18n } = useTranslation();

  const languages = ['en', 'sw', 'lg', 'rn', 'xog', 'ar', 'pt', 'zu', 'fr', 'yo', 'am', 'ha'];

  const handleWordClick = () => {
    const currentLang = i18n.language;
    const currentIndex = languages.indexOf(currentLang);
    const nextIndex = (currentIndex + 1) % languages.length;
    const nextLang = languages[nextIndex];
    i18n.changeLanguage(nextLang);
  };

  const text = t(translationKey);
  const words = text.split(' ');

  return (
    <>
      {words.map((word, index) => (
        <span
          key={index}
          onClick={handleWordClick}
          style={{
            cursor: 'pointer',
            marginRight: '0.25rem',
            ...(translationKey === 'login' ? { position: 'relative', top: '-2px' } : {})
          }}
        >
          {word}
        </span>
      ))}
    </>
  );
};

export default ClickableText;
