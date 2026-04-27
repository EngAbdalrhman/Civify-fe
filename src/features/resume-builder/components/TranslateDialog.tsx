import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { TranslateSaveMode } from '../hooks/useResumeTranslation';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Languages, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TranslateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentLanguage: string;
  onTranslate: (targetLanguage: string) => void;
  isTranslating: boolean;
  saveMode: TranslateSaveMode;
  onSaveModeChange: (mode: TranslateSaveMode) => void;
}

const LANGUAGES = [
  { code: 'en', flag: '🇬🇧', labelKey: 'en' },
  { code: 'ar', flag: '🇸🇦', labelKey: 'ar' },
  { code: 'fr', flag: '🇫🇷', labelKey: 'fr' },
  { code: 'de', flag: '🇩🇪', labelKey: 'de' },
  { code: 'es', flag: '🇪🇸', labelKey: 'es' },
  { code: 'pt', flag: '🇵🇹', labelKey: 'pt' },
  { code: 'zh', flag: '🇨🇳', labelKey: 'zh' },
  { code: 'ja', flag: '🇯🇵', labelKey: 'ja' },
  { code: 'ko', flag: '🇰🇷', labelKey: 'ko' },
  { code: 'tr', flag: '🇹🇷', labelKey: 'tr' },
  { code: 'hi', flag: '🇮🇳', labelKey: 'hi' },
  { code: 'it', flag: '🇮🇹', labelKey: 'it' },
  { code: 'nl', flag: '🇳🇱', labelKey: 'nl' },
  { code: 'ru', flag: '🇷🇺', labelKey: 'ru' },
];

export function TranslateDialog({
  open,
  onOpenChange,
  currentLanguage,
  onTranslate,
  isTranslating,
  saveMode,
  onSaveModeChange
}: TranslateDialogProps) {
  const t = useTranslations('builder.translate');
  const [selectedLang, setSelectedLang] = useState<string>('');

  const currentLangCode = currentLanguage?.toLowerCase() || 'en';

  const handleTranslateClick = () => {
    if (selectedLang && !isTranslating) {
      onTranslate(selectedLang);
    }
  };

  return (
    <Dialog open={open} onOpenChange={isTranslating ? undefined : onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-primary/10 rounded-full text-primary">
              <Languages className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl">{t('title')}</DialogTitle>
          </div>
          <DialogDescription>
            {t('subtitle')}
          </DialogDescription>
        </DialogHeader>

        {isTranslating ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-lg font-medium text-muted-foreground">
              {t('translating', { language: t(`languages.${selectedLang}`) })}
            </p>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {LANGUAGES.map((lang) => {
                const isCurrent = lang.code === currentLangCode;
                const isSelected = lang.code === selectedLang;
                
                return (
                  <button
                    key={lang.code}
                    onClick={() => !isCurrent && setSelectedLang(lang.code)}
                    disabled={isCurrent}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-200",
                      isCurrent && "opacity-50 cursor-not-allowed bg-muted/50",
                      isSelected && !isCurrent && "border-primary bg-primary/5 ring-1 ring-primary",
                      !isSelected && !isCurrent && "hover:border-primary/50 hover:bg-muted/50"
                    )}
                  >
                    <span className="text-2xl" aria-hidden="true">{lang.flag}</span>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">
                        {t(`languages.${lang.labelKey as any}`)}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                          {t('currentLanguage')}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-4 border-t space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">
                {t('savePreference')}
              </h4>
              <RadioGroup 
                value={saveMode} 
                onValueChange={(v) => onSaveModeChange(v as TranslateSaveMode)}
                className="grid gap-3"
              >
                <div className="flex items-start space-x-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => onSaveModeChange('new')}>
                  <RadioGroupItem value="new" id="new" className="mt-1" />
                  <div className="grid gap-1 cursor-pointer">
                    <Label htmlFor="new" className="font-medium cursor-pointer">
                      {t('saveAsNew')}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t('saveAsNewHint', { title: 'Resume', code: selectedLang || 'lang' })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3 rounded-lg border p-3 hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => onSaveModeChange('replace')}>
                  <RadioGroupItem value="replace" id="replace" className="mt-1" />
                  <div className="grid gap-1 cursor-pointer">
                    <Label htmlFor="replace" className="font-medium cursor-pointer">
                      {t('replaceExisting')}
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      {t('replaceHint')}
                    </p>
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>
        )}

        <DialogFooter className="sm:justify-end border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isTranslating}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleTranslateClick}
            disabled={!selectedLang || isTranslating}
          >
            {isTranslating ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {t('translating', { language: selectedLang ? t(`languages.${selectedLang}`) : '' })}</>
            ) : (
              selectedLang ? t('translateTo', { language: t(`languages.${selectedLang}`) }) : t('confirm')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
