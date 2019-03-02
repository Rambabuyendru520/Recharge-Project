import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name : 'msisdnPipe'
})
export class MSISDNPipe implements PipeTransform {
    transform(value: any) {
        return value.replace(/\D/g, '');
    }
}
