export type Language = 'pt' | 'en' | 'es';

export interface LanguageOption {
  code: Language;
  name: string;
  flag: string;
  nativeName: string;
}