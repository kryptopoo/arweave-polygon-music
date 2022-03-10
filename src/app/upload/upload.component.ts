import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import * as id3 from 'id3js';
import { totalmem, type } from 'os';
import { BundlrService } from '../services/bundlr.service';
import { DialogService } from '../services/dialog.service';
import { WalletComponent } from '../wallet/wallet.component';
import { environment } from './../../environments/environment';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
    selector: 'app-upload',
    templateUrl: './upload.component.html',
    styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {
    @ViewChild('walletCompoment', { static: false }) walletCompoment: WalletComponent;

    walletConnected: boolean = false;
    thumbBuffer: Buffer = null;
    album: any = { title: '', artist: '', genre: '', description: '', songs: [] };

    constructor(
        private _firestore: AngularFirestore,
        private _bundlrService: BundlrService,
        private _snackBar: MatSnackBar,
        private _dialogService: DialogService
    ) {}

    ngOnInit(): void {
        this._bundlrService.connection$.subscribe((isConnected: boolean) => {
            this.walletConnected = isConnected;
        });
        this.walletConnected = this._bundlrService.isConnected();
    }

    onThumbFileChanged(event: Event) {
        const target = event.target as HTMLInputElement;
        const file: File = (target.files as FileList)[0];
        console.log(file);

        const thumbElement = document.getElementById(`thumb`);
        this.readFileAsDataURL(file, (result) => thumbElement.setAttribute('src', result as string));

        this.readFileAsBuffer(file, async (buffer) => {
            this.thumbBuffer = buffer;
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
                    addSong.price = (await this._bundlrService.getPrice(buffer.length)).toFixed(5);
                } catch {}

                addSong.buffer = buffer;
            });
        }, 100);

        id3.fromFile(file).then((tags) => {
            // tags now contains v1, v2 and merged tags
            console.log(tags);
            addSong.title = tags.title;
            addSong.artist = tags.artist?.split(',').pop();
            //addSong.duration = tags.duration;
        });

        console.log('this.album.songs', this.album.songs);
    }

    async upload() {
        console.log('upload', this.album);

        const dataBytes =
            (this.thumbBuffer == null ? 0 : this.thumbBuffer.length) + this.album.songs.reduce((sum, { buffer }) => sum + buffer.length, 0);
        const dataUploadFee = await this._bundlrService.getPrice(dataBytes);
        this._dialogService.confirmDialog({ fee: dataUploadFee.toFixed(5) }).subscribe(async (confirmed) => {
            if (confirmed) {
                // upload album thumbnail
                var thumbId = environment.defaultThumbnailId;
                if (this.thumbBuffer != null) {
                    let rsThumbnail = await this._bundlrService.upload(this.thumbBuffer, [{ name: 'Content-Type', value: 'image' }]);
                    console.log('rsThumbnail', rsThumbnail.data);
                    thumbId = rsThumbnail.data.id;

                    this.log('upload-image', 'image', thumbId, '');
                }

                // upload album info
                let rsAlbum = await this._bundlrService.upload(
                    Buffer.from(
                        JSON.stringify({
                            title: this.album.title,
                            artist: this.album.artist,
                            genre: this.album.genre,
                            description: this.album.description,
                            thumbnail: thumbId
                        })
                    ),
                    [
                        { name: 'Content-Type', value: 'application/json' },
                        { name: 'Data-Type', value: 'album' },

                        { name: 'Keyword-Title', value: this.album.title.toLowerCase() },
                        { name: 'Keyword-Artist', value: this.album.artist.toLowerCase() },
                        { name: 'Keyword-Genre', value: this.album.genre.toLowerCase() },

                        { name: 'Title', value: this.album.title },
                        { name: 'Artist', value: this.album.artist },
                        { name: 'Genre', value: this.album.genre },
                        { name: 'Description', value: this.album.description },
                        { name: 'Thumbnail', value: thumbId }
                    ]
                );
                console.log('rsAlbum', rsAlbum.data);
                this.log('upload-album', 'application/json', rsAlbum.data.id, this.album.title);

                // upload album songs
                for (let i = 0; i < this.album.songs.length; i++) {
                    let song = this.album.songs[i];
                    let rsSong = await this._bundlrService.upload(song.buffer, [
                        { name: 'Content-Type', value: 'audio' },
                        { name: 'Data-Type', value: 'song' },

                        { name: 'Keyword-Title', value: song.title.toLowerCase() },
                        { name: 'Keyword-Artist', value: song.artist.toLowerCase() },
                        { name: 'Keyword-Genre', value: this.album.genre.toLowerCase() },

                        { name: 'Title', value: song.title },
                        { name: 'Artist', value: song.artist },
                        { name: 'Genre', value: this.album.genre },
                        { name: 'Duration', value: song.duration.toString() },
                        { name: 'Thumbnail', value: thumbId },
                        { name: 'Album', value: rsAlbum.data.id },
                        { name: 'Album-Track', value: (i + 1).toString() }
                    ]);
                    console.log('rsSong', rsSong.data);
                    this.log('upload-song', 'audio', rsSong.data.id, song.title);
                }

                this._snackBar.open(`Uploaded album successfully`, null, { duration: 3000, panelClass: ['snackbar-success'] });
                this.walletCompoment.loadWalletInfo();
            }
        });
    }

    log(type: string, contentType: string, txId: string, description: string) {
        var transactionCollection = this._firestore.collection(`logs-${this._bundlrService.getAddress()}`);
        transactionCollection.add({
            time: Math.round(Date.now() / 1000).toString(),
            type: type,
            contentType: contentType,
            txId: txId,
            description: description
        });
    }

    connectWallet() {
        this.walletCompoment.openConnectDialog();
    }

    getTotalPrice() {
        let total: number = 0;
        this.album.songs.forEach((song) => {
            total += parseFloat(song.price);
        });

        return total.toFixed(5);
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
