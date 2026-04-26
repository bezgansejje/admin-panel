import { ProtectedShell } from '@/components/ProtectedShell';
import { PageHeader } from '@/components/PageHeader';
import { UserManager } from '@/components/UserManager';

export default function UsersPage() {
  return (
    <ProtectedShell>
      <PageHeader
        title="Пользователи"
        description="Управление учетными записями, ролями и статусами доступа."
      />
      <UserManager />
    </ProtectedShell>
  );
}
