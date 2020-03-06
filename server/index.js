const path = require('path');
const { createServer } = require('http');

const express = require('express');
const WebSocket = require('ws');

const Player = require('./Player');
const Game = require('./Game');

const app = express();
app.use(express.static(path.resolve(__dirname, '..', 'dist')));

const server = createServer(app);
const wss = new WebSocket.Server({
  server,
  perMessageDeflate: false
});

const games = {};
const players = {};

wss.on('connection', function(ws) {
  const player = new Player(ws);
  players[player.id] = player;

  console.log(
    `[+] Player connected`,
    Object.values(players).map(({ ws, ...p }) => p)
  );

  ws.on('message', function(message) {
    if (message === 'pingcheck') {
      return ws.send('pongcheck');
    }

    let action = {};
    try {
      action = JSON.parse(message);
    } catch (err) {
      console.error('Wrong message', message);
    }

    console.log(action);

    switch (action.type) {
      case 'set_name':
        player.update({
          name: action.payload,
          scene: 'games',
          games: Object.values(games).map(game => ({
            id: game.id,
            players: game.players.map(player => player.name)
          }))
        });
        break;
      case 'view_games':
        if (player.game) {
          // Player disconnected
          player.game.stop();
          // const gameId = player.game.id;

          // for (p of player.game.players) {
          //   delete p.game;
          //   p.scene = 'games';
          // }

          // if (games[gameId].interval) {
          //   clearInterval(games[gameId].interval);
          // }
          // delete games[gameId];
        }

        player.update({
          scene: 'games',
          games: Object.values(games).map(game => ({
            id: game.id,
            players: game.players.map(player => player.name)
          }))
        });
        break;
      case 'create_game':
        if (player.game) {
          console.log(`Player ${player.id} already in game ${player.game.id}`);
          return;
        }

        console.log(
          `[+] Creating game by ${player.id}`,
          Object.values(players).map(({ name, scene }) => ({ name, scene }))
        );

        const game = new Game(player);
        games[game.id] = game;

        for (const p of Object.values(players)) {
          if (p.scene === 'games') {
            const payload = {
              games: Object.values(games).map(game => ({
                id: game.id,
                players: game.players.map(player => player.name)
              }))
            };

            if (p.id === player.id) {
              payload.scene = 'game';
            }

            p.update(payload);
          }
        }
        break;
      case 'join_game':
        let gameToJoin = games[action.payload];

        if (gameToJoin.players.length < 2) {
          player.join(gameToJoin);
          gameToJoin.start();
        }
        break;
      case 'input':
        if (player.game && player.game.state) {
          player.game.state[
            player.game.players[0].id === player.id
              ? 'leftPlayer'
              : 'rightPlayer'
          ].input = action.payload;
        }
        break;
    }
  });

  ws.on('close', function() {
    delete players[player.id];

    if (player.game) {
      const gameId = player.game.id;

      for (p of player.game.players) {
        delete p.game;
        p.scene = 'games';
      }

      if (games[gameId].interval) {
        clearInterval(games[gameId].interval);
      }
      delete games[gameId];
    }

    for (p of Object.values(players)) {
      if (p.scene === 'games') {
        p.ws.send(
          JSON.stringify({
            type: 'update',
            payload: {
              scene: 'games',
              games: Object.values(games).map(game => ({
                id: game.id,
                players: game.players.map(player => player.name)
              }))
            }
          })
        );
      }
    }

    console.log(
      `[-] Disconnecting ${player.id}`,
      Object.values(players).map(({ ws, ...p }) => p)
    );
  });
});

const port = process.env.PORT || 2345;
server.listen(port, err =>
  err
    ? console.error(err)
    : console.log(`> Running on http://localhost:${port}`)
);
