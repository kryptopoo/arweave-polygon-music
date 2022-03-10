import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogData } from './../confirm-dialog/confirm-dialog.component';

@Injectable({
    providedIn: 'root'
})
export class DialogService {
    constructor(private dialog: MatDialog) {}

    confirmDialog(data: ConfirmDialogData): Observable<boolean> {
        return this.dialog
            .open(ConfirmDialogComponent, {
                data,
                width: '400px',
                disableClose: true
            })
            .afterClosed();
    }
}
