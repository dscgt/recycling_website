import { Component, OnInit, ViewChild } from '@angular/core';
import { ExpansionTableComponent, IDisplayData } from 'src/app/modules/extra-material';
import { ICheckinRecord } from 'src/app/modules/backend';
import { Observable } from 'rxjs';
import { BackendCheckinService } from 'src/app/modules/backend/services/interfaces/checkin';
import { FbFunctionsService } from 'src/app/modules/backend/services/implementations/firebase';

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
  public disableButton = false;

  constructor(
    private backend: BackendCheckinService,
    private fbFunctionsService: FbFunctionsService
  ) { }

  ngOnInit(): void { 
    this.displayData = [];
    this.records$ = this.backend.getRecords();
    this.records$.subscribe({
      next: (recordsArray: Array<any>) => {
        
        // collect all column names needed
        const columns = new Set();
        recordsArray.forEach((record) => {
          Object.keys(record.properties).forEach((propertyName) => {
            if (!columns.has(propertyName)) {
              columns.add(propertyName);
            }
          });
        });
        
        // generate IDisplayData from columns
        const newDisplayData = Array.from(columns).map((columnName: string) => {
          return {
            name: columnName,
            property: columnName,
            accessor: (record: ICheckinRecord) => {
              if (record.properties[columnName] == null) {
                return 'N/A';
              }
              return record.properties[columnName];
            }
          }
        });

        // add top-level properties (model title, checkoutTime, checkinTime)
        newDisplayData.unshift(
          {
            name: "Model",
            property: "modelTitle",
            accessor: (record: ICheckinRecord) => {
              return record.modelTitle;
            }
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
          }
        )

        // give to table for rendering
        this.displayData = newDisplayData;
      }
    });
   }

  handleDownload(): void {
    this.disableButton = true;
    this.fbFunctionsService.getCheckinRecords()
      .then((res) => res.blob())
      .then((res) => {
        var a = document.createElement("a");
        a.href = URL.createObjectURL(res);
        a.setAttribute("download", 'data.xlsx');
        a.click();
      }).then(() => {
        this.disableButton = false;
      })
      .catch((err) => {
        window.alert("There was an error:\n" + err.message);
        this.disableButton = false;
      });
  }
}
