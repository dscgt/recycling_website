import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { BackendRoutesService, IRouteRecord } from 'src/app/modules/backend';
import { Observable } from 'rxjs';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { map } from 'rxjs/operators';
import { MatDataService } from 'src/app/core';

@Component({
  selector: 'app-route-records',
  templateUrl: './route-records.component.html',
  styleUrls: ['./route-records.component.scss']
})
export class RouteRecordsComponent implements AfterViewInit {

  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  private records$: Observable<IRouteRecord[]>;
  public totalRows$: Observable<number>;
  public displayRows$: Observable<IRouteRecord[]>;

  constructor(
    private routesBackend: BackendRoutesService,
    private matData: MatDataService
  ) { }

  ngAfterViewInit(): void {
    const sortEvent$: Observable<Sort> = this.matData.toSort$(this.sort);
    const pageEvent$: Observable<PageEvent> = this.matData.toPaginator$(this.paginator);
    this.records$ = this.routesBackend.getRecords();
    this.totalRows$ = this.records$.pipe(
      map((records: IRouteRecord[]): number => records.length)
    );
    this.displayRows$ = this.records$.pipe(
      this.matData.sortData$<IRouteRecord>(sortEvent$, {
        "crewmember": (a: IRouteRecord): string => a.crewmember.name,
        "route": (a: IRouteRecord): string => a.route.name,
        "startTime": (a: IRouteRecord): number => ((a.endTime.getUTCMinutes() - a.startTime.getUTCMinutes()) / 60)
      }),
      this.matData.paginateData$(pageEvent$)
    );
  }
}
