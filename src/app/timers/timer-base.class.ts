import { Injectable } from '@angular/core';
import { Observable, Subscription } from 'rxjs/Rx';
import { Timestamp } from '@firebase/firestore-types';

export interface TimeEntry {
  id?: string;
  userId?: string;
  timerId?: string;
  startTime: any;
  endTime: any;
  timeInSeconds: number;
  modified?: boolean;
}

@Injectable()
export abstract class TimerBase {
  active: boolean = false;
  state: string;
  previousTimeEntry: TimeEntry = null;
  webUrl: string = '';
  title: string = '';
  id: string;
  createdBy: string;
  createdDate: Date;
  closedDate: Date = null;
  notes: any;
  details: any;
  timerSubscription: any;
  newEntry: boolean = false;
  abstract timerType: string;
  abstract icon: string; // font-awesome icon
  private ticks: number = 0; // Ticks for current entry
  private entryStartDatetime: Date = null;

  public get runningTime(): number {
    return this.ticks;
  }

  constructor(timer: any) {
    this.sync(timer);
  }

  /*
  * Syncs the timers properties with other instances of the timer.
  */
  sync(timer: any): void {
    this.id = timer.id || undefined;
    this.active = timer.active || false;
    this.title = timer.title;
    this.state = timer.state || 'open';
    this.notes = timer.notes || {};
    this.entryStartDatetime =
      timer.entryStartDatetime != null
        ? timer.entryStartDatetime.toDate()
        : null;
    this.createdBy = timer.createdBy;
    this.createdDate = timer.createdDate
      ? timer.createdDate.toDate()
      : new Date();
    this.closedDate =
      this.closedDate != null ? timer.closedDate.toDate() : null;

    // Handle if timer is active or not.
    if (this.active) {
      this.startTimer();
    } else {
      this.unsubscribe(); // Unsubscribe to any rogue non active timers.
    }
  }

  /*
  * Starts the timer
  */
  startTimer(): void {
    // If timer subscription already exists then return
    if (this.timerSubscription) return;

    this.active = true;
    let currentEntryTicks = 0; // Total seconds of already started entry for this timer.

    // Check if timer is already started.
    if (this.entryStartDatetime == null) {
      this.entryStartDatetime = new Date();
    } else {
      // Get total seconds of open timer.
      currentEntryTicks = Math.round(
        (new Date().getTime() - this.entryStartDatetime.getTime()) / 1000,
      );
    }

    // Create timer observable
    const timer = Observable.timer(1, 1000);
    this.timerSubscription = timer.subscribe(t => {
      this.ticks = t + currentEntryTicks; // new tick plus any currentEntryTicks (if timer was already started)
    });
  }

  /*
  * Pauses the new timer
  */
  pauseTimer(): Promise<any> {
    this.active = false;
    // Create new time entry
    this.addTimeEntry();

    this.entryStartDatetime = null;
    this.ticks = 0;
    this.unsubscribe();
    return Promise.resolve(this);
  }

  /**
   * Unsubscribes from a timer observable.
   */
  unsubscribe(): void {
    if (this.timerSubscription) {
      this.timerSubscription.unsubscribe();
      this.timerSubscription = null;
    }
  }

  /**
   * Adds a new time entry to the time entries array.
   */
  addTimeEntry(): void {
    const timeEntry: TimeEntry = {
      timerId: this.id,
      userId: this.createdBy,
      startTime: this.entryStartDatetime,
      endTime: new Date(),
      timeInSeconds: this.ticks,
    };

    this.previousTimeEntry = timeEntry;
  }

  /*
  * Ends the timer
  */
  endTimer(): Promise<void> {
    // Pause timer if running
    if (this.entryStartDatetime != null) {
      this.newEntry = true;
      this.pauseTimer();
    }
    this.active = false;
    this.ticks = 0;
    this.state = 'closed';
    this.closedDate = new Date();

    if (this.timerSubscription) this.timerSubscription.unsubscribe(); // unsubscribing to the Observable timer.
    return Promise.resolve();
  }
}
