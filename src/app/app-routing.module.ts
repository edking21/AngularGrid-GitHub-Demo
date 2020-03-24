import { TimesheetComponent } from './timesheet/timesheet.component';
import { CrewComponent } from './crew/crew.component';
import { HomeComponent } from './home/home.component';
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: 'home' , component:HomeComponent },
  { path: 'timesheet', component:TimesheetComponent },
  { path: 'crew', component:CrewComponent },
  {
    path: 'asset',
    loadChildren: () => import('./asset/asset.module').then(m => m.AssetModule),
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

