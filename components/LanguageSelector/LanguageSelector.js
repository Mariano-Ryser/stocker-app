import { useState } from 'react';
import Flag from '../../components/flags/Flags';
import styles from './LanguageSelector.module.css';
import { useLanguage } from '../../contexts/LanguageContext';
import { ChevronDown, Globe } from 'lucide-react';

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
        {/* <span className={styles.globeIcon}>
          <Globe size={16} />
        </span> */}
        <Flag countryCode={language} size={currentSize.flag} />
        {showName && (
          <span className={styles.languageName} style={{ fontSize: currentSize.text }}>
            {currentLanguage?.name}
          </span>
        )}
        <span className={styles.code} style={{ fontSize: currentSize.text }}>
          {currentLanguage?.code.toUpperCase()}
        </span>
        <ChevronDown 
          size={14} 
          className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
        />
      </button>

      {isOpen && (
        <>
          <div className={styles.dropdown}>
            {/* <div className={styles.dropdownHeader}>
              <span className={styles.dropdownTitle}>✦ Idioma</span>
              <span className={styles.dropdownSubtitle}>Language</span>
            </div> */}
            <div className={styles.dropdownDivider} />
            {languageOptions.map(lang => {
              const isActive = lang.code === language;
              return (
                <button
                  key={lang.code}
                  className={`${styles.option} ${isActive ? styles.optionActive : ''}`}
                  onClick={() => handleLanguageChange(lang.code)}
                >
                  <span className={styles.optionFlag}>
                    <Flag countryCode={lang.code} size={currentSize.flag} />
                  </span>
                  <span className={styles.optionName}>{lang.name}</span>
                  <span className={styles.optionCode}>
                    {lang.code.toUpperCase()}
                  </span>
                  {isActive && (
                    <span className={styles.optionCheck}>✦</span>
                  )}
                </button>
              );
            })}
            {/* <div className={styles.dropdownFooter}>
              <span className={styles.footerText}>🌌 StockerCloud</span>
            </div> */}
          </div>
          <div className={styles.backdrop} onClick={() => setIsOpen(false)} />
        </>
      )}
    </div>
  );
};

export default LanguageSelector;