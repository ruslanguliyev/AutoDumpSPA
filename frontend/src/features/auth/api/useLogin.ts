import { useMutation } from '@tanstack/react-query';

import { loginUser } from '@/features/auth/api/auth.storage';

export const useLogin = () =>
  useMutation({
    mutationFn: loginUser,
  });
