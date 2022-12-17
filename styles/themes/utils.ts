/* eslint-disable import/no-cycle */
/* eslint-disable @typescript-eslint/naming-convention */
import { MappedTheme, Theme } from './types';

import { themes } from './index';

export const mapTheme = (variables: Theme): MappedTheme => {
  return {
    '--color-primary': variables.primary ?? '',
    '--color-primary-darker': variables.primaryDarker ?? '',
    '--color-secondary': variables.secondary ?? '',
    '--color-secondary-darker': variables.secondaryDarker ?? '',
    '--color-positive': variables.positive ?? '',
    '--color-negative': variables.negative ?? '',
    '--color-text-primary': variables.textPrimary ?? '',
    '--background-primary': variables.backgroundPrimary ?? '',
    '--background-primary-darker': variables.backgroundPrimaryDarker ?? '',
    '--background-sec': variables.backgroundSecondary ?? '',
    '--white-override': variables.whiteOverride ?? '',
    '--black-override': variables.blackOverride ?? ''
  };
};

export const applyTheme = (theme: string): void => {
  const themeObject: MappedTheme = mapTheme(themes[theme]);
  if (!themeObject) return;

  const root = document.documentElement;

  Object.keys(themeObject).forEach(property => {
    if (property === 'name') {
      return;
    }

    root.style.setProperty(property, themeObject[property]);
  });
};

export const extend = (extending: Theme, newTheme: Theme): Theme => {
  return { ...extending, ...newTheme };
};
