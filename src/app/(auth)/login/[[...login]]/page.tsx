import { SignIn } from '@clerk/nextjs';

export default function LoginPage() {
  return (
    <div className="h-full flex justify-center items-center py-8">
      <SignIn />
    </div>
  );
}
