import { Component, OnInit } from "@angular/core";

@Component({
  selector: "asset-facility",
  templateUrl: "./asset-facility.component.html",
  styleUrls: ["./asset-facility.component.scss"]
})
export class AssetFacilityComponent {
  public opened: boolean = false;

  public close(status) {
    console.log(`Dialog result: ${status}`);
    this.opened = false;
  }

  public open() {
    this.opened = true;
  }
  
  constructor() {}

  ngOnInit() {}
}
