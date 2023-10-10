export type LatLngSimple = {
	lat: number;
	lng: number;
};

export type QuestionResults = {
	latlng: LatLngSimple;
	political_address_components: google.maps.GeocoderAddressComponent[];
};
