<script lang="ts">
	import Questionare from "$lib/components/Questionare.svelte";
	import { pb, currentUser } from "$lib/pocketbase";
	import { onMount } from 'svelte';

	async function loginWithGoogle(){
		// This method initializes a one-off realtime subscription and will
		// open a popup window with the OAuth2 vendor page to authenticate.
		//
		// Once the external OAuth2 sign-in/sign-up flow is completed, the popup
		// window will be automatically closed and the OAuth2 data sent back
		// to the user through the previously established realtime connection.
		const authData = await pb.collection('users').authWithOAuth2({ provider: 'google' });
	}

	async function logout(){
		// "logout" the last authenticated model
		pb.authStore.clear();
	}


	onMount(() => {
		initService();
	});
	let service : google.maps.places.AutocompleteService;
	let geocoder : google.maps.Geocoder;

	function initService() {
		service = new google.maps.places.AutocompleteService();
		geocoder = new google.maps.Geocoder();
	}
	
</script>

<h1>The Spectator Demographics Survey</h1>

{#if $currentUser}
	<Questionare service={service} geocoder={geocoder} />
	<p>You're logged in with email: {$currentUser.email}</p>
	<button on:click|preventDefault={logout} class="secondary outline">Logout</button>
{:else}
	<p>You're not logged in</p>
	<button on:click|preventDefault={loginWithGoogle}>Login with Google</button>
{/if}

<style>

</style>
