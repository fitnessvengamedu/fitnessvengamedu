import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import AdminPanelClient from '@/components/AdminPanelClient';

export const revalidate = 0; // Disable caching to ensure fresh admin data

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect('/signin');
  }

  // Fetch user role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard');
  }

  // Fetch all profiles
  const { data: allProfiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });

  // Fetch all subscriptions
  const { data: allSubscriptions, error: subsError } = await supabase
    .from('subscriptions')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <AdminPanelClient
      initialProfiles={allProfiles || []}
      initialSubscriptions={allSubscriptions || []}
    />
  );
}
