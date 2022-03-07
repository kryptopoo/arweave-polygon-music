// import { Component, OnInit } from '@angular/core';

// @Component({
//   selector: 'app-player',
//   templateUrl: './player.component.html',
//   styleUrls: ['./player.component.scss']
// })
// export class PlayerComponent implements OnInit {

//   constructor() { }

//   ngOnInit(): void {
//   }

// }

import { Component } from '@angular/core';
import { AudioService, StreamState } from '../audio.service';

@Component({
  selector: 'app-player',
  templateUrl: './player.component.html',
  styleUrls: ['./player.component.scss'],
})
export class PlayerComponent {
  files: Array<any> = [];
  state: StreamState;
  currentFile: any = {};

  constructor(private audioService: AudioService) {
    // // get media files
    // cloudService.getFiles().subscribe((files) => {
    //   this.files = files;
    // });

    // this.files = [
    //   {
    //     title: 'Buoc qua nhau',
    //     artist: 'Vu',
    //     thumb:
    //       'https://i.scdn.co/image/ab67616d00001e024eca4595da187b3a25eb9958',
    //     media:
    //       'https://aredir.nixcdn.com/NhacCuaTui1024/BuocQuaNhau-Vu-7120388_hq.mp3?st=5xIHVhJ04c-Q5CZr-cNpMw&amp;e=1646116047',
    //   }
    // ]

    // listen to stream state
    this.audioService.getState().subscribe((state) => {
      this.state = state;
      // if (this.state.play) {
      //   console.log('state', state);
      // }
    });
  }

  // playStream(url: string) {
  //   this.audioService.playStream(url).subscribe((events) => {
  //     // listening for fun here
  //     console.log(events)
  //   });
  // }

  // openFile(file: any, index: number) {
  //   this.currentFile = { index, file };
  //   this.audioService.stop();
  //   this.playStream(file.media);
  // }



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

  onVolumnChanged(change: any){
    this.audioService.setVolumn(change.value / 100);
  }
}
