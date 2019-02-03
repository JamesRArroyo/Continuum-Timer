import { Timestamp } from '@firebase/firestore-types';
import { Component, OnInit, Inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material';
import { TimeEntry } from '../timer-base.class';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TimeEntryService } from '../time-entry.service';
import { isDate } from 'util';
import { isMoment } from 'moment';

@Component({
  selector: 'app-time-entry-edit',
  templateUrl: './time-entry-edit.component.html',
  styleUrls: ['./time-entry-edit.component.scss'],
})
export class TimeEntryEditComponent implements OnInit {
  originalEntry: TimeEntry;
  timeEntry: TimeEntry;
  entryEditForm: FormGroup;
  entryDuration: number;
  validationErrors: string[];
  showDelete = false;

  constructor(
    private timeEntryService: TimeEntryService,
    private bottomSheetRef: MatBottomSheetRef<TimeEntryEditComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
  ) {}

  ngOnInit() {
    this.timeEntry = Object.assign({}, this.data.timeEntry);

    // Convert times to Dates if not already
    this.timeEntry.startTime = isDate(this.timeEntry.startTime)
      ? this.timeEntry.startTime
      : this.timeEntry.startTime.toDate();
    this.timeEntry.endTime = isDate(this.timeEntry.endTime) ? this.timeEntry.endTime : this.timeEntry.endTime.toDate();

    this.entryDuration = this.duration(this.timeEntry.startTime, this.timeEntry.endTime);

    this.entryEditForm = new FormGroup({
      startTime: new FormControl(this.timeEntry.startTime, Validators.required),
      endTime: new FormControl(this.timeEntry.endTime, Validators.required),
    });
  }

  /**
   * Updates the time entry in the db.
   */
  updateTimeEntry() {
    const entryFormValues = this.entryEditForm.value;
    // Make sure dates arent null
    if (!this.isFormValid(entryFormValues)) {
      return;
    }
    const entry = this.timeEntry;
    entry.startTime = this.momentToDate(entryFormValues.startTime);
    entry.endTime = this.momentToDate(entryFormValues.endTime);
    entry.timeInSeconds = this.duration(entry.startTime, entry.endTime);
    this.timeEntryService.updateTimeEntry(entry);
    this.dismiss();
  }

  /**
   * Calculates the difference between two dates.
   * @param {Date} start - The start date.
   * @param {Date} end  - The end date.
   */
  duration(start: Date, end: Date): number {
    return this.timeEntryService.duration(start, end);
  }

  /**
   * Checks to see if the date is a moment object and if so returns a javascript object.
   * @param {any} date
   * @return {Date} - A javascript date object.
   */
  momentToDate(date: any): Date {
    return isMoment(date) ? date.toDate() : date;
  }

  /**
   * Updates duration on input change.
   * @param value - input value that changed.
   */
  dateInputChange(value: any) {
    const entryFormValues = this.entryEditForm.value;

    if (!this.isFormValid(entryFormValues)) {
      return;
    }
    this.entryDuration = this.duration(entryFormValues.startTime, entryFormValues.endTime);
  }

  /**
   * Checks to see if form values are valid.
   * @param {any} formValues - Form values to perform validation on.
   */
  isFormValid(formValues: any): boolean {
    const errors = [];
    if (!formValues.startTime) {
      errors.push('Start date/time is required.');
    }

    if (!formValues.endTime) {
      errors.push('End date/time is required.');
    }

    const duration = this.duration(formValues.startTime, formValues.endTime);
    if (duration < 0) {
      errors.push('Start time must be before end time');
    }

    this.validationErrors = errors;
    return errors.length === 0;
  }

  deleteTimeEntry(confirm: boolean) {
    if (!confirm) {
      this.showDelete = true;
    } else {
      this.timeEntryService.deleteTimeEntry(this.timeEntry.id).then(() => {
        this.bottomSheetRef.dismiss();
      });
    }
  }

  /**
   * Dismisses the bottom sheet.
   */
  dismiss() {
    this.timeEntry = this.originalEntry;
    this.bottomSheetRef.dismiss();
  }
}
