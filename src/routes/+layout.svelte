<script lang="ts">
	import "@picocss/pico";
	import { PUBLIC_GMAPS_JSAPI_KEY } from "$env/static/public";
	import "./globals.css";
    import NavBar from "$lib/components/NavBar.svelte";
</script>

<svelte:head>
	<script
		src={`https://maps.googleapis.com/maps/api/js?key=${PUBLIC_GMAPS_JSAPI_KEY}&libraries=places`}
	>
	</script>
</svelte:head>

<NavBar />

<main class="container">
	<slot />
</main>
