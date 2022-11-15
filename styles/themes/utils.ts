import { themes } from './index';

export interface ITheme {
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

export interface IThemes {
  [key: string]: ITheme;
}

export interface IMappedTheme {
  [key: string]: string | null;
}

export const mapTheme = (variables: ITheme): IMappedTheme => {
  return {
    '--color-primary': variables.primary || '',
    '--color-primary-darker': variables.primaryDarker || '',
    '--color-secondary': variables.secondary || '',
    '--color-secondary-darker': variables.secondaryDarker || '',
    '--color-positive': variables.positive || '',
    '--color-negative': variables.negative || '',
    '--color-text-primary': variables.textPrimary || '',
    '--background-primary': variables.backgroundPrimary || '',
    '--background-primary-darker': variables.backgroundPrimaryDarker || '',
    '--background-sec': variables.backgroundSecondary || '',
    '--white-override': variables.whiteOverride || '',
    '--black-override': variables.blackOverride || ''
  };
};

export const applyTheme = (theme: string): void => {
  const themeObject: IMappedTheme = mapTheme(themes[theme]);
  if (!themeObject) return;

  const root = document.documentElement;

  Object.keys(themeObject).forEach(property => {
    if (property === 'name') {
      return;
    }

    root.style.setProperty(property, themeObject[property]);
  });
};

export const extend = (extending: ITheme, newTheme: ITheme): ITheme => {
  return { ...extending, ...newTheme };
};
