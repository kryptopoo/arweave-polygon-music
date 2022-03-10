import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import * as moment from 'moment';

export interface StreamInfo {
    index: number;
    songs: SongInfo[];
}

export interface SongInfo {
    title: string;
    artist: string;
    thumbnail: string;
    url: string;
}

export interface StreamState {
    play: boolean;
    playing: boolean;
    readableCurrentTime: string;
    readableDuration: string;
    duration: number | undefined;
    currentTime: number | undefined;
    canplay: boolean;
    error: boolean;
    streamInfo: StreamInfo | null;
}

@Injectable({
    providedIn: 'root'
})
export class AudioService {
    private stop$ = new Subject();
    private audioObj = new Audio();
    audioEvents = ['ended', 'error', 'play', 'playing', 'pause', 'timeupdate', 'canplay', 'loadedmetadata', 'loadstart'];
    private state: StreamState = {
        play: false,
        playing: false,
        readableCurrentTime: '',
        readableDuration: '',
        duration: undefined,
        currentTime: undefined,
        canplay: false,
        error: false,
        streamInfo: null
    };

    private streamObservable(url: any) {
        return new Observable((observer) => {
            // Play audio
            this.audioObj.src = url;
            this.audioObj.load();
            this.audioObj.play();

            const handler = (event: Event) => {
                this.updateStateEvents(event);
                observer.next(event);
            };

            this.addEvents(this.audioObj, this.audioEvents, handler);
            return () => {
                // Stop Playing
                this.audioObj.pause();
                this.audioObj.currentTime = 0;
                // remove event listeners
                this.removeEvents(this.audioObj, this.audioEvents, handler);
                // reset state
                this.resetState();
            };
        });
    }

    private addEvents(obj: any, events: Array<any>, handler: any) {
        events.forEach((event) => {
            obj.addEventListener(event, handler);
        });
    }

    private removeEvents(obj: any, events: Array<any>, handler: any) {
        events.forEach((event) => {
            obj.removeEventListener(event, handler);
        });
    }

    playStream(streamInfo: StreamInfo) {
        this.state.streamInfo = streamInfo;
        console.log('playStream', streamInfo.songs[streamInfo.index]);
        return this.streamObservable(streamInfo.songs[streamInfo.index].url).pipe(takeUntil(this.stop$));
    }

    play() {
        this.audioObj.play();
    }

    pause() {
        this.audioObj.pause();
    }

    stop() {
        this.stop$.next();
    }

    seekTo(seconds: any) {
        this.audioObj.currentTime = seconds;
    }

    setVolumn(volumn: number) {
        this.audioObj.volume = volumn;
    }

    next() {
        let maxIndex = this.state.streamInfo.songs.length - 1;
        let newIndex = maxIndex > this.state.streamInfo.index ? this.state.streamInfo.index + 1 : maxIndex;
        let streamInfo: StreamInfo = { index: newIndex, songs: this.state.streamInfo.songs };
        this.stop();
        this.playStream(streamInfo).subscribe((events) => {});
    }

    previous() {
        let minIndex = 0;
        let newIndex = minIndex < this.state.streamInfo.index ? this.state.streamInfo.index - 1 : minIndex;
        let streamInfo: StreamInfo = { index: newIndex, songs: this.state.streamInfo.songs };
        this.stop();
        this.playStream(streamInfo).subscribe((events) => {});
    }

    formatTime(time: number, format: string = 'HH:mm:ss') {
        const momentTime = time * 1000;
        return moment.utc(momentTime).format(format);
    }

    private stateChange: BehaviorSubject<StreamState> = new BehaviorSubject(this.state);

    private updateStateEvents(event: Event): void {
        switch (event.type) {
            case 'canplay':
                this.state.duration = this.audioObj.duration;
                this.state.readableDuration = this.formatTime(this.state.duration);
                this.state.canplay = true;
                break;
            case 'play':
                this.state.play = true;
                break;
            case 'playing':
                this.state.playing = true;
                break;
            case 'pause':
                this.state.playing = false;
                break;
            case 'timeupdate':
                this.state.currentTime = this.audioObj.currentTime;
                this.state.readableCurrentTime = this.formatTime(this.state.currentTime);
                break;
            case 'error':
                this.resetState();
                this.state.error = true;
                break;
        }
        this.stateChange.next(this.state);
    }

    private resetState() {
        this.state = {
            play: false,
            playing: false,
            readableCurrentTime: '',
            readableDuration: '',
            duration: undefined,
            currentTime: undefined,
            canplay: false,
            error: false,
            streamInfo: null
        };
    }

    getState(): Observable<StreamState> {
        return this.stateChange.asObservable();
    }
}
