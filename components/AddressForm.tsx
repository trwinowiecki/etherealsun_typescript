/* eslint-disable jsx-a11y/label-has-for */
import { Combobox, Transition } from '@headlessui/react';
import axios, { CancelTokenSource } from 'axios';
import { Fragment, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Address } from 'square';

import { GeoApifyAutocompleteResult, GeoApifyFeature } from '../types/GeoApify';
import { UserProfile } from '../types/Supabase';
import { getError } from '../utils/error';

interface AddressFormProps {
  user?: UserProfile;
}

const AddressForm = ({ user }: AddressFormProps) => {
  const [defaultAddress, setDefaultAddress] = useState<Address>({});
  const [autocompleteRes, setAutocompleteRes] =
    useState<GeoApifyAutocompleteResult | null>();
  const [autocompleteSelected, setAutocompleteSelected] =
    useState<GeoApifyFeature | null>();

  if (user) {
    setDefaultAddress(user.square_customer?.address ?? {});
  }

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors }
  } = useForm<Address>({
    defaultValues: defaultAddress
  });
  const queryValue = watch('addressLine1');

  useEffect(() => {
    const source = axios.CancelToken.source();
    const fetchData = async (
      cancelSource: CancelTokenSource,
      query: string
    ) => {
      try {
        const res = await axios({
          method: 'POST',
          url: 'api/geoapify',
          data: { query, cancelToken: cancelSource.token },
          cancelToken: cancelSource.token
        });
        setAutocompleteRes(res.data);
      } catch (error) {
        if (!axios.isCancel(error)) {
          toast(getError(error));
        }
      }
    };
    if (queryValue && queryValue.length > 2) {
      console.log(queryValue);
      fetchData(source, queryValue);
    }

    return () => source.cancel('cleanup');
  }, [queryValue]);

  console.log(autocompleteRes?.features);

  return (
    <form className="flex flex-col gap-2">
      <label
        htmlFor="addressLine1"
        className={`${errors.addressLine1 ? 'error' : ''} input-field`}
      >
        <Combobox
          value={autocompleteSelected}
          onChange={setAutocompleteSelected}
        >
          <Combobox.Label>Address Line 1</Combobox.Label>

          <div className="relative flex flex-col flex-1">
            <Combobox.Input {...register('addressLine1')} />

            <Transition
              as={Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Combobox.Options className="absolute w-full py-1 mt-10 overflow-auto text-base bg-white rounded-md shadow-lg max-h-60 sm:text-sm">
                {!autocompleteRes || autocompleteRes.features.length === 0 ? (
                  <div>Nothing here</div>
                ) : (
                  autocompleteRes?.features.map(feature => (
                    <Combobox.Option
                      key={feature.properties.placeId}
                      value={feature}
                      className="px-2"
                    >
                      {feature.properties.formatted}
                    </Combobox.Option>
                  ))
                )}
              </Combobox.Options>
            </Transition>
          </div>
        </Combobox>
      </label>
      {/* <label
        htmlFor="addressLine1"
        className={`${errors.addressLine1 ? 'error' : ''} input-field`}
      >
        Address Line 1
        <input type="text" {...register('addressLine1')} autoComplete="true" />
      </label> */}
      <label
        htmlFor="addressLine2"
        className={`${errors.addressLine2 ? 'error' : ''} input-field`}
      >
        Address Line 2
        <input type="text" {...register('addressLine2')} autoComplete="true" />
      </label>
      <label
        htmlFor="addressLine3"
        className={`${errors.addressLine3 ? 'error' : ''} input-field`}
      >
        Address Line 3
        <input type="text" {...register('addressLine3')} autoComplete="true" />
      </label>
      <label
        htmlFor="postalCode"
        className={`${errors.postalCode ? 'error' : ''} input-field`}
      >
        Postal Code
        <input type="number" {...register('postalCode')} autoComplete="true" />
      </label>
      <label
        htmlFor="country"
        className={`${errors.country ? 'error' : ''} input-field`}
      >
        Country
        <input type="text" {...register('country')} autoComplete="true" />
      </label>
      <label
        htmlFor="firstName"
        className={`${errors.firstName ? 'error' : ''} input-field`}
      >
        First Name
        <input type="text" {...register('firstName')} autoComplete="true" />
      </label>
      <label
        htmlFor="lastName"
        className={`${errors.lastName ? 'error' : ''} input-field`}
      >
        Last Name
        <input type="text" {...register('lastName')} autoComplete="true" />
      </label>
    </form>
  );
};

export default AddressForm;
