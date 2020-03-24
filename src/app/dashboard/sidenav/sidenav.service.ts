import { Injectable, OnInit } from "@angular/core";
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
  HttpHeaders
} from "@angular/common/http";
import { throwError } from "rxjs";
import { RoleListModel } from "../../models/RoleListModel";
import { environment } from "../../../environments/environment";
import { catchError } from "rxjs/operators";

@Injectable()
export class SidenavService implements OnInit {
  constructor(private http: HttpClient) {}

  ngOnInit() {}

  GetRoles(IsWebAdmin:boolean, SubUserName:string, UserName:string) {
    const params = new HttpParams()
      .append('IsWebAdmin', IsWebAdmin.toString())
      .append('SubUserName', SubUserName)
      .append('UserName', UserName);

    return this.http
      .get<RoleListModel[]>(environment.serverPath + "api/utiliRole/getroles",{params})
      .pipe(catchError(this.handleError));
  }
  private handleError(error: HttpErrorResponse) {
    console.log("sidenav.service handleError");
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error("An error occurred:", error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` + `body was: ${error.error} ${error.error.message}`
      );
    }
    // return an ErrorObservable with a user-facing error message
    return  throwError(
      "Something bad happened; please try again later."
    );
  }
}
