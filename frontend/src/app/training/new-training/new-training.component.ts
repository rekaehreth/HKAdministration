import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthService } from 'src/app/auth.service';
import { HttpService } from 'src/app/httpService';
import { RawCoach, RawGroup, RawLocation, RawTraining } from 'src/app/types';
import { formatFullDate, formatHourDate } from 'src/app/utils';

@Component({
    selector: 'app-new-training',
    templateUrl: './new-training.component.html',
    styleUrls: ['./new-training.component.scss']
})
export class NewTrainingComponent implements OnInit {
    locations: RawLocation[] = [];
    selectedLocationId: number = 0;
    groups: RawGroup[] = [];
    selectedGroups: number[] = [];
    selectedType: string = "";
    trainingTypes: string[] = ["Off Ice", "Ice", "Ballet"];
    mode: string = "new";
    displayDate: Date = new Date();
    startHour: Date = new Date();
    endHour: Date = new Date();

    dateControl = new FormControl();
    startTimeControl = new FormControl();
    endTimeControl = new FormControl();
    groupControl = new FormControl();

    formatFullDate = formatFullDate;
    formatHourDate = formatHourDate;

    constructor(
        private http: HttpService,
        public dialogRef: MatDialogRef<NewTrainingComponent>,
        private authService: AuthService,
        @Inject(MAT_DIALOG_DATA) public data: RawTraining,
    ) { }
    ngOnInit(): void {
        this.loadLocations();
        this.loadGroups();
        if (this.data) {
            this.mode = "edit";
            this.selectedLocationId = this.data.location.id;
            this.displayDate = new Date(this.data.startTime);
            this.startHour = this.data.startTime;
            this.endHour = this.data.endTime;
            this.data.groups.forEach( group => {
                this.selectedGroups.push( group.id);
            });
        }
        this.initControls();
        console.log(this.data);
    }
    initControls() {
        this.dateControl = new FormControl(this.displayDate, Validators.required);
        this.startTimeControl = new FormControl(formatHourDate(this.startHour), Validators.required);
        this.endTimeControl = new FormControl(formatHourDate(this.endHour), Validators.required);
    }
    async loadLocations(): Promise<void> {
        this.locations = await this.http.get<RawLocation[]>('location');
    }
    async loadGroups(): Promise<void> {
        this.groups = await this.http.get<RawGroup[]>('group');
        console.log(this.groups);
    }
    async saveTraining(): Promise<void> {
        if (this.mode === "new") {
            this.saveNewTraining();
        }
        else {
            this.updateTraining();
        }
    }
    async saveNewTraining(): Promise<void> {
        const newTraining = await this.http.post<RawTraining>('training/new', {
            locationId: this.selectedLocationId,
            rawTrainingData: {
                startTime: formatFullDate(this.dateControl.value) + " " + this.startTimeControl.value,
                endTime: formatFullDate(this.dateControl.value) + " " + this.endTimeControl.value,
                type: this.selectedType,
            }
        });
        for (const groupId of this.selectedGroups) {
            await this.http.post<{}>('training/addGroup', {
                "groupId": groupId,
                "trainingId": newTraining.id
            });
        }
        console.log(newTraining);
        this.dialogRef.close({ refreshNeeded: true });
    }
    async updateTraining(): Promise<void> {
        // **TODO** only modify data that has been modified in form - does typeorm does that for me? 
        const modifiedTraining = await this.http.post<{}>('training/modify', {
            locationId: this.selectedLocationId,
            rawTrainingData: {
                id: this.data.id,
                startTime: formatFullDate(this.dateControl.value) + " " + this.startTimeControl.value,
                endTime: formatFullDate(this.dateControl.value) + " " + this.endTimeControl.value,
                type: this.selectedType,
            }
        });
        for (const groupId of this.selectedGroups) {
            // **TODO** remove groups that have been deselected
            // **TODO** only add groups that have not been added previously
            console.log( groupId );
            console.log( this.data.id );
            await this.http.post<RawGroup>('training/addGroup', {
                "groupId": groupId,
                "trainingId": this.data.id
            });
        }
        console.log(modifiedTraining);
        this.dialogRef.close({ refreshNeeded: true });
    }
    cancel() {
        this.dialogRef.close({ refreshNeeded: false });
    }
}
