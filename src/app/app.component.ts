import { Component, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs/Observable";
import { TimeSheetInfo } from "./models/TimeSheetInfo";
import { environment } from '../environments/environment';
import { AppService } from "./app.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent {
  userName:string;
  
  constructor(private appService: AppService){
    this.appService.GetUserName.subscribe(user => this.userName = user);
    console.log("Environment:",environment.serverPath)  
    
}
}

