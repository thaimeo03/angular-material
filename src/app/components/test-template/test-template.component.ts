import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-test-template',
  imports: [MatButtonModule],
  templateUrl: './test-template.component.html',
  styleUrl: './test-template.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestTemplateComponent {
  protected onClick() {
    console.log('Click');
  }
 }
