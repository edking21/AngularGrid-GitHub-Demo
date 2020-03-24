import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { ToastrService } from 'ngx-toastr';
import { AssetService } from "../asset.service";
import { SelectableOptions }  from '../../models/SelectableOptions';
import { AppService } from "../../app.service";
import { environment } from "../../../environments/environment";



@Component({
  selector: "asset-add",
  templateUrl: "./asset-add.component.html",
  styleUrls: ["./asset-add.component.scss"]
})
export class AssetAddComponent implements OnInit {
  public active = false;
  public status = "not open";
  @Output() AddDialogClosed = new EventEmitter<boolean>();
  assetTypes:SelectableOptions[] = [];
  public selectedType: { text: string, value: number };
  public defaultItem: { text: string, value: number } = { text: "Select Asset Type...", value: null };
  public selectedValue: { text: string, value: number } = { text: "Foo", value: 1 };
  public marketId:number = 0;
  userName: string;
  
  constructor(
      private assetService: AssetService,
      private appService: AppService,
      private toastrService: ToastrService
    ) 
    {
        this.appService.GetUserName.subscribe(user => (this.userName = user));
        if (this.userName == "")
          this.userName = window.location.href = environment.tokenIssuerClient; //this should never be blank. for testing only
  }

  closeAddDialog() {
    this.AddDialogClosed.emit(false)
  }


  ngOnInit(): void {
    this.GetMarket();

  }


  public GetMarket(){
    this.assetService.GetMarket(this.userName)
    .subscribe((market:number) => {
        this.marketId = market;
        this.assetService.SetTheMarket(market)
        //These calls must be here due to dependencies on GetMarket returning the MarketId from the DB.
        this.GetAssetTypes();
        });
   }

   public GetAssetTypes() {
    
    this.assetService.GetAssetType(this.marketId).subscribe((result:any)=>{
      result.options.map(index=>{
        this.assetTypes.push({
          value:index.value, text:index.text
        })
      
      })
    }  
  )  
   }

  public onCancel(e) : void {
      e.preventDefault();
      this.closeForm();
  }
  
  private closeForm(): void {
      this.active = false;
  }

  public onCreate(e): void {
  
    }

successToast(message): void {
    this.toastrService.success(message);
  }

}
