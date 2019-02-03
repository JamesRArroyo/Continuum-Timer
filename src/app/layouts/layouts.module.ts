import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutComponent } from './layout/layout.component';
import { HeaderComponent } from './header/header.component';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';
import { LoadingComponent } from './loading/loading.component';

@NgModule({
  imports: [CommonModule, RouterModule, SharedModule],
  declarations: [LayoutComponent, HeaderComponent, LoadingComponent],
  exports: [LayoutComponent, LoadingComponent],
})
export class LayoutsModule {}
