import { Component, OnInit } from '@angular/core';
import { FbFunctionsService } from 'src/app/modules/backend/services/implementations/firebase';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-route-records',
  templateUrl: './route-records.component.html',
  styleUrls: ['./route-records.component.scss']
})
export class RouteRecordsComponent implements OnInit {

  public startDate: Date = new Date();
  public endDate: Date = new Date();;
  public disableButton = false;

  constructor(
    private fbFunctionsService: FbFunctionsService
  ) { }

  ngOnInit(): void { }

  handleDownload(): void {
    this.disableButton = true;
    // turn start and end date into beginning and end of day, respectively, then send to getRouteRecords
    const start = DateTime.fromJSDate(this.startDate).startOf('day').toJSDate();
    const end = DateTime.fromJSDate(this.endDate).endOf('day').toJSDate();
    this.fbFunctionsService.getRouteRecords(start, end)
      .then((res) => {
        if (res.ok) {
          return res.blob();
        } else {
          throw new Error('Network call failed: internal server error. Try again another time, or contact the creators if this keeps happening.');
        }
      })
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
