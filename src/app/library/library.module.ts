import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarComponent } from './avatar/avatar.component';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '../../../node_modules/@angular/router';

@NgModule({
  imports: [CommonModule, RouterModule, SharedModule],
  declarations: [AvatarComponent],
  exports: [AvatarComponent],
})
export class LibraryModule {}
