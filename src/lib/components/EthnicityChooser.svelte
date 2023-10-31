<script lang="ts">
	import type { Ethnicity } from "$lib/types";
	import { pb } from "$lib/pocketbase";

	let predictions: Ethnicity[] = [];
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
</script>

<form
	on:submit|preventDefault={() => {
		debounce();
	}}
>
	<label for="ethnicity_query">Choose up to 5 ethnicities...</label>
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
				<button class="secondary">{prediction.name}</button>
			{/each}
		</ol>
	{/if}
</form>
