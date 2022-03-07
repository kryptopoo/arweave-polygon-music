import { Component, OnInit } from '@angular/core';
import { BundlrService } from '../bundlr.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
    selector: 'app-wallet',
    templateUrl: './wallet.component.html',
    styleUrls: ['./wallet.component.scss']
})
export class WalletComponent implements OnInit {
    address: string = null;
    balance: string = '0.00';

    constructor(private _bundlrService: BundlrService, private _snackBar: MatSnackBar) {}

    async ngOnInit(): Promise<void> {
        await this.loadWalletInfo();
    }

    shortAddress(address: string) {
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
    }

    async connect() {
        const isConnected = await this._bundlrService.initBundlr();

        if (isConnected) {
            await this.loadWalletInfo();

            this._snackBar.open('Connected successful', '', {
                duration: 3000,
                panelClass: ['snackbar-success']
            });
        }
    }

    disconnect() {}

    async loadWalletInfo() {
        if (this._bundlrService.isConnected()) {
            this.address = this._bundlrService.getAddress();
            this.address = this.shortAddress(this.address);
            this.balance = (await this._bundlrService.getBalance()).toFixed(6);
        }
    }
}
