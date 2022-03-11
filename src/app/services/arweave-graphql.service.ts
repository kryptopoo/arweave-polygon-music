import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DataGridItem } from './../data-grid/data-grid.component';
import { environment } from '../../environments/environment';

export interface ArweaveGraphqlTag {
    name: string;
    values: string[];
}

@Injectable({
    providedIn: 'root'
})
export class ArweaveGraphqlService {
    url: string = 'https://arweave.net/graphql';

    constructor(private http: HttpClient) {}

    queryByTags(tags: ArweaveGraphqlTag[], owner: string = ''): Observable<any> {
        {
            tags.push({ name: 'App-Name', values: [environment.appName] });
            tags.push({ name: 'App-Version', values: [environment.appVersion] });

            let tagsJson = '';
            tagsJson += '[';
            for (let i = 0; i < tags.length; i++) {
                let tag = tags[i];
                tagsJson += `{name: \"${tag.name}\", values: [\"${tag.values.join('')}\"]}` + (i < tags.length - 1 ? ',' : '');
            }
            tagsJson += ']';

            let ownerQuery = '';
            if (owner != '') ownerQuery = `, owners: ["${owner}"]`;

            let query = `
            {
              transactions(tags: ${tagsJson} ${ownerQuery}) {
                edges {
                  node {
                    id
                    tags {
                      name
                      value
                    }
                    owner {
                      address
                    }
                  }
                }
              }
            }
            `;

            let body: any = { operationName: null, variables: {}, query: query };
            return this.http.post(this.url, body);
        }
    }

    queryByIds(ids: string[]): Observable<any> {
        {
            let idsJson = '';
            idsJson += '[';
            for (let i = 0; i < ids.length; i++) {
                idsJson += `\"${ids[i]}\"` + (i < ids.length - 1 ? ',' : '');
            }
            idsJson += ']';

            let query = `
            {
              transactions(ids: ${idsJson}) {
                edges {
                    node {
                        id
                        tags {
                          name
                          value
                        }
                        owner {
                          address
                        }
                    }
                }
              }
            }
            `;

            let body: any = { operationName: null, variables: {}, query: query };
            return this.http.post(this.url, body);
        }
    }

    bindNodeToDataGridItem(node: any): DataGridItem {
        var tags = {};
        node.tags.forEach((tag: any) => {
            tags[tag.name] = tag.value;
        });

        var gridItem: DataGridItem = {
            id: node.id,
            name: tags['Title'] || tags['Name'],
            description: tags['Artist'] || tags['Description'],
            thumbnail: `https://arweave.net/${tags['Thumbnail']}`,
            url: `https://arweave.net/${node.id}`,
            type: tags['Data-Type'],
            duration: tags['Duration'],
            creator: tags['Creator'],
            owner: node.owner.address
        };

        return gridItem;
    }
}
