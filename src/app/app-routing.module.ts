import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TimerListComponent } from './timers/timer-list/timer-list.component';
import { LayoutComponent } from './layouts/layout/layout.component';
import { ProfileComponent } from './users/profile/profile.component';

const routes: Routes = [
  { path: '', redirectTo: 'timers', pathMatch: 'full' },
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: 'timers', component: TimerListComponent },
      { path: 'profile', component: ProfileComponent },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
