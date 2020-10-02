import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service'; // relative import, otherwise circular dependency issue due to importing from barrel file

@Injectable({
  providedIn: "root",
})
export class FbFunctionsService {
  // localhost:5001/recycling-checkin/us-central1/generateExcelSheet?filename=MyTest&sheetTitle=Records&collectionName=route
  private CHECKOUT_EXCEL_URL = "https://us-central1-gt-recycling.cloudfunctions.net/generateCheckoutRecordsExcelSheet";
  private ROUTE_EXCEL_URL = "https://us-central1-gt-recycling.cloudfunctions.net/generateExcelSheet";

  constructor(private authService: AuthService) {}

  getRouteRecords() {
    const FILE_NAME:string = `route_records_${Date.now()}`;
    const SHEET_TITLE:string = "sheet1";
    const ROUTES_FUNCTION_PATH = `${this.ROUTE_EXCEL_URL}/?recordType=route&filename=${FILE_NAME}&sheetTitle=${SHEET_TITLE}`;
    return fetch(ROUTES_FUNCTION_PATH);
  }

  getCheckinRecords() {
    return fetch(this.CHECKOUT_EXCEL_URL);
  }

}
