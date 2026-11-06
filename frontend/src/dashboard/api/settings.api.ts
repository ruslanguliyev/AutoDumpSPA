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

  /** Returns a fresh access token: the old one (and every other session) is revoked by the server. */
  changePassword: (currentPassword: string, newPassword: string) =>
    gqlRequest<{ changePassword: { accessToken: string } }>(
      `mutation($currentPassword: String!, $newPassword: String!) {
        changePassword(input: { currentPassword: $currentPassword, newPassword: $newPassword }) {
          accessToken
        }
      }`,
      { currentPassword, newPassword },
    ).then((d) => d.changePassword.accessToken),

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
