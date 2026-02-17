import { useMutation } from '@tanstack/react-query';

import { registerUser } from '@/features/auth/api/auth.storage';

export const useRegister = () =>
  useMutation({
    mutationFn: registerUser,
  });
