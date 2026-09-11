import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, LogOut, UserRound } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { z } from 'zod';
import { nameField, passwordField } from '#shared/schemas';
import { PageHeader } from '../../components/PageHeader.jsx';
import { Badge } from '../../components/ui/Badge.jsx';
import { Button } from '../../components/ui/Button.jsx';
import { Card, CardBody, CardHeader } from '../../components/ui/Card.jsx';
import { Input } from '../../components/ui/Field.jsx';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { userService } from '../../services/index.js';
import { useAuthStore } from '../../store/authStore.js';
import { toast } from '../../store/toastStore.js';
import { formatDate } from '../../utils/format.js';

const profileSchema = z.object({ name: nameField });
const passwordSchema = z
  .object({ currentPassword: z.string().min(1, 'Enter your current password'), newPassword: passwordField, confirm: z.string() })
  .refine((v) => v.newPassword === v.confirm, { path: ['confirm'], message: 'Passwords do not match' });

export default function SettingsPage() {
  useDocumentTitle('Settings');
  const { user, setUser, logout } = useAuthStore();
  const navigate = useNavigate();

  const profile = useForm({ resolver: zodResolver(profileSchema), defaultValues: { name: user.name } });
  const password = useForm({ resolver: zodResolver(passwordSchema), defaultValues: { currentPassword: '', newPassword: '', confirm: '' } });

  const saveProfile = async (values) => {
    try {
      const { user: updated } = await userService.updateMe(values);
      setUser(updated);
      profile.reset({ name: updated.name });
      toast.success('Profile updated');
    } catch (err) {
      toast.fromError(err);
    }
  };

  const savePassword = async ({ currentPassword, newPassword }) => {
    try {
      await userService.updateMe({ currentPassword, newPassword });
      password.reset();
      toast.success('Password changed. Other sessions have been signed out.');
    } catch (err) {
      Object.entries(err.fieldErrors?.() ?? {}).forEach(([name, message]) => password.setError(name, { message }));
      if (!err.details) toast.fromError(err);
    }
  };

  return (
    <div className="max-w-3xl animate-rise">
      <PageHeader title="Settings" description="Manage your profile and account security." />

      <div className="space-y-6">
        <Card>
          <CardHeader icon={UserRound} title="Profile" />
          <CardBody>
            <form onSubmit={profile.handleSubmit(saveProfile)} className="space-y-4" noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="Full name" error={profile.formState.errors.name?.message} {...profile.register('name')} />
                <Input label="Email" value={user.email} disabled hint="Contact support to change your email." readOnly />
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
                <Badge tone="brand">{user.plan === 'GROWTH' ? 'Growth' : 'Starter'} plan</Badge>
                {user.role === 'admin' && <Badge tone="dark">Admin</Badge>}
                <span>Member since {formatDate(user.createdAt)}</span>
              </div>
              <div className="flex justify-end">
                <Button type="submit" loading={profile.formState.isSubmitting} disabled={!profile.formState.isDirty}>
                  Save profile
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardHeader icon={KeyRound} title="Password" description="Changing your password signs you out everywhere else." />
          <CardBody>
            <form onSubmit={password.handleSubmit(savePassword)} className="space-y-4" noValidate>
              <Input label="Current password" type="password" autoComplete="current-password" error={password.formState.errors.currentPassword?.message} {...password.register('currentPassword')} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input label="New password" type="password" autoComplete="new-password" error={password.formState.errors.newPassword?.message} {...password.register('newPassword')} />
                <Input label="Confirm new password" type="password" autoComplete="new-password" error={password.formState.errors.confirm?.message} {...password.register('confirm')} />
              </div>
              <div className="flex justify-end">
                <Button type="submit" loading={password.formState.isSubmitting}>
                  Change password
                </Button>
              </div>
            </form>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-slate-900">Sign out</p>
              <p className="text-sm text-slate-500">End your session on this device.</p>
            </div>
            <Button
              variant="secondary"
              icon={LogOut}
              onClick={async () => {
                await logout();
                navigate('/login');
              }}
            >
              Sign out
            </Button>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
