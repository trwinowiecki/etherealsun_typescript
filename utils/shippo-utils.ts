import AddressForm from '../components/address-form';
import { ShippoAddressResponse } from '../pages/api/shippo';

export const convertShippoToSquareAddress = (
  address: ShippoAddressResponse
): AddressForm => {
  return {
    firstName: address.name?.split(' ')[0],
    lastName: address.name?.split(' ')[1],
    addressLine1: address.street1,
    addressLine2: address.street2,
    addressLine3: address.street3,
    locality: address.city,
    administrativeDistrictLevel1: address.state,
    postalCode: address.zip,
    country: address.country,
    phoneNumber: address.phone,
    email: address.email
  };
};

export const convertSquareToShippoAddress = (
  address: AddressForm
): ShippoAddressResponse => {
  return {
    name: [address.firstName, address.lastName].join(' '),
    street1: address.addressLine1,
    street2: address.addressLine2,
    street3: address.addressLine3,
    city: address.locality,
    state: address.administrativeDistrictLevel1,
    zip: address.postalCode,
    country: address.country,
    phone: address.phoneNumber,
    email: address.email
  };
};
