import * as React from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-radial from-background via-muted/30 to-background p-4 sm:p-8">
      <div className="w-full max-w-md space-y-6">
        {children}
      </div>
    </div>
  );
}
