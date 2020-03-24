import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { AssetService } from "./asset.service";
import { UploadModule } from '@progress/kendo-angular-upload';
import { ButtonsModule } from "@progress/kendo-angular-buttons";
import { DropDownsModule } from "@progress/kendo-angular-dropdowns";
import { LabelModule } from "@progress/kendo-angular-label";
import { DateInputsModule } from "@progress/kendo-angular-dateinputs";
import { LayoutModule } from "@progress/kendo-angular-layout";
import { InputsModule } from "@progress/kendo-angular-inputs";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ToastrModule } from 'ngx-toastr';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { DialogModule }  from '@progress/kendo-angular-dialog';
import { GridModule } from "@progress/kendo-angular-grid";
import { ExcelExportModule } from '@progress/kendo-angular-excel-export';
import { HttpClientModule} from '@angular/common/http';
import { HttpClientJsonpModule} from '@angular/common/http';
import { AssetComponent } from "./asset.component";
import { AssetAddComponent } from "./asset-add/asset-add.component";
import { AssetEditComponent } from './asset-edit/asset-edit.component';
import { ArraySortPipe } from '../pipes/array-sort-pipe.pipe';
import { AssetRoutingModule} from "./asset-routing.module";
import { AuthInterceptor } from '../headers.service';
import { AssetFacilityComponent } from './asset-facility/asset-facility.component';
import { AddEditAssettypeComponent } from './add-edit-assettype/add-edit-assettype.component';
import { AddEditDropdownsComponent } from './add-edit-dropdowns/add-edit-dropdowns.component';

@NgModule({
  imports: [
    AssetRoutingModule,
    HttpClientModule,
    HttpClientJsonpModule,
    ReactiveFormsModule,
    CommonModule,
    ButtonsModule,
    DropDownsModule,
    LabelModule,
    LayoutModule,
    DateInputsModule,
    FormsModule,
    InputsModule,
    GridModule,
    ToastrModule,
    DialogModule,
    UploadModule,
    ExcelExportModule
  ],
  declarations: [
    AssetAddComponent,
    AssetComponent,
    AssetEditComponent,
    ArraySortPipe,
    AssetFacilityComponent,
    AddEditAssettypeComponent,
    AddEditDropdownsComponent,
  ],
  entryComponents: [
    AssetEditComponent,
  ],
  exports: [
    AssetComponent,
  ],
  providers: [
    AssetService,
    // DialogService,
    AuthInterceptor,
    {
      provide:HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi:true
    } 
  ]
})
export class AssetModule {}
