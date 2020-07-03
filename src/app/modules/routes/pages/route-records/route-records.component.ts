import { Component, ViewChild, OnInit } from '@angular/core';
import { BackendRoutesService, IRouteRecord } from 'src/app/modules/backend';
import { Observable } from 'rxjs';
import { ExpansionTableComponent, IDisplayData } from 'src/app/modules/extra-material';

@Component({
  selector: 'app-route-records',
  templateUrl: './route-records.component.html',
  styleUrls: ['./route-records.component.scss']
})
export class RouteRecordsComponent implements OnInit {

  @ViewChild(ExpansionTableComponent)
  private expansionTable: ExpansionTableComponent<IRouteRecord>;

  public records$: Observable<IRouteRecord[]>;
  public displayData: IDisplayData<IRouteRecord>[];

  constructor(
    private routesBackend: BackendRoutesService
  ) { }

  ngOnInit(): void {
    this.displayData = [
      {
        name: "Crewmember",
        property: "crewmember",
        accessor: (record: IRouteRecord) => record.crewmember.name
      },
      {
        name: "Tonnage",
        property: "tonnage",
        accessor: (record: IRouteRecord) => record.tonnage.toString()
      },
      {
        name: "Route",
        property: "route",
        accessor: (record: IRouteRecord) => record.route.title
      },
      {
        name: "End Time",
        property: "endTime",
        accessor: (record: IRouteRecord) => record.endTime.toLocaleString()
      },
      {
        name: "# of Hours",
        property: "hours",
        accessor: (record: IRouteRecord) => {
          const hours: number = (record.endTime.valueOf() - record.startTime.valueOf()) / (1000 * 60 * 60);
          return hours.toString();
        }
      },
    ];
    this.records$ = this.routesBackend.getRecords();
  }
}
