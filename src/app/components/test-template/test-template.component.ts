import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { BaseTableCell } from '../base-table/base-table-cell.abstract';

@Component({
  selector: 'app-test-template',
  imports: [MatButtonModule, JsonPipe],
  templateUrl: './test-template.component.html',
  styleUrl: './test-template.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TestTemplateComponent extends BaseTableCell {
  protected onClick() {
    console.log('Button clicked!', this.rowData, this.columnData);
  }
}
