import { SignUp } from '@clerk/nextjs';

export default function SignupPage() {
  return (
    <div className="h-full flex justify-center items-center py-8">
      <SignUp fallbackRedirectUrl="/welcome" forceRedirectUrl="/welcome" />
    </div>
  );
}
