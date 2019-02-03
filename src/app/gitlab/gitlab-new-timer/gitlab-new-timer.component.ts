import { Component, OnInit, ViewChild } from '@angular/core';
import {
  MatDialogRef,
  MatPaginator,
  MatSort,
  MatTableDataSource,
} from '@angular/material';

import { GitlabService } from '../../gitlab/gitlab.service';
import { TimerService } from '../../timers/timer.service';
import { TimerType } from '../../timers/timer-type.enum';
@Component({
  selector: 'app-gitlab-new-timer',
  templateUrl: './gitlab-new-timer.component.html',
  styleUrls: ['./gitlab-new-timer.component.scss'],
})
export class GitlabNewTimerComponent implements OnInit {
  selectedRowIndex: number = -1;
  selectedRow: any;
  gitlabUnauthorized = true;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  displayedColumns: string[] = ['iid', 'title', 'labels', 'milestone.title'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource();

  constructor(
    private timerService: TimerService,
    private gitlabService: GitlabService,
    public dialogRef: MatDialogRef<GitlabNewTimerComponent>,
  ) {}

  ngOnInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.getIssues();
  }

  applyFilter(filterValue: string) {
    let value = filterValue.trim(); // Remove whitespace
    value = filterValue.toLowerCase(); // Datasource defaults to lowercase matches
    this.dataSource.filter = value;
  }

  getIssues(params?: any) {
    const p = params || {};
    p.state = 'opened'; // Get Open Issues
    this.gitlabService.getIssues(p).subscribe(
      i => (this.dataSource.data = i),
      err => {
        if (err.status === 401) this.gitlabUnauthorized = false;
      },
    );
  }

  selectRow(row: any) {
    this.selectedRowIndex = row.id;
    this.selectedRow = row;
  }

  createTimer(): void {
    this.selectedRow.timerType = 'gitlab';
    // rename 'state' property so it doesnt conflict with timer state property.
    this.selectedRow.taskState = this.selectedRow.state;
    delete this.selectedRow.state;
    this.timerService.createTimer(this.selectedRow);
    this.dialogRef.close();
  }
}
