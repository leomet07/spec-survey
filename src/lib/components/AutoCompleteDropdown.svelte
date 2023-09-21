<script lang="ts">
    export let service : google.maps.places.AutocompleteService;
    export let geocoder : google.maps.Geocoder;

    let predictions : google.maps.places.QueryAutocompletePrediction[] = [];
    let query : string;

    const displaySuggestions = function (
			predictions_param: google.maps.places.QueryAutocompletePrediction[] | null,
			status: google.maps.places.PlacesServiceStatus
		) {
			if (status != google.maps.places.PlacesServiceStatus.OK || !predictions_param) {
			    alert(status);
			    return;
			}
            predictions = predictions_param;

			console.log("Predictions: ", predictions)
	};

    async function handleChange(){
        if (!query){
            predictions = [];
            return;
        }

        service.getQueryPredictions({ input : query }, displaySuggestions);
    }

    async function choosePlace(place_id : string | undefined){
        if (!place_id){
            return;
        }
        console.log("Place id chosen: ", place_id);

        // get lat long
        const response = await geocoder.geocode({placeId : place_id});
        console.log("Response of chosen: ", response);
        
        let lat = response.results[0].geometry.location.lat();
        let long = response.results[0].geometry.location.lng();
        console.log("lat_long of chosen: ", lat, long);
    }

</script>


<form on:submit|preventDefault={() => {handleChange()}}>
    <input type="text" name="query" id="location_entry" bind:value={query} on:input={handleChange}>
    {#if predictions.length > 0}
        <ol>
            {#each predictions as prediction, index}
                <button class="secondary" on:click={() => choosePlace(prediction.place_id)}>{prediction.description}</button>
            {/each}
        </ol>
    {/if}
    <input type="submit" value="Get suggestions"/>
</form>