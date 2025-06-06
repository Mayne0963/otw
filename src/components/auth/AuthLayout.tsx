import type React from 'react';

import Link from 'next/link';
import Image from 'next/image';
import { Logo } from '../ui/logo';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Side - Branding */}
      <div className="hidden md:flex md:w-1/2 bg-black relative">
        <div className="absolute inset-0 bg-gradient-to-r from-black to-transparent z-10"></div>
        <Image
          src="/assets/images/otw-services-hero.jpg"
          alt="OTW Services"
          fill
          className="object-cover opacity-60"
          priority
          sizes="50vw"
        />
        <div className="relative z-20 flex flex-col justify-center items-center w-full p-12">
          <Link href="/" className="mb-8">
            <Logo size="large" variant="default" />
          </Link>
          <div className="max-w-md text-center">
            <h2 className="text-2xl font-bold mb-4 text-white">
              Thee Motion of the People
            </h2>
            <p className="text-gray-300">
              Join our community and experience the perfect blend of convenience
              and community service.
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#1A1A1A]">
        <div className="md:hidden text-center mb-10">
          <Link href="/" className="inline-block">
            <Logo size="medium" variant="default" />
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-white">{title}</h2>
            <p className="mt-2 text-sm text-gray-400">{subtitle}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
