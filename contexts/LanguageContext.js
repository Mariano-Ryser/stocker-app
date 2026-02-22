// LanguageContext.js
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef
} from 'react';
import { useAuth } from '../components/auth/AuthProvider';

const LanguageContext = createContext();
export const useLanguage = () => useContext(LanguageContext);

const languageOptions = [
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Español', flag: 'es' }
];

const DEFAULT_LANGUAGE = 'de';

// 👉 Todos los módulos de la app
const ALL_MODULES = [
  'CTASection',
  'featuresSection',
  'footer',
  'header',
  'homeHero',
  'index',
  'login',
  'privacy',
  'settings',
  'sideBar',
  'terms',
  'uns'
];

export const LanguageProvider = ({ children }) => {
  const { user, updateUser } = useAuth();

  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  const [messages, setMessages] = useState({});
  const [loadedModules, setLoadedModules] = useState(new Set());
  const [isChanging, setIsChanging] = useState(false);
  const [isReady, setIsReady] = useState(false); // ✅ CLAVE

  const languageRef = useRef(language);
  const tCache = useRef({});

  useEffect(() => {
    languageRef.current = language;
    tCache.current = {};
  }, [language]);

  // -----------------------------
  // Import dinámico
  // -----------------------------
  const importModule = async (lang, module) => {
    const data = await import(`../locales/${lang}/${module}.json`);
    return data.default;
  };

  // -----------------------------
  // Cargar TODOS los módulos
  // -----------------------------
  const loadAllModules = async (lang) => {
    const imports = await Promise.all(
      ALL_MODULES.map((m) => importModule(lang, m))
    );
    return Object.assign({}, ...imports);
  };

  // -----------------------------
  // Cambiar idioma
  // -----------------------------
  const changeLanguage = useCallback(
    async (lang, persist = true) => {
      const valid = languageOptions.some((l) => l.code === lang);
      if (!valid) lang = DEFAULT_LANGUAGE;

      if (lang === languageRef.current && isReady) return;

      setIsChanging(true);

      try {
        const newMessages = await loadAllModules(lang);

        setMessages(newMessages);
        setLoadedModules(new Set(ALL_MODULES));

        setLanguage(lang);
        languageRef.current = lang;

        document.documentElement.lang = lang;
        localStorage.setItem('appLanguage', lang);

        if (persist && user) {
          try {
            const token = localStorage.getItem('token');
            const API = process.env.NEXT_PUBLIC_BACKEND_URL;

            const res = await fetch(`${API}/users/${user.id}`, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ language: lang }),
            });

            if (res.ok) {
              updateUser({ ...user, language: lang });
            }
          } catch (e) {
            console.error('Backend language sync failed:', e);
          }
        }
      } catch (error) {
        console.error('❌ Error cambiando idioma:', error);
      } finally {
        setIsChanging(false);
        setIsReady(true); // ✅ idioma listo → ahora sí render
      }
    },
    [user, updateUser, isReady]
  );

  // -----------------------------
  // Inicialización (CLAVE)
  // -----------------------------
  useEffect(() => {
    const init = async () => {
      const stored = localStorage.getItem('appLanguage');
      const browser = navigator.language.split('-')[0];

      const lang =
        stored ||
        user?.language ||
        browser ||
        DEFAULT_LANGUAGE;

      await changeLanguage(lang, false);
    };

    init();
  }, []);

  // -----------------------------
  // Sync con user
  // -----------------------------
  useEffect(() => {
    if (user?.language && user.language !== language) {
      changeLanguage(user.language, false);
    }
  }, [user]);

  // -----------------------------
  // t() rápida
  // -----------------------------
  const t = useCallback(
    (key) => {
      const cacheKey = `${language}.${key}`;
      if (tCache.current[cacheKey]) {
        return tCache.current[cacheKey];
      }

      const value = key
        .split('.')
        .reduce((o, i) => o?.[i], messages);

      tCache.current[cacheKey] = value ?? key;
      return tCache.current[cacheKey];
    },
    [messages, language]
  );

  // ⛔ NO renderizar la app hasta tener idioma
  if (!isReady) {
    return null; // o spinner si querés
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        changeLanguage,
        t,
        loadedModules,
        languageOptions,
        isChanging,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
