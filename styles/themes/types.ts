export interface Theme {
  primary?: string;
  primaryDarker?: string;
  secondary?: string;
  secondaryDarker?: string;
  negative?: string;
  positive?: string;
  textPrimary?: string;
  backgroundPrimary?: string;
  backgroundPrimaryDarker?: string;
  backgroundSecondary?: string;
  whiteOverride?: string;
  blackOverride?: string;
}

export interface Themes {
  [key: string]: Theme;
}

export interface MappedTheme {
  [key: string]: string | null;
}
