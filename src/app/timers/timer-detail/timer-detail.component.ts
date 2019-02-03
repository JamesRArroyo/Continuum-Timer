import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { TimerService, FirestoreWhere } from '../timer.service';
import { TimerBase, TimeEntry } from '../timer-base.class';
import { MatBottomSheet, MatBottomSheetConfig, MatSnackBar } from '@angular/material';
import { TimerBottomSheetComponent } from '../timer-bottom-sheet/timer-bottom-sheet.component';
import { TimeEntryService } from '../time-entry.service';
import { TimeEntryEditComponent } from '../time-entry-edit/time-entry-edit.component';
import { isDate } from 'util';
import { takeWhile, debounceTime } from 'rxjs/operators';
import * as moment from 'moment';
import { Timestamp } from '@firebase/firestore-types';

const defaultConfig = new MatBottomSheetConfig();
@Component({
  selector: 'app-timer-detail',
  templateUrl: './timer-detail.component.html',
  styleUrls: ['./timer-detail.component.scss'],
})
export class TimerDetailComponent implements OnInit {
  @Input()
  timer: TimerBase;
  timerForm: FormGroup;
  timerFormStatus: boolean;
  timeEntries: TimeEntry[] = [];
  timeEntrySum: number = 0;
  entryDates: string[] = [];
  tooltipPosition: string = 'above';
  config: MatBottomSheetConfig = {
    disableClose: (defaultConfig.disableClose = true),
    data: { info: 'This is some test info' },
  };

  constructor(
    private timerService: TimerService,
    private timeEntryService: TimeEntryService,
    private bottomSheet: MatBottomSheet,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    // Setup timer form.
    this.setupTimerForm();

    // Set time entries on init
    this.setTimeEntries();
  }

  setupTimerForm() {
    // Initing new Form
    this.timerFormStatus = true;
    this.timerForm = new FormGroup({});
  }

  setTimeEntries() {
    const whereQuery: FirestoreWhere[] = [{ key: 'timerId', operator: '==', value: this.timer.id }];
    this.timeEntryService.getTimeEntriesRealtime(whereQuery).subscribe(
      (entries: TimeEntry[]) => {
        this.timeEntries = entries.sort((t1: TimeEntry, t2: TimeEntry) => {
          return t2.startTime < t1.startTime ? 1 : -1;
        });
        this.timeEntrySum = entries.reduce((t, e) => t + this.duration(e.startTime, e.endTime), 0);
        this.setUniqueEntryDates(entries).then((entryDates: string[]) => {
          this.entryDates = entryDates;
        });
      },
      (e: Error) => console.log(e),
    );
  }

  startTimer(): void {
    this.timerService.startTimer(this.timer);
  }

  pauseTimer(): void {
    this.timerService.pauseTimer(this.timer);
  }

  finishTimer(): void {
    this.config.data = { timer: this.timer };
    this.bottomSheet.open(TimerBottomSheetComponent, this.config);
  }

  private updateTimer(): void {
    const timerFormValues = this.timerForm.value;

    // Map form notes to timer notes
    for (const v in timerFormValues) {
      if (timerFormValues.hasOwnProperty(v)) {
        this.timer.notes[v] = timerFormValues[v];
      }
    }

    // Update the timer
    this.timerService
      .updateTimer(this.timer)
      .then(() => this.snackBar.open('Autosaving...', null, { duration: 2000 }))
      .catch((e: Error) => console.log(e));
  }

  timeEntryToolTip(entry: TimeEntry): string {
    const start = isDate(entry.startTime) ? entry.startTime : entry.startTime.toDate();
    const end = isDate(entry.endTime) ? entry.endTime : entry.endTime.toDate();
    const startTime = moment(start).format('h:mm:ss a');
    const endTime = moment(end).format('h:mm:ss a');
    const day = moment(start).format('MMMM Do');
    return `${day} | ${startTime} - ${endTime}`;
  }

  openTimeEntryEdit(entry: TimeEntry): void {
    this.config.data = { timeEntry: entry, timer: this.timer };
    this.bottomSheet.open(TimeEntryEditComponent, this.config);
  }

  /**
   * Creates an array of unique dates based off a list of time entries startDates.
   * @param {TimeEntry[]} entries - Entries to get unique dates from.
   */
  setUniqueEntryDates(entries: TimeEntry[]): Promise<any> {
    const entryDates = [...new Set(entries.map(e => moment(e.startTime.toDate()).format('MM/DD/YYYY')))];

    // Add a formControl for each entry date.
    entryDates.forEach((date: string) => {
      this.timerForm.addControl(date, new FormControl());
      const notes = this.timer.notes[date] || '';
      this.timerForm.controls[date].setValue(notes);
    });

    this.initAutoSave();

    return Promise.resolve(entryDates);
  }

  /**
   * Watches the timerForm for changes and saves after a period of time.
   */
  initAutoSave() {
    // Watch form changes and save when changed.
    this.timerForm.statusChanges
      .pipe(
        takeWhile(() => this.timerFormStatus),
        debounceTime(2000),
      )
      .subscribe(status => this.updateTimer());
  }

  duration(start: Timestamp, end: Timestamp) {
    return this.timeEntryService.duration(start.toDate(), end.toDate());
  }

  /**
   * Converts date string to Day format
   * @param {string} date  - The date as a string MM-DD-YYYY
   * @returns {string} - The day string
   */
  dateToDay(date: string): string {
    return moment(date, 'MM-DD-YYYY').format('dddd');
  }

  ngOnDestroy() {
    this.timerFormStatus = false;
  }
}
