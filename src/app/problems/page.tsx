import { ProtectedShell } from '@/components/ProtectedShell';
import { PageHeader } from '@/components/PageHeader';
import { ProblemManager } from '@/components/ProblemManager';
import { AIChat } from '@/components/AIChat';

export default function ProblemsPage() {
  return (
    <ProtectedShell>
      <PageHeader
        title="Проблемы"
        description="Список экологических проблем по водоемам и их текущий статус."
      />

      <ProblemManager />

      <AIChat /> {/* ВОТ ЧАТ */}
    </ProtectedShell>
  );
}