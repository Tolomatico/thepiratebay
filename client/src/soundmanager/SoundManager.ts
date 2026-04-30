import { Howl } from 'howler';

export class SoundManager {
  private shootSound: Howl;
  //private explosionSound: Howl;
 // private music: Howl;

  constructor() {
    this.shootSound = new Howl({ src: ['/sounds/shoot.mp3'], volume: 0.15 });
    // this.explosionSound = new Howl({ src: ['/sounds/explosion.mp3'] });
    // this.music = new Howl({ 
    //   src: ['/sounds/music.wav'],
    //   loop: true,
    //   volume: 0.1
    // });
  }

  playShootSound() {
    this.shootSound.play();
  }
  //todo
  // playExplosionSound() {
  //   this.explosionSound.play();
  // }

  // playMusic() {
  //   this.music.play();
  // }
}