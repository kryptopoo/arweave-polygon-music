import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ArweaveGraphqlService, ArweaveGraphqlTag } from '../arweave-graphql.service';
import { DataGridItem } from '../data-grid/data-grid.component';

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
    showResult: boolean = false;
    genres: any[] = new Array();

    searchTextValue: string = null;
    searchGenreValue: string = null;

    foundAlbums: Array<DataGridItem> = new Array<DataGridItem>();
    foundSongs: Array<DataGridItem> = new Array<DataGridItem>();

    constructor(private route: ActivatedRoute, private arweaveGrapqlService: ArweaveGraphqlService) {}

    ngOnChanges(): void {
        console.log('change', this.route.snapshot.queryParams);
    }

    ngOnInit(): void {
        // console.log(this.route.snapshot.queryParams.v) // search by text
        // console.log(this.route.snapshot.queryParams.g) // search by genre

        this.route.queryParams.subscribe((params) => {
            this.searchTextValue = this.route.snapshot.queryParams.v;
            this.searchGenreValue = this.route.snapshot.queryParams.g;

            console.log(this.searchTextValue, this.searchGenreValue);
            if (this.searchGenreValue) {
                this.searchByGenre();
            }
        });

        // get genres

        this.genres = [
            { name: 'Pop', imgUrl: 'https://t.scdn.co/images/0a74d96e091a495bb09c0d83210910c3', bgColor: 'rgb(141, 103, 171)' },
            { name: 'Country', imgUrl: 'https://i.scdn.co/image/ab67706f00000002a980b152e708b33c6516d848', bgColor: 'rgb(225, 51, 0)' },
            { name: 'Rock', imgUrl: 'https://i.scdn.co/image/ab67706f00000002fe6d8d1019d5b302213e3730', bgColor: 'rgb(230, 30, 50)' },
            { name: 'Classical', imgUrl: 'https://i.scdn.co/image/ab67706f000000023e0130fcd5d106f1402b4707', bgColor: 'rgb(141, 103, 171)' },

            { name: 'Romance', imgUrl: 'https://i.scdn.co/image/ab67706f0000000213601d4833623a4d6b328e38', bgColor: 'rgb(140, 25, 50)' },
            { name: 'Hip-Hop', imgUrl: 'https://i.scdn.co/image/ab67706f000000029bb6af539d072de34548d15c', bgColor: 'rgb(186, 93, 7)' },
            { name: 'Dance / Electronic', imgUrl: 'https://i.scdn.co/image/ab67706f000000020377baccf69ede3cf1a26eff', bgColor: 'rgb(220, 20, 140)' },
            { name: 'Gaming', imgUrl: 'https://i.scdn.co/image/ab67706f0000000221a2087747d946f16704b8af', bgColor: 'rgb(232, 17, 91)' },
            { name: 'Workout', imgUrl: 'https://i.scdn.co/image/ab67706f000000029249b35f23fb596b6f006a15', bgColor: 'rgb(119, 119, 119)' },
            { name: 'R&B', imgUrl: 'https://i.scdn.co/image/ab67706f000000023c5a4aaf5df054a9beeb3d82', bgColor: 'rgb(220, 20, 140)' },
            { name: 'Jazz', imgUrl: 'https://i.scdn.co/image/ab67706f00000002d72ef75e14ca6f60ea2364c2', bgColor: 'rgb(30, 50, 100)' },
            { name: 'Anime', imgUrl: 'https://t.scdn.co/images/54841f7d6a774ef096477c99c23f0cf1.jpeg', bgColor: 'rgb(215, 242, 125)' },

            { name: 'Sleep', imgUrl: 'https://i.scdn.co/image/ab67706f00000002b70e0223f544b1faa2e95ed0', bgColor: 'rgb(30, 50, 100)' },
            { name: 'Instrumental', imgUrl: 'https://i.scdn.co/image/ab67706f000000028ed1a5002b96c2ea882541b2', bgColor: 'rgb(71, 125, 149)' },
            { name: 'Focus', imgUrl: 'https://i.scdn.co/image/ab67706f00000002e4eadd417a05b2546e866934', bgColor: 'rgb(80, 55, 80)' },
            { name: 'Party', imgUrl: 'https://i.scdn.co/image/ab67706f00000002caa115cbdb8cd3d39d67cdc0', bgColor: 'rgb(175, 40, 150)' },
            { name: 'Acoustic', imgUrl: 'https://i.scdn.co/image/ab67706f0000000237df164786f688dd0ccd8744', bgColor: 'rgb(30, 50, 100)' },
            { name: 'TV & Movies', imgUrl: 'https://i.scdn.co/image/ab67706f000000026abff8de68c75470ea8f0665', bgColor: 'rgb(175, 40, 150)' },

            { name: 'Vietnamese Music', imgUrl: 'https://t.scdn.co/images/841d524163d94e98b0becfd8c920efde.jpeg', bgColor: 'rgb(195, 240, 200)' },
            { name: 'K-Pop', imgUrl: 'https://i.scdn.co/image/ab67706f00000002978b9f4a4f40b430fd0d837e', bgColor: 'rgb(20, 138, 8)' },
            { name: 'Chill', imgUrl: 'https://i.scdn.co/image/ab67706f00000002c414e7daf34690c9f983f76e', bgColor: 'rgb(71, 125, 149)' },
            { name: 'Mood', imgUrl: 'https://i.scdn.co/image/ab67706f00000002aa93fe4e8c2d24fc62556cba', bgColor: 'rgb(141, 103, 171)' },
            { name: 'Indie', imgUrl: 'https://i.scdn.co/image/ab67706f000000025f7327d3fdc71af27917adba', bgColor: 'rgb(96, 129, 8)' },
            { name: 'Latin', imgUrl: 'https://t.scdn.co/images/6a48e36b373a4d879a9340076db03a7b', bgColor: 'rgb(225, 17, 139)' }
        ];
    }

    enterSearch(event) {
        this.searchTextValue = event.target.value;
        this.searchByText();
    }

    searchByGenre() {
        this.foundAlbums = [];
        this.foundSongs = [];
        this.arweaveGrapqlService
            .queryByTags([
                { name: 'Content-Type', values: ['application/json'] },
                { name: 'Data-Type', values: ['album'] },
                { name: 'Genre', values: [this.searchGenreValue.toLowerCase()] }
            ])
            .subscribe((rs) => {
                var edges: any[] = rs.data.transactions.edges;
                edges.forEach((edge) => {
                    var dataGridItem = this.arweaveGrapqlService.bindNodeToDataGridItem(edge.node);
                    this.foundAlbums.push(dataGridItem);
                });
                console.log(this.foundAlbums);
            });
    }

    searchByText() {
        this.foundAlbums = [];
        this.foundSongs = [];

        // search album
        this.arweaveGrapqlService
            .queryByTags([
                { name: 'Data-Type', values: ['album'] },
                { name: 'Title', values: [this.searchTextValue.toLowerCase()] }
            ])
            .subscribe((rs) => {
                var edges: any[] = rs.data.transactions.edges;
                edges.forEach((edge) => {
                    var dataGridItem = this.arweaveGrapqlService.bindNodeToDataGridItem(edge.node);
                    this.foundAlbums.push(dataGridItem);
                });
            });

        this.arweaveGrapqlService
            .queryByTags([
                { name: 'Data-Type', values: ['album'] },
                { name: 'Artist', values: [this.searchTextValue.toLowerCase()] }
            ])
            .subscribe((rs) => {
                var edges: any[] = rs.data.transactions.edges;
                edges.forEach((edge) => {
                    var dataGridItem = this.arweaveGrapqlService.bindNodeToDataGridItem(edge.node);
                    this.foundAlbums.push(dataGridItem);
                });
            });

        // search songs
        this.arweaveGrapqlService
            .queryByTags([
                { name: 'Data-Type', values: ['song'] },
                { name: 'Title', values: [this.searchTextValue.toLowerCase()] }
            ])
            .subscribe((rs) => {
                var edges: any[] = rs.data.transactions.edges;
                edges.forEach((edge) => {
                    var dataGridItem = this.arweaveGrapqlService.bindNodeToDataGridItem(edge.node);
                    this.foundSongs.push(dataGridItem);
                });
            });

        this.arweaveGrapqlService
            .queryByTags([
                { name: 'Data-Type', values: ['song'] },
                { name: 'Artist', values: [this.searchTextValue.toLowerCase()] }
            ])
            .subscribe((rs) => {
                var edges: any[] = rs.data.transactions.edges;
                edges.forEach((edge) => {
                    var dataGridItem = this.arweaveGrapqlService.bindNodeToDataGridItem(edge.node);
                    this.foundSongs.push(dataGridItem);
                });
            });
    }
}
