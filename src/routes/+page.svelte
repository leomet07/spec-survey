<script lang="ts">
	import Questionare from "$lib/components/Questionare.svelte";
	import { pb, currentUser } from "$lib/pocketbase";
	import { onMount } from "svelte";

	let url: string;
	async function loginWithGoogle() {
		// This method initializes a one-off realtime subscription and will
		// open a popup window with the OAuth2 vendor page to authenticate.
		//
		// Once the external OAuth2 sign-in/sign-up flow is completed, the popup
		// window will be automatically closed and the OAuth2 data sent back
		// to the user through the previously established realtime connection.
		try {
			const authData = await pb.collection("users").authWithOAuth2({
				provider: "google",
				urlCallback: (urlp: string) => {
					url = urlp;
					window.open(urlp); // just try and open the window right away, works on non IOS browsers
				},
			});
		} catch (error) {}
	}

	async function logout() {
		// "logout" the last authenticated model
		pb.authStore.clear();
	}

	onMount(async () => {
		initService();
		const authData = await pb.collection("users").authWithOAuth2({
			provider: "google",
			urlCallback: (urlp: string) => {
				url = urlp;
			},
		});
	});
	let autoCompleteService: google.maps.places.AutocompleteService;
	let geocoder: google.maps.Geocoder;

	function initService() {
		autoCompleteService = new google.maps.places.AutocompleteService();
		geocoder = new google.maps.Geocoder();
	}
</script>

<header>
	<hgroup>
		<h1>The Spectator Demographics Survey</h1>
		<h2>Answer as many or as few questions as you would like!</h2>
	</hgroup>
</header>

{#if $currentUser}
	<Questionare {autoCompleteService} {geocoder} />
	<p>You're logged in with email: {$currentUser.email}</p>
	<button on:click|preventDefault={logout} class="secondary outline"
		>Logout</button
	>
{:else}
	<p>You're not logged in</p>
	<!-- On click to expand the accordian, user will either immedietely be redirected or will at least get the redirect url loaded for the button within the accordian -->
	<!-- Why? Well the JS method worked on everything other than safari/ios browsers becaue they block JS from opening new tabs -->
	<!-- So, we make the user open what JS was going to open if the user is on safari/ios -->
	<details>
		<!-- svelte-ignore a11y-no-redundant-roles -->
		<!-- svelte-ignore a11y-positive-tabindex -->
		<summary
			role="button"
			on:click={loginWithGoogle}
			on:keypress={loginWithGoogle}
			tabindex="1">Sign in</summary
		>
		<a role="button" target="_blank" href={url}>Login with Google</a>
	</details>
{/if}

<style>
	header {
		padding-top: 1.5rem;
	}
</style>
