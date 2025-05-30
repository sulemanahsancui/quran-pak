import { EventEmitter } from "events";
import playSound from "play-sound";
const player = playSound();

export class MediaPlayer extends EventEmitter {
  private audioProcess: any = null;

  play(url: string) {
    console.log("MediaPlayer: play called with", url);
    this.stop();
    try {
      // Use player.play directly
      this.audioProcess = player.play(url, (err: any) => {
        if (err) {
          console.error("MediaPlayer: play error", err);
          // Do not emit an unhandled error, just log it
          // this.emit("error", err);
        }
        this.emit("ended");
      });
      this.emit("play");
    } catch (error) {
      console.error("MediaPlayer: play exception", error);
    }
  }

  pause() {
    console.log("MediaPlayer: pause called");
    // Not supported by play-sound, you may need a more advanced library for pause/resume
    this.stop();
    this.emit("pause");
  }

  resume() {
    console.log("MediaPlayer: resume called");
    // Not supported by play-sound
  }

  stop() {
    console.log("MediaPlayer: stop called");
    if (this.audioProcess) {
      this.audioProcess.kill();
      this.audioProcess = null;
      this.emit("pause");
    }
  }

  setVolume(volume: number) {
    console.log("MediaPlayer: setVolume called with", volume);
    // Not supported by play-sound
  }

  setPlaybackRate(rate: number) {
    console.log("MediaPlayer: setPlaybackRate called with", rate);
    // Not supported by play-sound
  }
}
