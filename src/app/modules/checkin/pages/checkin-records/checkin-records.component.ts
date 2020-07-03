import { Component, OnInit, ViewChild } from '@angular/core';
import { ExpansionTableComponent, IDisplayData } from 'src/app/modules/extra-material';
import { ICheckinRecord } from 'src/app/modules/backend';
import { Observable } from 'rxjs';
import { BackendCheckinService } from 'src/app/modules/backend/services/interfaces/checkin';

@Component({
  selector: 'app-checkin-records',
  templateUrl: './checkin-records.component.html',
  styleUrls: ['./checkin-records.component.scss']
})
export class CheckinRecordsComponent implements OnInit {

  @ViewChild(ExpansionTableComponent)
  private expansionTable: ExpansionTableComponent<ICheckinRecord>;

  public records$: Observable<ICheckinRecord[]>;
  public displayData: IDisplayData<ICheckinRecord>[];

  constructor(
    private backend: BackendCheckinService
  ) { }

  ngOnInit(): void {
    this.displayData = [
      {
        name: "Model",
        property: "modelTitle",
        accessor: (record: ICheckinRecord) => record.modelTitle
      },
      {
        name: "Checkout Time",
        property: "checkoutTime",
        accessor: (record: ICheckinRecord) => record.checkoutTime.toLocaleString()
      },
      {
        name: "Checkin Time",
        property: "checkinTime",
        accessor: (record: ICheckinRecord) => record.checkinTime.toLocaleString()
      },
      {
        name: "# of Hours",
        property: "hours",
        accessor: (record: ICheckinRecord) => {
          const hours: number = (record.checkoutTime.valueOf() - record.checkinTime.valueOf()) / (1000 * 60 * 60);
          return hours.toString();
        }
      },
    ];
    this.records$ = this.backend.getRecords();
  }
}
