import { writable } from 'svelte/store';

let input = {
  left: 0,
  right: 0,
  up: 0
};

const store = writable({
  scene: 'login',
  name: '',
  game: {},
  games: [],
  latency: 0
});

const ws = new WebSocket(`ws://${location.host}`);

let startTime;
let pingInterval;

ws.onopen = function() {
  pingInterval = setInterval(() => {
    startTime = Date.now();
    ws.send('pingcheck');
  }, 2000);
};

ws.onmessage = function(message) {
  if (message.data === 'pongcheck') {
    const latency = Date.now() - startTime;
    return store.update(v => ({ ...v, latency }));
  }

  const action = JSON.parse(message.data);
  switch (action.type) {
    case 'update':
      store.update(v => ({
        ...v,
        ...action.payload,
        ...(action.payload.scene === 'games' && { game: {} })
      }));
  }
};

ws.onclose = function(...args) {
  clearInterval(pingInterval);
  console.log('Socket closed', args);
};

function setName(name) {
  ws.send(
    JSON.stringify({
      type: 'set_name',
      payload: name
    })
  );
}

function createGame() {
  ws.send(
    JSON.stringify({
      type: 'create_game'
    })
  );
}

function joinGame(gameId) {
  ws.send(
    JSON.stringify({
      type: 'join_game',
      payload: gameId
    })
  );
}

function updateInput(diff) {
  const nextInput = {
    ...input,
    ...diff
  };

  if (JSON.stringify(nextInput) !== JSON.stringify(input)) {
    input = nextInput;
    ws.send(
      JSON.stringify({
        type: 'input',
        payload: input
      })
    );
  }
}

function viewGames() {
  ws.send(
    JSON.stringify({
      type: 'view_games'
    })
  );
}

export { store, setName, createGame, joinGame, updateInput, viewGames };
