import { Component, OnInit } from '@angular/core';
import { ArweaveGraphqlService } from '../services/arweave-graphql.service';
import { DataGridItem } from '../data-grid/data-grid.component';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    loading: boolean = false;
    songs: Array<DataGridItem> = new Array<DataGridItem>();
    playlists: Array<DataGridItem> = new Array<DataGridItem>();
    albums: Array<DataGridItem> = new Array<DataGridItem>();

    constructor(private _arweaveGrapqlService: ArweaveGraphqlService) {}

    ngOnInit(): void {
        // get albums
        this.loading = true;
        this._arweaveGrapqlService.queryByTags([{ name: 'Data-Type', values: ['album'] }]).subscribe((rs) => {
            var edges: any[] = rs.data.transactions.edges;
            edges.forEach((edge) => {
                var dataGridItem = this._arweaveGrapqlService.bindNodeToDataGridItem(edge.node);
                this.albums.push(dataGridItem);
            });
            this.loading = false;
        });

        // get songs
        this.loading = true;
        this._arweaveGrapqlService.queryByTags([{ name: 'Data-Type', values: ['song'] }]).subscribe((rs) => {
            var edges: any[] = rs.data.transactions.edges;
            edges.forEach((edge) => {
                var dataGridItem = this._arweaveGrapqlService.bindNodeToDataGridItem(edge.node);
                this.songs.push(dataGridItem);
            });
            this.loading = false;
        });

        // get playlist
        this.loading = true;
        this._arweaveGrapqlService.queryByTags([{ name: 'Data-Type', values: ['playlist'] }]).subscribe((rs) => {
            var edges: any[] = rs.data.transactions.edges;
            edges.forEach((edge) => {
                var dataGridItem = this._arweaveGrapqlService.bindNodeToDataGridItem(edge.node);
                this.playlists.push(dataGridItem);
            });
            this.loading = false;
        });
    }
}
