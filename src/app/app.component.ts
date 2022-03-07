import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    @ViewChild('createPlaylistDialogRef') createPlaylistDialogRef: TemplateRef<any>;

    playlist: any = {name: 'test', description: 'test'};

    constructor(private _dialog: MatDialog) {}

    async ngOnInit() {}

    openCreatePlaylistDialog() {
        this._dialog.open(this.createPlaylistDialogRef, {
          width: '35rem',
      });
    }

    savePlaylist() {}

    onThumbFileChanged(event) {}
}
