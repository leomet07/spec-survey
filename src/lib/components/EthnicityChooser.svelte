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
		if ($chosenEthnicities && $chosenEthnicities?.length >= 10) {
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
			(v) => v.id !== ethnicity.id,
		);
	}
</script>

<hgroup>
	<h2>{prompt}</h2>
	<p class="explainer">
		The defenition of ethnicty that The Spectator is using for this survey
		is
		<a
			href="https://www.scotpho.org.uk/population-groups/ethnic-minorities/defining-ethnicity-and-race/"
			>the social group a person belongs to or identifies with as a result
			of a mix of cultural and other factors including language, diet,
			religion, ancestry, and physical features.</a
		>
	</p>
	<p class="explainer">
		Under this defenition, <i>ethnicity</i> is self-defined. In this survey,
		induviduals may identify with more than one ethnic group and they are encouraged
		to do select multiple ethnicities, ranging from broad descriptions to specific
		ones.
	</p>
</hgroup>

<label for="ethnicity_query">Choose up to 10 ethnicities...</label>
{#if $chosenEthnicities && $chosenEthnicities?.length > 0}
	<figure class="chosen_ethnicities">
		{#each $chosenEthnicities as chosen, index}
			<button
				class="contrast outline chosen_ethnicity"
				on:click={() => removeEthnicity(chosen)}>{chosen.name}</button
			>
		{/each}
	</figure>
{/if}
<form
	on:submit|preventDefault={() => {
		debounce();
	}}
>
	<input
		type="search"
		name="ethnicity_query"
		id="ethnicity_entry"
		bind:value={query}
		bind:this={queryInput}
		on:input={debounce}
		placeholder="Chinese, Swedish, etc..."
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
