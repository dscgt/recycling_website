import { Injectable } from '@angular/core';
import { AuthService } from '../auth/auth.service'; // relative import, otherwise circular dependency issue due to importing from barrel file

@Injectable({
  providedIn: "root",
})
export class FbFunctionsService {
  private GENERATE_EXCEL_SHEET_URL = "https://us-central1-gt-recycling.cloudfunctions.net/generateExcelSheet";

  constructor(private authService: AuthService) {}

  async getRouteRecords(rangeStart: Date, rangeEnd: Date): Promise<Response> {
    const headers = await this.constructHeaders();
    return fetch(this.constructPath('route', rangeStart, rangeEnd), {
      headers: headers
    });
  }

  async getCheckinRecords(rangeStart: Date, rangeEnd: Date): Promise<Response> {
    const headers = await this.constructHeaders();
    return fetch(this.constructPath('checkin', rangeStart, rangeEnd), {
      headers: headers
    });
  }

  /**
   * 
   * @param recordType 'checkin' or 'route'
   * @param rangeStart Javascript Date object for range start
   * @param rangeEnd Javascript Date object for range end. Can occur before rangeStart, but most likely nothing will be returned
   */
  constructPath(recordType: string, rangeStart: Date, rangeEnd: Date) {
    const rangeStartUnixString = Math.trunc((rangeStart.getTime() / 1000)).toString();
    const rangeEndUnixString = Math.trunc((rangeEnd.getTime() / 1000)).toString();
    return `${this.GENERATE_EXCEL_SHEET_URL}/?recordType=${recordType}&rangeStart=${rangeStartUnixString}&rangeEnd=${rangeEndUnixString}`;
  }

  async constructHeaders(): Promise<any> {
    const idToken = await this.authService.getIdToken();
    return {
      'Authorization': `Bearer ${idToken}`
    };
  }

}
