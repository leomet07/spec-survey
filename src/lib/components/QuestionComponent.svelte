<script lang="ts">
	import AutoCompleteDropdown from "$lib/components/AutoCompleteDropdown.svelte";
	import MapChooser from "$lib/components/MapChooser.svelte";
	import type { QuestionResults } from "$lib/types";
	import type { Writable } from "svelte/store";

	export let autoCompleteService: google.maps.places.AutocompleteService;
	export let geocoder: google.maps.Geocoder;
	export let questionStore: Writable<QuestionResults | undefined>;
	export let prompt: string;

	function getAddressFromPoliticalAddressComponents(
		components: google.maps.GeocoderAddressComponent[]
	): string {
		let ret = "";
		let state = "";
		let country = "";
		for (let comp of components) {
			if (comp.types.some((v) => v == "administrative_area_level_1")) {
				state = comp.long_name;
			}
			if (comp.types.some((v) => v == "country")) {
				country = comp.long_name;
			}
		}
		return (state && state + ", ") + country;
	}

	function formatNumber(n: number): number {
		return Math.round(n * 10000) / 10000;
	}

	function clearComponent() {
		questionStore.set(undefined);
	}
</script>

<section>
	<h2>{prompt}</h2>

	{#if $questionStore?.political_address_components && $questionStore?.political_address_components.length > 0}
		<button class="contrast outline chosen_place" on:click={clearComponent}>
			{getAddressFromPoliticalAddressComponents(
				$questionStore.political_address_components
			)}
		</button>
	{:else if $questionStore?.latlng}
		<button class="contrast outline chosen_place" on:click={clearComponent}>
			Selected location at ({formatNumber($questionStore.latlng.lat)},
			{formatNumber($questionStore.latlng.lng)})
		</button>
	{/if}

	<AutoCompleteDropdown
		{autoCompleteService}
		{geocoder}
		chosenPlaceStore={questionStore}
	/>

	<MapChooser chosenPlaceStore={questionStore} {geocoder} />
</section>

<style scoped>
	.chosen_place {
		display: inline;
		padding-block: 0px;
		margin-bottom: 0.5rem;
	}
</style>
