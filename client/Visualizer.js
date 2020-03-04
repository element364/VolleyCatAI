import * as PIXI from 'pixi.js';

import {
  HEIGHT,
  BALL_RADIUS,
  NET_POSITION_X,
  NET_RADIUS,
  NET_SPHERE_POSITION,
  BLOBBY_UPPER_SPHERE,
  BLOBBY_UPPER_RADIUS,
  BLOBBY_LOWER_SPHERE,
  BLOBBY_LOWER_RADIUS
} from './constants';

export default class Visualzer {
  constructor(dom, { WIDTH, HEIGHT }) {
    this.app = new PIXI.Application({
      width: WIDTH,
      height: HEIGHT,
      antialias: true,
      autoResize: true
    });
    this.app.renderer.backgroundColor = 0xaaaaaa;
    this.app.view.style.width = '600px';
    this.app.view.style.height = '400px';
    this.graphics = new PIXI.Graphics();

    this.text = new PIXI.Text('Score: 0 : 0\nHit count: 0 : 0', {
      fill: 0x000000,
      align: 'center'
    });
    this.app.stage.addChild(this.text);

    this.app.stage.addChild(this.graphics);

    while (dom.firstChild) {
      dom.removeChild(dom.firstChild);
    }
    dom.appendChild(this.app.view);
  }

  render(state) {
    if (!state.leftPlayer || !state.rightPlayer) {
      return;
    }

    console.log(`[+] Rendering ${state.id}`);

    this.graphics.clear();

    this.text.text = `Score ${state.leftPlayer.score} : ${state.rightPlayer.score}\nHit count: ${state.leftPlayer.hitCount} : ${state.rightPlayer.hitCount}`;

    // Blue blobby
    this.graphics.beginFill(0x0000ff);
    this.graphics.drawCircle(
      state.leftPlayer.x,
      state.leftPlayer.y - BLOBBY_UPPER_SPHERE,
      BLOBBY_UPPER_RADIUS
    );
    this.graphics.drawCircle(
      state.leftPlayer.x,
      state.leftPlayer.y + BLOBBY_LOWER_SPHERE,
      BLOBBY_LOWER_RADIUS
    );

    this.graphics.lineStyle(1, 0xffffff);
    this.graphics.moveTo(state.leftPlayer.x, state.leftPlayer.y);
    this.graphics.lineTo(
      state.leftPlayer.x + state.leftPlayer.vX,
      state.leftPlayer.y + state.leftPlayer.vY
    );
    this.graphics.lineStyle(0, 0);

    // Red blobby
    this.graphics.beginFill(0xff0000);
    this.graphics.drawCircle(
      state.rightPlayer.x,
      state.rightPlayer.y - BLOBBY_UPPER_SPHERE,
      BLOBBY_UPPER_RADIUS
    );
    this.graphics.drawCircle(
      state.rightPlayer.x,
      state.rightPlayer.y + BLOBBY_LOWER_SPHERE,
      BLOBBY_LOWER_RADIUS
    );

    this.graphics.lineStyle(1, 0xffffff);
    this.graphics.moveTo(state.rightPlayer.x, state.rightPlayer.y);
    this.graphics.lineTo(
      state.rightPlayer.x + state.rightPlayer.vX,
      state.rightPlayer.y + state.rightPlayer.vY
    );
    this.graphics.lineStyle(0, 0);

    this.graphics.beginFill(0xffffff);
    this.graphics.drawCircle(state.ball.x, state.ball.y, BALL_RADIUS);

    this.graphics.lineStyle(1, 0x000000);
    this.graphics.moveTo(state.ball.x, state.ball.y);
    this.graphics.lineTo(
      state.ball.x + state.ball.vX,
      state.ball.y + state.ball.vY
    );
    this.graphics.lineStyle(0, 0);

    this.graphics.beginFill(0xdedef0);
    this.graphics.drawCircle(NET_POSITION_X, NET_SPHERE_POSITION, NET_RADIUS);
    this.graphics.drawRect(
      NET_POSITION_X - NET_RADIUS,
      NET_SPHERE_POSITION,
      2 * NET_RADIUS,
      HEIGHT - NET_SPHERE_POSITION
    );

    this.graphics.endFill();
  }
}
