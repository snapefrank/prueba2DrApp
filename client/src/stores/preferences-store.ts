import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserPreferences {
  language: 'es' | 'en';
  accessibilityMode: boolean;
  disableAnimations: boolean;
  fontSize: 'small' | 'medium' | 'large';
  colorContrast: 'normal' | 'high';
}

interface PreferencesStore {
  preferences: UserPreferences;
  setLanguage: (language: 'es' | 'en') => void;
  toggleAccessibilityMode: () => void;
  toggleAnimations: () => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  setColorContrast: (contrast: 'normal' | 'high') => void;
  resetPreferences: () => void;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  language: 'es',
  accessibilityMode: false,
  disableAnimations: false,
  fontSize: 'medium',
  colorContrast: 'normal'
};

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      preferences: DEFAULT_PREFERENCES,
      
      setLanguage: (language) => 
        set((state) => ({
          preferences: { ...state.preferences, language }
        })),
      
      toggleAccessibilityMode: () => 
        set((state) => ({
          preferences: { 
            ...state.preferences, 
            accessibilityMode: !state.preferences.accessibilityMode 
          }
        })),
      
      toggleAnimations: () => 
        set((state) => ({
          preferences: { 
            ...state.preferences, 
            disableAnimations: !state.preferences.disableAnimations 
          }
        })),
      
      setFontSize: (fontSize) => 
        set((state) => ({
          preferences: { ...state.preferences, fontSize }
        })),
      
      setColorContrast: (colorContrast) => 
        set((state) => ({
          preferences: { ...state.preferences, colorContrast }
        })),
      
      resetPreferences: () => 
        set(() => ({ preferences: DEFAULT_PREFERENCES })),
    }),
    {
      name: 'user-preferences',
    }
  )
);