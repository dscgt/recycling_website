import { Component, Input, AfterViewInit, ViewChild, ContentChild, TemplateRef, SimpleChanges } from '@angular/core';
import { Observable } from 'rxjs';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDataService } from '../../services';
import { map } from 'rxjs/operators';
import { IDisplayData } from '../../types';

@Component({
  selector: 'app-expansion-table',
  templateUrl: './expansion-table.component.html',
  styleUrls: ['./expansion-table.component.scss']
})
export class ExpansionTableComponent<T> implements AfterViewInit {

  @ContentChild(TemplateRef) expansionContent: TemplateRef<any>;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  @Input() defaultPageSize: number;
  @Input() pageSizeOptions: number[];
  @Input() data$: Observable<T[]>;
  @Input() displayData: IDisplayData<T>[];

  public displayRows$: Observable<T[]>;
  public totalRows$: Observable<number>;

  private accessors: {
    [property: string]: (datum: T) => string;
  };

  private canSetRows: boolean = false;

  constructor(
    private matData: MatDataService
  ) { }

  ngAfterViewInit(): void {
    this.setRows();
    this.canSetRows = true;
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Set new rows on input change
    // However, if done too early some things may not be initialized, so we wait until after ngAfterViewInit
    if (this.canSetRows) {
      this.setRows();
    }
  }

  setRows(): void {
    // gather data accessors to give to row sorting algorithm
    this.accessors = {};
    for (let displayDatum of this.displayData) {
      this.accessors[displayDatum.property] = displayDatum.accessor;
    }
    const sort$: Observable<Sort> = this.matData.toSort$(this.sort);
    const pageEvent$: Observable<PageEvent> = this.matData.toPaginator$(this.paginator);
    this.displayRows$ = this.data$.pipe(
      this.matData.sortData$<T>(sort$, this.accessors),
      this.matData.paginateData$(pageEvent$)
    );
    this.totalRows$ = this.data$.pipe(
      map((data: T[]): number => data.length)
    );
  }
}
