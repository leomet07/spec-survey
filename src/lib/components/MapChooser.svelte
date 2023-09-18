<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { browser } from '$app/environment';
    import type { Map } from 'leaflet';

    let mapElement : HTMLElement;
    let map : Map;

    onMount(async () => {
        if(browser) {
            const leaflet = await import('leaflet');
            map = leaflet.map(mapElement).setView([40.718139, -74.013754], 2);

            leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
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
