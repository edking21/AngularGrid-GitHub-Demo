import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import {
  trigger,
  state,
  style,
  transition,
  animate
} from "@angular/animations";
import { AppService } from "../../app.service";
import { SidenavService } from "./sidenav.service";
import { RoleModel } from "../../models/RoleModel";
import { RoleListModel } from "../../models/RoleListModel";

@Component({
  selector: "sidenav",
  templateUrl: "./sidenav.component.html",
  styleUrls: ["./sidenav.component.scss"],
  animations: [
    trigger("hoverlink", [
      state(
        "in",
        style({
          transform: "scale(1)"
        })
      ),
      state(
        "out",
        style({
          transform: "scale(1.1)",
          backgroundColor: "black",
          opacity: 0.5,
          borderLeft: "solid",
          borderColor: "#428bca",
          color: "red"
        })
      ),
      transition("in <=> out", animate("400ms ease-in", style({})))
    ])
  ]
})
export class SidenavComponent implements OnInit {
  userName: string;
  sideItems: any;

  public roles: RoleModel[] = [];

  constructor(
    private appService: AppService,
    private sidenavService: SidenavService
  ) {
    this.sidenavService = sidenavService;

    this.sideItems = [
      {
        label: "Dashboard",
        link: "/home",
        icon: "fa fa-home fa-3x",
        scale: "in",
        disabled: false
      },

      {
        label: "Assets",
        link: "/asset",
        icon: "fa fa-barcode fa-3x",
        scale: "in",
        disabled: false
      },
      {
        label: "Crews",
        link: "/crew",
        icon: "fa fa-users fa-3x",
        scale: "in",
        disabled: false
      },
      {
        label: "Tempus",
        link: "/timesheet",
        icon: "fa fa-clock-o fa-3x",
        scale: "in",
        disabled: false
      }
    ];
  };

  ngOnInit() {
    this.GetRoles();
  }

  GetRoles() {
    this.appService.GetUserName.subscribe(user => {
      this.userName = user;
      if (this.userName) {
        this.sidenavService
          .GetRoles(true, this.userName, this.userName)
          .subscribe((roles:RoleListModel[]) => {
            roles = roles;
            for (let role of roles["roleList"]) {
              if (role.description === "Asset Manager" && !role.hasRole) {
                this.sideItems[1].disabled = true;
              }
              if (role.description === "Crew Manager" && !role.hasRole) {
                this.sideItems[2].disabled = true;
              }
              if (role.description === "Tempus User" && !role.hasRole) {
                this.sideItems[3].disabled = true;
              }
            }
          });
      }
    });
  }

  ToggleSelectedLink(i: number) {
    if (this.sideItems[i].scale !== "out") {
      this.sideItems[i].scale =
        this.sideItems[i].scale === "out" ? "in" : "out";
    }

    for (let x in this.sideItems) {
      if (Number(x) !== i) {
        this.sideItems[Number(x)].scale = "in";
      }
    }
  }
}
