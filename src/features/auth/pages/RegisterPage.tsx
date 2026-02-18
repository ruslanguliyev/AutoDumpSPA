import { useTranslation } from 'react-i18next';

import AuthLayout from '@/features/auth/components/AuthLayout';
import RegisterForm from '@/features/auth/components/RegisterForm';

const RegisterPage = () => {
  const { t } = useTranslation('auth');
  return (
    <AuthLayout
      title={t('register.title')}
      subtitle={t('register.subtitle')}
      footerNote={t('register.footerNote')}
    >
      <RegisterForm />
    </AuthLayout>
  );
};

export default RegisterPage;
