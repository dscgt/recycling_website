import { Injectable } from '@angular/core';
import { FormArray, AbstractControl } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  public swap(arr: any[], a: number, b: number): void {
    let temp = arr[a];
    arr[a] = arr[b];
    arr[b] = temp;
  }

  public swapFormArray(arr: FormArray, a: number, b: number): void {
    if (arr.length < 2) {
      return;
    }
    // see comment above
    let temp:AbstractControl = Object.assign({}, arr.at(a).value);
    arr.at(a).setValue(arr.at(b).value);
    arr.at(b).setValue(temp);
  }
}
