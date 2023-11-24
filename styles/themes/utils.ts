import { Theme } from './types';

export const extend = (extending: Theme, newTheme: Theme): Theme => {
  return { ...extending, ...newTheme };
};
