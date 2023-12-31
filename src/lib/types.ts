import type { RecordModel } from "pocketbase";

export type LatLngSimple = {
	lat: number;
	lng: number;
};

export type QuestionResults = {
	latlng: LatLngSimple;
	political_address_components: google.maps.GeocoderAddressComponent[];
};

export interface DBQuestion extends RecordModel {
	lat: number;
	lng: number;
	parent_user: string;
	question_id: string;
	political_address_components: google.maps.GeocoderAddressComponent[];
}

export interface Ethnicity extends RecordModel {
	name: string;
}

export type EthnicityQuestionResults = Ethnicity[];

export interface UserEthnicityDBEntry extends RecordModel {
	ethnicity: string;
	parent_user: string;
}
