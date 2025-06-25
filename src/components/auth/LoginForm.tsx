'use client';

import { useState } from 'react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ email, password }); // Pour l'instant, on log les données
  };

  return (
    
    <div className=" bg-neutral-900 self-start mt-24 pt-14 pb-16 px-14 rounded-2xl">
      <div className="inline-flex flex-col justify-center items-center gap-8">
        <div className="self-stretch flex flex-col justify-start items-start gap-6">
          <div className="self-stretch text-center justify-start text-white text-5xl font-bold  pb-4">Sign into STLD</div>
          <div className="self-stretch flex flex-col justify-center items-center gap-4 ">
            <div className="w-[500px] h-16 px-4 py-5 bg-neutral-800 rounded-md inline-flex justify-start items-center gap-3">
              <div className="justify-start text-neutral-400 text-xl font-normal">Email</div>
            </div>
            <div className="w-[500px] h-16 px-4 py-5 bg-neutral-800 rounded-md inline-flex justify-start items-center gap-3">
              <div className="justify-start text-neutral-400 text-xl font-normal">Password</div>
            </div>
          </div>
        </div>
        <div className=" w-full px-2 py-4 bg-[#D74C34] rounded-md inline-flex justify-center items-center">
          <div className="text-center justify-center text-black text-2xl font-semibold">Sign In</div>
        </div>
        <div className="px-6 sm:px-0 max-w-sm">
          <div className="w-full py-8" />
          <button type="button" className="text-white w-full bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center justify-between mr-2 mb-2">
            <svg className="mr-2 -ml-1 w-4 h-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
              <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z">
              </path>
            </svg>
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}
