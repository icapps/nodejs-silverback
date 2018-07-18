import * as icappsTranslation from 'tree-house-translations';
import { existsSync, mkdirSync } from 'fs';

const defaultOptions = <any> {
  destination: process.cwd() + '/locales',
  clean: true,
  seperateCategories: false,
  exportType: 'json',
};

/**
 * Import translations from the icapps translations service
 */
export async function importTranslations(url: string, token: string, options?: TranslationOptions) {
  const allOptions = Object.assign({}, defaultOptions, options);

  // if locales location does not exists, make directory
  if (!existsSync(allOptions.destination)) {
    mkdirSync(allOptions.destination);
  }

  return icappsTranslation.import(url, token, allOptions);
}

export interface TranslationOptions {
  destination?: string;
  clean?: boolean;
  verbose?: boolean;
  seperateCategories?: boolean;
  exportType?: string;
}
