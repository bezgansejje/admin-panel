import Link from 'next/link';
import { ProtectedShell } from '@/components/ProtectedShell';
import { WaterBodyDetails } from '@/components/WaterBodyDetails';

export default async function WaterBodyDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <ProtectedShell>
      <div className="topbar">
        <div>
          <h1 className="page-title">Карточка водоема</h1>
          <div className="muted">
            Просмотр паспорта водоема, графика показателей и экологических замеров.
          </div>
        </div>

        <Link className="btn secondary" href="/water-bodies">
          Назад
        </Link>
      </div>

      <WaterBodyDetails id={id} />
    </ProtectedShell>
  );
}
