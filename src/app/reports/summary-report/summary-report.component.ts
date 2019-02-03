import { Component, OnInit } from '@angular/core';
import { TimerService, FirestoreWhere } from '../../timers/timer.service';
import { TimeEntryService } from '../../timers/time-entry.service';
import { TimeEntry } from '../../timers/timer-base.class';
import { combineLatest } from 'rxjs';
import * as moment from 'moment';
import { MatSelectChange } from '@angular/material';
import { User } from '../../users/users.interface';
import { UsersService } from '../../users/users.service';
import { ReportsService, Filter } from '../reports.service';
import { ActivatedRoute, Params } from '@angular/router';
import { Timestamp } from '@firebase/firestore-types';
import { isDate } from 'util';

@Component({
  selector: 'app-summary-report',
  templateUrl: './summary-report.component.html',
  styleUrls: ['./summary-report.component.scss'],
})
export class SummaryReportComponent implements OnInit {
  loading: boolean = false;
  user: User;
  timersMap: any = {};
  timerIds: string[] = [];
  entriesByDate: any = {};
  entryGroups = [];
  totalTime: number = 0;
  graphData: any = [];
  filters: Filter = {
    startDate: new Date(),
    endDate: new Date(),
  };

  savedReports = [
    {
      id: 'fkljelkjflkjasdf',
      name: 'Report One',
    },
    {
      id: 'fkljelkjflkjasdf',
      name: 'Invoice: 5/01/2018 - 5/16/2018',
    },
    {
      id: 'fkljelkjflkjasdf',
      name: 'Report Two',
    },
    {
      id: 'fkljelkjflkjasdf',
      name: 'May Time',
    },
  ];

  // NGX-Charts Options
  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  showDataLabel = true;
  xAxisLabel = 'Date';
  showYAxisLabel = true;
  yAxisLabel = 'Hours';
  yScaleMax = 10;

  constructor(
    private timerService: TimerService,
    private timeEntryService: TimeEntryService,
    private userService: UsersService,
    private reportsService: ReportsService,
    private route: ActivatedRoute,
  ) {
    this.userService.user.subscribe(u => (this.user = u));

    this.route.queryParams.subscribe((params: Params) => {
      if (params['filter']) {
        this.reportsService.currentFilters.subscribe((filter: Filter) => {
          this.filters = filter ? filter : {};

          this.filters.userId = params['userId'];
          this.userService.getUser(this.filters.userId).subscribe((u: User) => (this.user = u));
          this.generateSummary(this.filters);
        });
      }
    });
  }

  ngOnInit() {}

  /**
   * Calls functions to generate data for the report
   */
  generateSummary(filters: Filter) {
    filters.userId = filters.userId ? filters.userId : this.user.id;
    this.filters.startDate = filters.startDate;
    this.filters.endDate = filters.endDate;
    // Reset report values;
    this.clearReport();

    this.loading = true;
    this.getTimeEntries(filters).then((entries: TimeEntry[]) => {
      this.loading = false;
      this.timerIds = [...new Set(entries.map(e => e.timerId))];
      this.createTimerMap(this.timerIds);
      this.groupEntriesByDay(entries);
      this.totalTime = this.addTimeEntries(entries);
    });
  }

  /**
   * Groups time entries by day.
   * @param {TimeEntry[]} entries - Time entries to group by day.
   */
  groupEntriesByDay(entries: TimeEntry[]) {
    entries.forEach((entry: TimeEntry) => {
      entry.startTime = moment(entry.startTime.toDate());
      entry.endTime = moment(entry.endTime.toDate());
      const day = entry.startTime.format('MM/DD/YYYY');

      if (this.entriesByDate[day]) {
        this.entriesByDate[day].entries.push(entry);
      } else {
        this.entriesByDate[day] = { day, entries: [entry] };
      }
    });

    // sum daily time for graph.
    this.generateGraphDailyTotal(this.entriesByDate);

    for (const d in this.entriesByDate) {
      if (this.entriesByDate.hasOwnProperty(d)) {
        // break entries into timer groups
        const dayEntries = this.entriesByDate[d].entries;
        const entriesByTimer = [];

        this.timerIds.forEach((id: string) => {
          let tEntries = [];
          tEntries = dayEntries.filter(e => e.timerId === id);
          if (tEntries.length > 0) {
            entriesByTimer.push(tEntries);
          }
        });

        this.entriesByDate[d].byTimer = entriesByTimer;
        this.entryGroups.push(this.entriesByDate[d]);
      }
    }
  }

  /**
   * Generates data for graph to show total hours by day.
   * @param entriesByDay - An mapped entreis object {'10/10/2018': [arrayOfEntries]
   */
  generateGraphDailyTotal(entriesByDay: any) {
    this.graphData = [];
    for (const d in this.entriesByDate) {
      if (this.entriesByDate.hasOwnProperty(d)) {
        const name = entriesByDay[d].day;
        const totalSeconds = this.addTimeEntries(entriesByDay[d].entries);
        const value = this.secondsToDecimalHours(totalSeconds);

        this.graphData.push({ name, value });
      }
    }
  }

  /**
   * Converts seconds to decimal hours.
   * @param {number} seconds - The seconds to convert into hours.
   * @return {number} - Total hours w/ decimal.
   */
  secondsToDecimalHours(seconds: number): number {
    const mil = seconds * 1000;
    return Math.round(moment.duration(mil).asHours() * 100) / 100;
  }

  /**
   * Gets time entries using criteria provided.
   * @param {Date} start - The start date.
   * @param {Date} end  - The end date.
   */
  getTimeEntries(filter: Filter): Promise<TimeEntry[]> {
    const whereQuery: FirestoreWhere[] = [
      { key: 'userId', operator: '==', value: filter.userId },
      { key: 'startTime', operator: '>=', value: filter.startDate },
      { key: 'startTime', operator: '<=', value: filter.endDate },
    ];
    return this.timeEntryService.getTimeEntries(whereQuery);
  }

  /**
   *  Gets a list of timers and creates a map using the objects id.
   * @param {string[]} ids - An array of timer ids.
   */
  createTimerMap(timerIds: string[]) {
    const timerObservables = [];

    // Create an array of timer observables
    timerIds.forEach((id: string) => {
      const whereQuery: FirestoreWhere[] = [{ key: 'id', operator: '==', value: id }];
      timerObservables.push(this.timerService.getTimers(whereQuery));
    });

    // combineLatest with all timer observables.
    combineLatest(timerObservables).subscribe((results: any) => {
      results.forEach(timer => {
        const t = timer[0];
        this.timersMap[t.id] = t;
      });
    });
  }

  /**
   * Gets the total time of entries passed in.
   * @param {TimeEntry[]} entries - The entries to be added.
   * @return {number} - The total time in seconds.
   */
  addTimeEntries(entries: TimeEntry[]) {
    return entries.reduce((c, e) => c + this.timeEntryService.duration(e.startTime, e.endTime), 0);
  }

  duration(start: moment.Moment, end: moment.Moment) {
    return this.timeEntryService.duration(start.toDate(), end.toDate());
  }

  /**
   * Returns a property off of a TimerBase.
   * @param {string} id - The id of the timer.
   * @param {string} propertyKey - The timer's object key for the property to return
   * @return {string} - The value of the property.
   */
  returnTimer(id: string, propertyKey: string): any {
    if (this.timersMap[id] === undefined) return '';
    return this.timersMap[id][propertyKey];
  }

  /**
   * Returns the notes from a timer using the notes objects key.
   * @param {string} timerId - The id of the timer
   * @param {string} notesKey - The object key that holds the desired notes.
   */
  getEntryNotes(timerId: string, notesKey: string): string {
    if (this.timersMap[timerId] === undefined) return '';
    return this.timersMap[timerId].notes[notesKey];
  }

  /**
   * Empties all report class variabes
   */
  clearReport() {
    this.timersMap = {};
    this.entriesByDate = {};
    this.entryGroups = [];
    this.totalTime = 0;
  }

  timeEntryToolTip(entry: TimeEntry): string {
    const start = isDate(entry.startTime) ? entry.startTime : entry.startTime.toDate();
    const end = isDate(entry.endTime) ? entry.endTime : entry.endTime.toDate();
    const startTime = moment(start).format('h:mm:ss a');
    const endTime = moment(end).format('h:mm:ss a');
    return `${startTime} - ${endTime}`;
  }

  /**
   * Generates the report based on a previously generated report.
   * @param {MatSelectChange} selectData - Contains selected value from the select box.
   */
  loadSavedReport(selectData: MatSelectChange) {
    console.log(selectData);
    alert('LOADING SAVED REPORTS IS NOT BUILT YET.. ');
  }
}
