<script lang="ts">
  import '@picocss/pico';
  import { PUBLIC_GMAPS_JSAPI_KEY } from '$env/static/public';
</script>

<svelte:head>
	<script src={`https://maps.googleapis.com/maps/api/js?key=${PUBLIC_GMAPS_JSAPI_KEY}&libraries=places`} async />
</svelte:head>

<main class="container">
  <slot />
</main>