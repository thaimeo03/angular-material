import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  imports: [MatIconModule, MatButtonModule, MatTooltipModule],
  template: `
    <button
      mat-icon-button
      (click)="toggleTheme()"
      [matTooltip]="
        theme() === 'light' ? 'Switch to dark mode' : 'Switch to light mode'
      "
      aria-label="Toggle theme"
    >
      <mat-icon>{{
        theme() === 'light' ? 'dark_mode' : 'light_mode'
      }}</mat-icon>
    </button>
  `,
  styles: [
    `
      button {
        transition: all 0.3s ease;
      }

      mat-icon {
        transition: transform 0.3s ease;
      }

      button:hover mat-icon {
        transform: scale(1.1);
      }
    `,
  ],
})
export class ThemeToggleComponent {
  readonly #themeService = inject(ThemeService);

  readonly theme = this.#themeService.theme;

  toggleTheme(): void {
    this.#themeService.toggleTheme();
  }
}
