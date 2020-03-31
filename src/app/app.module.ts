import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule} from '@angular/common/http';

// Imports for loading & configuring the in-memory web api
import { InMemoryWebApiModule } from 'angular-in-memory-web-api';
import { AppData } from './asset/app-data';

import { AppRoutingModule } from './app-routing.module';
import { AppService } from './app.service';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthInterceptor } from './headers.service';
import { CrewComponent } from './crew/crew.component';
import { HomeComponent } from './home/home.component';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { TimesheetModule } from './timesheet/timesheet.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ToastrModule } from 'ngx-toastr';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    CrewComponent,
    HomeComponent
  ],
  imports: [
    ToastrModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule, 
    
    InMemoryWebApiModule.forRoot(AppData, {
      dataEncapsulation: false,
      delay: 1000,
      passThruUnknownUrl: true }),


    HttpModule,
    TimesheetModule,
    DashboardModule,
    ToastrModule.forRoot({
      maxOpened:1,
      autoDismiss: true
    })
  ],
  providers: [ 
    AppService, 
    AuthInterceptor,
  {
    provide:HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi:true

  } 
],
  bootstrap: [AppComponent]
})
export class AppModule { }

