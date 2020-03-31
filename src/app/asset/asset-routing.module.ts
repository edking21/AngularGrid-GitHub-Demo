import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { Asset2Component } from './asset2/asset2.component';


const routes: Routes = [
  {
    path: '',
    component: Asset2Component
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AssetRoutingModule { }