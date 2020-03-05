<script>
  import { onDestroy } from 'svelte';

  import { store } from './store';

  import Login from './Login.svelte';
  import Games from './Games.svelte';
  import Game from './Game.svelte';

  let s;
  const unsubscribe = store.subscribe(v => {
    // console.log('[*] App: Store changed', v);
    s = v;
  });

  onDestroy(unsubscribe);
</script>

{#if s.scene === 'login'}
  <Login />
{:else if s.scene === 'games'}
  <Games />
{:else if s.scene === 'game'}
  <Game />
{:else}
  <h1>Kek</h1>
{/if}
