import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service'; // relative import, otherwise circular dependency issue due to importing from barrel file

@Injectable({
  providedIn: "root",
})
export class FbFunctionsService {
  // localhost:5001/recycling-checkin/us-central1/generateExcelSheet?filename=MyTest&sheetTitle=Records&collectionName=route
  private GENERATE_EXCEL_SHEET_URL = "https://us-central1-gt-recycling.cloudfunctions.net/generateExcelSheet";

  constructor(private authService: AuthService) {}

  getRouteRecords() {
    const ROUTES_FUNCTION_PATH = `${this.GENERATE_EXCEL_SHEET_URL}/?recordType=route`;
    return fetch(ROUTES_FUNCTION_PATH);
  }

  getCheckinRecords() {
    const CHECKOUT_FUNCTION_PATH = `${this.GENERATE_EXCEL_SHEET_URL}/?recordType=checkin`;
    return fetch(CHECKOUT_FUNCTION_PATH);
  }

}
