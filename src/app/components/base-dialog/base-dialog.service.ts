import { ComponentType } from '@angular/cdk/overlay';
import { inject, Injectable } from '@angular/core';
import {
  MatDialog,
  MatDialogConfig,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  BaseDialogComponent,
  IDialogDataConfig,
} from './base-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class BaseDialogService {
  #dialog = inject(MatDialog);

  open<T>(config?: MatDialogConfig<IDialogDataConfig>): MatDialogRef<T> {
    return this.#dialog.open(BaseDialogComponent as ComponentType<T>, config);
  }
}
