import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SelectableOptions } from "../../models/SelectableOptions";
import { AssetService } from "../asset.service";
import { ToastrService } from 'ngx-toastr';
import { AppService } from "../../app.service";
import { environment } from "../../../environments/environment";
import { AssetComboBoxOptions } from '../../models/AssetComboBoxOptions';

@Component({
  selector: 'add-edit-assettype',
  templateUrl: './add-edit-assettype.component.html',
  styleUrls: ['./add-edit-assettype.component.scss']
})

export class AddEditAssettypeComponent implements OnInit {

  public assetTypes: AssetComboBoxOptions[] = [];
  public ElementTypesList: SelectableOptions[] = [];
  
  @Output() close = new EventEmitter<number>();
  
  
  assetUIComponent:any=null;
  marketId:number;
  userName: string;
  newAssetTypeElement: { newElement:string; newLabel:string, newRequired:boolean, newSort:number, newElementTypeId:number, newElementType:string, newInactive:boolean, newWidth:number } = {newElement:"", newLabel:"", newRequired:false, newSort:0, newElementTypeId:0, newElementType:"", newInactive:false, newWidth:6 };
  vAssetType;
  vAssetTypeInactive;
  vAssetTypeId;
  visibleAssetTypeButton:boolean;

  constructor(private assetService: AssetService,    private toastrService:ToastrService,     private appService: AppService  ) { 
    this.appService.GetUserName.subscribe(user => (this.userName = user));
    // if (this.userName == "")
    //   this.userName = window.location.href = environment.tokenIssuerClient; //this should never be blank. for testing only
      if(this.userName == "")
      this.userName = "eking";  //this should never be blank. for testing only

  }



  closeAEassetType() {
    this.close.emit(0);  //false
  }


  ngOnInit() {
    this.GetMarket();
    this.GetAssetTypes();

    //this defaults the screen to "New Type" and blank
    this.visibleAssetTypeButton=true;

    this.GetElementTypes();
  }

  GetMarket(){
    this.assetService.GetTheMarket()
    .subscribe( mkt => {
        this.marketId = mkt;
    })
  }
  GetAssetTypes() {
    
    this.assetTypes = [];

    this.assetService.GetAssetType(this.marketId).subscribe((result:any) => {
      result.options.map(index => {
        this.assetTypes.push({
          text: index.text,
          value: index.value,
          inactive: index.inactive
        });
      });
    });
  }

  GetElementTypes() {
    this.assetService.GetElementTypesList(this.marketId).subscribe((result:any) => {
      result.map(index => {
        this.ElementTypesList.push({
          value: index.value,
          text: index.text
        });
      });
    });
  }


  AssetTypeChanged(value) {
      this.vAssetTypeId = value.value;

      this.assetService
      .GetAssetElements(this.marketId, value.value, false)
      .subscribe(aui => {
        this.assetUIComponent=aui
        
        if (value.value == "-1")
        {
          this.vAssetType = "";
          this.vAssetTypeInactive = false;
          this.visibleAssetTypeButton = true;
        }
        else 
        {
          this.vAssetType = value.text;
          this.vAssetTypeInactive = value.inactive;
          this.visibleAssetTypeButton = false;
        }
        });
        
 }

 defaultAssetType()
 {
    return { value: -1, text: "ADD NEW ASSET TYPE", inactive: false}
 }

 GetSelectedElementType(prop) 
 {
    return {value: prop.elementTypeId, text: prop.elementType};
 }

 handleElementTypeChange(event, prop)
 {
    prop.elementTypeId=event.value;
    prop.elementType=event.text;
 }

 handleElementTypeChange2(event)
 {
    this.newAssetTypeElement.newElementTypeId=event.value;
    this.newAssetTypeElement.newElementType=event.text;
 }

UpdateAssetType(assetUIComponent)
{
  //load info that can't be sent seperately to assetservice
  for (var x=0; x < assetUIComponent.length; x++ ){
    assetUIComponent[x].marketId = this.marketId;
    assetUIComponent[x].description = this.vAssetType;
    assetUIComponent[x].addedByUser = this.userName;
    assetUIComponent[x].AssetTypeInactive = this.vAssetTypeInactive;
    assetUIComponent[x].AssetTypeId = this.vAssetTypeId;
  }

   this.assetService.UpdateAssetType(assetUIComponent).subscribe((result:any) => {
    if (result.result == true) {
      this.toastrService.success("Successfully Saved");
    } else {
      this.toastrService.error(`Failed to save ${result.message}`);
    }
  });

}

AddAssetType(assetUIComponent)
{
  if (this.vAssetType =="")
  {
    this.toastrService.error("Can't Add Asset Type, Description Can't Be Blank");
    return;
  }

  //add info to a blank(new) assettype
  assetUIComponent=[];
  assetUIComponent.push ({  
    marketId: this.marketId,
    description: this.vAssetType,
    addedByUser: this.userName
  });

   this.assetService.AddAssetType(assetUIComponent).subscribe((result:any) => {
     if (result.result == true) {
      this.toastrService.success("Successfully Saved");
     } else {
        this.toastrService.error(`Failed to save ${result.message}`);
     }

    //refresh asset type combobox
    this.GetAssetTypes();
   });

   this.close.emit(3);  //false
  }

AddElement(assetUIComponent)
{
  if (this.newAssetTypeElement.newElement=="" || 
      this.newAssetTypeElement.newLabel=="" ||
      this.newAssetTypeElement.newElementType=="" ||
      this.newAssetTypeElement.newElementTypeId==0)
      {
        this.toastrService.error("Can't Add Element, Element Name, Label and Type Must Be Entered");
        return;
      }
  
  this.assetUIComponent.push ({  
     marketId: this.marketId,
     description: this.vAssetType,
     addedByUser: this.userName,

     elementName:this.newAssetTypeElement.newElement,
     elementTypeId:this.newAssetTypeElement.newElementTypeId,
     elementType:this.newAssetTypeElement.newElementType,
     label:this.newAssetTypeElement.newLabel,
     isRequired:this.newAssetTypeElement.newRequired,
     sortOrder:this.newAssetTypeElement.newSort,
     newInactive:this.newAssetTypeElement.newInactive,
     width:this.newAssetTypeElement.newWidth
   });

   //clear screen
   this.newAssetTypeElement.newElement="";
   this.newAssetTypeElement.newLabel="";
   this.newAssetTypeElement.newRequired=false;
   this.newAssetTypeElement.newSort=0;
   this.newAssetTypeElement.newWidth=0;
   this.newAssetTypeElement.newInactive=false;
}


}
