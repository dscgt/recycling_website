import { Component, OnInit } from '@angular/core';
import { BackendRoutesService } from 'src/app/modules/backend';

@Component({
  selector: 'app-route-records',
  templateUrl: './route-records.component.html',
  styleUrls: ['./route-records.component.scss']
})
export class RouteRecordsComponent implements OnInit {

  constructor(
    private routesBackend: BackendRoutesService
  ) { }

  ngOnInit(): void {
    
  }

  handleDownload(): void {
    console.log('handleDownload run');
  }
}
