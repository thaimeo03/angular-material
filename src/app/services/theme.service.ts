import { DOCUMENT } from '@angular/common';
import { effect, inject, Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly THEME_KEY = 'theme';

  readonly #document = inject(DOCUMENT) as Document;
  readonly theme = signal<Theme>('light');

  constructor() {
    const savedTheme = this.getStoredTheme();
    if (savedTheme) {
      this.theme.set(savedTheme);
    }

    effect(() => {
      this.applyTheme(this.theme());
    });
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme(): void {
    const newTheme: Theme = this.theme() === 'light' ? 'dark' : 'light';
    this.theme.set(newTheme);
  }

  /**
   * Set specific theme
   */
  setTheme(theme: Theme): void {
    this.theme.set(theme);
  }

  /**
   * Apply theme to HTML element use color-scheme and store theme
   */
  private applyTheme(theme: Theme): void {
    const htmlElement = this.#document.documentElement;

    // Update color-scheme
    htmlElement.style.colorScheme = theme;

    // Save to localStorage
    localStorage.setItem(this.THEME_KEY, theme);
  }

  /**
   * Get theme from localStorage
   */
  private getStoredTheme(): Theme | null {
    if (typeof localStorage === 'undefined') return null;

    const stored = localStorage.getItem(this.THEME_KEY);
    return stored === 'light' || stored === 'dark' ? stored : null;
  }
}
