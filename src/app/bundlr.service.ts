import { Injectable } from '@angular/core';
import { providers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';
import { WebBundlr } from '@bundlr-network/client';
import BigNumber from 'bignumber.js';
import { FundData } from '@bundlr-network/client/build/common/types';

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
        if (!(window as any)?.ethereum?.isMetaMask) return null;
        await (window as any).ethereum.enable();
        return await connectWeb3((window as any).ethereum);
    }
};

@Injectable({
    providedIn: 'root'
})
export class BundlrService {
    providerName: string = 'MetaMask';
    currencyName: string = 'matic';
    bundlerHttpAddress: string = 'https://node1.bundlr.network';

    private bundlr: WebBundlr = null;

    constructor() {
        //this.bundlr = new WebBundlr('http://node1.bundlr.network', 'MATIC', '74080a50c0b6bc436a1eae32b2214bd9df2b4877ad365901f277cd7ac97edd2b');
    }

    initBundlr = async (): Promise<boolean> => {
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
        const price = await this.bundlr.getPrice(bytes);
        return this.toDecimal(price);
    }

    async fund(amount: BigNumber): Promise<FundData> {
        return await this.bundlr.fund(amount);
    }

    async upload(
        data: Buffer,
        tags?: {
            name: string;
            value: string;
        }[]
    ) {
        // const price: any = await this.bundlr.getPrice(data.length);
        // // Get your current balance
        // const balance: any = await this.bundlr.getLoadedBalance();

        // // If you don't have enough balance for the upload
        // if (price > balance) {
        //     // Fund your account with the difference
        //     // We multiply by 1.1 to make sure we don't run out of funds
        //     await this.bundlr.fund((price - balance) * 1.1);
        // }

        return await this.bundlr.uploader.upload(data, tags);
    }

    // atomic units -> decimal
    toDecimal(atomicUnits: BigNumber): number {
        //return this.bundlr.utils.unitConverter(atomicUnits).toFixed(7, 2).toString();
        return this.bundlr.utils.unitConverter(atomicUnits).toNumber();
    }

    // decimal -> atomic units
    toAtomicUnits = (decimalValue: string | number) => {
        const conv = new BigNumber(decimalValue).multipliedBy(this.bundlr.currencyConfig.base[1]);
        if (conv.isLessThan(1)) {
            return 0;
        }
        return conv;
    };
}
