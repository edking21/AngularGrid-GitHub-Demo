import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AssetService } from "../asset.service";
import { ToastrService } from 'ngx-toastr';
import { AppService } from "../../app.service";
import { environment } from "../../../environments/environment";
import { AssetComboBoxOptions } from '../../models/AssetComboBoxOptions';

@Component({
  selector: 'add-edit-dropdowns',
  templateUrl: './add-edit-dropdowns.component.html',
  styleUrls: ['./add-edit-dropdowns.component.scss']
})
export class AddEditDropdownsComponent implements OnInit {
  
  assetTypes: AssetComboBoxOptions[] = [ 
    {value:'1',   text:'test1', inactive:false},
    {value:'2',   text:'test2', inactive:false},
    {value:'3',   text:'test3', inactive:false},
    {value:'4',   text:'test4', inactive:false}
  ];
  assetElements = null;
  assetElementOptions : {value:string; text:string; precedingDropDownId:number; inactive:boolean; enabled:boolean; elementId:number}[]=[]; // = {value:"", text:"",precedingDropDownId:0,inactive:false};
  assetElementModelOptions : {value:string; text:string; precedingDropDownId:number; inactive:boolean; makeId:number; enabled:boolean; elementId:number}[]=[]; // = {value:"", text:"",precedingDropDownId:0,inactive:false};
  assetUIComponent=null;
  selectedElement: string;
  selectedElementId:number;
  selectedModelElementId:number;
  selectedAssetTypeId:number;
  selectedPrecedingID:number;
  userName: string;
  ModelMessage:boolean = false;
  ModelVisible:boolean = false;
  newAssetElement: { newDescription:string; newInactive:boolean } = {newDescription:"", newInactive:false };
  newAssetElementModel: { newDescription:string; newInactive:boolean } = {newDescription:"", newInactive:false };
  public marketId:number = 0;

  @Output() close = new EventEmitter<boolean>();
  

  constructor(private assetService: AssetService, private toastrService: ToastrService, private appService: AppService) {
    this.appService.GetUserName.subscribe(user => (this.userName = user));
    // if (this.userName == "")
    //   this.userName = window.location.href = environment.tokenIssuerClient; //this should never be blank. for testing only

      if(this.userName == "")
      this.userName = "eking";  //this should never be blank. for testing only


    }

  closeAEdropdowns() {
    this.close.emit(false);  
  }

  elementTextShown()
  {
    //Problem: element drop box won't clear the selected value when a different assettype is picked
    //solution: If the selected element(shown) can't be found in assetElements then refresh by returning "Select"
    //FYI: in html, "value" determines what selected text is shown. This is what this method controls
    let flag1 = 0;
     if (this.assetElements != null)
     {
      for (var x=0; x<this.assetElements.length; x++)
      {
        if (this.assetElements[x].elementId == this.selectedElementId)
          flag1 = 1;
      }
     }
     if (flag1 == 0)
      return {elementName:"Select", elementId:-1};
     else
      return {elementName: this.selectedElement, elementId:this.selectedElementId};
  }

  ngOnInit() {
    this.GetMarket();
    //this.GetAssetTypes();
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

  public GetMarket(){
    this.assetService.GetMarket(this.userName)
    .subscribe((market:number) => {
        this.marketId = market;
        this.assetService.SetTheMarket(market)
        this.GetAssetTypes();
        });
   }

  AssetTypeChanged(value, isRefresh) {
    this.selectedAssetTypeId = value.value;
    this.assetElements=[];
    this.assetElementOptions=[];
    this.assetElementModelOptions=[];

    this.assetService
      .GetAssetElements(this.marketId, value.value, true)
      .subscribe(aui => {
        this.assetUIComponent=aui
        this.GetAssetElements(this.assetUIComponent);

        if (isRefresh == 1)  //refresh after edit
        {
          let temp3 = {elementName : this.selectedElement, elementId : this.selectedElementId}
          this.ElementChanged(temp3);
          let temp4 = {value: this.selectedPrecedingID};
          this.EditElementOption(temp4);
        }
        if (isRefresh == 2)  //refresh after add
        {
          let temp3 = {elementName : this.selectedElement, elementId : this.selectedElementId}
          this.ElementChanged(temp3);
        }
      });

    this.ModelVisible = false;
  }

ElementChanged(value) {
  this.assetElementOptions=[];
  this.selectedElement = value.elementName;
  this.selectedElementId = value.elementId;

  let a = this.assetElements.filter(a => a.elementName == value.elementName);

  if (a[0].elementName != "Model")
  {
    for (var i=0; i < a[0].options.length; i++ )
    {
      this.assetElementOptions.push ({
        text: a[0].options[i].text,
        value: a[0].options[i].value,
        precedingDropDownId: a[0].options[i].precedingDropDownId,
        inactive: a[0].options[i].inactive,
        enabled:true,
        elementId: a[0].elementId
      }
    );
  }
  let b = this.assetElements.filter(b => b.elementName == "Model");
  this.selectedModelElementId = b[0].elementId;

  this.ModelMessage = false;
  }
  else
  {
    this.ModelMessage = true;
  }

  this.assetElementModelOptions=[];
  this.ModelVisible = false;
}

GetAssetElementModelOptions(valueElementName)
{
  this.assetElementModelOptions=[];
  if (valueElementName == "Make")
  {
    let a = this.assetElements.filter(a => a.elementName == "Model");
    for (var i=0; i < a[0].options.length; i++ )
    {
      this.assetElementModelOptions.push ({
        text: a[0].options[i].text,
        value: a[0].options[i].value,
        precedingDropDownId: a[0].options[i].precedingDropDownId,
        inactive: a[0].options[i].inactive,
        makeId: a[0].options[i].makeId,
        enabled:true,
        elementId: a[0].elementId
        }
      );
    }
  }
}

GetAssetElements(aui)
{
  let a = aui.filter(a => a.editable == 1 && a.elementTypeId == 2);
  this.assetElements = a;
}

EditElementOption(prop)
{
  for (var z=0; z < this.assetElementOptions.length; z++)
  {
    this.assetElementOptions[z].enabled=true;
  }
  prop.enabled = false;

  this.ModelVisible = false;
  if (this.selectedElement == "Make")
  {
    this.ModelVisible = true;
    this.GetAssetElementModelOptions("Make");
    let a = this.assetElementModelOptions.filter(a => a.precedingDropDownId == prop.value);
    this.assetElementModelOptions=[];
    for (var i=0; i < a.length; i++ )
    {
      this.assetElementModelOptions.push ({
        text: a[i].text,
        value: a[i].value,
        precedingDropDownId: a[i].precedingDropDownId,
        inactive: a[i].inactive,
        makeId: a[i].makeId,
        enabled:true,
        elementId: a[i].elementId
        }
      );
    }
    this.selectedPrecedingID = prop.value;
  }

}

EditModelOption(prop)
{
  for (var z=0; z < this.assetElementModelOptions.length; z++)
  {
    this.assetElementModelOptions[z].enabled=true;
  }
  prop.enabled = false;
}

UpdateElementOption(prop)
{
  this.UpdateOptions(prop);

  //refresh, make sure screen matches model
  // for (var x=0; x < this.assetUIComponent.length; x++)
  // {
  //   if (this.assetUIComponent[x].elementName == this.selectedElement)
  //   {
  //     for (var v=0; v < this.assetUIComponent[x].options.length; v++)
  //     {
  //       if (this.assetUIComponent[x].options[v].value == prop.value )
  //       {
  //         this.assetUIComponent[x].options[v].text = prop.text;
  //         this.assetUIComponent[x].options[v].inactive = prop.inactive;
  //       }
  //     }
  //   }
  // }
      
}

UpdateModelOption(prop)
{
  this.UpdateOptions(prop);
      
}

UpdateOptions(prop)
{
  let aui = this.assetUIComponent;
  aui=[];
  aui.push ({
    ElementId : prop.elementId,
    AssetTypeId : prop.value,
    Description : prop.text,
    Inactive : prop.inactive,
    AddedByUser : this.userName
  });

  this.assetService.UpdateElementOption(aui).subscribe((result:any) => {
    if (result.result == true) {
      this.toastrService.success("Successfully Saved");
    } else {
      this.toastrService.error(`Failed to save ${result.message}`);
    }
  });

  //refresh from DB
  let temp1 = {inactive : false, text: "", value:this.selectedAssetTypeId };
  this.AssetTypeChanged(temp1,1);

  prop.enabled = !prop.enabled;
}

AddElementOption()
{
  if (this.newAssetElement.newDescription==""  )
  {
    this.toastrService.error("Can't Add Element, Description Must Be Entered");
    return;
  }

  this.assetElementOptions.push({
    value:"",
    text:this.newAssetElement.newDescription,
    precedingDropDownId:0,
    inactive:this.newAssetElement.newInactive,
    enabled:true,
    elementId:0
  });

  //add
  this.AddOptions(this.newAssetElement, this.selectedElementId);

 

  //clear screen
  this.newAssetElement.newDescription="";
  this.newAssetElement.newInactive=false;
}

AddElementModelOption()
{
  if (this.newAssetElementModel.newDescription==""  )
  {
    this.toastrService.error("Can't Add Element, Description Must Be Entered");
    return;
  }

  this.assetElementModelOptions.push({
    value:"",
    text:this.newAssetElementModel.newDescription,
    precedingDropDownId:0,
    inactive:this.newAssetElementModel.newInactive,
    makeId:0,
    enabled:true,
    elementId:0
  });

  //add
  this.AddOptions(this.newAssetElementModel, this.selectedModelElementId);

  //clear screen
  this.newAssetElementModel.newDescription="";
  this.newAssetElementModel.newInactive=false;
}

AddOptions(prop, inSelectedElementId)
{
  let aui = this.assetUIComponent;
  aui=[];
  aui.push ({
    MarketId:this.marketId,
    ElementId : inSelectedElementId,
    AssetTypeId : this.selectedAssetTypeId,
    Description : prop.newDescription,
    Inactive : prop.newInactive,
    AddedByUser : this.userName,
    ElementTypeId : this.selectedPrecedingID
  });

  this.assetService.AddElementOption(aui).subscribe((result:any) => {
    if (result.result == true) {
      this.toastrService.success("Successfully Saved");
    } else {
      this.toastrService.error(`Failed to save ${result.message}`);
    }
  });

    //refresh from DB
    let temp1 = {inactive : false, text: "", value:this.selectedAssetTypeId };
    this.AssetTypeChanged(temp1,2);
}


}
