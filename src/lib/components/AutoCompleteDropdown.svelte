<script lang="ts">
	import type { LatLngSimple, QuestionResults } from "$lib/types";
	import type { Writable } from "svelte/store";

	export let autoCompleteService: google.maps.places.AutocompleteService;
	export let geocoder: google.maps.Geocoder;
	export let chosenPlaceStore: Writable<QuestionResults | undefined>;

	let predictions: google.maps.places.QueryAutocompletePrediction[] = [];
	let query: string;
	let queryInput: HTMLInputElement;
	let timer: number;

	const displaySuggestions = function (
		predictions_param:
			| google.maps.places.QueryAutocompletePrediction[]
			| null,
		status: google.maps.places.PlacesServiceStatus
	) {
		if (
			status != google.maps.places.PlacesServiceStatus.OK ||
			!predictions_param
		) {
			alert(status);
			return;
		}
		predictions = predictions_param;
	};

	const debounce = () => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			handleSearch();
		}, 250);
	};

	async function handleSearch() {
		if (!query) {
			predictions = [];
			return;
		}

		autoCompleteService.getQueryPredictions(
			{ input: query },
			displaySuggestions
		);
	}

	async function choosePlace(place_id: string | undefined) {
		if (!place_id) {
			return;
		}

		// get lat long
		const response = await geocoder.geocode({ placeId: place_id });
		const results = response.results[0];

		let lat = results.geometry.location.lat();
		let lng = results.geometry.location.lng();

		let latlng: LatLngSimple = { lat, lng };

		let address_components = results.address_components;
		let political_address_components = address_components.filter((v) =>
			v.types.includes("political")
		);
		console.log(
			"Political Address components of chosen: ",
			political_address_components
		);
		$chosenPlaceStore = { latlng, political_address_components };
		queryInput.value = "";
		query = ""; // clear query too for when keyboard submit is used
		predictions = [];
	}
</script>

<form
	on:submit|preventDefault={() => {
		debounce();
	}}
>
	<label for="query">Enter the location</label>
	<input
		type="search"
		name="query"
		id="location_entry"
		bind:value={query}
		bind:this={queryInput}
		on:input={debounce}
		placeholder="Chigago, Brooklyn, etc..."
	/>
	{#if predictions.length > 0}
		<ol>
			{#each predictions as prediction, index}
				<button
					class="secondary"
					on:click={() => choosePlace(prediction.place_id)}
					>{prediction.description}</button
				>
			{/each}
		</ol>
	{/if}
</form>
