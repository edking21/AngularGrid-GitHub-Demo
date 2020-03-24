import { Component, OnInit, ViewChild, ViewEncapsulation } from "@angular/core";
import { TimeSheetInfo } from "../models/TimeSheetInfo";
import { TimesheetService } from "./timesheet.service";
import { ToastrService } from 'ngx-toastr';

import { AppService } from "../app.service";
import {
  DialogService,
  DialogRef,
  DialogCloseResult
} from "@progress/kendo-angular-dialog";
import { StatusKronos } from "../models/StatusKronos";
import { Project } from "../models/Project";
import { Task } from "../models/Task";
import { Category } from "..//models/Category";
import { RowClassArgs } from "@progress/kendo-angular-grid";
import * as moment from "moment";
import { environment } from "../../environments/environment";

@Component({
  selector: "app-timesheet",
  templateUrl: "./timesheet.component.html",
  styleUrls: ["./timesheet.component.scss"]
})
export class TimesheetComponent {
  @ViewChild("grid", { static: false }) grid;
  selectedUserName: string = "";
  showGrid: boolean = false;
  kronosSubmitted: boolean = false;
  isDisabledProjects: boolean = true;
  isDisabledTasks: boolean = true;
  isDisabledCategory: boolean = true;
  isTimeLord: boolean = false;
  newTimesheet: TimeSheetInfo;
  dateRange: string;
  existRecError: string;
  beginningOfWeek: Date;
  gridData: any[];
  activities: any[] = [];
  editedRowIndex: number;
  selectedCategory: Category;
  selectedProject: Project;
  selectedTask: Task;
  dataCategory: Category[] = [];
  dataProjects: Project[] = [];
  dataResultProjects: Project[] = [];
  dataTasks: Task[] = [];
  dataResultTasks: Task[] = [];
  kronosUsers: string[] = [];
  statusKrnonos: StatusKronos;
  editMode: boolean = false;
  addMode: boolean = false;
  textboxDisabled: boolean = true;
  max: number = 24;

  constructor(
    private timesheetService: TimesheetService,
    private toastrService:ToastrService,
    private appService: AppService,
    private dialogService: DialogService
  ) {
    this.SetDateRange();
  }

  public ngOnInit(): void {
    this.appService.GetUserName.subscribe(user => {
      if (user === "") {
        window.location.href = environment.tokenIssuerClient;
      } else {
        this.selectedUserName = user;
      }
      this.statusKrnonos = new StatusKronos(
        this.selectedUserName,
        this.selectedUserName,
        new Date(this.beginningOfWeek)
      );
    });

    this.timesheetService.GetExistRecError.subscribe(errMessage => {
      this.existRecError = errMessage;
      if (errMessage) {
        this.showExistingRecToast();
      }
    });
    this.timesheetService
      .GetUserRole(this.statusKrnonos)
      .subscribe(userRole => {
        if (userRole[0]) {
          this.isTimeLord = true;
        }
      });

    this.timesheetService.GetKronosUser().subscribe(users => {
      if (this.isTimeLord) {
        this.kronosUsers = users.map(index => {
          return index["userName"];
        });
      } else {
        this.kronosUsers.push(this.selectedUserName);
      }
    });
  }
  selectionChange(value: any): void {
    this.selectedUserName = value;
    this.closeEditor(this.grid);
    this.GetTimeSheet();
  }

  SetDateRange() {
    this.beginningOfWeek = new Date(moment(new Date()).format("l"));
    this.beginningOfWeek.setDate(
      this.beginningOfWeek.getDate() - ((this.beginningOfWeek.getDay() + 8) % 7)
    );
    this.beginningOfWeek.setHours(0, 0, 0, 0);
    this.dateRange =
      moment(this.beginningOfWeek).format("l") +
      " - " +
      moment(this.beginningOfWeek)
        .add(6, "days")
        .format("l");
    if (this.statusKrnonos) {
      this.statusKrnonos.BeginDate = this.beginningOfWeek;
    }
  }

  GetTimeSheet(): void {
    this.timesheetService
      .GetTimeSheet(this.beginningOfWeek, this.selectedUserName)
      .subscribe(timesheet => {
        this.CheckForEmptyGrid(timesheet);

        this.timesheetService.GetActivities().subscribe(activities => {
          if (!this.showGrid) {
            this.activities = activities;
            this.GetCascadingDropdown();
          }
          this.showGrid = true;
        });
      });
    this.GetKronosStatus();
  }
  CheckForEmptyGrid(timesheet): void {
    return timesheet[0].id === 0
      ? (this.gridData = [])
      : (this.gridData = timesheet);
  }

  SetKronosStatus(): void {
    this.successToast("Kronos Status Was Updated");
    this.timesheetService
      .SetKronosStatus(this.statusKrnonos)
      .subscribe(errMessage => {
        if (errMessage) {
          console.log("Kronos status failed to update");
        }
      });
  }

  GetKronosStatus(): void {
    this.timesheetService
      .GetKronosStatus(this.statusKrnonos)
      .subscribe(result => {
        this.kronosSubmitted = result[0] ? true : false;
      });
  }
  public rowCallback(context: RowClassArgs) {
    return {
      tsrowcolor: context.dataItem !== null
    };
  }
  OverForty(): boolean {
    return this.newTimesheet.Saturday +
      this.newTimesheet.Sunday +
      this.newTimesheet.Monday +
      this.newTimesheet.Tuesday +
      this.newTimesheet.Wednesday +
      this.newTimesheet.Thursday +
      this.newTimesheet.Friday >
      40
      ? true
      : false;
  }
  handleDatePickerChange(value) {
    if (this.grid !== undefined) {
      this.closeEditor(this.grid);
    }
    this.beginningOfWeek = new Date(value);
    this.beginningOfWeek.setDate(
      this.beginningOfWeek.getDate() - ((this.beginningOfWeek.getDay() + 8) % 7)
    );
    this.beginningOfWeek.setHours(0, 0, 0, 0);
    this.dateRange =
      moment(this.beginningOfWeek).format("l") +
      " - " +
      moment(this.beginningOfWeek)
        .add(6, "days")
        .format("l");
    if (this.statusKrnonos) {
      this.statusKrnonos.BeginDate = this.beginningOfWeek;
    }
    this.GetTimeSheet();
  }
  Clear() {
    this.SetDateRange();
  }
  AddTimesheetRecord() {
    this.newTimesheet.Category = this.selectedCategory.categoryName;
    this.newTimesheet.Project = this.selectedProject.projectName;
    this.newTimesheet.Task = this.selectedTask.taskName;

    this.timesheetService
      .AddEditTimeSheet(this.newTimesheet)
      .subscribe(timesheet => {
        if (this.newTimesheet.IsCreateAction === false && !timesheet) {
          this.successToast("Timesheet Row Edited");
        } else if (!timesheet) {
          this.successToast("Timesheet Row Added");
        }

        this.timesheetService
          .GetTimeSheet(this.beginningOfWeek, this.selectedUserName)
          .subscribe(timesheet => {
            this.gridData = timesheet;
          });
      });
  }

  handleCategoryChange(value) {
    this.selectedCategory = value;
    this.isDisabledProjects = false;
    this.dataResultProjects = this.dataProjects.filter(
      s => s.categoryId === value.categoryId
    );
    this.selectedTask = new Task("Select Task", null, null, null);
    this.selectedProject = new Project("Select Project", null, null);
  }

  handleProjectChange(value) {
    this.selectedTask = new Task("Select Task", null, null, null);
    this.selectedProject = value;
    this.isDisabledTasks = false;
    this.dataResultTasks = this.dataTasks.filter(
      s => s.projectId === value.projectId && s.categoryId === value.categoryId
    );
  }

  handleTaskChange(value) {
    this.textboxDisabled = false;
    this.addMode = false;
    this.selectedTask = value;
    if (
      this.gridData.filter(
        data =>
          data.task === this.selectedTask.taskName &&
          data.project === this.selectedProject.projectName &&
          data.category === this.selectedCategory.categoryName
      ).length > 0
    ) {
      this.errToast("Cannot Create Duplicate Records, Please re-select a Task");
      this.selectedTask = new Task("Select Task", null, null, null);
      this.addMode = true;
      this.textboxDisabled = true;
      return;
    }
  }
  GetCascadingDropdown() {
    let categoryId = null;
    let count = 0;
    this.activities.map(category => {
      category["childSelectableOptions"].map(project => {
        categoryId = project["parentId"];
        this.dataProjects.push(
          new Project(
            project.text,
            this.GetTaskId(project),
            project["parentId"]
          )
        );
        project["childSelectableOptions"].map(task =>
          this.dataTasks.push(
            new Task(task.text, ++count, project["parentId"], task["parentId"])
          )
        );
      });
      this.dataCategory.push(new Category(category.text, categoryId));
    });
  }
  GetTaskId(project): number {
    return project["childSelectableOptions"][0]["parentId"];
  }
  CreateNewTimesheet() {
    return new TimeSheetInfo(
      0,
      this.selectedUserName,
      new Date(this.beginningOfWeek),
      0,
      "",
      "",
      "",
      "",
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      0,
      true
    );
  }
  GetWeeklyTotal() {
    return (
      this.newTimesheet.Saturday +
      this.newTimesheet.Sunday +
      this.newTimesheet.Monday +
      this.newTimesheet.Tuesday +
      this.newTimesheet.Wednesday +
      this.newTimesheet.Thursday +
      this.newTimesheet.Friday
    );
  }
  CreateEditTimesheet(timesheetToEdit) {
    return new TimeSheetInfo(
      timesheetToEdit.id,
      timesheetToEdit.userName,
      timesheetToEdit.weekBeginDate,
      null,
      timesheetToEdit.activityIdText || "",
      timesheetToEdit.category,
      timesheetToEdit.project,
      timesheetToEdit.task,
      timesheetToEdit.monday || 0,
      timesheetToEdit.tuesday || 0,
      timesheetToEdit.wednesday || 0,
      timesheetToEdit.thursday || 0,
      timesheetToEdit.friday || 0,
      timesheetToEdit.saturday || 0,
      timesheetToEdit.sunday || 0,
      timesheetToEdit.total,
      false
    );
  }

  public addHandler({ sender }) {
    this.textboxDisabled = true;
    this.isDisabledCategory = false;
    this.isDisabledProjects = true;
    this.isDisabledTasks = true;
    this.addMode = true;
    this.selectedCategory = new Category("Select Category", null);
    this.selectedProject = new Project("Select Project", null, null);
    this.selectedTask = new Task("Select Task", null, null, null);
    this.closeEditor(sender);
    this.newTimesheet = this.CreateNewTimesheet();
    sender.addRow(this.newTimesheet);
  }

  public editHandler({ sender, rowIndex, dataItem }) {
    this.textboxDisabled = false;
    this.isDisabledCategory = true;
    this.isDisabledProjects = true;
    this.isDisabledTasks = true;
    this.addMode = false;
    this.editMode = true;
    this.selectedCategory = new Category(
      dataItem.category,
      dataItem.categoryId
    );
    this.selectedProject = new Project(
      dataItem.project,
      dataItem.projectId,
      dataItem.categoryId
    );
    this.selectedTask = new Task(
      dataItem.task,
      dataItem.taskId,
      dataItem.categoryId,
      dataItem.projectId
    );
    this.newTimesheet = this.CreateEditTimesheet(dataItem);
    this.closeEditor(sender);
    this.isDisabledProjects = true;
    this.isDisabledTasks = true;
    this.editedRowIndex = rowIndex;
    sender.editRow(rowIndex, dataItem);
  }

  public cancelHandler({ sender, rowIndex }) {
    this.editMode = false;
    this.closeEditor(sender, rowIndex);
  }

  public saveHandler({ sender, rowIndex, dataItem, isNew }): void {
    if (this.GetWeeklyTotal() < 0.25) {
      this.errToast("Record Not Saved. You Must Enter Your Time");
      return;
    }
    this.editMode = false;
    this.AddTimesheetRecord();
    sender.closeRow(rowIndex);
    this.isDisabledCategory = false;
  }

  private closeEditor(grid, rowIndex = this.editedRowIndex) {
    grid.closeRow(rowIndex);
    this.editedRowIndex = undefined;
  }
  successToast(message): void {
    this.toastrService.success(message);
  }
  errToast(message): void {
    this.toastrService.error(message);
  }
  showExistingRecToast(): void {
    this.toastrService.error("Server Error " + this.existRecError);
  }

  public showConfirmation(dataItem): void {
    let result;
    const dialog: DialogRef = this.dialogService.open({
      title: "Please confirm",
      content: "Would you like to delete this record?",
      actions: [{ text: "No" }, { text: "Yes", primary: true }],
      width: 450,
      height: 200,
      minWidth: 250
    });

    dialog.result.subscribe(result => {
      if (result instanceof DialogCloseResult) {
      } else {
        if (result["text"] === "Yes") {
          this.timesheetService.DeleteTimesheet(dataItem).subscribe(result => {
            if (!result) {
              this.successToast("Timesheet Row Deleted");
            }
            this.gridData.splice(
              this.gridData.findIndex(({ id }) => id === dataItem.id),
              1
            );
          });
        }
      }
      result = JSON.stringify(result);
    });
  }
  public removeHandler({ dataItem }): void {
    this.showConfirmation(dataItem);
    this.GetTimeSheet();
  }
  GetColumTotal(field): number {
    let total = 0;
    switch (field) {
      case "saturday":
        this.gridData.map(dayOfWeek => {
          total = total + dayOfWeek.saturday;
        });
        break;
      case "sunday":
        this.gridData.map(dayOfWeek => {
          total = total + dayOfWeek.sunday;
        });
        break;
      case "monday":
        this.gridData.map(dayOfWeek => {
          total = total + dayOfWeek.monday;
        });
        break;
      case "tuesday":
        this.gridData.map(dayOfWeek => {
          total = total + dayOfWeek.tuesday;
        });
        break;
      case "wednesday":
        this.gridData.map(dayOfWeek => {
          total = total + dayOfWeek.wednesday;
        });
        break;
      case "thursday":
        this.gridData.map(dayOfWeek => {
          total = total + dayOfWeek.thursday;
        });
        break;
      case "friday":
        this.gridData.map(dayOfWeek => {
          total = total + dayOfWeek.friday;
        });
        break;
      case "total":
        this.gridData.map(dayOfWeek => {
          total = total + dayOfWeek.total;
        });
        break;
    }
    return total;
  }
}
