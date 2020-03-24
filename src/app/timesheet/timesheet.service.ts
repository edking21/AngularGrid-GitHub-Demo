import { Injectable } from "@angular/core";
import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpErrorResponse
} from "@angular/common/http";
import { TimeSheetInfo } from "../models/TimeSheetInfo";
import { StatusKronos } from "../models/StatusKronos";
import { Observable, BehaviorSubject } from "rxjs";
import { AuthInterceptor } from "./../headers.service";
import "rxjs/add/operator/catch";
import { environment } from '../../environments/environment'; 

@Injectable()
export class TimesheetService {
  private existRecError = new BehaviorSubject<string>("");
  GetExistRecError = this.existRecError.asObservable();


  constructor(private http: HttpClient) {}

  IsTimeSheetUser() {
    return this.http.get(environment.serverPath +"api/time/istimesheetuser");
  }

  DeleteTimesheet(timesheet) {
    return this.http.post(environment.serverPath +"api/time/deletetimesheet", timesheet);
  }
  SetKronosStatus(info) {
    return this.http.post(environment.serverPath +"api/time/setkronosstatus", info);
  }
  GetKronosUser() {
    return this.http.get<StatusKronos[]>(environment.serverPath +"api/time/getkronosuser");
  }
  GetKronosStatus(info) {
    return this.http.post(environment.serverPath +"api/time/getkronosstatus", info);
  }
  GetUserRole(userInfo) {
    return this.http.post(environment.serverPath +"api/time/timesheetuserrole", userInfo);
  }
  SetErrorMessage(message) {
    this.existRecError.next(message);
  }
 
  GetActivities(): Observable<TimeSheetInfo[]> {
    return this.http.get<TimeSheetInfo[]>(environment.serverPath +"api/time/activities");
  }
  GetTimeSheet(startdate, selectedUserName): Observable<TimeSheetInfo[]> {
    return this.http.post<TimeSheetInfo[]>(environment.serverPath +"api/time/gettimesheet",  { UserName: selectedUserName, WeekBeginDate: new Date(startdate)})
    
  }
 
  AddEditTimeSheet(newTimeSheet): Observable<(any)> {
    return this.http
      .post<TimeSheetInfo>(environment.serverPath +"api/time/addoredittimesheet", newTimeSheet)
      .catch((err: HttpErrorResponse) => {
        if (err.error instanceof Error) {
            console.error(err.error.message);
        } else {
              this.SetErrorMessage(err.error);
        }
               return Observable.empty(err.error);
      });
  }
  
}
