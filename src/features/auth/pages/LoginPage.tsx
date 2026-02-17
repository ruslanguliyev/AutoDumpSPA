import AuthLayout from '@/features/auth/components/AuthLayout';
import LoginForm from '@/features/auth/components/LoginForm';

const LoginPage = () => {
  return (
    <AuthLayout
      title="Sign in to AutoDump"
      subtitle="Access your listings, profiles and drafts."
      footerNote="© 2024 AutoDump Enterprise Solutions. All rights reserved."
    >
      <LoginForm />
    </AuthLayout>
  );
};

export default LoginPage;
