export type Language = 'en' | 'uz' | 'ru';

export interface LanguageOption {
  code: Language;
  label: string;
  flag: string;
  shortCode: string;
  motto: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  {
    code: 'en',
    label: 'English',
    flag: '🇬🇧',
    shortCode: 'EN',
    motto: 'experience uzbekistan effortlessly'
  },
  {
    code: 'uz',
    label: 'O‘zbekcha',
    flag: '🇺🇿',
    shortCode: 'UZ',
    motto: 'O‘zbekistonni oson va qulay kashf eting'
  },
  {
    code: 'ru',
    label: 'Русский',
    flag: '🇷🇺',
    shortCode: 'RU',
    motto: 'Открывайте Узбекистан легко и комфортно'
  }
];
