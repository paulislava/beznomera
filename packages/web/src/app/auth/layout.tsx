export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-[#1a1a2e] dark:via-[#16213e] dark:to-[#0f3460]'>
      {children}
    </div>
  );
}
