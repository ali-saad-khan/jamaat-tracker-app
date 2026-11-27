import { useCallback } from "react";

import { list, translate, type Language, type StringKey } from "@/i18n/strings";
import { useSettings } from "@/state/settings";

/** The current language, whether it is right-to-left, and translation helpers. */
export function useI18n() {
  const { settings } = useSettings();
  const language: Language = settings.language;
  const t = useCallback(
    (key: StringKey, params?: Record<string, string | number>) => translate(language, key, params),
    [language],
  );
  const lists = useCallback(
    (key: "months" | "weekdaysShort" | "weekdaysChart") => list(language, key),
    [language],
  );
  return { language, isRTL: language === "ur", t, list: lists };
}
