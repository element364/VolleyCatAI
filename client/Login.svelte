<script>
  import { setName } from './store';

  let name = '';

  function handleEnter(e) {
    e.preventDefault();
    setName(name);
  }
</script>

<style>
  h1 {
    color: red;
  }
</style>

<h1>Login</h1>

<form>
  <input bind:value={name} />
  <button type="submit" on:click={handleEnter}>Enter</button>
</form>
