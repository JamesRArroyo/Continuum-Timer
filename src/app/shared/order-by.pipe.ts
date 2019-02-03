import { Pipe, PipeTransform } from '@angular/core';

export type Direction = 'asc' | 'desc';

@Pipe({
  name: 'orderBy',
})
export class OrderByPipe implements PipeTransform {
  transform(array: any[], orderBy, asc = true) {
    if (!orderBy || orderBy.trim() === '') {
      console.log('no data');
      return array;
    }

    // ascending
    if (asc) {
      console.log('asc', array);
      return Array.from(array).sort((item1: any, item2: any) => {
        console.log('sorting');
        return this.orderByComparator(item1[orderBy], item2[orderBy]);
      });
    } else {
      console.log('desc');

      // not asc
      return Array.from(array).sort((item1: any, item2: any) => {
        return this.orderByComparator(item2[orderBy], item1[orderBy]);
      });
    }
  }

  orderByComparator(a: any, b: any): number {
    console.log('function called');
    console.log('a', a);
    if (
      isNaN(parseFloat(a)) ||
      !isFinite(a) ||
      (isNaN(parseFloat(b)) || !isFinite(b))
    ) {
      // Isn't a number so lowercase the string to properly compare
      if (a.toLowerCase() < b.toLowerCase()) return -1;
      if (a.toLowerCase() > b.toLowerCase()) return 1;
    } else {
      // Parse strings as numbers to compare properly
      if (parseFloat(a) < parseFloat(b)) return -1;
      if (parseFloat(a) > parseFloat(b)) return 1;
    }

    return 0; // equal each other
  }
}
