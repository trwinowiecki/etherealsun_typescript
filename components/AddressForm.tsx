import axios, { CancelTokenSource } from 'axios';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Address } from 'square';

import { CustomUser } from '../utils/firebase/firebaseAuth';

interface AddressFormProps {
  user?: CustomUser;
}

const AddressForm = ({ user }: AddressFormProps) => {
  const [defaultAddress, setDefaultAddress] = useState<Address>({});
  const [autocomplete, setAutocomplete] = useState({});

  if (user) {
    setDefaultAddress(user.squareCustomer?.address ?? {});
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
      const res = await axios({
        method: 'GET',
        url: `https://api.geoapify.com/v1/geocode/autocomplete?text=${query}&apiKey=5c6ba5019b3b450a839e5988d5757976`,
        cancelToken: cancelSource.token
      });
      console.log(res.data);
    };
    if (queryValue && queryValue.length > 2) {
      console.log(queryValue);
      fetchData(source, queryValue);
    }

    return () => source.cancel();
  }, [queryValue]);

  return (
    <form>
      {JSON.stringify(autocomplete)}
      <label
        htmlFor="addressLine1"
        className={`${errors.addressLine1 ? 'error' : ''} input-field`}
      >
        Address Line 1
        <input type="text" {...register('addressLine1')} autoComplete="true" />
      </label>
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
