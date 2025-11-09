# i18n Implementation Guide - HICv

## ✅ Implementation Complete!

The i18n system has been successfully implemented with **client-side locale management** that:
- ✅ **No route changes** when switching languages
- ✅ **Dynamic text updates** from JSON files
- ✅ **Automatic Accept-Language header** for backend API calls
- ✅ **RTL support** for Arabic
- ✅ **Persistent locale** in localStorage

---

## 🎯 How It Works

### 1. **Client-Side Locale Management**

The locale is stored in **localStorage** and managed entirely on the client side. When you switch languages:
- ✅ The URL stays the same (no `/en` or `/ar` prefix)
- ✅ The text updates dynamically
- ✅ The `Accept-Language` header is automatically set for API calls
- ✅ The `dir` attribute changes to `rtl` for Arabic

### 2. **Translation Files**

Static frontend text is stored in JSON files:
- `src/i18n/messages/en.json` - English translations
- `src/i18n/messages/ar.json` - Arabic translations

### 3. **Backend Communication**

The API client automatically adds the `Accept-Language` header based on the current locale:
```typescript
// Automatically includes: Accept-Language: en or Accept-Language: ar
const data = await apiClient.get('/api/plans');
```

---

## 📚 Usage Examples

### **1. Using Translations in Components**

```tsx
"use client";

import { useTranslate } from "@/lib/i18n/translate";

export function MyComponent() {
  const translate = useTranslate('common');
  
  return (
    <div>
      <h1>{translate('title')}</h1>
      <button>{translate('save')}</button>
    </div>
  );
}
```

### **2. Switching Languages**

Use the `LanguageSwitcher` or `SettingsMenu` component:

```tsx
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export function Header() {
  return (
    <header>
      <LanguageSwitcher />
    </header>
  );
}
```

Or use the `SettingsMenu` for combined language + theme switching:

```tsx
import { SettingsMenu } from "@/components/SettingsMenu";

export function Header() {
  return (
    <header>
      <SettingsMenu />
    </header>
  );
}
```

### **3. Programmatic Locale Change**

```tsx
"use client";

import { useLocale } from "@/lib/i18n/locale-provider";

export function MyComponent() {
  const { locale, setLocale } = useLocale();
  
  const switchToArabic = () => {
    setLocale('ar');
  };
  
  return (
    <div>
      <p>Current locale: {locale}</p>
      <button onClick={switchToArabic}>Switch to Arabic</button>
    </div>
  );
}
```

### **4. Making API Calls with Locale**

The `apiClient` automatically includes the `Accept-Language` header:

```tsx
"use client";

import { apiClient } from "@/lib/api-client";
import { useEffect, useState } from "react";

export function PlansComponent() {
  const [plans, setPlans] = useState([]);
  
  useEffect(() => {
    async function fetchPlans() {
      try {
        // Accept-Language header is automatically added
        const data = await apiClient.get('/plans');
        setPlans(data);
      } catch (error) {
        console.error('Failed to fetch plans:', error);
      }
    }
    fetchPlans();
  }, []);
  
  return <div>{/* Render plans */}</div>;
}
```

### **5. Error Handling with Localized Messages**

```tsx
"use client";

import { showErrorToast, handleAsyncOperation } from "@/lib/error-handler";
import { useTranslate } from "@/lib/i18n/translate";
import { apiClient } from "@/lib/api-client";

export function CreatePlanForm() {
  const translate = useTranslate();
  
  const handleSubmit = async (formData: any) => {
    await handleAsyncOperation(
      async () => {
        const result = await apiClient.post('/admin/plans', formData);
        return result;
      },
      {
        translate,
        successMessage: translate('common.created'),
        errorMessage: translate('error.unknown'),
      }
    );
  };
  
  return <form onSubmit={handleSubmit}>{/* Form fields */}</form>;
}
```

---

## 🗂️ Translation File Structure

### **English (`src/i18n/messages/en.json`)**

```json
{
  "app": {
    "name": "HICv",
    "description": "AI-powered CV tailoring"
  },
  "common": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit"
  },
  "language": {
    "title": "Language",
    "english": "English",
    "arabic": "Arabic"
  },
  "theme": {
    "title": "Theme",
    "light": "Light",
    "dark": "Dark",
    "vintage": "Vintage"
  }
}
```

### **Arabic (`src/i18n/messages/ar.json`)**

```json
{
  "app": {
    "name": "HICv",
    "description": "تخصيص السيرة الذاتية بالذكاء الاصطناعي"
  },
  "common": {
    "save": "حفظ",
    "cancel": "إلغاء",
    "delete": "حذف",
    "edit": "تعديل"
  },
  "language": {
    "title": "اللغة",
    "english": "English",
    "arabic": "العربية"
  },
  "theme": {
    "title": "المظهر",
    "light": "فاتح",
    "dark": "داكن",
    "vintage": "كلاسيكي"
  }
}
```

---

## 🔧 Technical Details

### **Files Created/Modified**

1. **`src/lib/i18n/locale-provider.tsx`** - Client-side locale provider
   - Manages locale state
   - Stores locale in localStorage
   - Updates `document.documentElement.lang` and `dir` attributes
   - Sets `window.__LOCALE__` for API client

2. **`src/lib/api-client.ts`** - API client with automatic locale header
   - Automatically adds `Accept-Language` header
   - Handles authentication tokens
   - Includes token refresh logic

3. **`src/app/layout.tsx`** - Updated to use LocaleProvider
   - Removed server-side locale detection
   - Uses client-side LocaleProvider

4. **`src/components/LanguageSwitcher.tsx`** - Updated to use client-side locale
   - No route changes
   - Direct locale state update

5. **`src/components/SettingsMenu.tsx`** - Updated to use client-side locale
   - Combined language + theme switcher
   - No route changes

6. **`src/i18n/request.ts`** - Simplified configuration
   - Always returns default locale
   - Messages loaded client-side

---

## 🚀 Benefits

1. **No Route Changes** - URL stays the same when switching languages
2. **Better UX** - Instant language switching without page reload
3. **Automatic Backend Communication** - Accept-Language header automatically set
4. **Persistent Preference** - Locale saved in localStorage
5. **RTL Support** - Automatic RTL layout for Arabic
6. **Type-Safe** - Full TypeScript support
7. **Easy to Extend** - Just add more keys to JSON files

---

## 📝 Adding New Translations

1. Add the key to both `en.json` and `ar.json`:

```json
// en.json
{
  "myFeature": {
    "title": "My Feature",
    "description": "This is my feature"
  }
}

// ar.json
{
  "myFeature": {
    "title": "ميزتي",
    "description": "هذه هي ميزتي"
  }
}
```

2. Use in your component:

```tsx
const translate = useTranslate('myFeature');
return <h1>{translate('title')}</h1>;
```

---

## ✅ Testing

The app is now running at **http://localhost:9002**

Test the following:
1. ✅ Switch language using LanguageSwitcher - URL should NOT change
2. ✅ Text should update dynamically
3. ✅ Arabic should display RTL layout
4. ✅ Refresh page - locale should persist
5. ✅ API calls should include Accept-Language header

---

## 🎉 Summary

You now have a fully functional i18n system that:
- ✅ Keeps URLs clean (no locale prefixes)
- ✅ Updates text dynamically from JSON files
- ✅ Automatically sends Accept-Language header to backend
- ✅ Supports RTL for Arabic
- ✅ Persists user preference
- ✅ Works seamlessly with theme system
- ✅ Production-ready and type-safe

All done! 🚀

