import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function OfficialLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get('official_session')?.value;

  // Protect all routes inside /official except /official/login
  // But wait, layout applies to all children including login!
  // It's better to put this check inside a specific layout or in the page.tsx itself.
  return <>{children}</>;
}
