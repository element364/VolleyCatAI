<script>
  import { onDestroy } from 'svelte';

  import { store, createGame, joinGame } from './store';

  let selectedGameId;

  let s;
  const unsubscribe = store.subscribe(v => {
    // console.log('[*] Games: Store changed', v);
    s = v;
  });

  function handleCreateGame() {
    console.log('Create game');
    createGame();
  }

  function handleSelectGame(e) {
    const { id } = e.target.dataset;
    selectedGameId = id;
  }

  function handleJoinGame() {
    joinGame(selectedGameId);
  }

  onDestroy(unsubscribe);
</script>

<style>
  .game {
    color: gray;
    margin: 5px 0;
    user-select: none;
  }

  .selected {
    background-color: green;
  }
</style>

<h1>Games</h1>

<button on:click={handleCreateGame}>Create</button>

{#each s.games as game}
  <div
    data-id={game.id}
    class="game"
    class:selected={game.id === selectedGameId}
    on:click={handleSelectGame}
    on:dblclick={handleJoinGame}>
    {game.players[0]}
  </div>
{/each}

<button disabled={!selectedGameId} on:click={handleJoinGame}>Join</button>
