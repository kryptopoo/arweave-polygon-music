import { Injectable } from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';

export function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export function secondsToTime(val: any) {
    var secs = val;
    if (typeof val === 'string' || val instanceof String) secs = parseFloat(val.toString());

    return moment.utc(secs * 1000).format('HH:mm:ss');
}

export function timeToFromNow(val: any) {
    return moment(val).fromNow(true);
}

export function generateId() {
    return uuidv4();
}

export interface SelectInputFile {
    file: File;
    src: string | ArrayBuffer;
}

@Injectable({
    providedIn: 'root'
})
export class FileHelper {
    constructor() {}

    readFileAsBuffer(file: File, callback: any) {
        const reader = new FileReader();
        reader.onload = function () {
            if (reader.result) {
                const buffer = Buffer.from(reader.result as ArrayBuffer);
                callback(buffer);
            } else {
                callback(null);
            }
        };
        reader.readAsArrayBuffer(file);
    }

    readFileAsDataURL(blob, callback) {
        const reader = new FileReader();
        reader.onload = async (e) => {
            callback(e.target.result);
        };
        reader.readAsDataURL(blob);
    }

    onFileChanged(event: Event, selectedFile: SelectInputFile) {
        const target = event.target as HTMLInputElement;
        const file: File = (target.files as FileList)[0];
        selectedFile.file = file;

        // preview image
        const reader = new FileReader();
        reader.onload = () => {
            selectedFile.src = reader.result as string;
        };
        reader.readAsDataURL(file);
    }
}
