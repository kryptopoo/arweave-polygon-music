import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-top-navigation',
    templateUrl: './top-navigation.component.html',
    styleUrls: ['./top-navigation.component.scss']
})
export class TopNavigationComponent implements OnInit {
    constructor(private _location: Location) {}

    ngOnInit(): void {}

    back(): void {
        this._location.back();
    }

    forward(): void {
        this._location.forward();
    }
}
