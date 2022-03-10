import { Component } from '@angular/core';
import { AudioService, StreamState } from '../services/audio.service';

@Component({
    selector: 'app-player',
    templateUrl: './player.component.html',
    styleUrls: ['./player.component.scss']
})
export class PlayerComponent {
    files: Array<any> = [];
    state: StreamState;
    currentFile: any = {};

    constructor(private audioService: AudioService) {
        // listen to stream state
        this.audioService.getState().subscribe((state) => {
            this.state = state;
            // if (this.state.play) {
            //   console.log('state', state);
            // }
        });
    }

    pause() {
        this.audioService.pause();
    }

    play() {
        this.audioService.play();
    }

    stop() {
        this.audioService.stop();
    }

    next() {
        this.audioService.next();
    }

    previous() {
        this.audioService.previous();
    }

    // isFirstPlaying() {
    //   return this.currentFile.index === 0;
    // }

    // isLastPlaying() {
    //   return this.currentFile.index === this.files.length - 1;
    // }

    onMediaSeed(change: any) {
        this.audioService.seekTo(change.value);
    }

    onVolumnChanged(change: any) {
        this.audioService.setVolumn(change.value / 100);
    }
}
