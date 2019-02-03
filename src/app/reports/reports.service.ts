import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Filter {
  startDate?: Date;
  endDate?: Date;
  userId?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ReportsService {
  filterParamsBehavSub = new BehaviorSubject<Filter>(null);
  currentFilters = this.filterParamsBehavSub.asObservable();

  constructor() {}

  setFilter(filter: any): Promise<null> {
    this.filterParamsBehavSub.next(filter);
    return Promise.resolve(null);
  }
}
