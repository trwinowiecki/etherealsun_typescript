/* eslint-disable jsx-a11y/label-has-for */
import axios, { AxiosResponse } from 'axios';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Address } from 'square';

import Button from '@ui/Button';
import LoadingSpinner from '@ui/LoadingSpinner';
import Modal from '@ui/Modal';
import { ShippoCommand } from '../enums/ShippoCommands';
import { ShippoAddressResponse } from '../pages/api/shippo';
import { UserProfile } from '../types/Supabase';
import { getError } from '../utils/error';

interface AddressFormProps {
  user?: UserProfile;
  onSubmit: (data: AddressForm) => void;
}

interface AddressForm extends Address {
  phoneNumber?: string;
  email?: string;
}

const AddressForm = (props: AddressFormProps) => {
  const [defaultAddress, setDefaultAddress] = useState<AddressForm>({});
  const [userEnteredAddress, setUserEnteredAddress] = useState<AddressForm>({});
  const [suggestedAddress, setSuggestedAddress] =
    useState<ShippoAddressResponse>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = props;

  if (user) {
    setDefaultAddress(
      user.square_customer?.address
        ? {
            ...user.square_customer.address,
            firstName:
              user.first_name ??
              user.square_customer.givenName ??
              user.square_customer.address.firstName ??
              '',
            lastName:
              user.last_name ??
              user.square_customer.familyName ??
              user.square_customer.address.lastName ??
              '',
            phoneNumber: user.square_customer.phoneNumber ?? '',
            email: user.square_customer.emailAddress ?? ''
          }
        : {}
    );
  }

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<AddressForm>({
    defaultValues: defaultAddress
  });

  const onSubmit: SubmitHandler<AddressForm> = async address => {
    // todo set loading state
    setLoading(true);
    setUserEnteredAddress(address);

    await axios({
      method: 'POST',
      url: `api/shippo`,
      data: {
        type: ShippoCommand.VALIDATE_ADDRESS,
        address: convertSquareToShippo(address)
      }
    })
      .then(({ data }: AxiosResponse<ShippoAddressResponse>) => {
        setLoading(false);

        if (data.validation_results?.is_valid) {
          console.log(data);
          if (data.validation_results?.messages) {
            setModalOpen(true);
            setSuggestedAddress(data);
          } else {
            props.onSubmit(address);
          }
        } else {
          toast.error(data.validation_results?.messages?.map(m => m.text));
          console.error(data.validation_results);
        }
      })
      .catch(error => {
        setLoading(false);
        toast.error(getError(error));
      });
  };

  const modalHandler = (useSuggested: boolean) => {
    setModalOpen(false);
    if (modalHandler === null) {
      return;
    }
    if (useSuggested) {
      props.onSubmit(convertShippoToSquare(suggestedAddress));
    } else {
      props.onSubmit(userEnteredAddress);
    }
  };

  const convertShippoToSquare = (
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

  const convertSquareToShippo = (
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

  const addressDisplay = (address: AddressForm) => {
    return (
      <>
        <p>
          {address.firstName} {address.lastName}
        </p>
        <p>{address.addressLine1}</p>
        <p>{address.addressLine2}</p>
        <p>
          {address.locality}, {address.administrativeDistrictLevel1}{' '}
          {address.postalCode}
        </p>
        <p>{address.country}</p>
      </>
    );
  };

  return (
    <>
      <form className="flex flex-col gap-2 relative" autoComplete="true">
        <div className="flex gap-2 flex-col md:flex-row w-full">
          <label
            htmlFor="firstName"
            className={`${errors.firstName ? 'error' : ''} input-field flex-1`}
          >
            First Name
            <input
              type="text"
              {...register('firstName', { required: true })}
              autoComplete="true"
            />
          </label>
          <label
            htmlFor="lastName"
            className={`${errors.lastName ? 'error' : ''} input-field flex-1`}
          >
            Last Name
            <input
              type="text"
              {...register('lastName', { required: true })}
              autoComplete="true"
            />
          </label>
        </div>
        <label
          htmlFor="addressLine1"
          className={`${errors.addressLine1 ? 'error' : ''} input-field`}
        >
          Address Line 1
          <input
            type="text"
            {...register('addressLine1', { required: true })}
            autoComplete="true"
          />
        </label>
        <label
          htmlFor="addressLine2"
          className={`${errors.addressLine2 ? 'error' : ''} input-field`}
        >
          Address Line 2
          <input
            type="text"
            {...register('addressLine2')}
            autoComplete="true"
          />
        </label>
        <label
          htmlFor="addressLine3"
          className={`${errors.addressLine3 ? 'error' : ''} input-field`}
        >
          Address Line 3
          <input
            type="text"
            {...register('addressLine3')}
            autoComplete="true"
          />
        </label>
        <label
          htmlFor="locality"
          className={`${errors.locality ? 'error' : ''} input-field`}
        >
          City
          <input
            type="text"
            {...register('locality', { required: true })}
            autoComplete="true"
          />
        </label>
        <label
          htmlFor="administrativeDistrictLevel1"
          className={`${
            errors.administrativeDistrictLevel1 ? 'error' : ''
          } input-field`}
        >
          State
          <input
            type="text"
            {...register('administrativeDistrictLevel1', { required: true })}
            autoComplete="true"
          />
        </label>
        <label
          htmlFor="postalCode"
          className={`${errors.postalCode ? 'error' : ''} input-field`}
        >
          Postal Code
          <input
            type="number"
            {...register('postalCode', {
              required: true,
              min: 5,
              valueAsNumber: true
            })}
            autoComplete="true"
          />
        </label>
        <label
          htmlFor="country"
          className={`${errors.country ? 'error' : ''} input-field`}
        >
          Country
          <input
            type="text"
            {...register('country', { required: true })}
            autoComplete="true"
          />
        </label>
        <Button role="submit" type="submit" onClick={handleSubmit(onSubmit)}>
          Submit
        </Button>
      </form>
      <LoadingSpinner loading={loading} />
      <Modal
        name="Suggested Address Changes"
        open={modalOpen}
        closeButton={false}
        modalClosed={modalHandler}
        minHeight="auto"
      >
        <div className="flex flex-col gap-2">
          <div>Would you like to use the suggested address?</div>
          <div className="flex gap-2">
            <div className="flex-1 border border-black p-2">
              <strong>Your address:</strong>
              {addressDisplay(userEnteredAddress)}
            </div>
            <div className="flex-1 border border-black p-2">
              <strong>Suggested address:</strong>
              {addressDisplay(convertShippoToSquare(suggestedAddress))}
            </div>
          </div>
          <div className="flex gap-2 absolute bottom-6 right-6">
            <Button onClick={() => modalHandler(false)} intent="secondary">
              No
            </Button>
            <Button onClick={() => modalHandler(true)} intent="primary">
              Yes
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AddressForm;
