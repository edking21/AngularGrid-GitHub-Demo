import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimesheetComponent } from './timesheet.component';
import { TimesheetService } from './timesheet.service';
import { ButtonsModule } from '@progress/kendo-angular-buttons';
import { DropDownsModule } from '@progress/kendo-angular-dropdowns';
import { LabelModule } from '@progress/kendo-angular-label';
import { DateInputsModule } from '@progress/kendo-angular-dateinputs';
import { LayoutModule } from '@progress/kendo-angular-layout';
import { InputsModule } from '@progress/kendo-angular-inputs';
import { FormsModule } from '@angular/forms';
import { GridModule } from '@progress/kendo-angular-grid';
import { ToastrModule } from 'ngx-toastr';
import { DialogModule }  from '@progress/kendo-angular-dialog';

@NgModule({
  imports: [
    CommonModule,
    ButtonsModule,
    DropDownsModule,
    LabelModule,
    LayoutModule,
    DateInputsModule, 
    FormsModule, 
    InputsModule,
    GridModule,
    DialogModule
  ],
  providers:[TimesheetService],
  declarations: [TimesheetComponent],
  exports: [TimesheetComponent]

})
export class TimesheetModule { }
