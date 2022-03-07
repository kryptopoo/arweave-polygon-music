import { Component, OnInit } from '@angular/core';
import { ArweaveGraphqlService, ArweaveGraphqlTag } from '../arweave-graphql.service';
import { AudioService, StreamState, StreamInfo, SongInfo } from '../audio.service';
import { BundlrService } from '../bundlr.service';
import { DataGridItem } from '../data-grid/data-grid.component';

@Component({
    selector: 'app-your-library',
    templateUrl: './your-library.component.html',
    styleUrls: ['./your-library.component.scss']
})
export class YourLibraryComponent implements OnInit {
    songs: Array<DataGridItem> = new Array<DataGridItem>();
    playlists: Array<DataGridItem>  = new Array<DataGridItem>();
    albums: Array<DataGridItem>  = new Array<DataGridItem>();

    state: StreamState;
    tab: string = 'songs';
    walletConnected: boolean = false;

    constructor(private _audioService: AudioService, private _arweaveGrapqlService: ArweaveGraphqlService, private _bundlrService: BundlrService) {}

    ngOnInit(): void {
        this.walletConnected = this._bundlrService.isConnected();
        if (!this.walletConnected) return;

        // let dumpSongs = [
        //     {
        //         title: 'Buoc qua nhau',
        //         artist: 'Vu',
        //         thumb: 'https://i.scdn.co/image/ab67616d00001e024eca4595da187b3a25eb9958',
        //         url: 'https://aredir.nixcdn.com/NhacCuaTui1024/BuocQuaNhau-Vu-7120388_hq.mp3?st=5xIHVhJ04c-Q5CZr-cNpMw&amp;e=1646116047'
        //     },
        //     {
        //         title: 'Buoc qua mua co don',
        //         artist: 'Vu',
        //         thumb: 'https://avatar-nct.nixcdn.com/song/2020/12/11/4/0/f/e/1607643612541_300.jpg',
        //         url: 'https://aredir.nixcdn.com/NhacCuaTui1008/BuocQuaMuaCoDon-Vu-6879419_hq.mp3?st=1PRCs-RQx6r4QmKl3Sxn0Q&amp;e=1646140789'
        //     }
        // ];

        // get albums
        this._arweaveGrapqlService
            .queryByTags(
                [
                    { name: 'Content-Type', values: ['application/json'] },
                    { name: 'Data-Type', values: ['album'] }
                ],
                this._bundlrService.getAddress()
            )
            .subscribe((rs) => {
                var edges: any[] = rs.data.transactions.edges;
                edges.forEach((edge) => {
                    // var tags = {};
                    // edge.node.tags.forEach((tag) => {
                    //     tags[tag.name] = tag.value;
                    // });

                    // this.albums.push({
                    //     id: edge.node.id,
                    //     title: tags['Title'],
                    //     artist: tags['Artist'],
                    //     description: tags['Description'],
                    //     thumbnail: `https://arweave.net/${tags['Thumbnail']}`,
                    //     url: `/album/${edge.node.id}`
                    // });

                    var dataGridItem = this._arweaveGrapqlService.bindNodeToDataGridItem(edge.node);
                    this.albums.push(dataGridItem);
                });
                console.log(this.albums);
            });

        // get songs
        this._arweaveGrapqlService
            .queryByTags(
                [
                    { name: 'App-Name', values: ['Arpomus'] },
                    { name: 'App-Version', values: ['0.1.0'] },
                    { name: 'Content-Type', values: ['audio'] }
                ],
                this._bundlrService.getAddress()
            )
            .subscribe((rs) => {
                var edges: any[] = rs.data.transactions.edges;
                edges.forEach((edge) => {
                    // var tags = {};
                    // edge.node.tags.forEach((tag) => {
                    //     tags[tag.name] = tag.value;
                    // });

                    // this.songs.push({
                    //     id: edge.node.id,
                    //     name: tags['Title'],
                    //     description: tags['Artist'],
                    //     thumbnail: `https://arweave.net/${tags['Thumbnail']}`,
                    //     url: `https://arweave.net/${edge.node.id}`
                    // });

                    var dataGridItem = this._arweaveGrapqlService.bindNodeToDataGridItem(edge.node);
                    this.songs.push(dataGridItem);
                });
                console.log('songs', this.songs);
            });
    }

    playSong(song: any): void {
        let streamInfo: StreamInfo = { index: 0, songs: [song] };
        this._audioService.playStream(streamInfo).subscribe((events) => {
            // listening for fun here
            //console.log(events);
        });

        //this.audioService.play();
    }

    playPlaylist(playlist: any): void {
        let streamInfo: StreamInfo = { index: 0, songs: playlist.songs };
        this._audioService.playStream(streamInfo).subscribe((events) => {
            // listening for fun here
            //console.log(events);
        });

        //this.audioService.play();
    }

    selectAlbum() {}
}
