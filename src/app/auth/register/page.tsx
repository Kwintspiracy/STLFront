import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#131618] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <RegisterForm />
      </div>
    </div>
  );
}
