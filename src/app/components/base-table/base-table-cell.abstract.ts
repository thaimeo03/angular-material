import { Directive, Input } from '@angular/core';

@Directive()
export abstract class BaseTableCell<R = any, C = any> {
  /**
   * The row data for the cell.
   * This is the data for the entire row, not just the cell.
   */
  @Input() rowData: R | null = null;

  /**
   * The column data for the cell.
   * This is the data specific to the column, such as configuration or metadata.
   */
  @Input() columnData: C | null = null;
}
