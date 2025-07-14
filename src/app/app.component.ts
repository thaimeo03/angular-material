import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { DialogType } from './components/base-dialog/base-dialog.component';
import { BaseDialogService } from './components/base-dialog/base-dialog.service';
import {
  BaseTableComponent,
  ITableColumn,
} from './components/base-table/base-table.component';
import { TestTemplateComponent } from './components/test-template/test-template.component';
import { ThemeToggleComponent } from './components/theme-toggle/theme-toggle.component';
import { FakePaginationDataService } from './services/fake-pagination-data.service';

const COLUMNS: ITableColumn[] = [
  { name: 'ID', ref: 'id', width: '4rem' },
  { name: 'Name', ref: 'name', sortable: true },
  { name: 'Email', ref: 'email', sortable: true },
  {
    name: 'Actions',
    ref: 'actions',
    component: TestTemplateComponent,
    componentData: { buttonText: 'Click Me', icon: 'edit' },
  },
];

const STATIC_DATA_SOURCE = [
  { id: 1, name: 'User 1', email: 'user1@example.com' },
  { id: 2, name: 'User 2', email: 'user2@example.com' },
  { id: 3, name: 'User 3', email: 'user3@example.com' },
  { id: 4, name: 'User 4', email: 'user4@example.com' },
  { id: 5, name: 'User 5', email: 'user5@example.com' },
  { id: 6, name: 'User 6', email: 'user6@example.com' },
  { id: 7, name: 'User 7', email: 'user7@example.com' },
  { id: 8, name: 'User 8', email: 'user8@example.com' },
  { id: 9, name: 'User 9', email: 'user9@example.com' },
  { id: 10, name: 'User 10', email: 'user10@example.com' },
  { id: 11, name: 'User 11', email: 'user11@example.com' },
  { id: 12, name: 'User 12', email: 'user12@example.com' },
  { id: 13, name: 'User 13', email: 'user13@example.com' },
  { id: 14, name: 'User 14', email: 'user14@example.com' },
  { id: 15, name: 'User 15', email: 'user15@example.com' },
  { id: 16, name: 'User 16', email: 'user16@example.com' },
  { id: 17, name: 'User 17', email: 'user17@example.com' },
  { id: 18, name: 'User 18', email: 'user18@example.com' },
  { id: 19, name: 'User 19', email: 'user19@example.com' },
  { id: 20, name: 'User 20', email: 'user20@example.com' },
  { id: 21, name: 'User 21', email: 'user21@example.com' },
  { id: 22, name: 'User 22', email: 'user22@example.com' },
  { id: 23, name: 'User 23', email: 'user23@example.com' },
  { id: 24, name: 'User 24', email: 'user24@example.com' },
  { id: 25, name: 'User 25', email: 'user25@example.com' },
  { id: 26, name: 'User 26', email: 'user26@example.com' },
  { id: 27, name: 'User 27', email: 'user27@example.com' },
  { id: 28, name: 'User 28', email: 'user28@example.com' },
  { id: 29, name: 'User 29', email: 'user29@example.com' },
  { id: 30, name: 'User 30', email: 'user30@example.com' },
];

@Component({
  selector: 'app-root',
  imports: [
    MatButtonModule,
    MatToolbarModule,
    BaseTableComponent,
    ThemeToggleComponent,
  ],
  templateUrl: './app.component.html',
})
export class AppComponent {
  // Use for dialog testing
  readonly #dialog = inject(BaseDialogService);
  readonly #destroyRef = inject(DestroyRef);

  protected openDialog(): void {
    const dialogRef = this.#dialog.open({
      data: {
        type: DialogType.FORM,
        component: TestTemplateComponent,
        enableCloseButton: true,
      },
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((res) => {
        if (res) {
          console.log('Ok');
        }
      });
  }

  // Use for table testing
  #fakePaginationDataService = inject(FakePaginationDataService);

  protected api = (params: { page: number }) =>
    this.#fakePaginationDataService.getData(params);
  protected columns = COLUMNS;
  protected staticDataSource = STATIC_DATA_SOURCE;

  protected onClick(row: any): void {
    console.log('Row clicked:', row);
  }
}
