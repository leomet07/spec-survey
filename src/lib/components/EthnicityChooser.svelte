<script lang="ts">
	import type { Ethnicity, EthnicityQuestionResults } from "$lib/types";
	import { pb } from "$lib/pocketbase";
	import type { Writable } from "svelte/store";

	export let prompt: string;
	let predictions: Ethnicity[] = [];
	export let chosenEthnicities: Writable<
		EthnicityQuestionResults | undefined
	>;
	let query: string;
	let queryInput: HTMLInputElement;
	let timer: number;

	async function handleSearch() {
		if (!query) {
			predictions = [];
			return;
		}

		predictions = (
			await pb.collection("ethnicities").getList<Ethnicity>(1, 5, {
				filter: `name~'${query}'`,
			})
		).items;
	}

	const debounce = () => {
		clearTimeout(timer);
		timer = setTimeout(() => {
			handleSearch();
		}, 250);
	};

	async function selectEthnicity(ethnicity: Ethnicity) {
		if ($chosenEthnicities && $chosenEthnicities?.length >= 5) {
			// if already at 5 elements
			return;
		}
		if ($chosenEthnicities?.some((v) => v.id == ethnicity.id)) {
			// If already chosen
			return;
		}
		$chosenEthnicities = [...($chosenEthnicities || []), ethnicity];
		query = "";
	}
	async function removeEthnicity(ethnicity: Ethnicity) {
		$chosenEthnicities = $chosenEthnicities?.filter(
			(v) => v.id !== ethnicity.id
		);
	}
</script>

<h2>{prompt}</h2>

<form
	on:submit|preventDefault={() => {
		debounce();
	}}
>
	<label for="ethnicity_query">Choose up to 5 ethnicities...</label>
	{#if $chosenEthnicities && $chosenEthnicities?.length > 0}
		<figure class="chosen_ethnicities">
			{#each $chosenEthnicities as chosen, index}
				<button
					class="contrast outline chosen_ethnicity"
					on:click={() => removeEthnicity(chosen)}
					>{chosen.name}</button
				>
			{/each}
		</figure>
	{/if}
	<input
		type="search"
		name="ethnicity_query"
		id="ethnicity_entry"
		bind:value={query}
		bind:this={queryInput}
		on:input={debounce}
		placeholder="Asian, Swedish, etc..."
	/>
	{#if predictions.length > 0}
		<ol>
			{#each predictions as prediction, index}
				<button
					class="secondary"
					on:click={() => selectEthnicity(prediction)}
					>{prediction.name}</button
				>
			{/each}
		</ol>
	{/if}
</form>

<style scoped>
	.chosen_ethnicities {
		display: flex;
		gap: 1rem;
		margin-bottom: 0;
	}
	.chosen_ethnicity {
		display: inline;
		padding-block: 0px;
		max-width: 200px;
	}
</style>
