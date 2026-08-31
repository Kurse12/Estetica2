import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { translations } from "./translations";

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState("es");

  // The toggle switches the whole document, not just React state: screen
  // readers pick their voice from <html lang>, and hyphenation and quotes
  // follow it too.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(
    () => ({
      lang,
      t: translations[lang],
      toggleLang: () => setLang((prev) => (prev === "es" ? "en" : "es")),
    }),
    [lang]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
