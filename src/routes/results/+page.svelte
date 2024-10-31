<script lang="ts">
	import { pb } from "$lib/pocketbase";
	import { onMount } from "svelte";

	// import { Map } from "leaflet";
	import { browser } from "$app/environment";

	let mapElement: HTMLElement;
	let chartElement: HTMLElement;
	let map: any;

	let names: string[] = [];
	let values: number[] = [];
	let parent_names: string[] = [];
	let parent_values: number[] = [];
	import { Pie } from "svelte-chartjs";
	import {
		Chart as ChartJS,
		Title,
		Tooltip,
		Legend,
		ArcElement,
		CategoryScale,
		Colors,
	} from "chart.js";

	ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, Colors);

	function return_Country_value_map(
		public_answers: any[],
		question_letter: string,
	) {
		const only_question_a = public_answers.filter(
			(v) => v.question_id.toLowerCase() == question_letter,
		);
		const all_political_address_components = only_question_a.map(
			(v) => v.political_address_components,
		);

		// const only_countries = all_political_address_components.map((v) => v.filter(j => j.types.includes("country")));
		const only_countries = [];
		for (
			let index = 0;
			index < all_political_address_components.length;
			index++
		) {
			let political_address_component =
				all_political_address_components[index];
			let v = political_address_component.filter((j: any) =>
				j.types.includes("country"),
			);

			if (v.length == 0) {
				// no political address components
				continue;
			}

			only_countries.push(v);
		}
		const only_country_names = only_countries.map((v) => v[0]?.short_name);

		let country_name_to_number_map: Record<string, number> = {};

		for (const country_name of only_country_names) {
			if (country_name in country_name_to_number_map) {
				country_name_to_number_map[country_name] += 1;
			} else {
				country_name_to_number_map[country_name] = 1;
			}
		}
		const object_entry_map = Object.entries(country_name_to_number_map);
		object_entry_map.sort((a, b) => b[1] - a[1]);
		return object_entry_map;
	}

	onMount(async () => {
		// pb.collection("public_questions").subscribe("*" , (public_answers) => {
		//     console.log("Public answers: ", public_answers)
		// })
		if (browser && window) {
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

			const object_entry_map = return_Country_value_map(
				public_answers,
				"a",
			);
			const parent_object_entry_map = return_Country_value_map(
				public_answers,
				"b",
			);
			console.log(object_entry_map);

			names = object_entry_map.map((a) => a[0]);
			values = object_entry_map.map((a) => a[1]);
			parent_names = parent_object_entry_map.map((a) => a[0]);
			parent_values = parent_object_entry_map.map((a) => a[1]);

			// console.log("192: ", only_country_names[192]);

			// const unique_set_of_country_names = Array.from(
			// 	new Set(only_country_names),
			// );
			// console.log("Unique country names: ", unique_set_of_country_names);
		}
	});
</script>

<h1>Results</h1>

<div class="map" bind:this={mapElement} />

<div class="pie-container">
	<h2>Where students are born:</h2>
	<Pie
		data={{
			labels: names,
			datasets: [
				{
					data: values,
				},
			],
		}}
		options={{ responsive: true }}
	/>
</div>
<div class="pie-container">
	<h2>Where parents (#1) are from:</h2>
	<Pie
		data={{
			labels: parent_names,
			datasets: [
				{
					data: parent_values,
				},
			],
		}}
		options={{ responsive: true }}
	/>
</div>

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

	.pie-container {
		margin-top: 1rem;
		max-width: 900px;
		background-color: white;
	}
	.pie-container h2 {
		color: black;
	}
</style>
