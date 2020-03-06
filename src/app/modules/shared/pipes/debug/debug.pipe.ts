import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'debug'
})
export class DebugPipe implements PipeTransform {

  transform(item: any, name: string, func: (item: any) => void): string  {
    func(item);
    return `${name} is being debugged`;
  }
}
