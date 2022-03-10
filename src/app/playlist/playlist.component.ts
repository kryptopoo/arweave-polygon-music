import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ArweaveGraphqlService } from '../services/arweave-graphql.service';
import { AudioService, StreamInfo } from '../services/audio.service';
import moment from 'moment';

@Component({
    selector: 'app-playlist',
    templateUrl: './playlist.component.html',
    styleUrls: ['./playlist.component.scss']
})
export class PlaylistComponent implements OnInit {
    songs: any[];
    playlist: any = { title: null, description: null, artist: null, thumbnail: null, creator: null, duration: null, song: [] };

    constructor(private route: ActivatedRoute, private audioService: AudioService, private arweaveGrapqlService: ArweaveGraphqlService) {}

    ngOnChanges(): void {
    }

    ngOnInit(): void {
        const id = this.route.snapshot.paramMap.get('id');

        this.route.params.subscribe((params) => {
            const id = params.id;

            this.arweaveGrapqlService.queryByIds([id]).subscribe((rs) => {
                var edges: any[] = rs.data.transactions.edges;
                var tags = {};
                edges[0].node.tags.forEach((tag) => {
                    tags[tag.name] = tag.value;
                });

                this.playlist = {
                    title: tags['Title'] || tags['Name'],
                    description: tags['Description'],
                    type: tags['Data-Type'],
                    thumbnail: `https://arweave.net/${tags['Thumbnail']}`,
                    songs: [],
                    owner: edges[0].node.owner.address,
                    duration: 0
                };

                console.log('this.playlist', this.playlist);

                // query songs
                var queryTags = [];
                if (this.playlist.type == 'album') queryTags.push({ name: 'Album', values: [id] });
                if (this.playlist.type == 'playlist') {
                    queryTags.push({ name: 'Playlist', values: [id] });
                    queryTags.push({ name: 'Data-Type', values: ['playlist-song'] });

                    // // for testing
                    // queryTags.push({ name: 'Data-Type', values: ['song'] });
                }

                this.arweaveGrapqlService.queryByTags(queryTags).subscribe((rsSongs) => {
                    var edges: any[] = rsSongs.data.transactions.edges;
                    edges.forEach((edge) => {
                        var tags = {};
                        edge.node.tags.forEach((tag) => {
                            tags[tag.name] = tag.value;
                        });

                        // audio data
                        //var songUrl = this.playlist.type == 'playlist' ? `https://arweave.net/${tags['Song']}` : `https://arweave.net/${edge.node.id}`;
                        var songUrl = `https://arweave.net/${edge.node.id}`
                        if (tags['Song']) songUrl = `https://arweave.net/${tags['Song']}`;

                        this.playlist.songs.push({
                            id: edge.node.id,
                            title: tags['Title'],
                            artist: tags['Artist'],
                            duration: this.secondsToTime(tags['Duration']),
                            durationValue: tags['Duration'],
                            thumbnail: `https://arweave.net/${tags['Thumbnail']}`,
                            url: songUrl,
                            
                        });
                    });

                    this.playlist.duration = this.secondsToTime(this.playlist.songs.reduce((sum, { durationValue }) => sum + parseFloat(durationValue), 0));
                });
            });
        });
    }

    secondsToTime(val: any) {
        var secs = val;
        if ((typeof val === 'string' || val instanceof String))
            secs = parseFloat(val.toString());

        return moment.utc(secs * 1000).format('HH:mm:ss');
    }

    playSong(song: any): void {
        console.log('playsong', song);
        let streamInfo: StreamInfo = { index: 0, songs: [song] };
        this.audioService.playStream(streamInfo).subscribe((events) => {
        });
    }

    playPlaylist(): void {
        let streamInfo: StreamInfo = { index: 0, songs: this.playlist.songs };
        this.audioService.playStream(streamInfo).subscribe((events) => {
        });
    }
}
