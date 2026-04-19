import { useTranslation } from 'react-i18next';

import AuthLayout from '@/features/auth/components/AuthLayout';
import LoginForm from '@/features/auth/components/LoginForm';

const LoginPage = () => {
  const { t } = useTranslation('auth');
  return (
    <AuthLayout
      title={t('login.title')}
      subtitle={t('login.subtitle')}
      footerNote={t('login.footerNote')}
    >
      <LoginForm />
    </AuthLayout>
  );
};

export default LoginPage;
