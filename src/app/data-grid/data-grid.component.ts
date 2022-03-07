import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AudioService, SongInfo, StreamInfo } from '../audio.service';

export interface DataGridItem {
    id: string;
    name: string;
    description: string;
    thumbnail: string;
    url: string;
    type: string;
}

@Component({
    selector: 'app-data-grid',
    templateUrl: './data-grid.component.html',
    styleUrls: ['./data-grid.component.scss']
})
export class DataGridComponent implements OnInit {
    @Input() items: Array<DataGridItem>;

    constructor(private _audioService: AudioService, private _router: Router) {}

    ngOnInit(): void {}

    play(item: DataGridItem): void {
        if (item.type == 'song') {
            let song: SongInfo = { title: item.name, artist: item.description, thumbnail: item.thumbnail, url: item.url };
            let streamInfo: StreamInfo = { index: 0, songs: [song] };
            this._audioService.playStream(streamInfo).subscribe((events) => {});
        }
        else if (item.type == 'album') {
          this._router.navigateByUrl(`/album/${item.id}`)
        }
    }
}
