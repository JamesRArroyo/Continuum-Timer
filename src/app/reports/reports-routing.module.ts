import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from '../layouts/layout/layout.component';
import { SummaryReportComponent } from './summary-report/summary-report.component';
import { ActivityReportComponent } from './activity-report/activity-report.component';

const reportsRoutes: Routes = [
  {
    path: 'reports',
    component: LayoutComponent,
    children: [
      { path: 'summary', component: SummaryReportComponent },
      { path: 'activity', component: ActivityReportComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(reportsRoutes)],
  exports: [RouterModule],
})
export class ReportsRoutingModule {}
