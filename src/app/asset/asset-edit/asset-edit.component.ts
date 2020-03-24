import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  OnDestroy
} from "@angular/core";
import { AssetService } from "../asset.service";
import { AssetElement } from "../../models/AssetElement";
import { AssetHistory } from "../../models/AssetHistory";
import { FileInfo } from "@progress/kendo-angular-upload";
import { environment } from "../../../environments/environment";
import { AssetInfo } from "../../models/AssetInfo";
import { AppService } from "../../app.service";
import { Subscription } from "rxjs/Subscription";
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: "asset-edit",
  templateUrl: "./asset-edit.component.html",
  styleUrls: ["./asset-edit.component.scss"]
})
export class AssetEditComponent implements OnInit, OnDestroy {
  @Input() editDialogOpened;
  @Input() currentAssetInfo;
  @Input() selectedType;
  @Input() users;
  @Input() isAddAsset:boolean;
  @Input() assetTypes;

  subscription: Subscription;

  @Output() editDialogClosed = new EventEmitter<boolean>();
  @Output() messageEvent = new EventEmitter<string>();
  @Output() assetElementChangeEvent = new EventEmitter<AssetInfo>();

  asset;
  objectProps;
  allModelOptions;
  uploadSaveUrl = "saveUrl";
  uploadRemoveUrl = "removeUrl";
  assetElement: AssetElement = new AssetElement();
  public assetHistory: AssetHistory[] = [];
  assetType: string = "Asset";
  myFiles: Array<FileInfo>;
  serverPath: string = environment.serverPath;
  baseAssets: string[] = ["TagId", "Make", "Model", "Status", "Comments"];
  userName: string;
  icount = 0;
  assetElements2 = [];
  changedProps2: {
    elementId: number;
    elementName: string;
    valueText: string;
    value: string;
  }[] = [{ elementId: 0, elementName: "", valueText: "", value: "" }];
  error1:boolean=false;

  constructor(
    private assetService: AssetService,
    private appService: AppService,
    private toastrService: ToastrService
  ) {
   
    this.appService.GetUserName.subscribe(user => (this.userName = user));
    if (this.userName == "")
      this.userName = window.location.href = environment.tokenIssuerClient; //this should never be blank. for testing only
  }

  ngOnDestroy() {
    // prevent memory leak when component destroyed
    
  }

  GetSelectedValue(prop) {
    if (prop.value == null) {
      return {value: 1, text: ""};
    } else {
      if (prop.options == null) {
        return {value: 1, text: ""};
      }
      let x = prop.options.filter(x => x.value == prop.value)[0];
      if (x == null) {
        return {value: 1, text: ""};
      } else {
        return {value: x.value, text: x.text};
      }
    }
  }
  
  handleDropdownChange(event, prop) {
    let element = {
      elementId: prop.elementId,
      elementName: event.text,
      valueText: event.text,
      value: event.value.toString()
    };
    this.changedProps2[prop.elementId] = element;

    prop.value=event.value;
    prop.text=event.valueText;

    if (prop.key == "Make") {
      this.setMakeModelCombo(event.value);

    }
  }

  handleTextareaChange(event, prop) {
    let element = {
      elementId: prop.elementId,
      elementName: event,
      valueText: event,
      value: event
    };
    this.changedProps2[prop.elementId] = element;
  }

  handleNumericChange(event, prop) {
    let element = {
      elementId: prop.elementId,
      elementName: event,
      valueText: event,
      value: event
    };
    this.changedProps2[prop.elementId] = element;
  }

  isBaseAsset(index) {
    return this.baseAssets.indexOf(index) > -1;
  }

  UpdateAsset(objectProps) {
    if (objectProps[0].key == "TagId" && objectProps[0].value == null) {
      if (objectProps[0].value == null || objectProps[0].value == "") {
        this.toastrService.error("Failed to save: TagId required");
        return;
      }
    }

    //check for required fields not filled in
    for (var assetElm=0; assetElm < objectProps.length; assetElm++)
    {
      if (objectProps[assetElm].isRequired == true && objectProps[assetElm].editable == true)
      {
        if (objectProps[assetElm].value == null || objectProps[assetElm].value == "")
          {
            this.toastrService.error(`Failed to save: ${objectProps[assetElm].key} is required"`);
            return;
          }
      }
    }

    let ai: AssetInfo = new AssetInfo();
    ai.AssetElements = [];

    this.objectProps.map(index => {
      if (this.isBaseAsset(index.key)) {
        ai[index.key] = index.value;
      }
      ai.AssetElements.push({
        ElementName: index.key,
        ElementId: index.elementId,
        ElementTypeId: index.elementTypeId,
        Value: index.value,
        ValueText: index.valueText = index.options.length == 0 ? null : 
          (!index.value || index.value === 0 ) ? null : 
          index.options.filter (x=>x.value == index.value).length == 0 ? index.value :
          index.options.filter (x=>x.value == index.value)[0].text,
        Editable: index.Editable
      });
    });

    ai.AssetId = this.currentAssetInfo.assetId;
    ai.TypeId = this.currentAssetInfo.TypeId;
    ai.MarketId = this.currentAssetInfo.marketId;

    ai.UpdatedBy = this.userName;
    if (this.userName == "") {
      ai.UpdatedBy = window.location.href = environment.tokenIssuerClient; // this shouldn't happen except in debug because the username doesn't get read in testing
    }

    ////////////////////////////////////////////////////// post assetElements2 in the parent grid
    if (ai.AssetId != null) {
      this.assetElements2[0] = ai.AssetId.toString();
      let ictr = 1;
      for (var i = 1; i < objectProps.length; i++) {
        this.assetElements2[ictr] = this.objectProps[i];
        for (var j = 0; j < this.changedProps2.length; j++) {
          if (
            this.changedProps2[j] &&
            this.changedProps2[j].elementId === this.assetElements2[ictr].elementId 
          ) {
            this.assetElements2[ictr].valueText = this.changedProps2[j].valueText;
            ai.AssetElements[i].ValueText = this.changedProps2[j].valueText;
            ai.AssetElements[i].Value = this.changedProps2[j].value;
          }
        }
        ictr++;
      }
      this.assetService.announceAssetElements(this.assetElements2); 
    }
    ////////////////////////////////////////////////////// post assetElements2 in the parent grid


    //add date and user to comments
    let dt = new Date();
    let t1=this.currentAssetInfo.comments;
    ai.AssetElements.forEach(function(e) {
      if (e.ElementName.toUpperCase() == "COMMENTS" && t1 != e.Value && e.Value != null) {
        e.Value = e.Value ;
        e.ValueText = e.ValueText;
      }
    });

    if (ai.AssetId == null) {
      // ***************
      // **** ADD ******
      // ***************
      ai.StatusDTM = new Date();
      ai.FacilityId = this.getUserFacility();
      ai.ScanId = ""; //leave blank
      ai.Comments = ""; //leave blank , was ActivityComments
      ai.TypeId = this.currentAssetInfo.assetTypeId;

      let x : any = ai.AssetElements

      this.assetService.announceAssetAdd(x); 

      ai.CreatedBy = this.userName;
      if (this.userName == "") {
        ai[0].CreatedBy = window.location.href = environment.tokenIssuerClient; // this shouldn't happen except in debug because the username doesn't get read in testing
      }

      this.assetService.AddAsset(ai).subscribe((result:any) => {
        if (result.result == true) {
          this.toastrService.success("Successfully Saved");

        } else {
          this.toastrService.error( `Failed to save: ${result.message}`);
        }
      });
    } else {
      // ***************
      // **** EDIT *****
      // ***************
      this.assetService.EditAsset(ai).subscribe((result:any) => {
        if (result.result == true) {
          this.toastrService.success("Successfully Saved");
        } else {
          this.toastrService.error( `Failed to save: ${result.message}`);
        }
      });
    }
  
    this.closeEditDialog();
  }

  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  ngOnInit() {
    if (this.currentAssetInfo.assetId) {
      this.assetService
        .GetAssetUIComponents(
          this.currentAssetInfo.marketId,
          this.currentAssetInfo.assetTypeId,
          this.currentAssetInfo.assetId,
        )
        .subscribe((assetInfo:any) => {
          this.asset = this.TransformObject(assetInfo);
          this.objectProps = Object.keys(this.asset).map(prop => {
            return Object.assign({}, { key: prop }, this.asset[prop]);
          });
          this.assetType = assetInfo.filter(
            index => index.label === "Type"
          ).value;
          for (var i = 0; i < this.assetTypes.length; i++) {
            if (this.assetTypes[i].value == this.currentAssetInfo.assetTypeId) {
              this.assetType = this.assetTypes[i].text;
            }
          }
          
          if (this.objectProps.length != 0) {
            this.setMakeModelCombo(null);
            this.error1=false;
          }
          else
            this.error1=true;
        });
    } else {
      this.assetService
        .GetAssetElements(
          this.currentAssetInfo.marketId,
          this.currentAssetInfo.assetTypeId,
          false
        )
        .subscribe(assetInfo => {
          this.asset = this.TransformObject(assetInfo);
          this.objectProps = Object.keys(this.asset).map(prop => {
            return Object.assign({}, { key: prop }, this.asset[prop]);
          });
          for (var i = 0; i < this.assetTypes.length; i++) {
            if (this.assetTypes[i].value == this.currentAssetInfo.assetTypeId) {
              this.assetType = this.assetTypes[i].text;
            }
          }
          if (this.objectProps.length != 0) {
            this.setMakeModelCombo(null);
            this.error1=false;
          }
          else
            this.error1=true;
          
        });
    }


    this.assetService.GetAssetHistory(this.currentAssetInfo.assetId).subscribe((result:any) => {
      result.map(index => {
        this.assetHistory.push({
          //Comments:index.comments,
          //AuditAction:index.AuditAction

          AuditAction: index.auditAction,
          AuditDTM: index.auditDTM,
          UpdatedBy: index.updatedBy,
          CheckedOutTo: index.checkedOutTo,
          Market: index.market,
          Facility: index.facility,
          TagId: index.tagId,
          AssetType: index.assetType,
          Make: index.make,
          Model: index.model,
          AssetStatus: index.assetStatus,
          Comments: index.comments

        })
      })
    });
  }

  setMakeModelCombo(inValue:number) {
    //save all model options for cascading dropdown
    //1. find array element for model 2. save that info to allModelOptions
    let t1=0;
    let t2=0;
    for (var i=0; i < this.objectProps.length; i++) {
      if (this.objectProps[i].key == "Model") {
        t1=i;
      }
      if (this.objectProps[i].key == "Make") {
        t2=i;
      }
    }

    //filter the model options and set them
    if (inValue == null){    //init
      this.allModelOptions = this.objectProps[t1].options;   // do this once on init only
      let z=this.allModelOptions.filter(x=>x.precedingDropDownId==this.objectProps[t2].value);
      this.objectProps[t1].options=z;
    }
    else{   //on make change
      let z=this.allModelOptions.filter(x=>x.precedingDropDownId==inValue);
      this.objectProps[t1].options=z;
    }
  }


  getUserFacility() {
    var fac = this.users.filter(
      index => index.UserName.toUpperCase() == this.userName.toUpperCase()
    );
    if (fac.length < 1) return 0;
    else return fac[0].FacilityId;
  }

  GetRadioValue(options, value) {
    return true
      ? options.filter(index => index.text === value)[0].text === value
      : false;
  }
  closeEditDialog() {
    this.editDialogClosed.emit(false);
  }

  TransformObject(asset): Object {
    let obj = {};
    asset.map(index => {
      obj[index.elementName] = {
        key: index.elementName,
        options: index.options,
        label: index.label,
        value: index.elementValue,
        type: index.elementType,
        sortOrder: index.sortOrder,
        width: index.width,
        elementId: index.elementId,
        elementTypeId: index.elementTypeId,
        valueText: index.valueText,
        isRequired: index.isRequired,
        editable: index.editable
      };
    });
    return obj;
  }

  successToast(message): void {
    this.toastrService.success(message);
  }

  errToast(message): void {
    this.toastrService.error(message);
  }

  GetRequiredMarker(prop) {
    if (prop.isRequired == true && prop.editable == true)
      return true;
    else
      return false;
  }




  // ***************************************************************
// *** Asset History *********************************************
// ***************************************************************

public openAssetHistory: boolean = false;

AssetHistoryClick()
{
  this.openAssetHistory = true;
}


// ***************************************************************
 
}
