import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, tap } from 'rxjs/operators';
import { throwError, Observable } from 'rxjs';
import { Asset } from './../asset';

@Injectable({
  providedIn: 'root'
})
export class Asset2Service {

  constructor(private http: HttpClient) { }

  getAssets(): Observable<Asset[]>{
    return this.http.get<Asset[]>('api/assets')
      .pipe(
        // tap(data => console.log('Assets: ', JSON.stringify(data))),
        catchError(this.handleError));

  }

    private handleError(err: any) {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage: string;
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Backend returned code ${err.status}: ${err.body.error}`;
    }
    console.error(err);
    return throwError(errorMessage);
  }
}
