export interface GeoApifyAutocompleteResult {
  type: string;
  features: GeoApifyFeature[];
  query: any;
}

export interface GeoApifyFeature {
  type: string;
  geometry: {
    type: string;
    coordinates?: number[];
  };
  properties: GeoApifyProperties;
}

export interface GeoApifyProperties {
  countryCode: string;
  houseNumber: string;
  street: string;
  country: string;
  county: string;
  dataSource: {
    sourceName: string;
    attribution: string;
    license: string;
  };
  postcode: string;
  state: string;
  district: string;
  city: string;
  lon: number;
  lat: number;
  stateCode: string;
  formatted: string;
  addressLine1: string;
  addressLine2: string;
  timezone: {
    name: string;
    offsetSTD: string;
    offsetSTDSeconds: number;
    offsetDST: string;
    offsetDSTSeconds: number;
    abbreviationSTD: string;
    abbreviationDST: string;
  };
  resultType: string;
  rank: {
    confidence: number;
    matchType: string;
  };
  placeId: string;
}
