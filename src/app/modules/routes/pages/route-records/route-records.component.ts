import { Component, OnInit } from '@angular/core';
import { FbFunctionsService } from 'src/app/modules/backend/services/implementations/firebase';

@Component({
  selector: 'app-route-records',
  templateUrl: './route-records.component.html',
  styleUrls: ['./route-records.component.scss']
})
export class RouteRecordsComponent implements OnInit {

  public disableButton = false;

  constructor(
    private fbFunctionsService: FbFunctionsService
  ) { }

  ngOnInit(): void { }

  handleDownload(): void {
    this.disableButton = true;
    this.fbFunctionsService.getRouteRecords()
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
