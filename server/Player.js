const nanoid = require('nanoid');

module.exports = class Player {
  constructor(ws) {
    this.id = nanoid();
    this.name = '';
    this.scene = '';
    this.ws = ws;
  }

  update(values) {
    for (const [key, value] of Object.entries(values)) {
      if (this.hasOwnProperty(key) && key !== 'game') {
        this[key] = value;
      }
    }

    this.ws.send(
      JSON.stringify({
        type: 'update',
        payload: values
      })
    );
  }

  join(game) {
    game.players.push(this);
    this.game = game;
    this.update({ scene: 'game' });
  }

  disconnectFromGame(game) {
    for (player of game.players) {
      if (player.id !== this.id) {
        player.disconnectFromGame();
      }
    }

    if (game.interval) {
      clearInterval(game.interval);
    }
  }
};
