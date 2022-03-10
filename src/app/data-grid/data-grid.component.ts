import { Component, Input, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AudioService, SongInfo, StreamInfo } from '../services/audio.service';
import { BundlrService } from '../services/bundlr.service';
import { DialogService } from '../services/dialog.service';

export interface DataGridItem {
    id: string;
    name: string;
    description: string;
    thumbnail: string;
    url: string;
    type: string;
    duration: string;
    owner: string;
}

@Component({
    selector: 'app-data-grid',
    templateUrl: './data-grid.component.html',
    styleUrls: ['./data-grid.component.scss']
})
export class DataGridComponent implements OnInit {
    @Input() items: Array<DataGridItem>;

    selectedItem: DataGridItem;
    playlists: Array<any> = new Array<any>();
    constructor(
        private _audioService: AudioService,
        private _router: Router,
        private _dialogService: DialogService,
        private _snackBar: MatSnackBar,
        private _bundlrService: BundlrService
    ) {}

    ngOnInit(): void {
        this.playlists = JSON.parse(localStorage.getItem('arpomus.playlists'));
    }

    shortAddress(address: string) {
        return `${address.substring(0, 8)}...${address.substring(address.length - 6)}`;
    }

    play(item: DataGridItem): void {
        if (item.type == 'song') {
            let song: SongInfo = { title: item.name, artist: item.description, thumbnail: item.thumbnail, url: item.url };
            let streamInfo: StreamInfo = { index: 0, songs: [song] };
            this._audioService.playStream(streamInfo).subscribe((events) => {});
        } else if (item.type == 'album') {
            this._router.navigateByUrl(`/album/${item.id}`);
        } else if (item.type == 'playlist') {
            this._router.navigateByUrl(`/playlist/${item.id}`);
        }
    }

    async addToPlaylist(playlist) {
        console.log('addToPlaylist', this.selectedItem, playlist);
        const dataBytes = Buffer.from('').length;
        const dataUploadFee = await this._bundlrService.getPrice(dataBytes);
        this._dialogService
            .confirmDialog({
                fee: dataUploadFee.toFixed(5)
            })
            .subscribe(async (confirmed) => {
                if (confirmed) {
                    let tags = [
                        { name: 'Content-Type', value: 'application/json' },
                        { name: 'Data-Type', value: 'playlist-song' },
                        { name: 'Title', value: this.selectedItem.name },
                        { name: 'Artist', value: this.selectedItem.description },
                        { name: 'Thumbnail', value: this.selectedItem.thumbnail?.split('/').pop() },
                        { name: 'Duration', value: this.selectedItem.duration },
                        { name: 'Playlist', value: playlist.id },
                        { name: 'Song', value: this.selectedItem.url?.split('/').pop() }
                    ];

                    let rsAddPlaylist: any = await this._bundlrService.upload(Buffer.from(''), tags);
                    console.log('rsAddPlaylist', rsAddPlaylist.data);

                    //this._snackBar.open(`Transaction ${rsAddPlaylist.data.id} has been submitted`, null, { duration: 3000, panelClass: ['snackbar-success'] });
                    this._snackBar.open(`Added "${this.selectedItem.name}" to "${playlist.name}" successfully`, null, {
                        duration: 3000,
                        panelClass: ['snackbar-success']
                    });
                }
            });
    }

    selectItem(item: DataGridItem) {
        this.selectedItem = item;
    }
}
