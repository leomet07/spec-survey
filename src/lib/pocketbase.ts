import PocketBase from "pocketbase";
import { writable } from "svelte/store";
import { PUBLIC_POCKETBASE_URL } from "$env/static/public";
import { dev } from "$app/environment";

export const pb = new PocketBase(
	PUBLIC_POCKETBASE_URL || "http://127.0.0.1:8090"
);

export const currentUser = writable(pb.authStore.model);

pb.authStore.onChange((auth) => {
	currentUser.set(pb.authStore.model);
});
