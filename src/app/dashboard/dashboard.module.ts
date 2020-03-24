import { RouterModule, Routes } from '@angular/router'; // we also need angular router for Nebular to function properly
import { NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { TopnavComponent } from './topnav/topnav.component';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DialogModule }  from '@progress/kendo-angular-dialog';
import { SidenavService } from './sidenav/sidenav.service';
@NgModule({
  
  imports: [
    CommonModule, 
    RouterModule,
    ButtonsModule,
    DialogModule
  ],
  providers: [SidenavService],
  declarations: [DashboardComponent, SidenavComponent, TopnavComponent],
  exports: [DashboardComponent]
})
export class DashboardModule {}