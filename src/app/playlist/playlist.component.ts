import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ArweaveGraphqlService } from '../arweave-graphql.service';
import { AudioService, StreamInfo } from '../audio.service';

@Component({
    selector: 'app-playlist',
    templateUrl: './playlist.component.html',
    styleUrls: ['./playlist.component.scss']
})
export class PlaylistComponent implements OnInit {
    songs: any[];
    playlist: any = { title: null, description: null, artist: null, thumbnail: null, creator: null, duration: null, song: [] };

    constructor(private route: ActivatedRoute, private audioService: AudioService, private arweaveGrapqlService: ArweaveGraphqlService) {}

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');

        this.arweaveGrapqlService.queryByIds([id]).subscribe((rs) => {
            var edges: any[] = rs.data.transactions.edges;
            var tags = {};
            edges[0].node.tags.forEach((tag) => {
                tags[tag.name] = tag.value;
            });

            this.playlist = {
                title: tags['Title'],
                description: tags['Description'],
                thumbnail: `https://arweave.net/${tags['Thumbnail']}`,
                songs: [],
                creator: 'kyptopoo',
                duration: '17 hr 21 min'
            };

            // query songs
            this.arweaveGrapqlService.queryByTags([{ name: 'Album', values: [id] }]).subscribe((rsSongs) => {
                var edges: any[] = rsSongs.data.transactions.edges;
                edges.forEach((edge) => {
                    var tags = {};
                    edge.node.tags.forEach((tag) => {
                        tags[tag.name] = tag.value;
                    });

                    this.playlist.songs.push({
                        id: edge.node.id,
                        title: tags['Title'],
                        artist: tags['Artist'],
                        duration: tags['Duration'],
                        thumbnail: `https://arweave.net/${tags['Thumbnail']}`,
                        url: `https://arweave.net/${edge.node.id}`
                    });
                });
            });
        });
    }

    playSong(song: any): void {
        let streamInfo: StreamInfo = { index: 0, songs: [song] };
        this.audioService.playStream(streamInfo).subscribe((events) => {
            // listening for fun here
            //console.log(events);
        });
    }

    playPlaylist(): void {
        let streamInfo: StreamInfo = { index: 0, songs: this.playlist.songs };
        this.audioService.playStream(streamInfo).subscribe((events) => {
            // listening for fun here
            //console.log(events);
        });
    }
}
