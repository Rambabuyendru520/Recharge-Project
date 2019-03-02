import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name : 'checkNullPipe',
    pure : false
})

export class CheckNullPipe implements PipeTransform {
    transform(value: any) {
     if (!value) {
      return 'NA';
     }
     return value;
    }
}
