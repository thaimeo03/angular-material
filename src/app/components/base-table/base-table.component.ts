import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  DestroyRef,
  inject,
  input,
  OnChanges,
  OnDestroy,
  OnInit,
  output,
  QueryList,
  signal,
  SimpleChanges,
  Type,
  ViewChild,
  ViewChildren,
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
  component?: Type<any>; // Dynamic component to render in the cell
  componentData?: { [key: string]: any }; // Data to pass to dynamic component
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
export class BaseTableComponent
  implements OnInit, OnChanges, AfterViewInit, OnDestroy
{
  // Dependencies
  #destroyRef = inject(DestroyRef);

  // Constants
  private readonly DEFAULT_CUR_PAGE = 1;
  private readonly DEFAULT_PAGE_SIZE = 10;
  private readonly DEFAULT_LENGTH = 0;
  private readonly DEFAULT_PAGE_OPTIONS = [5, 10, 20];
  private readonly DEFAULT_DEBOUNCE_TIME = 150;
  private readonly COLUMN_DATA_PROPERTY = 'columnData'; // Property name for column data in dynamic components
  private readonly ROW_DATA_PROPERTY = 'rowData'; // Property name for row data in dynamic components

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
  @ViewChildren('dynamicComponentContainer', { read: ViewContainerRef }) // QueryList for dynamic components
  dynamicContainers!: QueryList<ViewContainerRef>;

  private pageChange$ = new Subject<any>();
  private debounceClick$ = new Subject<() => void>();
  private componentRefs: ComponentRef<any>[] = []; // Store dynamic component references

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

    // Initialize dynamic components
    this.initDynamicComponents();

    // Listen for data changes to reinitialize dynamic components
    this.dataSource
      .connect()
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe(() => {
        setTimeout(() => this.initDynamicComponents(), 0);
      });
  }

  ngOnDestroy(): void {
    // Clean up dynamic component references
    this.componentRefs.forEach((ref) => {
      if (ref && !ref.hostView.destroyed) {
        ref.destroy();
      }
    });
    this.componentRefs = [];
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

    this.clickEvent.emit(row);
  }

  private initDynamicComponents(): void {
    // Clear existing component references
    this.componentRefs.forEach((ref) => {
      if (ref && !ref.hostView.destroyed) {
        ref.destroy();
      }
    });
    this.componentRefs = [];

    if (!this.dynamicContainers) return;

    // Get current data
    const currentData = this.dataSource.data;
    const containers = this.dynamicContainers.toArray();
    const columnsWithComponents = this.defColumns().filter(
      (col) => col.component,
    );

    containers.forEach((container, index) => {
      const rowIndex = Math.floor(index / columnsWithComponents.length);
      const columnIndex = index % columnsWithComponents.length;

      if (
        rowIndex < currentData.length &&
        columnIndex < columnsWithComponents.length
      ) {
        const column = columnsWithComponents[columnIndex];
        const rowData = currentData[rowIndex];

        this.createDynamicComponent(
          container,
          column.component!,
          column.componentData,
          rowData,
        );
      }
    });
  }

  protected createDynamicComponent(
    container: ViewContainerRef,
    component: Type<any>,
    data?: any,
    rowData?: any,
  ) {
    if (!container || !component) return;

    container.clear();
    const componentRef = container.createComponent(component);

    // Pass data to the component if it has these properties
    if (
      data &&
      componentRef.instance &&
      this.COLUMN_DATA_PROPERTY in componentRef.instance
    ) {
      componentRef.instance[this.COLUMN_DATA_PROPERTY] = data;
    }

    // Pass the current row element if the component expects it
    if (
      rowData &&
      componentRef.instance &&
      this.ROW_DATA_PROPERTY in componentRef.instance
    ) {
      componentRef.instance[this.ROW_DATA_PROPERTY] = rowData;
    }

    this.componentRefs.push(componentRef);
    componentRef.changeDetectorRef.detectChanges();
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
