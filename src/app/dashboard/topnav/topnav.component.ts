import { Component, OnInit } from '@angular/core';
import { AppService } from "../../app.service";
import { environment } from '../../../environments/environment';

@Component({
  selector: 'topnav',
  templateUrl: './topnav.component.html',
  styleUrls: ['./topnav.component.scss']
})
export class TopnavComponent implements OnInit {
mouseOvered:boolean = false;
userName:string;
searchMode:boolean = false;
openSupportDialog:boolean = false;

  settings: Array<any> = [{
    text: 'Profile'
}, {
    text: 'Return to Portal'
}, {
    text: 'Support'
}, {
    text: 'Log Out'
}];
  constructor(private appService:AppService) { 
    this.appService.GetUserName.subscribe(user => this.userName = user);
  }

  ngOnInit() {
    
  }
  onItemClick(value){
    switch(value.text){
      case "Profile":
          window.location.href= environment.tokenIssuerClient+`?gtma=${this.userName}`;
      break;

      case "Return to Portal":
        window.location.href= environment.tokenIssuerClient+`?kmli=${this.userName}`;
      break;

      case "Support":
          this.openSupportDialog = true;
      break;

      case "Log Out":
        window.location.href= environment.tokenIssuerClient
      break;
    }
  }
  

}
