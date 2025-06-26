declare module 'language-list' {
  export default class LanguageList {
    getData(): { code: string; language: string }[];
    getLanguageName(code: string): string;
    getLanguageCode(language: string): string;
  }
}