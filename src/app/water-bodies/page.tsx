import { ProtectedShell } from '@/components/ProtectedShell';
import { PageHeader } from '@/components/PageHeader';
import { WaterBodyManager } from '@/components/WaterBodyManager';

export default function WaterBodiesPage() {
  return (
    <ProtectedShell>
      <PageHeader
        title="Водоемы"
        description="Справочник водоемов, паспортные данные и переход к экологическим замерам."
      />
      <WaterBodyManager />
    </ProtectedShell>
  );
}
