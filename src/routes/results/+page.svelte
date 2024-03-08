<script lang="ts">
	import { pb } from "$lib/pocketbase";
	import type { LatLngSimple } from "$lib/types";
	import { onMount } from "svelte";

	import type { LatLng, LeafletMouseEvent, Map, Marker } from "leaflet";
	import { browser } from "$app/environment";
	import iconUrl from "$lib/leaflet_images/marker-icon.png";
	import iconRetinaUrl from "$lib/leaflet_images/marker-icon-2x.png";
	import shadowUrl from "$lib/leaflet_images/marker-shadow.png";

	let mapElement: HTMLElement;
	let map: Map;

	onMount(async () => {
		// pb.collection("public_questions").subscribe("*" , (public_answers) => {
		//     console.log("Public answers: ", public_answers)
		// })
		if (browser) {
			const leaflet = await import("leaflet");

			// Hacky way to get around bundling of marker icon failing
			// @ts-ignore
			delete leaflet.Icon.Default.prototype._getIconUrl;
			leaflet.Icon.Default.mergeOptions({
				iconUrl: iconUrl,
				iconRetinaUrl: iconRetinaUrl,
				shadowUrl: shadowUrl,
			});

			map = leaflet.map(mapElement).setView([40.718139, -74.013754], 2);

			leaflet
				.tileLayer(
					"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
					{
						attribution:
							'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
					},
				)
				.addTo(map);

			const public_answers = await pb
				.collection("public_questions")
				.getFullList();

			for (const public_answer of public_answers) {
				let marker = leaflet
					.marker({ lat: public_answer.lat, lng: public_answer.lng })
					.addTo(map)
					.addEventListener("click", (e) => {
						console.log("Marker clicked: ", public_answer);
					});
			}
		}
	});
</script>

<h1>Results</h1>

<div class="map" bind:this={mapElement} />

<style>
	@import "leaflet/dist/leaflet.css";
	.map {
		height: 600px;
	}

	/* Override styles applied by pocketbase */
	:global(.leaflet-control-zoom) {
		border: none !important;
		padding-bottom: 2px !important;
	}
	:global(.leaflet-control-zoom [role="button"]) {
		padding: 0px !important;
		border-radius: 0% !important;
	}
	:global(.leaflet-control-zoom a:last-child) {
		border-bottom: 1px solid var(--primary) !important;
	}

	:global(.leaflet-marker-icon) {
		background-color: transparent !important;
		border: none !important;
	}

	:global(.leaflet-popup-close-button) {
		padding: 0px !important;
	}
</style>
