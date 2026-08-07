import { redirect } from 'next/navigation';
import { requireTenantSession } from '@/lib/requireAuth';
import SettingsPanel from '@/components/settingsPanel';

export default async function SettingsPage() {
  const auth = await requireTenantSession();
  if (!auth) redirect('/login');

  if (auth.session.role !== 'owner') {
    redirect('/dashboard');
  }

  return (
    <SettingsPanel
      tenantName={auth.tenant.name}
      subdomain={auth.tenant.subdomain}
      timezone={auth.tenant.timezone}
    />
  );
}