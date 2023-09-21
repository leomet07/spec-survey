<script lang="ts">
    import MapChooser from "$lib/components/MapChooser.svelte";
	import { pb, currentUser } from "$lib/pocketbase";
	import { onMount } from 'svelte';
	import { PUBLIC_GMAPS_JSAPI_KEY } from '$env/static/public';

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

	function initService(): void {
		const displaySuggestions = function (
			predictions: google.maps.places.QueryAutocompletePrediction[] | null,
			status: google.maps.places.PlacesServiceStatus
		) {
			if (status != google.maps.places.PlacesServiceStatus.OK || !predictions) {
			alert(status);
			return;
			}

			console.log("Predictions: ", predictions)
		};

		const service = new google.maps.places.AutocompleteService();

		service.getQueryPredictions({ input: "pizza near Syd" }, displaySuggestions);
	}
	
</script>

<svelte:head>
	<script src={`https://maps.googleapis.com/maps/api/js?key=${PUBLIC_GMAPS_JSAPI_KEY}&libraries=places`} async defer/>
</svelte:head>

<h1>Hello World</h1>
<button on:click|preventDefault={loginWithGoogle}>Login with Google</button>
<button on:click|preventDefault={logout}>Logout</button>

<MapChooser />

{#if $currentUser}
	<h2>You're logged in with email: {$currentUser.email}</h2>
{:else}
	<h2>You're not logged in</h2>
{/if}

<style>

</style>
