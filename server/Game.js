const nanoid = require('nanoid');

const { getInitialState, getNextState } = require('./physics');

module.exports = class Game {
  constructor(player) {
    this.id = nanoid();
    this.state = getInitialState();

    this.players = [player];
    player.game = this;

    this.nextTick = this.nextTick.bind(this);
  }

  start() {
    this.interval = setInterval(this.nextTick, 1000 / 60);
  }

  nextTick() {
    const nextState = getNextState(this.state);
    this.state = nextState;

    for (const player of this.players) {
      player.update({ game: this.state });
    }
  }
};
