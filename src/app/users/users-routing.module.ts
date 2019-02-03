import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import { LayoutComponent } from '../layouts/layout/layout.component';

const usersRoutes: Routes = [
  {
    path: 'users',
    component: LayoutComponent,
    children: [{ path: 'profile', component: ProfileComponent }],
  },
];

@NgModule({
  imports: [RouterModule.forChild(usersRoutes)],
  exports: [RouterModule],
})
export class UsersRoutingModule {}
