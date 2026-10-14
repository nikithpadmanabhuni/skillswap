import type { Book } from '$shared/types';

class AudiobookPlayerState {
  currentBook = $state<Book | null>(null);
  isPlaying = $state<boolean>(false);
  progressSeconds = $state<number>(142); // 2m 22s initial
  totalSeconds = $derived<number>((this.currentBook?.audioDurationMinutes ?? 60) * 60);
  playbackSpeed = $state<number>(1.0);
  isMinimized = $state<boolean>(false);
  private timer: ReturnType<typeof setInterval> | null = null;

  play(book: Book) {
    this.currentBook = book;
    this.isPlaying = true;
    this.isMinimized = false;
    this.startTimer();
  }

  pause() {
    this.isPlaying = false;
    this.stopTimer();
  }

  resume() {
    if (this.currentBook) {
      this.isPlaying = true;
      this.startTimer();
    }
  }

  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.resume();
    }
  }

  seek(seconds: number) {
    this.progressSeconds = Math.max(0, Math.min(seconds, this.totalSeconds));
  }

  skip(deltaSeconds: number) {
    this.seek(this.progressSeconds + deltaSeconds);
  }

  setSpeed(speed: number) {
    this.playbackSpeed = speed;
  }

  cycleSpeed() {
    const speeds = [1.0, 1.25, 1.5, 2.0];
    const nextIdx = (speeds.indexOf(this.playbackSpeed) + 1) % speeds.length;
    this.playbackSpeed = speeds[nextIdx];
  }

  close() {
    this.pause();
    this.currentBook = null;
  }

  private startTimer() {
    this.stopTimer();
    this.timer = setInterval(() => {
      if (this.isPlaying && this.currentBook) {
        if (this.progressSeconds >= this.totalSeconds) {
          this.pause();
        } else {
          this.progressSeconds += 1;
        }
      }
    }, 1000 / this.playbackSpeed);
  }

  private stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }
}

export const audiobook = new AudiobookPlayerState();
