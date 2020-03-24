import { HttpInterceptor } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { HttpRequest ,HttpEvent, HttpHandler, HttpErrorResponse} from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { Router } from '@angular/router';
import { environment } from '../environments/environment'; 

    @Injectable()
    export class AuthInterceptor implements HttpInterceptor{

        constructor(private router:Router){

        }
        intercept(req:HttpRequest<any>, 
            next:HttpHandler):Observable<HttpEvent<any>>{ 
                const token = localStorage.getItem('token');
                    if(token){
                        const cloned = req.clone({
                            headers: req.headers.set("Authorization", 
                                "Bearer " + token)
                        });
                        
                        return next.handle(cloned).do(event => {}, err => {
                            if (err instanceof HttpErrorResponse) {
                                switch(Number(err.status)){  
                                    case 401:
                                    window.location.href= environment.tokenIssuerClient;
                                            break;
                                }
                            }   
                        })
                    }      
                        else{
                        return  next.handle(req);
                        }
            } 
}