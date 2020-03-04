<script>
  import { onDestroy } from 'svelte';

  import { store, updateInput, viewGames } from './store';
  import Visualizer from './Visualizer';
  import { WIDTH, HEIGHT } from './constants';

  let container;
  let visualizer;

  let game;
  const unsubscribe = store.subscribe(v => {
    console.log('[*] Game: Store changed', v);
    game = v.game;
    if (visualizer) {
      visualizer.render(game);
    }
  });

  function onKeyDown(event) {
    switch (event.keyCode) {
      case 65:
      case 37:
        updateInput({ left: 1 });
        break;
      case 68:
      case 39:
        updateInput({ right: 1 });
        break;
      case 87:
      case 38:
        updateInput({ up: 1 });
        break;
    }
  }

  function onKeyUp(event) {
    switch (event.keyCode) {
      case 65:
      case 37:
        updateInput({ left: 0 });
        break;
      case 68:
      case 39:
        updateInput({ right: 0 });
        break;
      case 87:
      case 38:
        updateInput({ up: 0 });
        break;
    }
  }

  $: if (container) {
    visualizer = new Visualizer(container, { WIDTH, HEIGHT });

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
  }

  function handleBack() {
    viewGames();
  }

  onDestroy(() => {
    unsubscribe();
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);
  });
</script>

<style>
  .flex {
    display: flex;
  }

  .flex-1 {
    flex: 1;
  }
</style>

<div class="flex">
  <div class="flex-1" bind:this={container} />
  <div class="flex-1">
    <pre>{JSON.stringify(game, null, 2)}</pre>
  </div>
</div>

<button on:click={handleBack}>Back</button>
