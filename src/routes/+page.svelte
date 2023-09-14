<script lang="ts">
	import { pb, currentUser } from "$lib/pocketbase";

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
</script>

<main>
	<h1>Hello World</h1>
	<button on:click|preventDefault={loginWithGoogle}>Login with Google</button>
	<button on:click|preventDefault={logout}>Logout</button>

	{#if $currentUser}
		<h2>You're logged in with email: {$currentUser.email}</h2>
	{:else}
		<h2>You're not logged in</h2>
	{/if}
</main>

<style>

</style>
