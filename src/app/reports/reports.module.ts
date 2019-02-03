import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportsRoutingModule } from './reports-routing.module';
import { SummaryReportComponent } from './summary-report/summary-report.component';
import { SharedModule } from '../shared/shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LayoutsModule } from '../layouts/layouts.module';
import { ActivityReportComponent } from './activity-report/activity-report.component';
import { FilterBarComponent } from './filter-bar/filter-bar.component';
import { LibraryModule } from '../library/library.module';

@NgModule({
  imports: [
    CommonModule,
    ReportsRoutingModule,
    SharedModule,
    FormsModule,
    ReactiveFormsModule,
    LayoutsModule,
    LibraryModule,
  ],
  declarations: [
    SummaryReportComponent,
    ActivityReportComponent,
    FilterBarComponent,
  ],
})
export class ReportsModule {}
