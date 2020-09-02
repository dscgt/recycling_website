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

  public disableButton = false;

  constructor(
    private fbFunctionsService: FbFunctionsService
  ) { }

  ngOnInit(): void { }

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
