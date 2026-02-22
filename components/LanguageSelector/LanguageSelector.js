import { useState } from 'react';
import Flag from '../../components/flags/Flags';
import styles from './LanguageSelector.module.css';
import { useLanguage } from '../../contexts/LanguageContext';

const LanguageSelector = ({ showName = false, size = 'medium' }) => {
  const { language, changeLanguage, languageOptions, isChanging } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const sizes = {
    small: { flag: 16, text: '12px' },
    medium: { flag: 20, text: '14px' },
    large: { flag: 24, text: '16px' },
  };

  const currentSize = sizes[size];
  const currentLanguage = languageOptions.find(l => l.code === language);

  const handleLanguageChange = (code) => {
    changeLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className={styles.wrapper}>
      <button
        className={`${styles.button} ${styles[size]}`}
        onClick={() => setIsOpen(o => !o)}
        disabled={isChanging}
      >
        <Flag countryCode={language} size={currentSize.flag} />
        {showName && (
          <span style={{ fontSize: currentSize.text }}>
            {currentLanguage?.name}
          </span>
        )}
        <span className={styles.code} style={{ fontSize: currentSize.text }}>
          {currentLanguage?.code.toUpperCase()}
        </span>
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          {languageOptions.map(lang => (
            <button
              key={lang.code}
              className={styles.option}
              onClick={() => handleLanguageChange(lang.code)}
            >
              <Flag countryCode={lang.code} size={currentSize.flag} />
              <span>{lang.name}</span>
              <span className={styles.optionCode}>
                {lang.code.toUpperCase()}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
