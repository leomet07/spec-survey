<script lang="ts">
	import Questionare from "$lib/components/Questionare.svelte";
	import { pb, currentUser } from "$lib/pocketbase";
	import { onMount } from 'svelte';

	let errord : any;
	let url : string;
	async function loginWithGoogle(){
		// This method initializes a one-off realtime subscription and will
		// open a popup window with the OAuth2 vendor page to authenticate.
		//
		// Once the external OAuth2 sign-in/sign-up flow is completed, the popup
		// window will be automatically closed and the OAuth2 data sent back
		// to the user through the previously established realtime connection.
		try {
			errord = "before"
			const authData = await pb.collection('users').authWithOAuth2({ provider: 'google', urlCallback : (urlp : string) => {
				url = urlp;
				// window.location.href = urlp;
				window.open(urlp); // just try and open the window right away, works on non IOS browsers
			}});
			errord = "after"
		} catch (error){
			errord = "before"
			errord = String(error);
		}
	}

	async function logout(){
		// "logout" the last authenticated model
		pb.authStore.clear();
	}


	onMount(async () => {
		initService();
		const authData = await pb.collection('users').authWithOAuth2({ provider: 'google', urlCallback : (urlp : string) => {
			url = urlp;
		}});
	});
	let autoCompleteService : google.maps.places.AutocompleteService;
	let geocoder : google.maps.Geocoder;

	function initService() {
		autoCompleteService = new google.maps.places.AutocompleteService();
		geocoder = new google.maps.Geocoder();
	}
	
</script>

<h1>The Spectator Demographics Survey</h1>

{#if $currentUser}
	<Questionare autoCompleteService={autoCompleteService} geocoder={geocoder} />
	<p>You're logged in with email: {$currentUser.email}</p>
	<button on:click|preventDefault={logout} class="secondary outline">Logout</button>
{:else}
	<p>You're not logged in</p>
	<!-- <button on:click|preventDefault={loginWithGoogle}>Login with Google</button> -->
	<details>
		<summary role="button" on:click={loginWithGoogle} on:keypress={loginWithGoogle} tabindex="1">Sign in</summary>
		<a role="button" target="_blank" href={url}>New login with google</a>
	</details>
{/if}

<style>

</style>
