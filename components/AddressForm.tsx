/* eslint-disable jsx-a11y/label-has-for */
import axios, { AxiosResponse } from 'axios';
import { HTMLInputTypeAttribute, useEffect, useState } from 'react';
import {
  Controller,
  RegisterOptions,
  SubmitHandler,
  useForm
} from 'react-hook-form';
import { toast } from 'react-toastify';
import { Address } from 'square';

import Button from '@ui/Button';
import LoadingSpinner from '@ui/LoadingSpinner';
import Modal from '@ui/Modal';
import PhoneInput from 'react-phone-number-input/input';
import { ShippoCommand } from '../enums/ShippoCommands';
import { ShippoAddressResponse } from '../pages/api/shippo';
import { UserCustom } from '../types/Supabase';
import { getErrorShippo } from '../utils/error';
import { cn } from '../utils/tw-utils';

interface AddressFormProps {
  user?: UserCustom;
  onSubmit: (data: AddressForm) => void;
  address?: AddressForm;
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
  const { user, address } = props;

  useEffect(() => {
    let newAddress: AddressForm = {};

    if (user) {
      newAddress = {
        ...defaultAddress,
        ...user.square_customer?.address,
        firstName:
          user.first_name ||
          user.square_customer?.givenName ||
          user.square_customer?.address?.firstName ||
          defaultAddress.firstName ||
          '',
        lastName:
          user.last_name ||
          user.square_customer?.familyName ||
          user.square_customer?.address?.lastName ||
          defaultAddress.lastName ||
          '',
        phoneNumber:
          user.square_customer?.phoneNumber || defaultAddress.phoneNumber || '',
        email: user.square_customer?.emailAddress || defaultAddress.email || ''
      };
    }

    if (address) {
      newAddress = {
        firstName:
          address.firstName ||
          newAddress.firstName ||
          defaultAddress.firstName ||
          '',
        lastName:
          address.lastName ||
          newAddress.lastName ||
          defaultAddress.lastName ||
          '',
        addressLine1:
          address.addressLine1 ||
          newAddress.addressLine1 ||
          defaultAddress.addressLine1 ||
          '',
        addressLine2:
          address.addressLine2 ||
          newAddress.addressLine2 ||
          defaultAddress.addressLine2 ||
          '',
        addressLine3:
          address.addressLine3 ||
          newAddress.addressLine3 ||
          defaultAddress.addressLine3 ||
          '',
        locality:
          address.locality ||
          newAddress.locality ||
          defaultAddress.locality ||
          '',
        administrativeDistrictLevel1:
          address.administrativeDistrictLevel1 ||
          newAddress.administrativeDistrictLevel1 ||
          defaultAddress.administrativeDistrictLevel1 ||
          '',
        postalCode:
          address.postalCode ||
          newAddress.postalCode ||
          defaultAddress.postalCode ||
          '',
        country:
          address.country ||
          newAddress.country ||
          defaultAddress.country ||
          'US',
        phoneNumber:
          address.phoneNumber ||
          newAddress.phoneNumber ||
          defaultAddress.phoneNumber ||
          '',
        email: address.email || newAddress.email || defaultAddress.email || ''
      };
    }

    setDefaultAddress(newAddress);
    reset(newAddress);
  }, [
    user?.id,
    address?.firstName,
    address?.lastName,
    address?.addressLine1,
    address?.addressLine2,
    address?.addressLine3,
    address?.locality,
    address?.administrativeDistrictLevel1,
    address?.postalCode,
    address?.country,
    address?.phoneNumber,
    address?.email
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
    reset
  } = useForm<AddressForm>({
    defaultValues: {
      ...defaultAddress,
      country: defaultAddress.country ?? 'US'
    }
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
          if (
            data.validation_results?.messages &&
            data.validation_results?.messages?.length > 0
          ) {
            setModalOpen(true);
            setSuggestedAddress(data);
          } else {
            props.onSubmit(address);
          }
        } else {
          const errMessage = getErrorShippo(data);
          toast.error(errMessage);
        }
      })
      .catch(error => {
        setLoading(false);
        toast.error(getErrorShippo(error));
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

  const states = {
    AA: 'Select a state',
    AL: 'Alabama',
    AK: 'Alaska',
    AZ: 'Arizona',
    AR: 'Arkansas',
    CA: 'California',
    CO: 'Colorado',
    CT: 'Connecticut',
    DE: 'Delaware',
    FL: 'Florida',
    GA: 'Georgia',
    HI: 'Hawaii',
    ID: 'Idaho',
    IL: 'Illinois',
    IN: 'Indiana',
    IA: 'Iowa',
    KS: 'Kansas',
    KY: 'Kentucky',
    LA: 'Louisiana',
    ME: 'Maine',
    MD: 'Maryland',
    MA: 'Massachusetts',
    MI: 'Michigan',
    MN: 'Minnesota',
    MS: 'Mississippi',
    MO: 'Missouri',
    MT: 'Montana',
    NE: 'Nebraska',
    NV: 'Nevada',
    NH: 'New Hampshire',
    NJ: 'New Jersey',
    NM: 'New Mexico',
    NY: 'New York',
    NC: 'North Carolina',
    ND: 'North Dakota',
    OH: 'Ohio',
    OK: 'Oklahoma',
    OR: 'Oregon',
    PA: 'Pennsylvania',
    RI: 'Rhode Island',
    SC: 'South Carolina',
    SD: 'South Dakota',
    TN: 'Tennessee',
    TX: 'Texas',
    UT: 'Utah',
    VT: 'Vermont',
    VA: 'Virginia',
    WA: 'Washington',
    WV: 'West Virginia',
    WI: 'Wisconsin',
    WY: 'Wyoming'
  };

  const reactHookFormInput = (
    name: keyof AddressForm,
    displayName: string,
    type: HTMLInputTypeAttribute,
    options: RegisterOptions = {},
    className: string = '',
    extraProps: any = {}
  ) => {
    return (
      <label
        htmlFor={name}
        className={cn('input-field', className, { error: !!errors[name] })}
      >
        {displayName}
        <input
          type={type}
          {...register(name, options)}
          autoComplete="true"
          {...extraProps}
        />
      </label>
    );
  };

  const reactHookFormSelectInput = (
    name: keyof AddressForm,
    displayName: string,
    values: string[],
    keys = values,
    options: RegisterOptions = {},
    className: string = ''
  ) => {
    return (
      <label
        htmlFor={name}
        className={cn('input-field', className, { error: !!errors[name] })}
      >
        {displayName}
        <select {...register(name, options)} autoComplete="true">
          {keys.map((key, index) => (
            <option key={key} value={key} disabled={index === 0}>
              {values[index]}
            </option>
          ))}
        </select>
      </label>
    );
  };

  return (
    <>
      <section className="flex justify-center w-full">
        <form
          className="flex flex-col self-stretch w-full max-w-4xl gap-2"
          autoComplete="true"
        >
          <div className="flex flex-col w-full gap-2 md:flex-row">
            {reactHookFormInput(
              'firstName',
              'First Name',
              'text',
              { required: true },
              'flex-1'
            )}
            {reactHookFormInput(
              'lastName',
              'Last Name',
              'text',
              { required: true },
              'flex-1'
            )}
          </div>
          {reactHookFormInput('addressLine1', 'Address Line 1', 'text', {
            required: true
          })}
          {reactHookFormInput('addressLine2', 'Address Line 2', 'text')}
          {reactHookFormInput('addressLine3', 'Address Line 3', 'text')}
          {reactHookFormInput('locality', 'City', 'text', {
            required: true
          })}
          {reactHookFormSelectInput(
            'administrativeDistrictLevel1',
            'State',
            Object.values(states),
            Object.keys(states),
            { required: true, value: 'AA' }
          )}
          {reactHookFormInput('postalCode', 'Postal Code', 'text', {
            required: true,
            min: 5
          })}
          {reactHookFormInput(
            'country',
            'Country',
            'text',
            { value: 'US' },
            '',
            { disabled: true }
          )}
          <label
            htmlFor="phoneNumber"
            className={cn('input-field', { error: !!errors.phoneNumber })}
          >
            Phone
            <Controller
              name="phoneNumber"
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, value } }) => (
                <PhoneInput
                  value={value}
                  onChange={onChange}
                  defaultCountry="US"
                  id="phoneNumber"
                />
              )}
            />
          </label>
          {errors.phoneNumber && (
            <p className="error-message">{errors.phoneNumber.message}</p>
          )}
          <Button role="submit" type="submit" onClick={handleSubmit(onSubmit)}>
            Submit
          </Button>
        </form>
      </section>
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
            <div className="flex-1 p-2 border border-black">
              <strong>Your address:</strong>
              {addressDisplay(userEnteredAddress)}
            </div>
            <div className="flex-1 p-2 border border-black">
              <strong>Suggested address:</strong>
              {addressDisplay(convertShippoToSquare(suggestedAddress))}
            </div>
          </div>
          <div className="absolute flex gap-2 bottom-6 right-6">
            <Button onClick={() => modalHandler(false)} intent="danger">
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
