<script lang="ts">
	import { pb } from "$lib/pocketbase";
	import { onMount } from "svelte";

	import type { Map } from "leaflet";
	import { browser } from "$app/environment";

	let mapElement: HTMLElement;
	let map: Map;

	onMount(async () => {
		// pb.collection("public_questions").subscribe("*" , (public_answers) => {
		//     console.log("Public answers: ", public_answers)
		// })
		if (browser) {
			const leaflet = await import("leaflet");

			map = leaflet
				.map(mapElement, { preferCanvas: true })
				.setView([40.718139, -74.013754], 2);

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
					.circleMarker(
						// circle marker for better performance (cred: https://stackoverflow.com/a/43019740)
						{ lat: public_answer.lat, lng: public_answer.lng },
						{
							radius: 5,
							fillColor: "#006eff",
						},
					)
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
