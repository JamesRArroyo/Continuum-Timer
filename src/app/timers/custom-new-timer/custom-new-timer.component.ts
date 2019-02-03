import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { TimerService } from '../timer.service';
import { MatDialogRef } from '@angular/material';
import { TimerType } from '../timer-type.enum';

@Component({
  selector: 'app-custom-new-timer',
  templateUrl: './custom-new-timer.component.html',
  styleUrls: ['./custom-new-timer.component.scss'],
})
export class CustomNewTimerComponent implements OnInit {
  timerForm: FormGroup;
  constructor(
    private timerService: TimerService,
    public dialogRef: MatDialogRef<CustomNewTimerComponent>,
  ) {}

  ngOnInit() {
    this.timerForm = new FormGroup({
      title: new FormControl(),
      timerType: new FormControl('custom'),
    });
  }

  createTimer(): void {
    const timerDetails = this.timerForm.value;
    this.timerService.createTimer(timerDetails);
    this.dialogRef.close();
  }
}
