import { gqlRequest } from '@/lib/graphql';

export type AccountInfo = {
  id: string;
  email: string;
  fullName: string;
};

export type SellerProfile = {
  id: string;
  name: string;
  city: string;
  phone: string | null;
  showPhone: boolean;
};

export type SellerProfileInput = {
  name: string;
  city: string;
  /** Empty string removes the stored phone number. */
  phone: string;
  showPhone: boolean;
};

export const settingsApi = {
  me: () =>
    gqlRequest<{ me: AccountInfo }>(`query { me { id email fullName } }`).then((d) => d.me),

  updateName: (fullName: string) =>
    gqlRequest<{ updateProfile: AccountInfo }>(
      `mutation($fullName: String!) { updateProfile(input: { fullName: $fullName }) { id email fullName } }`,
      { fullName },
    ).then((d) => d.updateProfile),

  changePassword: (currentPassword: string, newPassword: string) =>
    gqlRequest<{ changePassword: boolean }>(
      `mutation($currentPassword: String!, $newPassword: String!) {
        changePassword(input: { currentPassword: $currentPassword, newPassword: $newPassword })
      }`,
      { currentPassword, newPassword },
    ).then((d) => d.changePassword),

  mySeller: () =>
    gqlRequest<{ mySeller: SellerProfile | null }>(
      `query { mySeller { id name city phone showPhone } }`,
    ).then((d) => d.mySeller),

  updateSeller: (input: SellerProfileInput) =>
    gqlRequest<{ updateSeller: SellerProfile }>(
      `mutation($input: UpdateSellerInput!) { updateSeller(input: $input) { id name city phone showPhone } }`,
      { input },
    ).then((d) => d.updateSeller),
};
