import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service'; // relative import, otherwise circular dependency issue due to importing from barrel file

@Injectable({
  providedIn: "root",
})
export class FbFunctionsService {
  // localhost:5001/recycling-checkin/us-central1/generateExcelSheet?filename=MyTest&sheetTitle=Records&collectionName=route
  private SHEET_TITLE = "sheet";
  private BASE_URL = "https://us-central1-gt-recycling.cloudfunctions.net/generateExcelSheet";
  private ROUTES_TYPE = "route";
  private CHECKIN_TYPE = "checkin";
  private ROUTES_FUNCTION_PATH = `${this.BASE_URL}/?filename=MyFile&sheetTitle=${this.SHEET_TITLE}&recordType=${this.ROUTES_TYPE}`;
  private CHECKIN_FUNCTION_PATH = `${this.BASE_URL}/?filename=MyFile&sheetTitle=${this.SHEET_TITLE}&recordType=${this.CHECKIN_TYPE}`;

  constructor(private authService: AuthService) {}

  getRouteRecords() {
    return fetch(this.ROUTES_FUNCTION_PATH);
  }

  getCheckinRecords() {
    return fetch(this.CHECKIN_FUNCTION_PATH);
  }

}
