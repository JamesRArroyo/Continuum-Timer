import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GitlabService } from './gitlab.service';
import { GitlabNewTimerComponent } from './gitlab-new-timer/gitlab-new-timer.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [CommonModule, RouterModule, SharedModule],
  providers: [GitlabService],
  declarations: [GitlabNewTimerComponent],
})
export class GitlabModule {}
