<script lang="ts">
    export let service : google.maps.places.AutocompleteService;

    let predictions : google.maps.places.QueryAutocompletePrediction[] = [];
    const displaySuggestions = function (
			predictions_param: google.maps.places.QueryAutocompletePrediction[] | null,
			status: google.maps.places.PlacesServiceStatus
		) {
			if (status != google.maps.places.PlacesServiceStatus.OK || !predictions_param) {
			    alert(status);
			    return;
			}
            predictions = predictions_param;

			console.log("Predictions: ", predictions);
	};

    async function handleChange(){
        if (!query){
            predictions = [];
            return;
        }

        service.getQueryPredictions({ input : query }, displaySuggestions);
    }

    let query : string;

</script>


<form on:submit|preventDefault={() => {handleChange()}}>
    <input type="text" name="query" id="location_entry" bind:value={query} on:input={handleChange}>
    {#if predictions.length > 0}
        <ol>
            {#each predictions as prediction, index}
                <li>{prediction.description}</li>
            {/each}
        </ol>
    {/if}
    <input type="submit" value="Get suggestions"/>
</form>