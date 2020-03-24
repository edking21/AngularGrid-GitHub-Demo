import { DomSanitizer, SafeStyle } from "@angular/platform-browser";
import {
  Component,
  OnInit,
  ViewChild,
  ViewEncapsulation
} from "@angular/core";
import { AssetService } from "./asset.service";
import { ToastrService } from 'ngx-toastr';

import { AssetInfo } from "../models/AssetInfo";
import { State, toDataSourceRequest } from "@progress/kendo-data-query";
import { AutoCompleteComponent } from '@progress/kendo-angular-dropdowns';
import { GridColumn } from "../models/GridColumn";
import { RowClassArgs, RowArgs } from "@progress/kendo-angular-grid";
import { DataStateChangeEvent } from "@progress/kendo-angular-grid";
import { SelectableOptions } from "../models/SelectableOptions";
import { Subscription, ReplaySubject } from "rxjs";
import { AppService } from "../app.service";
import { environment } from "../../environments/environment";
import { AssetDesign } from "../models/AssetDesign";

import { GridDataResult, PageChangeEvent, SelectAllCheckboxState } from '@progress/kendo-angular-grid';


@Component({
  styleUrls: ["styles2.scss"],
  selector: "app-asset",
  templateUrl: "./asset.component.html"
})
export class AssetComponent implements OnInit {
  assetSubscribe = [];
  assetSubscribeAdd = [];
  @ViewChild("grid", { static: true }) grid;
  @ViewChild('autocomplete', { static: false }) public autocomplete: AutoCompleteComponent;
  public assignee: { UserName: string; FacilityId: number } = {
    UserName: "Select a User",
    FacilityId: null
  };
  public assets: AssetInfo[] = [];
  public nuassets;
  public marketId: number = 0;
  public searchText: string;
  public assetsTemp: any[] = [];
  public exportColumns: any[] = [];

  //test area
  public items: any[] = this.assets;
  public selectAllState: SelectAllCheckboxState = 'unchecked';
  public selectedRowsDisplayed: any[] = [];
  public isRowSelected = (e: RowArgs) => this.selectedRowsDisplayed.indexOf(e.dataItem.assetId) >= 0;


  changedProps2: {
    elementId: number;
    elementName: string;
    valueText: string;
    value: string;
  }[] = [{ elementId: 0, elementName: "", valueText: "", value: "" }];

  assetElementTemp: {
    ElementName: string;
    Value: string;
  };

  myasset: {
    tagId: string;
    AssetId: number;
    marketId: number;
    FacilityId: number;
    facility: string;
    typeId: number;
    assetType: string,
    statusId: number;
    assetStatus: string;
    make: string;
    model: string;
    StatusDTM: Date;
    Comments: string;   //was activityComments
    createdBy: string;
    CreatedDTM: Date;
    UpdatedBy: string;
    updatedDTMFormatted: Date;
    ScanId: string;
    CheckedOutTo: string;
    assetElements: AssetDesign[];
  } = {
      tagId: "",
      AssetId: 0,
      marketId: 0,
      FacilityId: 0,
      facility: "",
      typeId: 0,
      assetType: "",
      statusId: 0,
      assetStatus: "",
      make: "",
      model: "",
      StatusDTM: new Date(),
      Comments: "",   //was activityComments
      createdBy: "",
      CreatedDTM: new Date(),
      UpdatedBy: "",
      updatedDTMFormatted: new Date(),
      ScanId: "",
      CheckedOutTo: "",
      assetElements: []
    };

  tempAssetElement: {
    assetElement: AssetDesign;
  }[];

  tempElement: {
    elementName: string;
    value: string;
  }[] = [{ elementName: "", value: "" }];

  // public myAssetInfo: AssetInfo = new AssetInfo();
  public selectedAssetRows: AssetInfo[] = [];
  public columns: GridColumn[] = [];
  public currentAssetId;
  public selectedRows: Array<{ value: any; index: number }> = [];
  public opened: boolean = false;
  public openedAdd: boolean = false;
  public openFacility: boolean = false;
  public openSettings: boolean = false;
  public openAEassetType: boolean = false;
  public openAEdropdowns: boolean = false;
  public users: Array<{ UserName: string; FacilityId: number }> = [];
  public AssetManagers: Array<{ UserName: string; FacilityId: number }> = [];
  public confirmationDialog: boolean = false;
  public confirmationAction: string;
  public assetTypes: SelectableOptions[] = [];
  public facilityList: SelectableOptions[] = [];
  public selectedValue: { text: string; value: number } = {
    text: "Select Asset Type",
    value: null
  };
  public selectedUser: { UserName: string } = {
    UserName: ""
  };
  public selectedFacility: { text: string; value: number } = {
    text: "",
    value: null
  };
  public allSelected: boolean = false;
  public isPagable: boolean = true;
  public pageSize: number = 10;

  searchTextLength: number = 3;
  openCommentDialog: boolean = false;
  currentlySelectedComment: string = "";
  currentAssetInfo = {
    marketId: null,
    assetTypeId: null,
    assetId: null,
    comments: null,
    tagId: null
  };
  isAddAsset: boolean = false;
  public hiddenColumns = [];

  currentUser: string;
  isAssetManager: boolean;

  public state: State = {
    skip: 0,
    take: 10,
    filter: {
      logic: "and",
      filters: [{ field: null, operator: "isnotnull", value: "" }]
    }
  };

  handleSearchFilter(inValue) {
    let temp = new Array<AssetInfo>();
    let matched = false;
    let tempPropValue = "";
    let searchableFieldString = "tagId facility assetType make model createdBy checkedOutTo updatedDTM Comments";   //was ActivityComments
    let assetElementSearchString = "";

    if (inValue == undefined)
      inValue = "";

    if (inValue.length >= this.searchTextLength) {
      //x = properity all, y = properity name, x[y] = value
      this.assets.map(x => {
        matched = false;
        Object.keys(x).map(y => {

          //handle null error  
          if (x[y] == "" || x[y] == null)
            tempPropValue = "";
          else
            tempPropValue = x[y].toString().toUpperCase();

          //check if search value is in the grid(class)
          if (tempPropValue.indexOf(inValue.toString().toUpperCase()) >= 0 && !matched && searchableFieldString.indexOf(y) >= 0) {
            temp.push(x);
            matched = true;
          }

          //also check if search value is in comment array
          if (matched == false && y == "assetElements") {
            //put the array comments into one string
            assetElementSearchString = "";
            x["assetElements"].forEach(function (oneElement) {
              assetElementSearchString = assetElementSearchString + oneElement.valueText + " ";
            });

            //check if search value is in comment string
            if (assetElementSearchString.toUpperCase().indexOf(inValue.toString().toUpperCase()) >= 0 && !matched) {
              temp.push(x);
              matched = true;
            }
          }


        })
      })
      this.gridData = [];
      this.gridData = temp;
      //this.state.skip=0;  //moves to the first page
      //this.pageChange({skip:0});  //moves to the first page
    }
    else {
      this.gridData = this.assets;
    }

    this.state.skip = 0;  //moves to the first page
    this.pageChange({ skip: 0 });  //moves to the first page

  }

  public SelectionKey(context: RowArgs): string {
    try {
      return context.dataItem.assetId + " " + context.index;
    } catch {
      //don't know why this happens when a row is clicked 3 times
    }
  }

  ViewComments(dataItem) {

    this.openCommentDialog = true;
    this.currentlySelectedComment = dataItem.comments;
  }

  public gridData: any[] = [];

  public dataStateChange(state: DataStateChangeEvent): void {
    this.state = state;
    //this.gridData = this.assets;  //10/23/19 SD: not sure why the grid was reloaded everytime its state changed but it caused problems between grid filter and search box when used together. This may cause some refresh issus but I haven't seen any in testing
  }

  //////////////// Post updates to the Asset Components in the child row
  subscription: Subscription;
  subscriptionAdd: Subscription;
  constructor(
    private assetService: AssetService,
    private toastrService: ToastrService,
    private sanitizer: DomSanitizer,
    private appService: AppService
  ) {
    this.assetSubscribe = null;
    this.assetSubscribeAdd = null;

    // edit
    this.subscription = assetService.assetElementAnnounceds$.subscribe(
      assetSubscribe => {
        this.nuassets = this.assets;
        if (
          this.selectedRows[0].value.assetId.toString() === assetSubscribe[0]
        ) {
          this.assetSubscribe = null;
          this.assetSubscribe = assetSubscribe;
          for (var j = 0; j < this.nuassets.length; j++) {
            if (this.nuassets[j].assetId == assetSubscribe[0]) {
              this.nuassets[j].make = assetSubscribe[1].valueText;
              this.nuassets[j].model = assetSubscribe[2].valueText;
              this.nuassets[j].checkedOutTo = assetSubscribe[5].valueText;
              for (var i = 7; i < assetSubscribe.length; i++) {
                this.nuassets[j].assetElements[i - 7].label =
                  assetSubscribe[i].key;
                this.nuassets[j].assetElements[i - 7].valueText =
                  assetSubscribe[i].valueText;
              }
            }
          }
        } else {
          this.assetSubscribe = null;
        }
      },
      error => {
        console.log("asset.component error: ", error);
      }
    );

    // add
    this.subscriptionAdd = assetService.assetAddAnnounceds$.subscribe(
      assetSubscribe => {
        let elementValue;
        this.nuassets = this.assets;
        this.assetSubscribe = assetSubscribe;
        this.myasset.tagId = this.assetSubscribe[0].Value;
        this.myasset.make = this.assetSubscribe[1].ValueText;
        this.myasset.model = this.assetSubscribe[2].ValueText;
        this.myasset.assetStatus = this.assetSubscribe[3].ValueText;
        this.myasset.Comments = this.assetSubscribe[4].Value;   //was ActivityComments
        let y = this.users.filter(j => j.UserName === this.currentUser)[0];
        this.myasset.facility = this.facilityList.filter(k => Number(k.value) === y.FacilityId)[0].text;
        this.myasset.assetType = this.selectedValue.text;
        this.myasset.createdBy = this.currentUser;
        this.myasset.updatedDTMFormatted = new Date();
        this.myasset.assetStatus = "Checked In";
        this.myasset.marketId = this.marketId;

        for (var i = 7; i < assetSubscribe.length; i++) {
          switch (assetSubscribe[i].ElementTypeId) {
            case 1: {
              elementValue = assetSubscribe[i].Value;
              break;
            }
            case 2: {
              elementValue = assetSubscribe[i].ValueText;
              break;
            }
            default: {
              elementValue = assetSubscribe[i].Value;
              break;
            }
          }
          this.myasset.assetElements.push({
            elementId: assetSubscribe[i].ElementId,
            elementTypeId: assetSubscribe[i].ElementTypeId,
            elementName: assetSubscribe[i].ElementName,
            label: assetSubscribe[i].ElementName,
            value: elementValue,
            valueText: elementValue,
            elementValue: elementValue,
            editable: true
          });
        }
        this.nuassets.push(this.myasset);

        //refresh data
        this.gridData = this.nuassets;
      },
      error => {
        console.log("asset.component error: ", error);
      }
    );

    //get the current logged in user
    this.appService.GetUserName.subscribe(user => {
      // if (user === "" ) {
      //   window.location.href = environment.tokenIssuerClient;
      // } else {
      //   this.currentUser = user;
      // }
      if (this.currentUser === undefined)
        this.currentUser = "eking";  //this should never be blank. for testing only
    });
  }
  //////////////// Post updates to the Asset Components in the child row
  public colorCode(code: string): SafeStyle {
    let result;

    switch (code) {
      case "Checked In":
        result = "#a2e2b6";
        break;
      case "Checked Out":
        result = "#dcaba8";
        break;
      case "Defective":
        result = "#FFD700";
        break;
      case "Removed":
        result = "#b6c8dc";
        break;
      case "defective":
        result = "#B2F699";
        break;
      default:
        result = "transparent";
        break;
    }

    return this.sanitizer.bypassSecurityTrustStyle(result);
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
  ngAfterContentChecked() {
    this.grid.resizable = true;
  }

  SelectedRows(event) {
    //console.log("A row selected event:", event);

    if (this.allSelected == true) {
      this.allSelected = false;
      return;
    }

    //this fixes bug: when a row is click on a page, then a row is clicked on another page, the first page selected row doesn't go away.
    //fix: clear all the selected rows when a row is clicked.
    if (event.ctrlKey == false) //false=row clicked, true=row chkBox clicked
    {
      this.selectedRowsDisplayed = [];
      this.selectedRows = [];
    }


    //remove deselected rows from selectedRows array
    if (event.deselectedRows.length > 0) {
      for (var i = 0; i < event.deselectedRows.length; i++) {
        for (var z = 0; z < this.selectedRows.length; z++) {
          //remove from selected rows array
          if (this.selectedRows[z].value.tagId == event.deselectedRows[i].dataItem.tagId) {
            this.selectedRows.splice(z, 1);
          }
          //remove rows from visible from array
          if (this.selectedRowsDisplayed[z] == event.deselectedRows[i].dataItem.assetId) {
            this.selectedRowsDisplayed.splice(z, 1);
          }
        }
      }
    }

    //add currently selected row to selectedRows array
    if (event.selectedRows.length > 0) {
      for (var i = 0; i < event.selectedRows.length; i++) {
        //add row to visible array
        this.selectedRowsDisplayed[this.selectedRowsDisplayed.length] = event.selectedRows[i].dataItem.assetId;
        //add to selected rows array
        this.selectedRows.push({
          value: event.selectedRows[i].dataItem,
          index: event.index
        })
      }
    }

  }

  public isHidden(columnName: string): boolean {
    return this.hiddenColumns.indexOf(columnName) > -1;
  }

  ngOnInit() {
    this.GetMarket();
  }

  public GetMarket() {
    this.assetService.GetMarket(this.currentUser)
      .subscribe((market: number) => {
        this.marketId = market;
        this.assetService.SetTheMarket(market)
        //These calls must be here due to dependencies on GetMarket returning the MarketId from the DB.
        this.GetAssets();
        this.GetUsers(this.marketId, false);
        this.GetAssetTypes();
        this.GetAssetManagers(this.marketId, false);
        this.GetFacilityList(this.marketId);
      });
  }

  public rowCallback(context: RowClassArgs) {
    return {
      defective: context.dataItem.assetStatus === "Defective",
      checkin: context.dataItem.assetStatus === "Checked In",
      checkout: context.dataItem.assetStatus === "Checked Out",
      removed: context.dataItem.assetStatus === "Removed"
    };
  }

  public AddAsset() {
    //refresh
    this.GetAssetTypes();

    this.selectedValue = { text: "Select Asset Type", value: null };
    this.isAddAsset = true;
    this.openedAdd = true;
  }

  public AddAssetContinue() {
    if (this.selectedValue.value != null) {
      this.currentAssetInfo = {
        marketId: this.marketId,
        assetTypeId: this.selectedValue.value,
        assetId: null,
        comments: "",
        tagId: null
      };
      this.openedAdd = false;
      this.opened = true;
    }
  }

  GetAssets() {
    this.assetService.GetAssets(this.currentUser, this.marketId)
      .subscribe(
        (assets: AssetInfo[]) => {
          this.FormatDates(assets);
          this.assets = assets;
          this.gridData = this.assets;
          for (let indx of Object.keys(this.assets[0])) {
            this.columns.push({
              field: indx,
              title: this.GetTitle(indx),
              hidden: false
            });
          }
          //filter data if searchtext is set
          this.handleSearchFilter(this.searchText);
        });
  }



  CreateTempForExcel() {
    this.assetsTemp = this.assets;
    this.assetsTemp.map((index, i) => {
      index["assetElements"].map(dd => {
        if (dd.hasOwnProperty("valueText")) {
          this.assetsTemp[i][dd["elementName"]] = dd["valueText"];
        }
      })
    });

    this.assetService.exportAsExcelFile(this.assetsTemp, 'Assets');
  }

  GetUsers(MarketId: number, IncludeInactive: boolean) {
    this.users = [];
    this.assetService
      .GetUsers(MarketId, IncludeInactive)
      .subscribe((users: any[]) => {
        users.map(index => {
          this.users.push({
            UserName: index.userName,
            FacilityId: index.facilityId
          });
          this.users.sort(function (a, b) {
            var titleA = a.UserName.toLowerCase(), titleB = b.UserName.toLowerCase();
            if (titleA < titleB) return -1;
            if (titleA > titleB) return 1;
            return 0;
          });
        });
      });
  }

  GetAssetManagers(MarketId: number, IncludeInactive: boolean) {
    this.AssetManagers = [];
    this.assetService
      .GetAssetManagers(MarketId, IncludeInactive)
      .subscribe((AssetManagers: any[]) => {
        AssetManagers.map(index => {
          this.AssetManagers.push({
            UserName: index.userName,
            FacilityId: index.facilityId
          });
          this.AssetManagers.sort();
        });

        //try to find current user in assetmanager list. if found then this person is an asset manager and action buttons will be enabled
        var xx = this.AssetManagers.find(
          x => x.UserName.toUpperCase() == this.currentUser.toUpperCase()
        );
        this.isAssetManager = false;
        if (xx != null) this.isAssetManager = true;
      });
  }

  GetTitle(title: string) {
    return (
      title.charAt(0).toUpperCase() +
      title.slice(1).replace(/([a-z])([A-Z])/g, "$1 $2")
    );
  }

  GetAssetTypes() {
    //clear for refresh
    this.assetTypes = [];

    this.assetService.GetAssetType(this.marketId).subscribe((result: any[]) => {
      result["options"].map(index => {
        this.assetTypes.push({
          value: index.value,
          text: index.text
        });
      });
    });
  }

  GetFacilityList(MarketId: number) {
    this.facilityList = [];
    this.assetService.GetFacilityList(MarketId).subscribe((result: any[]) => {
      result.map(index => {
        this.facilityList.push({
          value: index.value,
          text: index.text
        });
      });
    });
  }

  public FormatDates(assets) {
    assets.map(index => {
      index.statusDTM =
        new Date(index.statusDTM).toLocaleDateString() +
        " " +
        new Date(index.statusDTM).toLocaleTimeString();
    });
  }

  public AssetSettings() {
    this.openSettings = true;
  }

  /////////////////////////////////////////// Facility /////////////////////
  public FacilityAsset() {
    this.openFacility = true;
    this.openSettings = false;
  }
  /////////////////////////////////////////// Facility /////////////////////

  public EditAsset() {
    if (!this.ValidateEdit()) {
      this.toastrService.warning("You must select one item to edit");
      return;
    }
    this.currentAssetInfo = {
      marketId: this.selectedRows[0].value.marketId,
      assetTypeId: this.selectedRows[0].value.typeId,
      assetId: this.selectedRows[0].value.assetId,
      comments: this.selectedRows[0].value.comments,
      tagId: this.selectedRows[0].value.tagId
    };
    this.isAddAsset = false;
    this.opened = true;
  }

  public ValidateEdit() {
    return true ? this.selectedRows.length === 1 : false;
  }

  public ValidateInput() {
    return true ? this.selectedRows.length === 0 : false;
  }

  CloseFacility(status) {
    this.openFacility = status;
  }

  CloseDialog(status) {
    //to refresh data after add
    this.assets = [];
    this.ngOnInit();


    this.opened = status;
  }

  CloseSettings(status) {
    this.openSettings = status;
  }

  CloseAE(status) {
    //this.openAEassetType=status;
    if (status == 0)
      this.openAEassetType = false;
    else if (status == 1)
      this.openAEassetType = true;
    else { //close and reopen to fix bug. combobox will not select after adding
      this.openAEassetType = false;
      this.openSettings = true;
    }
  }

  CloseAEdropdowns(status) {
    this.openAEdropdowns = status;
  }

  assetMessage: string;

  ConvertToAssetInfoObject() {
    return this.selectedRows.map(index => {
      return new AssetInfo(
        index.value.assetId,
        index.value.marketId,
        index.value.facilityId,
        index.value.tagId,
        index.value.typeId,
        index.value.make,
        index.value.model,
        index.value.statusId,
        index.value.assetStatus,
        index.value.statusDTM,
        (index.value.Comments = "Removed by web"),    //was activityComments
        index.value.createdBy,
        index.value.createdDTM,
        (index.value.updatedBy = this.currentUser),
        index.value.updatedDTM,
        (index.value.scanId = ""),
        index.value.checkedOutTo,
        index.value.assetElements
      );
    });
  }

  public SaveAssetAction(action) {

    switch (action) {
      case "remove":
        // this.assetService
        //   .RemoveAsset(this.selectedAssetRows)
        //   .subscribe((result:any) => {
        //     //this code will be changed in a later phase to actually throw a message on invalid removes
        //     if (result.result == true || result.result == false) {
        //       this.nuassets = this.assets;
        //       this.selectedAssetRows.forEach(element => {
        //         for (var i = 0; i < this.nuassets.length; i++) {
        //           if (this.nuassets[i].assetId === element.AssetId) {
        //             this.nuassets[i].assetStatus = "Removed";
        //             break;
        //           }
        //         }
        //       });
        //       //this.toastrService.success("Successfully Removed");
        //       var temp1 = `${result.message}`;
        //       this.toastrService.success(temp1, "Remove", {enableHtml:true});
        //     } else {
        //       this.toastrService.error( `Failed To Remove ${result.message}`);
        //     }
        //   });
        for (var ii = 0; ii < this.selectedAssetRows.length; ii++) {
          var tempSelectedAssetRow = this.selectedAssetRows[ii]
          this.assetService
            .RemoveAsset(tempSelectedAssetRow)
            .subscribe((result: any) => {
              //this code will be changed in a later phase to actually throw a message on invalid removes
              if (result.result == true || result.result == false) {
                this.nuassets = this.assets;
                //this.selectedAssetRows.forEach(element => {
                for (var i = 0; i < this.nuassets.length; i++) {
                  var tmpMsg = `${result.message}`;
                  var msgSplit = tmpMsg.split('|');
                  if (this.nuassets[i].assetId === Number(msgSplit[0])) {
                    this.nuassets[i].assetStatus = "Removed";
                    break;
                  }
                }
                //});
                //this.toastrService.success("Successfully Removed");
                var temp1 = `${result.message}`;
                var temp1 = `${result.message}`;
                var temp11 = temp1.split('|');
                this.toastrService.success(temp11[1], "Remove", { enableHtml: true });
              }
              else {
                var temp1 = `${result.message}`;
                var temp11 = temp1.split('|');
                this.toastrService.error(temp11[1], "Remove", { enableHtml: true });
              }
            });
        }
        break;


      case "check in":
        // this.assetService
        //   .CheckinAsset(this.selectedAssetRows)
        //   .subscribe((result:any) => {
        //     if (result.result == true) {
        //       this.nuassets = this.assets;
        //       this.selectedAssetRows.forEach(element => {
        //         for (var i = 0; i < this.nuassets.length; i++) {
        //           if (this.nuassets[i].assetId === element.AssetId) {
        //             this.nuassets[i].assetStatus = "Checked In";
        //             break;
        //           }
        //         }
        //       });
        //       //this.toastrService.success("Successfully Checked In");
        //       var temp1 = `${result.message}`;
        //       this.toastrService.success(temp1, "Check In", {enableHtml:true});
        //     } else {
        //       this.toastrService.error( `Failed To Check In: ${result.message}` );
        //     }
        //   });
        for (var ii = 0; ii < this.selectedAssetRows.length; ii++) {
          var tempSelectedAssetRow = this.selectedAssetRows[ii];
          tempSelectedAssetRow.FacilityId = this.selectedFacility.value;    //this send the new facilityid to DB
          this.selectedAssetRows[ii].FacilityId = this.selectedFacility.value;  //this updates facilityid in current grid
          this.assetService
            .CheckinAsset(tempSelectedAssetRow)
            .subscribe((result: any) => {
              if (result.result == true) {
                this.nuassets = this.assets;
                //this.selectedAssetRows.forEach(element => {
                for (var i = 0; i < this.nuassets.length; i++) {
                  var tmpMsg = `${result.message}`;
                  var msgSplit = tmpMsg.split('|');
                  if (this.nuassets[i].assetId === Number(msgSplit[0])) {
                    this.nuassets[i].assetStatus = "Checked In";
                    break;
                  }
                }
                //});
                //this.toastrService.success("Successfully Checked In");
                var temp1 = `${result.message}`;
                var temp11 = temp1.split('|');
                this.toastrService.success(temp11[1], "Check In", { enableHtml: true });
              }
              else {
                var temp1 = `${result.message}`;
                var temp11 = temp1.split('|');
                this.toastrService.error(temp11[1], "Check In", { enableHtml: true });
                //this.toastrService.error( `Failed To Check In: ${result.message}` );
              }
            });
        }
        break;

      case "check out":
        this.selectedAssetRows.forEach(e => {
          e.CheckedOutTo = this.assignee.UserName;
        });
        // this.assetService
        //   .CheckoutAsset(this.selectedAssetRows)
        //   .subscribe((result:any) => {
        //     if (result.result === true) {
        //       this.nuassets = this.assets;
        //       this.selectedAssetRows.forEach(element => {
        //         for (var i = 0; i < this.nuassets.length; i++) {
        //           if (this.nuassets[i].assetId === element.AssetId) {
        //             this.nuassets[i].assetStatus = "Checked Out";
        //             this.nuassets[i].checkedOutTo = this.assignee.UserName;
        //             break;
        //           }
        //         }
        //       });
        //       //this.toastrService.success("Successfully Checked Out");
        //       var temp1 = `${result.message}`;
        //       this.toastrService.success(temp1, "Check Out", {enableHtml:true});
        //     } else {
        //       this.toastrService.error( `Failed To Check Out: ${result.message}`);
        //     }
        //   });
        // break;
        for (var ii = 0; ii < this.selectedAssetRows.length; ii++) {
          var tempSelectedAssetRow = this.selectedAssetRows[ii];
          tempSelectedAssetRow.FacilityId = this.assignee.FacilityId;  //this send the new facilityid to DB
          this.selectedAssetRows[ii].FacilityId = this.assignee.FacilityId;  //this updates facilityid in current grid
          this.assetService
            .CheckoutAsset(tempSelectedAssetRow)
            .subscribe((result: any) => {
              if (result.result === true) {
                this.nuassets = this.assets;
                //this.selectedAssetRows.forEach(element => {
                for (var i = 0; i < this.nuassets.length; i++) {
                  var tmpMsg = `${result.message}`;
                  var msgSplit = tmpMsg.split('|');
                  if (this.nuassets[i].assetId === Number(msgSplit[0])) {
                    this.nuassets[i].assetStatus = "Checked Out";
                    this.nuassets[i].checkedOutTo = this.assignee.UserName;
                    break;
                  }
                }
                //});
                //this.toastrService.success("Successfully Checked Out");
                var temp1 = `${result.message}`;
                var temp11 = temp1.split('|');
                this.toastrService.success(temp11[1], "Check Out", { enableHtml: true });
              }
              else {
                //this.toastrService.error( `Failed To Check Out: ${result.message}`);
                var temp1 = `${result.message}`;
                var temp11 = temp1.split('|');
                this.toastrService.error(temp11[1], "Check Out", { enableHtml: true });
              }
            });
          //});  
        }
        break;


      case "mark defective":
        for (var ii = 0; ii < this.selectedAssetRows.length; ii++) {
          var tempSelectedAssetRow = this.selectedAssetRows[ii]
          this.assetService
            .MarkAssetDefective(tempSelectedAssetRow)
            .subscribe((result: any) => {
              if (result.result == true) {
                this.nuassets = this.assets;
                //this.selectedAssetRows.forEach(element => {
                for (var i = 0; i < this.nuassets.length; i++) {
                  var tmpMsg = `${result.message}`;
                  var msgSplit = tmpMsg.split('|');
                  if (this.nuassets[i].assetId === Number(msgSplit[0])) {
                    this.nuassets[i].assetStatus = "Defective";
                    break;
                  }
                }
                //});
                //this.toastrService.success("Successfully Changed To Defective");
                var temp1 = `${result.message}`;
                var temp11 = temp1.split('|');
                this.toastrService.success(temp11[1], "Defective", { enableHtml: true });
              }
              else {
                var temp1 = `${result.message}`;
                var temp11 = temp1.split('|');
                this.toastrService.error(temp11[1], "Defective", { enableHtml: true });
              }
            });
        }
        break;
    }
    this.confirmationDialog = false;
    this.GetAssets(); //refresh data changes
  }

  public CheckSelectedRows() {
    if (this.ValidateInput()) {
      this.toastrService.error("You must select select at least one item");
      return false;
    }
    return true;
  }

  public GetItemCount() {
    return this.selectedRows.length + " Items";
  }

  public ProcessAsset(event) {
    if (this.CheckSelectedRows()) {
      this.confirmationAction = event.target.textContent.toLowerCase();
      this.confirmationDialog = true;
      this.selectedAssetRows = this.ConvertToAssetInfoObject();
    }
  }

  SuccessToast(message): void {

    this.toastrService.success(message);
  }

  saveFacility() {
    //set these 4 parameters in assetInfo class and send that because a post requires and object and won't take parameters????
    let ai: AssetInfo = new AssetInfo();
    ai.CreatedBy = this.selectedUser.UserName;
    ai.MarketId = this.marketId;
    ai.UpdatedBy = this.currentUser;
    ai.FacilityId = this.selectedFacility.value;

    this.assetService.ChangeFacility(ai).subscribe((result: any) => {
      if (result.result == true) {
        this.toastrService.success("Successfully Changed Facility");

      } else {
        this.toastrService.error(`Failed To Change Facility: ${result.message}`);
      }
      //clear & reload users
      this.users = [];
      this.GetUsers(this.marketId, false);
    });

    this.openFacility = false;
  }

  FacilityUserChanged(value) {
    let x = this.facilityList.filter(f => f.value === value.FacilityId)[0];
    this.selectedFacility = { text: x.text, value: +x.value };
  }

  AddEditAssetType() {
    this.openAEassetType = true;
    this.openSettings = false;
  }

  AddEditDropdowns() {
    this.openAEdropdowns = true;
    this.openSettings = false;
  }

  sortChangeEvent(event) {
    this.handleSearchFilter(this.searchText);
  }

  pageChange(event) {
    //this.handleSearchFilter(this.searchText);   // SD 11/12/19 not sure why this was here but shouldn't need to research every time the page is changed
  }

  public onSelectAllChange(checkedState: SelectAllCheckboxState) {
    // this link helps explain paging done programmatically
    //  https://www.telerik.com/kendo-angular-ui/components/grid/selection/#toc-persisting-the-selection

    this.allSelected = true;

    var tempGridData = null;
    if (this.grid.pageable == true)
      tempGridData = this.gridData;
    else
      tempGridData = this.grid.data.data;

    if (checkedState === 'checked') {
      this.selectAllState = 'checked';
      this.selectedRows = [];
      for (var i = 0; i < tempGridData.length; i++) {
        this.selectedRowsDisplayed[this.selectedRowsDisplayed.length] = tempGridData[i].assetId;

        this.selectedRows.push({
          value: tempGridData[i],
          index: i
        })
      }
    } else {
      this.selectAllState = 'unchecked';
      this.selectedRowsDisplayed = [];
      this.selectedRows = [];
    }

  }

  public onSelectedKeysChange(e) {
    // const len = this.mySelection.length;

    // if (len === 0) {
    //     this.selectAllState = 'unchecked';
    // } else if (len > 0 && len < this.items.length) {
    //     this.selectAllState = 'indeterminate';
    // } else {
    //     this.selectAllState = 'checked';
    // }
  }

  public handleFilter(event) {
    if (event.filters.length > 1) {
      this.isPagable = false;
      this.pageSize = 2000;
    }
    else {
      this.isPagable = true;
      this.pageSize = 10;
    }

    //this.gridData  = this.gridData.filter((s) => s.description.toLowerCase().indexOf(event.toLowerCase()) !== -1);
  }




}
