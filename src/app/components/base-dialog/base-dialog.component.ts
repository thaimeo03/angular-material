import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  Type,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { MatButton } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle,
} from '@angular/material/dialog';

export enum DialogType {
  CONFIRM = 'confirm',
  ALERT = 'alert',
  FORM = 'form',
  CUSTOM = 'custom',
}

type TDefaultDialogInfo = {
  [K in DialogType]: IDialogDataConfig;
};

export interface IDialogDataConfig {
  enableCloseButton?: boolean;
  title?: string;
  type?: DialogType;
  component?: Type<any>;
  description?: string;
}

@Component({
  selector: 'app-base-dialog',
  imports: [
    CommonModule,
    MatButton,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
  ],
  templateUrl: './base-dialog.component.html',
  styleUrl: './base-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseDialogComponent implements AfterViewInit {
  // Dependencies
  protected data?: IDialogDataConfig = inject(MAT_DIALOG_DATA);

  // Properties
  @ViewChild('dynamicComponentContainer', { read: ViewContainerRef })
  private container!: ViewContainerRef;

  private readonly defaultDialogInfo: TDefaultDialogInfo = {
    alert: {
      title: 'Alert title',
      description: 'Alert description',
      enableCloseButton: false,
    },
    confirm: {
      title: 'Confirm title',
      description: 'Confirm description',
      enableCloseButton: true,
    },
    form: {
      title: 'Form title',
      description: 'Form description',
      enableCloseButton: true,
    },
    custom: {},
  };

  protected readonly DialogType = DialogType;
  protected currentType = signal<DialogType>(
    this.data?.type ?? DialogType.CONFIRM,
  );
  protected dialogInfo = signal<IDialogDataConfig>(
    this.defaultDialogInfo[this.currentType()],
  );

  // Lifecycle
  constructor() {
    this.initCurrentInfo();
  }

  ngAfterViewInit(): void {
    // Dynamic component with only dialog type FORM or CUSTOM
    if (this.container && this.data?.component) {
      this.container.createComponent(this.data.component);
    }
  }

  // Handlers
  private initCurrentInfo() {
    if (this.data?.title !== undefined) {
      this.dialogInfo.set({ ...this.dialogInfo(), title: this.data.title });
    }

    if (this.data?.description !== undefined) {
      this.dialogInfo.set({
        ...this.dialogInfo(),
        description: this.data.description,
      });
    }

    if (this.data?.enableCloseButton !== undefined) {
      this.dialogInfo.set({
        ...this.dialogInfo(),
        enableCloseButton: this.data.enableCloseButton,
      });
    }
  }
}
