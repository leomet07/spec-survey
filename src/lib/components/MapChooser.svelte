<script lang="ts">
    import iconUrl from "$lib/leaflet_images/marker-icon.png"
    import iconRetinaUrl from "$lib/leaflet_images/marker-icon-2x.png"
    import shadowUrl from "$lib/leaflet_images/marker-shadow.png"

    import { onMount, onDestroy } from 'svelte';
    import { browser } from '$app/environment';
    import type { LatLng, LeafletMouseEvent, Map, Marker } from 'leaflet';
	import type { Writable } from "svelte/store";
	import type { QuestionResults } from "$lib/types";

    export let geocoder : google.maps.Geocoder;
    export let chosenPlaceStore : Writable<QuestionResults | undefined>;


    let mapElement : HTMLElement;
    let map : Map;

    let marker : Marker;

    onMount(async () => {
        if(browser) {
            const leaflet = await import('leaflet');

            // Hacky way to get around bundling of marker icon failing
            // @ts-ignore
            delete leaflet.Icon.Default.prototype._getIconUrl;
            leaflet.Icon.Default.mergeOptions({
                iconUrl: iconUrl,
                iconRetinaUrl: iconRetinaUrl,
                shadowUrl: shadowUrl
            });
            
            map = leaflet.map(mapElement).setView([40.718139, -74.013754], 2);

            leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);

            map.on("click", async (e : LeafletMouseEvent) => {
                let latlng = {lat : e.latlng.lat, lng : e.latlng.lng};
                console.log("Lat long of click: ", latlng);

                // convert lat long to a place, then grab the city/state/country/that-sort-of-political-data
                const response = await geocoder.geocode({location : latlng});

                const results = response.results[0];
                let address_components = results.address_components;
                let political_address_components = address_components.filter((v) => v.types.includes("political"));

                $chosenPlaceStore = { latlng , political_address_components };  
            })

            chosenPlaceStore.subscribe((chosenPlace) => {
                if (marker){
                    marker.remove();
                }
                if (!chosenPlace){
                    return;
                }
                marker = leaflet.marker(chosenPlace.latlng).addTo(map);

            })
        }
    });

    

    onDestroy(async () => {
        if(map) {
            console.log('Unloading Leaflet map.');
            map.remove();
        }
    });
</script>

<div class="map" bind:this={mapElement}></div>

<style>
    @import 'leaflet/dist/leaflet.css';
    .map {
        height: 600px;
    }

    /* Override styles applied by pocketbase */
    :global(.leaflet-control-zoom){
        border : none !important;
        padding-bottom: 2px !important;
    }
    :global(.leaflet-control-zoom [role="button"]){
        padding : 0px !important; 
        border-radius: 0% !important;;
    }
    :global(.leaflet-control-zoom a:last-child){
        border-bottom : 1px solid var(--primary) !important
    }

    :global(.leaflet-marker-icon){
        background-color: transparent !important;
        border : none !important;
    }

    :global(.leaflet-popup-close-button){
        padding : 0px !important;
    }
    
</style>
