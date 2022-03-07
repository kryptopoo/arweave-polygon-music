import { Component, OnInit } from '@angular/core';
import { ArweaveGraphqlService } from '../arweave-graphql.service';
import { DataGridItem } from '../data-grid/data-grid.component';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    songs: Array<DataGridItem> = new Array<DataGridItem>();
    playlists: Array<DataGridItem> = new Array<DataGridItem>();
    albums: Array<DataGridItem> = new Array<DataGridItem>();

    constructor(private _arweaveGrapqlService: ArweaveGraphqlService) {}

    ngOnInit(): void {
        // get albums
        this._arweaveGrapqlService
            .queryByTags([
                { name: 'Data-Type', values: ['album'] }
            ])
            .subscribe((rs) => {
                var edges: any[] = rs.data.transactions.edges;
                edges.forEach((edge) => {
                    var dataGridItem = this._arweaveGrapqlService.bindNodeToDataGridItem(edge.node);
                    this.albums.push(dataGridItem);
                });
            });

        // get songs
        this._arweaveGrapqlService
            .queryByTags([
                { name: 'Data-Type', values: ['song'] }
            ])
            .subscribe((rs) => {
                var edges: any[] = rs.data.transactions.edges;
                edges.forEach((edge) => {
                    var dataGridItem = this._arweaveGrapqlService.bindNodeToDataGridItem(edge.node);
                    this.songs.push(dataGridItem);
                });
            });
    }
}
