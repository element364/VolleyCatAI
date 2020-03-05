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
  latency: 0,
  input
});

const ws = new WebSocket(`ws://${location.host}`);

let startTime;
let pingInterval;

ws.onopen = function(...args) {
  setInterval(() => {
    startTime = Date.now();
    ws.send('latency-ping');
  }, 2000);
};

ws.onmessage = function(message) {
  if (message.data === 'latency-pong') {
    const latency = Date.now() - startTime;
    return store.update(v => ({ ...v, latency }));
  }

  const action = JSON.parse(message.data);
  // console.log('[+] Received', action);
  switch (action.type) {
    case 'update':
      store.update(v => ({ ...v, ...action.payload }));
  }
  // visualizer.render(state);
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
    store.update(v => ({ ...v, input }));
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
