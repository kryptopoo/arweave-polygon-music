import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BundlrService } from '../services/bundlr.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';

@Component({
    selector: 'app-wallet',
    templateUrl: './wallet.component.html',
    styleUrls: ['./wallet.component.scss']
})
export class WalletComponent implements OnInit {
    @ViewChild('walletDialogRef') walletDialogRef: TemplateRef<any>;
    @ViewChild('connectDialogRef') connectDialogRef: TemplateRef<any>;

    bunlderAddress: string = null;
    address: string = null;
    shortAddress: string = null;
    balance: number = 0;
    amount: number = 0;
    loading = {
        fund: false,
        withdraw: false
    };

    constructor(private _bundlrService: BundlrService, private _snackBar: MatSnackBar, private _dialog: MatDialog) {}

    async ngOnInit(): Promise<void> {
        await this.loadWalletInfo();
    }

    async connect(bunlderAddress: string) {
        const isConnected = await this._bundlrService.connect(bunlderAddress);

        if (isConnected) {
            await this.loadWalletInfo();
            this._snackBar.open(`Wallet has been connected`, null, { duration: 3000, panelClass: ['snackbar-success'] });
        }

        this._bundlrService.connection$.next(isConnected);
    }

    async disconnect() {
        await this._bundlrService.disconnect();
    }

    async loadWalletInfo() {
        if (this._bundlrService.isConnected()) {
            this.address = this._bundlrService.getAddress();
            this.shortAddress = `${this.address.substring(0, 6)}...${this.address.substring(this.address.length - 4)}`;
            this.bunlderAddress = this._bundlrService.bundlerHttpAddress;
            this.balance = await this._bundlrService.getBalance();
        }
    }

    openWalletDialog() {
        this._dialog.open(this.walletDialogRef);
    }

    openConnectDialog() {
        this._dialog.open(this.connectDialogRef);
    }

    async fund() {
        this.loading.fund = true;
        const units = this._bundlrService.toAtomicUnits(this.amount);
        const fundRs: any = await this._bundlrService.fund(units);
        console.log('fund', fundRs);

        this.loading.fund = false;
        this._snackBar.open(`Your wallet has been funded successfully`, null, { duration: 3000, panelClass: ['snackbar-success'] });
        // this._snackBar.open(`Transaction ${fundRs.id} has been submitted`, null, { duration: 3000, panelClass: ['snackbar-success'] });
        this.loadWalletInfo();
    }

    async withdraw() {
        this.loading.withdraw = true;
        const units = this._bundlrService.toAtomicUnits(this.amount);
        const withdrawRs: any = await this._bundlrService.withdrawBalance(units);
        console.log('withdraw', withdrawRs);

        this.loading.withdraw = false;
        this._snackBar.open(`Your wallet has been withdrawn successfully`, null, { duration: 3000, panelClass: ['snackbar-success'] });
        // this._snackBar.open(`Transaction ${withdrawRs.data.tx_id} has been submitted`, null, { duration: 3000, panelClass: ['snackbar-success'] });
        this.loadWalletInfo();
    }
}
