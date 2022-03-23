import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ArweaveGraphqlService, ArweaveGraphqlTag } from '../services/arweave-graphql.service';
import { DataGridItem } from '../data-grid/data-grid.component';
import { AppConstants } from '../app.constants';

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {
    loading: boolean = false;
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
        this.route.queryParams.subscribe((params) => {
            this.searchTextValue = this.route.snapshot.queryParams.v;
            this.searchGenreValue = this.route.snapshot.queryParams.g;

            if (this.searchGenreValue) {
                this.searchByGenre();
            }
        });

         // get genres
         this.genres = AppConstants.Genres;
    }

    enterSearch(event) {
        this.searchGenreValue = null;
        this.searchTextValue = event.target.value;
        this.searchByText();
    }

    searchByGenre() {
        this.loading = true;
        this.searchTextValue = null;
        this.foundAlbums = [];
        this.foundSongs = [];
        this.arweaveGrapqlService
            .queryByTags([
                { name: 'Content-Type', values: ['application/json'] },
                { name: 'Data-Type', values: ['album'] },
                { name: 'Keyword-Genre', values: [this.searchGenreValue.toLowerCase()] }
            ])
            .subscribe((rs) => {
                var edges: any[] = rs.data.transactions.edges;
                edges.forEach((edge) => {
                    var dataGridItem = this.arweaveGrapqlService.bindNodeToDataGridItem(edge.node);
                    this.foundAlbums.push(dataGridItem);
                });
                console.log(this.foundAlbums);

                this.loading = false;
            });
    }

    searchByText() {
        this.loading = true;
        this.foundAlbums = [];
        this.foundSongs = [];

        // search album
        this.arweaveGrapqlService
            .queryByTags([
                { name: 'Data-Type', values: ['album'] },
                { name: 'Keyword-Title', values: [this.searchTextValue.toLowerCase()] }
            ])
            .subscribe((rs) => {
                var edges: any[] = rs.data.transactions.edges;
                edges.forEach((edge) => {
                    var dataGridItem = this.arweaveGrapqlService.bindNodeToDataGridItem(edge.node);
                    this.foundAlbums.push(dataGridItem);
                });

                this.loading = false;
            });

        this.arweaveGrapqlService
            .queryByTags([
                { name: 'Data-Type', values: ['album'] },
                { name: 'Keyword-Artist', values: [this.searchTextValue.toLowerCase()] }
            ])
            .subscribe((rs) => {
                var edges: any[] = rs.data.transactions.edges;
                edges.forEach((edge) => {
                    var dataGridItem = this.arweaveGrapqlService.bindNodeToDataGridItem(edge.node);
                    this.foundAlbums.push(dataGridItem);
                });

                this.loading = false;
            });

        // search songs
        this.arweaveGrapqlService
            .queryByTags([
                { name: 'Data-Type', values: ['song'] },
                { name: 'Keyword-Title', values: [this.searchTextValue.toLowerCase()] }
            ])
            .subscribe((rs) => {
                var edges: any[] = rs.data.transactions.edges;
                edges.forEach((edge) => {
                    var dataGridItem = this.arweaveGrapqlService.bindNodeToDataGridItem(edge.node);
                    this.foundSongs.push(dataGridItem);
                });

                this.loading = false;
            });

        this.arweaveGrapqlService
            .queryByTags([
                { name: 'Data-Type', values: ['song'] },
                { name: 'Keyword-Artist', values: [this.searchTextValue.toLowerCase()] }
            ])
            .subscribe((rs) => {
                var edges: any[] = rs.data.transactions.edges;
                edges.forEach((edge) => {
                    var dataGridItem = this.arweaveGrapqlService.bindNodeToDataGridItem(edge.node);
                    this.foundSongs.push(dataGridItem);
                });

                this.loading = false;
            });
    }
}
