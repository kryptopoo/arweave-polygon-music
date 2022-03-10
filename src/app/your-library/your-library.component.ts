import { Component, OnInit, ViewChild } from '@angular/core';
import { ArweaveGraphqlService, ArweaveGraphqlTag } from '../services/arweave-graphql.service';
import { AudioService, StreamState, StreamInfo, SongInfo } from '../services/audio.service';
import { BundlrService } from '../services/bundlr.service';
import { DataGridItem } from '../data-grid/data-grid.component';
import { WalletComponent } from '../wallet/wallet.component';

@Component({
    selector: 'app-your-library',
    templateUrl: './your-library.component.html',
    styleUrls: ['./your-library.component.scss']
})
export class YourLibraryComponent implements OnInit {
    @ViewChild('walletCompoment', { static: false }) walletCompoment: WalletComponent;
    songs: Array<DataGridItem> = new Array<DataGridItem>();
    playlists: Array<DataGridItem> = new Array<DataGridItem>();
    albums: Array<DataGridItem> = new Array<DataGridItem>();

    loading: boolean = false;
    state: StreamState;
    tab: string = 'songs';
    walletConnected: boolean = false;

    constructor(private _audioService: AudioService, private _arweaveGrapqlService: ArweaveGraphqlService, private _bundlrService: BundlrService) {}

    ngOnInit(): void {
        this._bundlrService.connection$.subscribe((isConnected: boolean) => {
            this.walletConnected = isConnected;
            this.loadAlbums();
            this.loadSongs();
            this.loadPlaylists();
        });

        this.walletConnected = this._bundlrService.isConnected();
        if (!this.walletConnected) return;

        // load data
        this.loadAlbums();
        this.loadSongs();
        this.loadPlaylists();
    }

    playSong(song: any): void {
        let streamInfo: StreamInfo = { index: 0, songs: [song] };
        this._audioService.playStream(streamInfo).subscribe((events) => {});
    }

    playPlaylist(playlist: any): void {
        let streamInfo: StreamInfo = { index: 0, songs: playlist.songs };
        this._audioService.playStream(streamInfo).subscribe((events) => {});
    }

    connectWallet() {
        this.walletCompoment.openConnectDialog();
    }

    loadAlbums() {
        this.loading = true;
        // get albums
        this._arweaveGrapqlService
            .queryByTags(
                [
                    { name: 'Data-Type', values: ['album'] },
                    { name: 'Creator', values: [this._bundlrService.getAddress()] }
                ],
                this._bundlrService.getAddress()
            )
            .subscribe((rs) => {
                var edges: any[] = rs.data.transactions.edges;
                edges.forEach((edge) => {
                    var dataGridItem = this._arweaveGrapqlService.bindNodeToDataGridItem(edge.node);
                    this.albums.push(dataGridItem);
                });

                this.loading = false;
            });
    }

    loadSongs() {
        // get songs
        this.loading = true;
        this._arweaveGrapqlService
            .queryByTags([
                { name: 'Data-Type', values: ['song'] },
                { name: 'Creator', values: [this._bundlrService.getAddress()] }
            ])
            .subscribe((rs) => {
                var edges: any[] = rs.data.transactions.edges;
                edges.forEach((edge) => {
                    var dataGridItem = this._arweaveGrapqlService.bindNodeToDataGridItem(edge.node);
                    this.songs.push(dataGridItem);
                });

                this.loading = false;
            });
    }

    loadPlaylists() {
        this.loading = true;
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
                this.loading = false;
            });
    }
}
