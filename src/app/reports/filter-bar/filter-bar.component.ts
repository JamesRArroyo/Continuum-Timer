import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { Filter } from '../reports.service';

@Component({
  selector: 'app-filter-bar',
  templateUrl: './filter-bar.component.html',
  styleUrls: ['./filter-bar.component.scss'],
})
export class FilterBarComponent implements OnInit {
  filtersForm: FormGroup;
  @Input()
  buttonText: string = 'Apply Filters';
  @Input()
  startDate: Date = new Date();
  @Input()
  endDate: Date = new Date();
  @Output()
  filters: EventEmitter<Filter> = new EventEmitter();
  constructor() {}

  ngOnInit() {
    // Initialize Form
    this.filtersForm = new FormGroup({
      startDate: new FormControl(this.startDate),
      endDate: new FormControl(this.endDate),
    });
  }

  /**
   * Emits an @output with the filter values.
   */
  applyFilters() {
    const filters = this.filtersForm.value;
    // Adjust start and end date to cover full day.
    filters.startDate.setHours(0, 0, 0, 0);
    filters.endDate.setUTCHours(23, 59, 59, 999);
    this.filters.emit(filters);
  }
}
