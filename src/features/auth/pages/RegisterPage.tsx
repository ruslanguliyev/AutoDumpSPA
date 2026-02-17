import AuthLayout from '@/features/auth/components/AuthLayout';
import RegisterForm from '@/features/auth/components/RegisterForm';

const RegisterPage = () => {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Access marketplace features and manage your profiles."
      footerNote="© 2024 AutoDump Inc. Enterprise Automotive Solutions."
    >
      <RegisterForm />
    </AuthLayout>
  );
};

export default RegisterPage;
