import * as PIXI from 'pixi.js';

export default class FPSCounter extends PIXI.Container {
  constructor() {
    super();

    this.fps = 0;
    this.ping = 0;

    this.timeValues = [];
    this.lastTime = Date.now();

    this.counterText = new PIXI.Text(`FPS: 0\nPING: 0`, {
      fill: 0xff0000,
      fontSize: 24,
      align: 'right'
    });
    this.addChild(this.counterText);

    this.ticker = new PIXI.Ticker();
    this.ticker.add(this.measureFps.bind(this));
    this.ticker.start();
  }

  measureFps() {
    const currentTime = Date.now();

    this.timeValues.push(1000 / (currentTime - this.lastTime));

    if (this.timeValues.length === 30) {
      let total = 0;

      for (let i = 0; i < 30; i++) {
        total += this.timeValues[i];
      }

      this.fps = (total / 30).toFixed(2);
      this.updateText();

      this.timeValues.length = 0;
    }

    this.lastTime = currentTime;
  }

  updateText() {
    this.counterText.text = `FPS: ${this.fps}\nPING: ${this.ping}`;
  }
}
