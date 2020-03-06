import { Component, Input, AfterViewInit, ViewChild, ContentChild, TemplateRef } from '@angular/core';
import { Observable } from 'rxjs';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatDataService } from '../../services';
import { map, tap } from 'rxjs/operators';
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

  constructor(
    private matData: MatDataService
  ) { }

  ngAfterViewInit(): void {
    this.accessors = {};
    for (let displayDatum of this.displayData) {
      this.accessors[displayDatum.property] = displayDatum.accessor;
    }
    const sort$: Observable<Sort> = this.matData.toSort$(this.sort);
    const pageEvent$: Observable<PageEvent> = this.matData.toPaginator$(this.paginator);
    this.totalRows$ = this.data$.pipe(
      map((data: T[]): number => data.length)
    );
    this.displayRows$ = this.data$.pipe(
      this.matData.sortData$<T>(sort$, this.accessors),
      this.matData.paginateData$(pageEvent$)
    );
  }
}
