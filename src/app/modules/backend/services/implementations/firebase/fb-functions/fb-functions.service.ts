import { Injectable } from '@angular/core';
import { AuthService } from 'src/app/modules/backend/services/implementations/firebase';

@Injectable({
  providedIn: "root",
})
export class FbFunctionsService {
  private ROUTE_RECORDS_FUNCTION_PATH: string =
    "http://localhost:5001/recycling-checkin/us-central1/generateExcelSheet";
  private CHECKIN_RECORDS_FUNCTION_PATH: string = "";

  constructor(private authService: AuthService) {}

  getRouteRecords() {
    // fetch(this.ROUTE_RECORDS_FUNCTION_PATH)
    //   .then((res) => res.blob())
    //   .
    //   .catch((err) => {
    //     window.alert("There was an error:\n" + err.message);
    //   });

    // const res = await fetch(url);
    // const fileStream = fs.createWriteStream(path);
    // await new Promise((resolve, reject) => {
    //   res.body.pipe(fileStream);
    //   res.body.on("error", (err) => {
    //     reject(err);
    //   });
    //   fileStream.on("finish", function() {
    //     resolve();
    //   });
    // });
  }

  getCheckinRecords() {}

}
