import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import * as id3 from 'id3js';
import { totalmem } from 'os';
import { BundlrService } from '../bundlr.service';

@Component({
    selector: 'app-upload',
    templateUrl: './upload.component.html',
    styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {
    album: any = { title: 'testing', artist: 'justin', genre: 'pop', description: 'for testing', thumbBuffer: null, songs: [] };

    constructor(private _bundlrService: BundlrService, private _snackBar: MatSnackBar) {}

    async ngOnInit(): Promise<void> {}

    onThumbFileChanged(event: Event) {
        const target = event.target as HTMLInputElement;
        const file: File = (target.files as FileList)[0];
        console.log(file);

        const thumbElement = document.getElementById(`thumb`);
        this.readFileAsDataURL(file, (result) => thumbElement.setAttribute('src', result as string));

        this.readFileAsBuffer(file, async (buffer) => {
            this.album.thumbBuffer = buffer;
        });
    }

    async onAddAudioFileChanged(event: Event) {
        const target = event.target as HTMLInputElement;
        const file: File = (target.files as FileList)[0];

        let addSong = { title: '', artist: '', genre: 'Unknown', duration: 0, price: null, buffer: null };
        this.album.songs.push(addSong);

        setTimeout(() => {
            const audioElement = document.getElementById(`audio-${this.album.songs.length}`);
            this.readFileAsDataURL(file, (result) => {
                audioElement.setAttribute('src', result as string);

                audioElement.onloadedmetadata = function () {
                    addSong.duration = (audioElement as any).duration;
                };
            });
            this.readFileAsBuffer(file, async (buffer) => {
                try {
                    addSong.price = (await this._bundlrService.getPrice(buffer.length)).toFixed(6);
                } catch {}

                addSong.buffer = buffer;
            });
        }, 100);

        id3.fromFile(file).then((tags) => {
            // tags now contains v1, v2 and merged tags
            console.log(tags);
            addSong.title = tags.title;
            addSong.artist = tags.artist;
            //addSong.duration = tags.duration;
        });
    }

    async upload() {
        console.log('upload', this.album);

        // upload album thumbnail
        let rsThumbnail = await this._bundlrService.upload(this.album.thumbBuffer, [
            { name: 'App-Name', value: 'Arpomus' },
            { name: 'App-Version', value: '0.1.0' },
            { name: 'Content-Type', value: 'image' },
            { name: 'Unix-Time', value: Math.round(Date.now() / 1000).toString() }
        ]);
        console.log('rsThumbnail', rsThumbnail.data);

        // upload album info
        let rsAlbum = await this._bundlrService.upload(Buffer.from(''), [
            { name: 'App-Name', value: 'Arpomus' },
            { name: 'App-Version', value: '0.1.0' },
            { name: 'Content-Type', value: 'application/json' },
            { name: 'Data-Type', value: 'album' },
            { name: 'Unix-Time', value: Math.round(Date.now() / 1000).toString() },
            
            { name: 'Title', value: this.album.title },
            { name: 'Artist', value: this.album.artist },
            { name: 'Genre', value: this.album.genre },
            { name: 'Description', value: this.album.description },
            { name: 'Thumbnail', value: rsThumbnail.data.id }
        ]);
        console.log('rsAlbum', rsAlbum.data);

        // upload album songs
        for (let i = 0; i < this.album.songs.length; i++) {
            let song = this.album.songs[i];
            let rsSong = await this._bundlrService.upload(song.buffer, [
                { name: 'App-Name', value: 'Arpomus' },
                { name: 'App-Version', value: '0.1.0' },
                { name: 'Content-Type', value: 'audio' },
                { name: 'Data-Type', value: 'song' },
                { name: 'Unix-Time', value: Math.round(Date.now() / 1000).toString() },

                { name: 'Title', value: song.title },
                { name: 'Artist', value: song.artist },
                { name: 'Genre', value: song.genre },
                { name: 'Duration', value: song.duration.toString() },
                { name: 'Thumbnail', value: rsThumbnail.data.id },
                { name: 'Album', value: rsAlbum.data.id },
                { name: 'Album-Track', value: (i + 1).toString() }
            ]);
            console.log('rsSong', rsSong.data);
        }

        this._snackBar.open('Upload album successfully', '', { panelClass: ['snackbar-success'] });
    }

    getTotalPrice() {
        let total: number = 0;
        this.album.songs.forEach((song) => {
            total += parseFloat(song.price);
        });

        return total.toFixed(4);
    }

    readFileAsBuffer(file: File, callback: any) {
        const reader = new FileReader();
        reader.onload = function () {
            if (reader.result) {
                const buffer = Buffer.from(reader.result as ArrayBuffer);
                callback(buffer);
            } else {
                callback(null);
            }
        };
        reader.readAsArrayBuffer(file);
    }

    readFileAsDataURL(blob: Blob, callback) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            callback(e.target.result);
        };
        reader.readAsDataURL(blob);
    }
}
