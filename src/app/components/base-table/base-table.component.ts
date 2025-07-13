import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  OnChanges,
  OnInit,
  output,
  signal,
  SimpleChanges,
  Type,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  MatPaginator,
  MatPaginatorModule,
  PageEvent,
} from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { debounceTime, Observable, of, Subject, switchMap } from 'rxjs';

export interface ITableColumn {
  name: string;
  ref: string;
  component?: Type<any>;
  sortable?: boolean;
  width?: string;
}

@Component({
  selector: 'app-base-table',
  imports: [MatTableModule, MatPaginatorModule, MatSortModule],
  templateUrl: './base-table.component.html',
  styleUrl: './base-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BaseTableComponent implements OnInit, OnChanges, AfterViewInit {
  // Dependencies
  #destroyRef = inject(DestroyRef);

  // Constants
  private readonly DEFAULT_CUR_PAGE = 1;
  private readonly DEFAULT_PAGE_SIZE = 10;
  private readonly DEFAULT_LENGTH = 0;
  private readonly DEFAULT_PAGE_OPTIONS = [5, 10, 20];
  private readonly DEFAULT_DEBOUNCE_TIME = 150;

  // Inputs
  defColumns = input.required<ITableColumn[]>();
  pageSizeOptions = input<number[]>(this.DEFAULT_PAGE_OPTIONS);
  params = input<any>({ page: this.DEFAULT_CUR_PAGE });
  api = input<((params: any) => Observable<any>) | null>(null);
  staticDataSource = input<any[]>([]);
  enablePagination = input(true);
  showOrderColumn = input(true);
  showFirstLastButtons = input(true);
  clickable = input(false);
  hidePageSize = input(false);
  disabled = input(false);

  // Outputs
  clickEvent = output<any>({ alias: 'onClick' });

  // Properties
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('dynamicComponentContainer', { read: ViewContainerRef })
  private container!: ViewContainerRef;

  private pageChange$ = new Subject<any>();
  private debounceClick$ = new Subject<() => void>();

  protected dataSource = new MatTableDataSource();
  protected pageSize = signal(this.DEFAULT_PAGE_SIZE);
  protected length = signal(this.DEFAULT_LENGTH);

  // Lifecycle
  ngOnInit(): void {
    this.addNumberOrderColumn();
    this.initDataSource();
    this.debounceClick();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['params']) {
      this.pageChange$.next(this.params);
    }
  }

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
    if (this.staticDataSource().length > 0) {
      this.dataSource.paginator = this.paginator;
    }
  }

  // Handlers
  private addNumberOrderColumn() {
    if (this.showOrderColumn()) {
      const firstColumn = this.defColumns()[0];
      if (firstColumn.ref !== 'no') {
        this.defColumns().unshift({
          name: '#',
          ref: 'no',
          sortable: false,
        });
      }
    }
  }

  private initDataSource() {
    if (this.staticDataSource().length > 0) {
      this.dataSource.data = this.staticDataSource().map(
        (item: any, index: number) => ({ ...item, no: index + 1 }),
      );
      return;
    }

    // Fetch data
    this.pageChange$
      .pipe(
        switchMap((params) => {
          const api$ = this.api();
          if (api$ === null) return of(null);
          return api$(params);
        }),
        takeUntilDestroyed(this.#destroyRef),
      )
      .subscribe((res) => {
        if (!res) return;

        const { limit, totalElements, currentPage } = res.pagination;
        // Set data and add number order
        this.dataSource.data = res.data.map((item: any, index: number) => ({
          ...item,
          no: (currentPage - 1) * limit + index + 1,
        }));

        this.length.set(totalElements);
      });

    // Init data
    this.pageChange$.next(this.params);
  }

  private debounceClick() {
    this.debounceClick$
      .pipe(
        debounceTime(this.DEFAULT_DEBOUNCE_TIME),
        takeUntilDestroyed(this.#destroyRef),
      )
      .subscribe((fn) => {
        fn();
      });
  }

  protected onPageChange(e: PageEvent) {
    this.debounceClick$.next(() => {
      this.pageChange$.next({ page: e.pageIndex + 1 });
      this.pageSize.set(e.pageSize);
    });
  }

  protected onClick(row: any) {
    if (!this.clickable()) return;

    this.debounceClick$.next(() => {
      this.clickEvent.emit(row);
    });
  }

  protected createDynamicComponent(component: Type<any>) {
    if (this.container) {
      this.container.createComponent(component);
    }
  }

  // Getters
  protected get columnRef() {
    return this.defColumns().map((item) => item.ref);
  }

  protected getColumnWidth(item: ITableColumn) {
    if (item.ref === 'no') {
      return '4rem';
    }
    return item.width;
  }
}
