/**
 * Translation Utilities
 * Provides better-named translation functions for the application
 */

import { useTranslations as useNextIntlTranslations } from 'next-intl';
import { getTranslations as getNextIntlTranslations } from 'next-intl/server';

/**
 * Hook for using translations in client components
 * @param namespace - The translation namespace (e.g., 'common', 'auth.login')
 * @returns Translation function
 * 
 * @example
 * ```tsx
 * const translate = useTranslate('common');
 * return <button>{translate('save')}</button>;
 * ```
 */
export function useTranslate(namespace?: string) {
  return useNextIntlTranslations(namespace);
}

/**
 * Get translations in server components
 * @param namespace - The translation namespace (e.g., 'common', 'auth.login')
 * @returns Translation function
 * 
 * @example
 * ```tsx
 * const translate = await getTranslate('common');
 * return <button>{translate('save')}</button>;
 * ```
 */
export async function getTranslate(namespace?: string) {
  return await getNextIntlTranslations(namespace);
}

/**
 * Type-safe translation keys for common namespaces
 * This provides autocomplete and type checking for translation keys
 */
export type TranslationKey = {
  common: 
    | 'save' 
    | 'cancel' 
    | 'delete' 
    | 'edit' 
    | 'create' 
    | 'update' 
    | 'view' 
    | 'search' 
    | 'filter' 
    | 'export' 
    | 'import' 
    | 'download' 
    | 'upload' 
    | 'back' 
    | 'next' 
    | 'previous' 
    | 'submit' 
    | 'confirm' 
    | 'close' 
    | 'yes' 
    | 'no' 
    | 'loading' 
    | 'success' 
    | 'error' 
    | 'warning' 
    | 'info' 
    | 'notfound' 
    | 'unauthorized' 
    | 'forbidden' 
    | 'badrequest' 
    | 'internalerror' 
    | 'created' 
    | 'updated' 
    | 'deleted' 
    | 'activated' 
    | 'deactivated';
  
  auth: {
    login: 'title' | 'email' | 'password' | 'submit' | 'forgotPassword' | 'noAccount' | 'register';
    register: 'title' | 'name' | 'email' | 'password' | 'confirmPassword' | 'submit' | 'hasAccount' | 'login';
    logout: 'title' | 'confirm' | 'success';
  };
  
  validation: 
    | 'required' 
    | 'email' 
    | 'min' 
    | 'max' 
    | 'minValue' 
    | 'maxValue' 
    | 'pattern' 
    | 'passwordMatch' 
    | 'invalid';
};

/**
 * Translation namespace helper
 * Provides a cleaner way to access nested translation namespaces
 */
export const TranslationNamespace = {
  // App
  app: 'app',
  
  // Common
  common: 'common',
  
  // Auth
  auth: {
    root: 'auth',
    login: 'auth.login',
    register: 'auth.register',
    logout: 'auth.logout',
    forgotPassword: 'auth.forgotPassword',
    resetPassword: 'auth.resetPassword',
    verifyEmail: 'auth.verifyEmail',
  },
  
  // User
  user: {
    root: 'user',
    profile: 'user.profile',
    settings: 'user.settings',
    preferences: 'user.preferences',
  },
  
  // Subscription
  subscription: {
    root: 'subscription',
    plan: 'subscription.plan',
    status: 'subscription.status',
    upgrade: 'subscription.upgrade',
    cancel: 'subscription.cancel',
  },
  
  // Payment
  payment: {
    root: 'payment',
    method: 'payment.method',
    history: 'payment.history',
    invoice: 'payment.invoice',
  },
  
  // CV
  cv: {
    root: 'cv',
    create: 'cv.create',
    edit: 'cv.edit',
    delete: 'cv.delete',
    download: 'cv.download',
    tailor: 'cv.tailor',
  },
  
  // API
  api: {
    root: 'api',
    keys: 'api.keys',
    usage: 'api.usage',
    docs: 'api.docs',
  },
  
  // Promo
  promo: {
    root: 'promo',
    apply: 'promo.apply',
    valid: 'promo.valid',
    invalid: 'promo.invalid',
  },
  
  // Validation
  validation: 'validation',
  
  // Admin
  admin: {
    root: 'admin',
    dashboard: 'admin.dashboard',
    users: 'admin.users',
    plans: 'admin.plans',
    payments: 'admin.payments',
    promo: 'admin.promo',
    analytics: 'admin.analytics',
  },
  
  // License
  license: {
    root: 'license',
    activate: 'license.activate',
    deactivate: 'license.deactivate',
    status: 'license.status',
  },
  
  // Error
  error: {
    root: 'error',
    network: 'error.network',
    timeout: 'error.timeout',
    unknown: 'error.unknown',
  },
  
  // Language
  language: 'language',
} as const;

/**
 * Helper function to translate with parameters
 * @param translate - The translation function from useTranslate or getTranslate
 * @param key - The translation key
 * @param params - Parameters to replace in the translation
 * @returns Translated string with parameters replaced
 * 
 * @example
 * ```tsx
 * const translate = useTranslate('validation');
 * const message = translateWithParams(translate, 'required', { field: 'Email' });
 * // Returns: "Email is required"
 * ```
 */
export function translateWithParams(
  translate: (key: string, params?: Record<string, any>) => string,
  key: string,
  params: Record<string, any>
): string {
  return translate(key, params);
}

/**
 * Helper to check if current locale is RTL
 */
export function useIsRtl(): boolean {
  if (typeof window === 'undefined') return false;
  return document.documentElement.dir === 'rtl';
}

/**
 * Helper to get current locale
 */
export function useCurrentLocale(): 'en' | 'ar' {
  if (typeof window === 'undefined') return 'en';
  
  const html = document.documentElement;
  const lang = html.getAttribute('lang');
  
  return lang === 'ar' ? 'ar' : 'en';
}

