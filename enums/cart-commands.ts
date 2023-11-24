/* eslint-disable @shopify/typescript/prefer-pascal-case-enums */
export enum CartCommand {
  ADD = 'CART_ADD_ITEM',
  UPDATE = 'CART_UPDATE_ITEM',
  REMOVE = 'CART_REMOVE_ITEM',
  RESET = 'CART_RESET',
  CLEAR = 'CART_CLEAR_ITEMS',
  SAVE_PAYMENT_METHOD = 'SAVE_PAYMENT_METHOD',
  SAVE_SHIPPING_ADDRESS = 'SAVE_SHIPPING_ADDRESS',
  POP_UP = 'PUP_UP',
  SET_USER = 'SET_USER'
}
