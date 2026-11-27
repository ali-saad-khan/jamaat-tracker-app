import type { ReminderText } from "@/domain/reminders";
import type { Language } from "@/data/settings";
import type { Prayer } from "@/domain/prayers";

export type { Language };

const en = {
  "tab.today": "Today",
  "tab.history": "History",
  "tab.stats": "Stats",
  "tab.settings": "Settings",

  "prayer.fajr": "Fajr",
  "prayer.dhuhr": "Dhuhr",
  "prayer.asr": "Asr",
  "prayer.maghrib": "Maghrib",
  "prayer.isha": "Isha",

  "status.jamaat": "With congregation",
  "status.alone": "Alone",
  "status.missed": "Missed",
  "status.none": "Not marked",

  "today.summary": "{marked} of {total} marked · {jamaat} in congregation",
  "today.hint": "Tap to change a prayer. Long-press to clear it.",
  "times.stale": "Showing saved prayer times (could not refresh).",
  "times.unavailableCity": "Prayer times are unavailable: city not found. Check Settings.",
  "times.unavailableNetwork": "Prayer times are unavailable. Check your connection.",
  "row.a11y": "{prayer}: {status}. Tap to change.",

  "history.prev": "Previous month",
  "history.next": "Next month",
  "history.hint": "Tap a day to see or change its prayers.",
  "history.legend":
    "Dark green: all 5 in congregation · light green: 3 or more · amber: 1 or 2 · red: none",
  "history.dayA11y": "{date}: {marked} of 5 marked, {jamaat} in congregation",

  "stats.current": "Current streak",
  "stats.best": "Best streak",
  "stats.day": "day",
  "stats.days": "days",
  "stats.footnoteAll":
    "A day counts when all 5 prayers were in congregation. Change this in Settings.",
  "stats.footnoteSome":
    "A day counts when at least {n} prayers were in congregation. Change this in Settings.",
  "stats.last7": "Last 7 days",
  "stats.week": "This week",
  "stats.last30": "Last 30 days",
  "stats.percent": "{n}% in congregation",
  "stats.caption":
    "{jamaat} in congregation · {alone} alone · {missed} missed · {unmarked} not marked",
  "stats.chartA11y": "Prayers in congregation per day: {counts}",

  "settings.location": "Location",
  "settings.city": "City",
  "settings.country": "Country",
  "settings.save": "Save and check times",
  "settings.method": "Calculation method",
  "settings.asr": "Asr calculation",
  "settings.hanafi": "Hanafi (later)",
  "settings.shafi": "Shafi (earlier)",
  "settings.todayIn": "Today in {city}, {country}",
  "settings.checking": "Checking…",
  "settings.saved": "Saved times (could not refresh).",
  "settings.cityNotFound": "City not found. Check the spelling and country.",
  "settings.noConnection": "Could not load times. Check your connection.",
  "settings.reminders": "Reminders",
  "settings.remindMe": "Remind me at prayer time",
  "settings.blocked": "Notifications are blocked. Allow them for this app in the phone settings.",
  "settings.offsetLabel": "Remind me",
  "settings.at": "At prayer time",
  "settings.before": "{n} min before",
  "settings.streak": "Streak",
  "settings.streakLabel": "A day counts toward the streak when",
  "settings.streak5": "All 5 in congregation",
  "settings.streak4": "4 or more",
  "settings.streak3": "3 or more",
  "settings.appearance": "Appearance",
  "settings.language": "Language",
  "settings.theme": "Theme",
  "settings.themeSystem": "System",
  "settings.themeLight": "Light",
  "settings.themeDark": "Dark",
  "settings.zoneNote":
    "Times use this phone's time zone. If you travel, they may be off until you change the city.",

  "reminder.title": "{prayer} time",
  "reminder.titleBefore": "{prayer} in {n} minutes",
  "reminder.body": "Remember to pray in congregation.",

  months: "January,February,March,April,May,June,July,August,September,October,November,December",
  weekdaysShort: "M,T,W,T,F,S,S",
  weekdaysChart: "Su,Mo,Tu,We,Th,Fr,Sa",
} as const;

export type StringKey = keyof typeof en;

const ur: Record<StringKey, string> = {
  "tab.today": "آج",
  "tab.history": "تاریخ",
  "tab.stats": "اعداد و شمار",
  "tab.settings": "ترتیبات",

  "prayer.fajr": "فجر",
  "prayer.dhuhr": "ظہر",
  "prayer.asr": "عصر",
  "prayer.maghrib": "مغرب",
  "prayer.isha": "عشاء",

  "status.jamaat": "باجماعت",
  "status.alone": "اکیلے",
  "status.missed": "قضا",
  "status.none": "نشان نہیں",

  "today.summary": "{total} میں سے {marked} نشان زد · {jamaat} باجماعت",
  "today.hint": "نماز بدلنے کے لیے ٹیپ کریں۔ مٹانے کے لیے دیر تک دبائیں۔",
  "times.stale": "محفوظ شدہ اوقات دکھائے جا رہے ہیں (تازہ نہیں ہو سکے)۔",
  "times.unavailableCity": "اوقات دستیاب نہیں: شہر نہیں ملا۔ ترتیبات دیکھیں۔",
  "times.unavailableNetwork": "اوقات دستیاب نہیں۔ انٹرنیٹ چیک کریں۔",
  "row.a11y": "{prayer}: {status}۔ بدلنے کے لیے ٹیپ کریں۔",

  "history.prev": "پچھلا مہینہ",
  "history.next": "اگلا مہینہ",
  "history.hint": "کسی دن پر ٹیپ کر کے اس کی نمازیں دیکھیں یا بدلیں۔",
  "history.legend":
    "گہرا سبز: پانچوں باجماعت · ہلکا سبز: تین یا زیادہ · زرد: ایک یا دو · سرخ: کوئی نہیں",
  "history.dayA11y": "{date}: 5 میں سے {marked} نشان زد، {jamaat} باجماعت",

  "stats.current": "موجودہ تسلسل",
  "stats.best": "بہترین تسلسل",
  "stats.day": "دن",
  "stats.days": "دن",
  "stats.footnoteAll":
    "دن اسی وقت شمار ہوتا ہے جب پانچوں نمازیں باجماعت ہوں۔ ترتیبات میں بدل سکتے ہیں۔",
  "stats.footnoteSome":
    "دن اسی وقت شمار ہوتا ہے جب کم از کم {n} نمازیں باجماعت ہوں۔ ترتیبات میں بدل سکتے ہیں۔",
  "stats.last7": "پچھلے 7 دن",
  "stats.week": "یہ ہفتہ",
  "stats.last30": "پچھلے 30 دن",
  "stats.percent": "{n}% باجماعت",
  "stats.caption": "{jamaat} باجماعت · {alone} اکیلے · {missed} قضا · {unmarked} نشان نہیں",
  "stats.chartA11y": "روزانہ باجماعت نمازیں: {counts}",

  "settings.location": "مقام",
  "settings.city": "شہر",
  "settings.country": "ملک",
  "settings.save": "محفوظ کریں اور اوقات دیکھیں",
  "settings.method": "حساب کا طریقہ",
  "settings.asr": "عصر کا حساب",
  "settings.hanafi": "حنفی (دیر سے)",
  "settings.shafi": "شافعی (جلدی)",
  "settings.todayIn": "آج، {city}، {country}",
  "settings.checking": "جانچ رہے ہیں…",
  "settings.saved": "محفوظ شدہ اوقات (تازہ نہیں ہو سکے)۔",
  "settings.cityNotFound": "شہر نہیں ملا۔ ہجے اور ملک چیک کریں۔",
  "settings.noConnection": "اوقات لوڈ نہیں ہو سکے۔ انٹرنیٹ چیک کریں۔",
  "settings.reminders": "یاد دہانیاں",
  "settings.remindMe": "نماز کے وقت یاد دلائیں",
  "settings.blocked": "اطلاعات بند ہیں۔ فون کی ترتیبات میں اس ایپ کے لیے اجازت دیں۔",
  "settings.offsetLabel": "یاد دلائیں",
  "settings.at": "نماز کے وقت",
  "settings.before": "{n} منٹ پہلے",
  "settings.streak": "تسلسل",
  "settings.streakLabel": "دن تسلسل میں تب شمار ہوتا ہے جب",
  "settings.streak5": "پانچوں باجماعت",
  "settings.streak4": "چار یا زیادہ",
  "settings.streak3": "تین یا زیادہ",
  "settings.appearance": "ظاہری شکل",
  "settings.language": "زبان",
  "settings.theme": "تھیم",
  "settings.themeSystem": "سسٹم",
  "settings.themeLight": "روشن",
  "settings.themeDark": "تاریک",
  "settings.zoneNote":
    "اوقات اس فون کے ٹائم زون کے مطابق ہیں۔ سفر کی صورت میں شہر بدلنے تک فرق ہو سکتا ہے۔",

  "reminder.title": "{prayer} کا وقت",
  "reminder.titleBefore": "{prayer} میں {n} منٹ",
  "reminder.body": "باجماعت نماز ادا کرنا یاد رکھیں۔",

  months: "جنوری,فروری,مارچ,اپریل,مئی,جون,جولائی,اگست,ستمبر,اکتوبر,نومبر,دسمبر",
  weekdaysShort: "پیر,منگل,بدھ,جمعرات,جمعہ,ہفتہ,اتوار",
  weekdaysChart: "اتوار,پیر,منگل,بدھ,جمعرات,جمعہ,ہفتہ",
};

export const STRINGS: Record<Language, Record<StringKey, string>> = { en, ur };

/** Looks up a string and fills `{name}` placeholders. */
export function translate(
  language: Language,
  key: StringKey,
  params: Record<string, string | number> = {},
): string {
  return STRINGS[language][key].replace(/\{(\w+)\}/g, (_, name: string) =>
    String(params[name] ?? `{${name}}`),
  );
}

export function list(
  language: Language,
  key: "months" | "weekdaysShort" | "weekdaysChart",
): string[] {
  return STRINGS[language][key].split(",");
}

/** Reminder wording for the notification planner. */
export function reminderText(language: Language): ReminderText {
  const name = (p: Prayer) => translate(language, `prayer.${p}`);
  return {
    title: (p, offset) =>
      offset === 0
        ? translate(language, "reminder.title", { prayer: name(p) })
        : translate(language, "reminder.titleBefore", { prayer: name(p), n: offset }),
    body: () => translate(language, "reminder.body"),
  };
}
