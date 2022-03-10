import { Injectable } from '@angular/core';
import { providers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { WebBundlr } from '@bundlr-network/client';
import BigNumber from 'bignumber.js';
import { FundData } from '@bundlr-network/client/build/common/types';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';

const connectWeb3 = async (connector: any) => {
    // if (provider) {
    //   await clean();
    // }
    const p = new providers.Web3Provider(connector);
    await p._ready();
    return p;
};

const currencyMap = {
    // "matic": {
    //   providers: ["MetaMask"],
    // },
    matic: {
        providers: ['MetaMask'],
        opts: {
            chainId: 137,
            chainName: 'Polygon Mainnet',
            rpcUrls: ['https://polygon-rpc.com']
        }
    }
};

const providerMap = {
    MetaMask: async (c: any) => {
        try {
            if (!(window as any)?.ethereum?.isMetaMask) return null;
            await (window as any).ethereum.enable();
        } catch (e) {
            alert('Make sure that Metamask is installed/unlocked and ready to use');
        }
        return await connectWeb3((window as any).ethereum);
    }
};

@Injectable({
    providedIn: 'root'
})
export class BundlrService {
    providerName: string = 'MetaMask';
    currencyName: string = 'matic';
    bundlerHttpAddress: string = 'https://node2.bundlr.network';

    private bundlr: WebBundlr = null;
    connection$: Subject<boolean> = new Subject<boolean>();

    constructor() {}

    connect = async (bundlerAddress: string): Promise<boolean> => {
        this.bundlerHttpAddress = `https://${bundlerAddress}`;
        const providerFunc = providerMap[this.providerName]; // get provider entry
        const currency = currencyMap[this.currencyName]; // get currency entry
        const provider = await providerFunc(currency); //

        this.bundlr = new WebBundlr(this.bundlerHttpAddress, this.currencyName, provider);
        try {
            // Check for valid bundlr node
            var bundlrAddress = await this.bundlr.utils.getBundlerAddress(this.currencyName);
            console.log('bundlrAddress', bundlrAddress);
        } catch {
            console.log('err', `Failed to connect to bundlr`);
            return false;
        }

        try {
            await this.bundlr.ready();
        } catch (err) {
            console.log(err);
            return false;
        }

        if (!this.bundlr.address) {
            console.log('something went wrong');
            return false;
        }

        return true;
    };

    async disconnect() {
        await (window as any).ethereum.request({
            method: 'eth_requestAccounts',
            params: [{ eth_accounts: {} }]
        });
        this.bundlr = null;
        location.reload();
    }

    isConnected() {
        return this.bundlr != null;
    }

    getAddress(): string {
        return this.bundlr.address;
    }

    async getBalance(): Promise<number> {
        const balance = await this.bundlr.getLoadedBalance();
        return this.toDecimal(balance);
    }

    async getPrice(bytes: number): Promise<number> {
        try {
            const price = await this.bundlr.getPrice(bytes);
            return this.toDecimal(price);
        } catch {
            return 0;
        }
    }

    async fund(amount: BigNumber): Promise<FundData> {
        return await this.bundlr.fund(amount);
    }

    async withdrawBalance(amount: BigNumber): Promise<any> {
        return await this.bundlr.withdrawBalance(amount);
    }

    async upload(
        data: Buffer,
        tags?: {
            name: string;
            value: string;
        }[]
    ) {
        tags.push({ name: 'App-Name', value: environment.appName });
        tags.push({ name: 'App-Version', value: environment.appVersion });
        tags.push({ name: 'Unix-Time', value: Math.round(Date.now() / 1000).toString() });
        tags.push({ name: 'Creator', value: this.getAddress() });

        const price = (await this.getPrice(data.length)).toFixed(6);

        return await this.bundlr.uploader.upload(data, tags);
    }

    // atomic units -> decimal
    toDecimal(atomicUnits: BigNumber): number {
        //return this.bundlr.utils.unitConverter(atomicUnits).toFixed(7, 2).toString();
        return this.bundlr.utils.unitConverter(atomicUnits).toNumber();
    }

    // decimal -> atomic units
    toAtomicUnits = (decimalValue: string | number): BigNumber => {
        const conv = new BigNumber(decimalValue).multipliedBy(this.bundlr.currencyConfig.base[1]);
        // if (conv.isLessThan(1)) {
        //     return new BigNumber(0);
        // }
        return conv;
    };
}
