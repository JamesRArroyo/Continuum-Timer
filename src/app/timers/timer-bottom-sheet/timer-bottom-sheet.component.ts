import { Component, OnInit, Inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material';
import { TimerBase } from '../timer-base.class';
import { FormGroup, FormControl } from '@angular/forms';
import { TimerService } from '../timer.service';
import * as moment from 'moment';

@Component({
  selector: 'app-timer-bottom-sheet',
  templateUrl: './timer-bottom-sheet.component.html',
  styleUrls: ['./timer-bottom-sheet.component.scss'],
})
export class TimerBottomSheetComponent implements OnInit {
  timer: TimerBase;
  timerForm: FormGroup;
  timerDates: string[] = [];

  constructor(
    private bottomSheetRef: MatBottomSheetRef<TimerBottomSheetComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    private timerService: TimerService,
  ) {}

  ngOnInit() {
    this.timer = this.data.timer;

    const today = moment(new Date()).format('MM/DD/YYYY');
    this.timerDates.push(today);

    // Initing new Form
    this.timerForm = new FormGroup({});
    this.timerForm.addControl(today, new FormControl());
    this.createNoteFormControls();
  }

  /**
   * Creates form controls for each note value
   */
  createNoteFormControls(): void {
    const notes = this.timer.notes;
    for (const key in notes) {
      if (notes.hasOwnProperty(key)) {
        const newDate = this.timerDates.findIndex(d => d === key) < 0;
        if (newDate) {
          this.timerDates.push(key);
          // Add a formControl for each entry date.
          this.timerForm.addControl(key, new FormControl());
        }
        const notes = this.timer.notes[key] || '';
        this.timerForm.controls[key].setValue(notes);
      }
    }
  }

  /**
   * Dismisses the bottom sheet.
   */
  dismiss() {
    this.bottomSheetRef.dismiss();
  }

  /**
   * Finishes the timer.
   */
  finishTimer(): void {
    const timerFormValues = this.timerForm.value;

    // Map form notes to timer notes
    for (const v in timerFormValues) {
      if (timerFormValues.hasOwnProperty(v)) {
        this.timer.notes[v] = timerFormValues[v];
      }
    }
    this.timerService.endTimer(this.timer);
    this.dismiss();
  }
}
