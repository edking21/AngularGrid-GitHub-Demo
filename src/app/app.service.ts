import { Injectable } from "@angular/core";
import { HttpClient ,HttpHeaders, HttpErrorResponse} from "@angular/common/http";
import {Router, ActivatedRoute, Params} from '@angular/router';
import {  BehaviorSubject} from 'rxjs/Rx';
import { environment } from '../environments/environment'; 

@Injectable()
export class AppService {
  
  querystring = "";
  private userName = new BehaviorSubject<string>('');
  GetUserName = this.userName.asObservable();

  constructor( private http: HttpClient, private router:Router, private activatedRoute: ActivatedRoute) {

    this.activatedRoute.queryParams.subscribe((
      params: Params) => {
          if(params["userName"] && params["timeStamp"] && params["seed"]){
              this.querystring = `?userName=${params["userName"]}&timeStamp=${params["timeStamp"]}&seed=${encodeURIComponent(params["seed"])}`;
              this.http.get(environment.tokenIssuerPath +'/api/jwt/getjwt'+this.querystring).subscribe(
                  token  =>{
                    localStorage.setItem('token', token["returnJwt"]);
                    this.router.navigate(['/home'])  
                    this.SetUser(params["userName"]);
                    },
                        (err: HttpErrorResponse) => {
                          if (err.error instanceof Error) {
                            console.log("Client-side error occured.", err.error);
                          } else {
                            console.log("Server-side error occured.", err.error);
                          }
                    });
            }  
});
}
  SetUser(newUser){
      this.userName.next(newUser);
  }
  
}


