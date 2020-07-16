import { Injectable } from '@angular/core';
import { FormArray } from '@angular/forms';

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
    let asArr = arr.value;
    this.swap(asArr, a, b);
    arr.setValue(asArr);
  }
}
