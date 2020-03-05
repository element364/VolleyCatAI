<script>
  import { onDestroy } from 'svelte';

  import { store, updateInput, viewGames } from './store';
  import Visualizer from './Visualizer';
  import { WIDTH, HEIGHT } from './constants';

  let container;
  let visualizer;

  let state;
  const unsubscribe = store.subscribe(v => {
    // console.log('[*] Game: Store changed', v);
    state = v;
    if (visualizer) {
      visualizer.render(v.game, v.latency);
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

  function onBlur() {
    updateInput({ left: 0, up: 0, right: 0 });
  }

  $: if (container) {
    visualizer = new Visualizer(container, { WIDTH, HEIGHT });

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);
  }

  function handleBack() {
    viewGames();
  }

  onDestroy(() => {
    unsubscribe();
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);
    window.removeEventListener('blur', onBlur);
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
  <div class="flex-1">
    <div bind:this={container} />
    <button on:click={handleBack}>Back</button>
  </div>
  <div class="flex-1">
    <pre>{JSON.stringify(state, null, 2)}</pre>
  </div>
</div>
