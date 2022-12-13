/* eslint-disable import/no-cycle */
import base from './base';
import { extend } from './utils';

export default extend(base, {
  primary: 'red',
  backgroundPrimary: '#fff',
  backgroundPrimaryDarker: '#eee'
});
