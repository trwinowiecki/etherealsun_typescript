/* eslint-disable import/no-cycle */
import autumn from './autumn';
import base from './base';
import dark from './dark';
import { Themes } from './types';

export const DEFAULT_THEME = 'base';

export const themes: Themes = {
  base,
  autumn,
  dark
};
