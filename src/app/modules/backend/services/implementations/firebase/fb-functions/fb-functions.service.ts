import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service'; // relative import, otherwise circular dependency issue due to importing from barrel file

@Injectable({
  providedIn: "root",
})
export class FbFunctionsService {
  private GENERATE_EXCEL_SHEET_URL = "https://us-central1-gt-recycling.cloudfunctions.net/generateExcelSheet";

  constructor(private authService: AuthService) {}

  async getRouteRecords(): Promise<Response> {
    const ROUTES_FUNCTION_PATH = `${this.GENERATE_EXCEL_SHEET_URL}/?recordType=route`;
    const idToken = await this.authService.getIdToken();
    return fetch(ROUTES_FUNCTION_PATH, {
      headers: {
        'Authorization': `Bearer ${idToken}`
      }
    });
  }

  async getCheckinRecords(): Promise<Response> {
    const CHECKOUT_FUNCTION_PATH = `${this.GENERATE_EXCEL_SHEET_URL}/?recordType=checkin`;
    const idToken = await this.authService.getIdToken();
    return fetch(CHECKOUT_FUNCTION_PATH, {
      headers: {
        'Authorization': `Bearer ${idToken}`
      }
    });
  }

}
