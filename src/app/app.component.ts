import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ArweaveGraphqlService } from './services/arweave-graphql.service';
import { BundlrService } from './services/bundlr.service';
import { DataGridItem } from './data-grid/data-grid.component';
import { DialogService } from './services/dialog.service';
import { environment } from './../environments/environment';
import { FileHelper } from './app.helper';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    @ViewChild('createPlaylistDialogRef') createPlaylistDialogRef: TemplateRef<any>;

    walletConnected: boolean = false;
    thumbBuffer: any = null;
    playlist: any = { name: '', description: '' };
    playlists: Array<DataGridItem> = new Array<DataGridItem>();

    constructor(
        private _dialog: MatDialog,
        private _snackBar: MatSnackBar,
        private _bundlrService: BundlrService,
        private _arweaveGrapqlService: ArweaveGraphqlService,
        private _dialogService: DialogService,
        private _fileHelper: FileHelper
    ) {}

    async ngOnInit() {
        localStorage.removeItem('arpomus.playlists');
        this._bundlrService.connection$.subscribe((isConnected: boolean) => {
            this.walletConnected = isConnected;
            this.loadPlaylists();
        });
    }

    openCreatePlaylistDialog() {
        if (!this.walletConnected) return;

        this.playlist = { name: '', description: '' };
        this._dialog.open(this.createPlaylistDialogRef, {
            width: '35rem'
        });
    }

    async savePlaylist() {
        const dataBytes = (this.thumbBuffer == null ? 0 : this.thumbBuffer.length) + Buffer.from(JSON.stringify(this.playlist)).length;
        const dataUploadFee = await this._bundlrService.getPrice(dataBytes);
        this._dialogService.confirmDialog({ fee: dataUploadFee.toFixed(5) }).subscribe(async (confirmed) => {
            if (confirmed) {
                // upload thumbnail
                let thumbId = environment.defaultThumbnailId;
                if (this.thumbBuffer != null) {
                    let rsThumbnail = await this._bundlrService.upload(this.thumbBuffer, [
                        { name: 'Content-Type', value: 'image' },
                        { name: 'Unix-Time', value: Math.round(Date.now() / 1000).toString() }
                    ]);
                    console.log('rsThumbnail', rsThumbnail.data);
                    thumbId = rsThumbnail.data.id;
                    //tags.push({ name: 'Thumbnail', value: rsThumbnail.data.id });
                }

                let tags = [
                    { name: 'Content-Type', value: 'application/json' },
                    { name: 'Data-Type', value: 'playlist' },
                    { name: 'Name', value: this.playlist.name },
                    { name: 'Description', value: this.playlist.description },
                    { name: 'Thumbnail', value: thumbId }
                ];

                let rsPlaylist: any = await this._bundlrService.upload(Buffer.from(JSON.stringify(this.playlist)), tags);
                console.log('rsPlaylist', rsPlaylist.data);

                this._snackBar.open(`Playlist has been created`, null, { duration: 3000, panelClass: ['snackbar-success'] });
                //this._snackBar.open(`Transaction ${rsPlaylist.data.id} has been submitted`, null, { duration: 3000, panelClass: ['snackbar-success'] });

                this.loadPlaylists();
            }
        });
    }

    loadPlaylists() {
        this.playlists = [];
        this._arweaveGrapqlService
            .queryByTags([
                { name: 'Data-Type', values: ['playlist'] },
                { name: 'Creator', values: [this._bundlrService.getAddress()] }
            ])
            .subscribe((rs) => {
                var edges: any[] = rs.data.transactions.edges;
                edges.forEach((edge) => {
                    var dataGridItem = this._arweaveGrapqlService.bindNodeToDataGridItem(edge.node);
                    this.playlists.push(dataGridItem);
                });
                console.log('load playlists', this.playlists);
                localStorage.setItem('arpomus.playlists', JSON.stringify(this.playlists));
            });
    }

    onThumbFileChanged(event: Event) {
        const target = event.target as HTMLInputElement;
        const file: File = (target.files as FileList)[0];
        console.log(file);

        const thumbElement = document.getElementById(`playlist-thumb`);
        this._fileHelper.readFileAsDataURL(file, (result) => thumbElement.setAttribute('src', result as string));

        this._fileHelper.readFileAsBuffer(file, async (buffer) => {
            this.thumbBuffer = buffer;
        });
    }
}
