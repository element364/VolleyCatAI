const path = require('path');
const { createServer } = require('http');

const express = require('express');
const WebSocket = require('ws');
const nanoid = require('nanoid');

const { getInitialState, getNextState } = require('./physics');

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
  const player = {
    id: nanoid(),
    name: '',
    scene: '',
    ws
  };
  players[player.id] = player;

  console.log(
    `[+] Player connected`,
    Object.values(players).map(({ ws, ...p }) => p)
  );

  ws.on('message', function(message) {
    if (message === 'latency-ping') {
      return ws.send('latency-pong');
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
        player.name = action.payload;
        player.scene = 'games';
        console.log(
          `[*] Setting player ${player.id} name to ${action.payload}`,
          Object.values(players).map(({ ws, ...p }) => p)
        );
        const payload = {
          name: player.name,
          scene: 'games',
          games: Object.values(games).map(game => ({
            ...game,
            players: game.players.map(player => player.name)
          }))
        };
        console.log(payload);
        ws.send(
          JSON.stringify({
            type: 'update',
            payload
          })
        );
        break;
      case 'view_games':
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
                    ...game,
                    players: game.players.map(player => player.name)
                  }))
                }
              })
            );
          }
        }
        break;
      case 'create_game':
        const playerGame = Object.values(games).find(game =>
          game.players.find(p => p.id === player.id)
        );
        if (playerGame) {
          console.log(`Player ${player.id} already in game ${playerGame.id}`);
          return;
        }

        console.log(
          `[+] Creating game by ${player.id}`,
          Object.values(players).map(({ name, scene }) => ({ name, scene }))
        );

        const game = {
          id: nanoid(),
          ...getInitialState(),
          players: [player]
        };
        player.game = game;

        games[game.id] = game;
        for (const p of Object.values(players)) {
          if (p.scene === 'games') {
            const payload = {
              games: Object.values(games).map(game => ({
                ...game,
                players: game.players.map(player => player.name)
              }))
            };

            if (p.id === player.id) {
              player.scene = 'game';
              payload.scene = 'game';
            }

            p.ws.send(
              JSON.stringify({
                type: 'update',
                payload
              })
            );
          }
        }
        break;
      case 'join_game':
        let gameToJoin = games[action.payload];

        if (gameToJoin.players.length < 2) {
          gameToJoin.players.push(player);

          players.scene = 'game';
          player.game = gameToJoin;

          player.ws.send(
            JSON.stringify({
              type: 'update',
              payload: {
                scene: 'game'
              }
            })
          );

          gameToJoin.interval = setInterval(() => {
            const nextState = getNextState(gameToJoin, gameToJoin.input);
            if (true || JSON.stringify(nextState) !== JSON.stringify(game)) {
              gameToJoin = nextState;
              for (const p of gameToJoin.players) {
                p.ws.send(
                  JSON.stringify({
                    type: 'update',
                    payload: {
                      game: {
                        ...gameToJoin,
                        players: gameToJoin.players.map(p => p.name),
                        interval: undefined
                      }
                    }
                  })
                );
              }
            }
          }, 1000 / 60);
        }
        break;
      case 'input':
        if (player.game) {
          player.game.input[
            player.game.players[0].id === player.id
              ? 'leftPlayer'
              : 'rightPlayer'
          ] = action.payload;
        }
        break;
    }
  });

  ws.on('close', function() {
    delete players[player.id];
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
