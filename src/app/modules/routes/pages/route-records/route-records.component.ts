import { Component, OnInit } from '@angular/core';
import { BackendRoutesService, IRouteRecord } from 'src/app/modules/backend';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-route-records',
  templateUrl: './route-records.component.html',
  styleUrls: ['./route-records.component.scss']
})
export class RouteRecordsComponent implements OnInit {

  public records: Observable<IRouteRecord[]>;

  constructor(
    private routesBackend: BackendRoutesService
  ) { }

  ngOnInit(): void {
    this.records = this.routesBackend.getRecords()
      .pipe(tap((records: IRouteRecord[]) => {
        console.log(records);
      }));
  }

}
