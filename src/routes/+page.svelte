<script lang="ts">
	import { pb, currentUser } from "$lib/pocketbase";
	import { onMount } from 'svelte';
	import { q1_results } from "$lib/store";
	import QuestionComponent from "$lib/components/QuestionComponent.svelte";

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


<h1>Hello World</h1>
<button on:click|preventDefault={loginWithGoogle}>Login with Google</button>
<button on:click|preventDefault={logout}>Logout</button>

<QuestionComponent questionStore={q1_results} geocoder={geocoder} service={service} prompt="Where were you born?" />

{#if $currentUser}
	<h2>You're logged in with email: {$currentUser.email}</h2>
{:else}
	<h2>You're not logged in</h2>
{/if}

<style>

</style>
