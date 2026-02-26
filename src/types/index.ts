export interface AgileRate {
  value_exc_vat: number;
  value_inc_vat: number;
  valid_from: string;
  valid_to: string;
}

export interface OctopusApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: AgileRate[];
}

export interface OctopusSettings {
  apiKey: string;
  mpan: string;
  serial: string;
  agilePlanVersion: string;
  region: string;
  ofgemCapRate: number;
  notificationsEnabled: boolean;
}
