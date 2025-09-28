"use client"
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "@/locales/en/common.json";
import hi from "@/locales/hi/common.json";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { common: en },
      hi: { common: hi },
    },
    lng: "en", // default language
    fallbackLng: "en",
    ns: ["common"],
    defaultNS: "common",
    interpolation: {
      escapeValue: false, // react handles xss
    },
  });

export default i18n;
