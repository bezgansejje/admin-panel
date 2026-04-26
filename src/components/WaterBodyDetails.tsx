'use client';

import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';
import { formatDate } from '@/utils/format';
import { Measurement, WaterBody, WaterBodyPassport } from '@/types';
import { ActionIcon } from './ActionIcon';
import { WaterQualityChart } from './WaterQualityChart';

type MeasurementForm = {
  recordDate: string;
  ph: string;
  turbidity: string;
  dissolvedGases: string;
  biogenicCompounds: string;
  permanganateOxid: string;
  mineralization: string;
  salinity: string;
  hardness: string;
  calcium: string;
  magnesium: string;
  chlorides: string;
  sulfates: string;
  hydrocarbonates: string;
  potassiumSodium: string;
  overgrowthPercent: string;
  overgrowthDegree: string;
  phytoplanktonDev: string;
  zooplanktonTaxa: string;
  zooplanktonGroups: string;
  zoobenthosTaxa: string;
  zoobenthosGroups: string;
  trophicStatus: string;
};

type PassportForm = {
  area: string;
  overgrowthArea: string;
  altitude: string;
  length: string;
  maxWidth: string;
  coastlineLength: string;
  coastlineDev: string;
  catchmentArea: string;
  currentDepth: string;
  maxDepth: string;
  avgDepth: string;
  volume: string;
  fisheryType: string;
  fishProductivity: string;
  economicDesc: string;
  waterProtectionZone: string;
  waterProtectionStrip: string;
  ichthyofauna: string;
  mammals: string;
  invertebrates: string;
};

type SectionId = 'overview' | 'passport' | 'measurements' | 'history';

const emptyMeasurementForm: MeasurementForm = {
  recordDate: '',
  ph: '',
  turbidity: '',
  dissolvedGases: '',
  biogenicCompounds: '',
  permanganateOxid: '',
  mineralization: '',
  salinity: '',
  hardness: '',
  calcium: '',
  magnesium: '',
  chlorides: '',
  sulfates: '',
  hydrocarbonates: '',
  potassiumSodium: '',
  overgrowthPercent: '',
  overgrowthDegree: '',
  phytoplanktonDev: '',
  zooplanktonTaxa: '',
  zooplanktonGroups: '',
  zoobenthosTaxa: '',
  zoobenthosGroups: '',
  trophicStatus: '',
};

const emptyPassportForm: PassportForm = {
  area: '',
  overgrowthArea: '',
  altitude: '',
  length: '',
  maxWidth: '',
  coastlineLength: '',
  coastlineDev: '',
  catchmentArea: '',
  currentDepth: '',
  maxDepth: '',
  avgDepth: '',
  volume: '',
  fisheryType: '',
  fishProductivity: '',
  economicDesc: '',
  waterProtectionZone: '',
  waterProtectionStrip: '',
  ichthyofauna: '',
  mammals: '',
  invertebrates: '',
};

const sectionOptions: { id: SectionId; label: string; hint: string }[] = [
  { id: 'overview', label: 'Обзор', hint: 'Краткая информация по водоему' },
  { id: 'passport', label: 'Паспорт', hint: 'Паспортные данные и описание' },
  { id: 'measurements', label: 'Замеры', hint: 'Быстрое добавление и редактирование' },
  { id: 'history', label: 'История', hint: 'График и список всех записей' },
];

function toNumber(value: string): number | undefined {
  if (!value.trim()) return undefined;
  const n = Number(value);
  return Number.isNaN(n) ? undefined : n;
}

function buildMeasurementPayload(form: MeasurementForm) {
  return {
    recordDate: form.recordDate
      ? new Date(`${form.recordDate}T00:00:00.000Z`).toISOString()
      : undefined,
    ph: toNumber(form.ph),
    turbidity: toNumber(form.turbidity),
    dissolvedGases: form.dissolvedGases.trim() || undefined,
    biogenicCompounds: form.biogenicCompounds.trim() || undefined,
    permanganateOxid: toNumber(form.permanganateOxid),
    mineralization: toNumber(form.mineralization),
    salinity: toNumber(form.salinity),
    hardness: toNumber(form.hardness),
    calcium: toNumber(form.calcium),
    magnesium: toNumber(form.magnesium),
    chlorides: toNumber(form.chlorides),
    sulfates: toNumber(form.sulfates),
    hydrocarbonates: toNumber(form.hydrocarbonates),
    potassiumSodium: toNumber(form.potassiumSodium),
    overgrowthPercent: toNumber(form.overgrowthPercent),
    overgrowthDegree: form.overgrowthDegree.trim() || undefined,
    phytoplanktonDev: form.phytoplanktonDev.trim() || undefined,
    zooplanktonTaxa: form.zooplanktonTaxa.trim() || undefined,
    zooplanktonGroups: form.zooplanktonGroups.trim() || undefined,
    zoobenthosTaxa: form.zoobenthosTaxa.trim() || undefined,
    zoobenthosGroups: form.zoobenthosGroups.trim() || undefined,
    trophicStatus: form.trophicStatus.trim() || undefined,
  };
}

function measurementToForm(m: Measurement): MeasurementForm {
  return {
    recordDate: m.recordDate ? String(m.recordDate).slice(0, 10) : '',
    ph: m.ph != null ? String(m.ph) : '',
    turbidity: m.turbidity != null ? String(m.turbidity) : '',
    dissolvedGases: m.dissolvedGases || '',
    biogenicCompounds: m.biogenicCompounds || '',
    permanganateOxid: m.permanganateOxid != null ? String(m.permanganateOxid) : '',
    mineralization: m.mineralization != null ? String(m.mineralization) : '',
    salinity: m.salinity != null ? String(m.salinity) : '',
    hardness: m.hardness != null ? String(m.hardness) : '',
    calcium: m.calcium != null ? String(m.calcium) : '',
    magnesium: m.magnesium != null ? String(m.magnesium) : '',
    chlorides: m.chlorides != null ? String(m.chlorides) : '',
    sulfates: m.sulfates != null ? String(m.sulfates) : '',
    hydrocarbonates: m.hydrocarbonates != null ? String(m.hydrocarbonates) : '',
    potassiumSodium: m.potassiumSodium != null ? String(m.potassiumSodium) : '',
    overgrowthPercent: m.overgrowthPercent != null ? String(m.overgrowthPercent) : '',
    overgrowthDegree: m.overgrowthDegree || '',
    phytoplanktonDev: m.phytoplanktonDev || '',
    zooplanktonTaxa: m.zooplanktonTaxa || '',
    zooplanktonGroups: m.zooplanktonGroups || '',
    zoobenthosTaxa: m.zoobenthosTaxa || '',
    zoobenthosGroups: m.zoobenthosGroups || '',
    trophicStatus: m.trophicStatus || '',
  };
}

function passportToForm(passport?: WaterBodyPassport | null): PassportForm {
  return {
    area: passport?.area != null ? String(passport.area) : '',
    overgrowthArea: passport?.overgrowthArea != null ? String(passport.overgrowthArea) : '',
    altitude: passport?.altitude != null ? String(passport.altitude) : '',
    length: passport?.length != null ? String(passport.length) : '',
    maxWidth: passport?.maxWidth != null ? String(passport.maxWidth) : '',
    coastlineLength: passport?.coastlineLength != null ? String(passport.coastlineLength) : '',
    coastlineDev: passport?.coastlineDev != null ? String(passport.coastlineDev) : '',
    catchmentArea: passport?.catchmentArea != null ? String(passport.catchmentArea) : '',
    currentDepth: passport?.currentDepth != null ? String(passport.currentDepth) : '',
    maxDepth: passport?.maxDepth != null ? String(passport.maxDepth) : '',
    avgDepth: passport?.avgDepth != null ? String(passport.avgDepth) : '',
    volume: passport?.volume != null ? String(passport.volume) : '',
    fisheryType: passport?.fisheryType || '',
    fishProductivity: passport?.fishProductivity != null ? String(passport.fishProductivity) : '',
    economicDesc: passport?.economicDesc || '',
    waterProtectionZone: passport?.waterProtectionZone || '',
    waterProtectionStrip: passport?.waterProtectionStrip || '',
    ichthyofauna: passport?.ichthyofauna || '',
    mammals: passport?.mammals || '',
    invertebrates: passport?.invertebrates || '',
  };
}

function buildPassportPayload(form: PassportForm) {
  return {
    area: toNumber(form.area),
    overgrowthArea: toNumber(form.overgrowthArea),
    altitude: toNumber(form.altitude),
    length: toNumber(form.length),
    maxWidth: toNumber(form.maxWidth),
    coastlineLength: toNumber(form.coastlineLength),
    coastlineDev: toNumber(form.coastlineDev),
    catchmentArea: toNumber(form.catchmentArea),
    currentDepth: toNumber(form.currentDepth),
    maxDepth: toNumber(form.maxDepth),
    avgDepth: toNumber(form.avgDepth),
    volume: toNumber(form.volume),
    fisheryType: form.fisheryType.trim() || undefined,
    fishProductivity: toNumber(form.fishProductivity),
    economicDesc: form.economicDesc.trim() || undefined,
    waterProtectionZone: form.waterProtectionZone.trim() || undefined,
    waterProtectionStrip: form.waterProtectionStrip.trim() || undefined,
    ichthyofauna: form.ichthyofauna.trim() || undefined,
    mammals: form.mammals.trim() || undefined,
    invertebrates: form.invertebrates.trim() || undefined,
  };
}

export function WaterBodyDetails({ id }: { id: string }) {
  const [waterBody, setWaterBody] = useState<WaterBody | null>(null);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [passportForm, setPassportForm] = useState<PassportForm>(emptyPassportForm);
  const [form, setForm] = useState<MeasurementForm>(emptyMeasurementForm);
  const [activeSection, setActiveSection] = useState<SectionId>('overview');
  const [editingMeasurementId, setEditingMeasurementId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passportSaving, setPassportSaving] = useState(false);
  const [error, setError] = useState('');
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [historyPage, setHistoryPage] = useState(1);

  const measurementsPerPage = 15;

  async function load() {
    try {
      setLoading(true);
      setError('');

      const [bodyData, measurementsData] = await Promise.all([
        api.getWaterBodyById(id),
        api.getWaterBodyMeasurements(id),
      ]);

      setWaterBody(bodyData);
      setMeasurements(measurementsData);
      setPassportForm(passportToForm(bodyData.passport));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось загрузить данные водоема');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [id]);

  const latestMeasurement = useMemo(() => {
    return [...measurements]
      .filter((measurement) => measurement.recordDate)
      .sort(
        (a, b) =>
          new Date(b.recordDate ?? '').getTime() -
          new Date(a.recordDate ?? '').getTime(),
      )[0];
  }, [measurements]);

  // Фильтрация истории замеров по поисковому запросу
  const filteredMeasurements = measurements.filter((measurement) => {
    if (!historySearchQuery.trim()) return true;
    
    const query = historySearchQuery.toLowerCase().trim();
    return (
      (measurement.recordDate && formatDate(measurement.recordDate).toLowerCase().includes(query)) ||
      (measurement.ph != null && measurement.ph.toString().includes(query)) ||
      (measurement.turbidity != null && measurement.turbidity.toString().includes(query)) ||
      (measurement.trophicStatus && measurement.trophicStatus.toLowerCase().includes(query))
    );
  });

  // Пагинация
  const totalHistoryPages = Math.ceil(filteredMeasurements.length / measurementsPerPage);
  const paginatedMeasurements = filteredMeasurements.slice(
    (historyPage - 1) * measurementsPerPage,
    historyPage * measurementsPerPage
  );

  // Сброс страницы при изменении поиска
  useEffect(() => {
    setHistoryPage(1);
  }, [historySearchQuery]);

  // Корректировка текущей страницы если она выходит за пределы
  useEffect(() => {
    if (historyPage > totalHistoryPages && totalHistoryPages > 0) {
      setHistoryPage(totalHistoryPages);
    }
  }, [historyPage, totalHistoryPages]);

  function startEditMeasurement(m: Measurement) {
    setActiveSection('measurements');
    setEditingMeasurementId(m.id);
    setForm(measurementToForm(m));
  }

  function resetForm() {
    setForm(emptyMeasurementForm);
    setEditingMeasurementId(null);
  }

  async function handleSubmit() {
    try {
      setSaving(true);
      const payload = buildMeasurementPayload(form);

      if (editingMeasurementId) {
        await api.updateWaterBodyMeasurement(id, editingMeasurementId, payload);
      } else {
        await api.createWaterBodyMeasurement(id, payload);
      }

      resetForm();
      setActiveSection('history');
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Не удалось сохранить замер');
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteMeasurement(measurementId: string) {
    if (!confirm('Удалить замер?')) return;

    try {
      await api.deleteWaterBodyMeasurement(id, measurementId);
      if (editingMeasurementId === measurementId) {
        resetForm();
      }
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Не удалось удалить замер');
    }
  }

  async function handleSavePassport() {
    try {
      setPassportSaving(true);
      await api.updateWaterBodyPassport(id, { passport: buildPassportPayload(passportForm) });
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Не удалось сохранить паспорт');
    } finally {
      setPassportSaving(false);
    }
  }

  if (loading) {
    return <div className="card">Загрузка...</div>;
  }

  if (error) {
    return <div className="card" style={{ color: 'red' }}>{error}</div>;
  }

  if (!waterBody) {
    return <div className="card">Водоем не найден</div>;
  }

  return (
    <div className="stack">
      <div className="card stack">
        <div className="topbar">
          <div>
            <h2 style={{ margin: 0 }}>{waterBody.name}</h2>
            <div className="muted">Информация о водоеме и быстрый доступ к основным действиям.</div>
          </div>
          <div className="actions">
            <button
              className="btn"
              type="button"
              onClick={() => {
                resetForm();
                setActiveSection('measurements');
              }}
            >
              Добавить замер
            </button>
            <button
              className="btn secondary"
              type="button"
              onClick={() => setActiveSection('passport')}
            >
              Открыть паспорт
            </button>
          </div>
        </div>

        <div className="water-body-stats">
          <div className="info-chip">
            <span className="info-chip-label">Замеров</span>
            <strong>{measurements.length}</strong>
          </div>
          <div className="info-chip">
            <span className="info-chip-label">Последняя запись</span>
            <strong>
              {latestMeasurement?.recordDate
                ? formatDate(latestMeasurement.recordDate || undefined)
                : 'Нет данных'}
            </strong>
          </div>
          <div className="info-chip">
            <span className="info-chip-label">Район</span>
            <strong>{waterBody.district || 'Не указан'}</strong>
          </div>
        </div>

        <div className="detail-tabs">
          {sectionOptions.map((section) => (
            <button
              key={section.id}
              type="button"
              className={activeSection === section.id ? 'detail-tab active' : 'detail-tab'}
              onClick={() => setActiveSection(section.id)}
            >
              <span>{section.label}</span>
              <small>{section.hint}</small>
            </button>
          ))}
        </div>
      </div>

      {activeSection === 'overview' ? (
        <div className="card stack">
          <div className="section-heading">
            <div>
              <h3>Общая информация</h3>
              <div className="muted">
                Основные сведения по водоему без длинной формы и лишней прокрутки.
              </div>
            </div>
          </div>

          <div className="form-grid">
            <div>
              <strong>Район:</strong> {waterBody.district || '—'}
            </div>
            <div>
              <strong>Широта:</strong> {waterBody.latitude ?? '—'}
            </div>
            <div>
              <strong>Долгота:</strong> {waterBody.longitude ?? '—'}
            </div>
            <div>
              <strong>Паспорт заполнен:</strong> {waterBody.passport ? 'Да' : 'Нет'}
            </div>
            <div>
              <strong>Готово к вводу замеров:</strong> Да
            </div>
            <div className="field" style={{ gridColumn: '1 / -1' }}>
              <span>Ссылка на изображение</span>
              <input value={waterBody.imageUrl || ''} disabled />
            </div>
            {waterBody.imageUrl ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <img
                  src={waterBody.imageUrl}
                  alt={waterBody.name}
                  className="image-preview"
                  style={{ maxWidth: 260 }}
                />
                <span className="muted">Превью изображения</span>
              </div>
            ) : null}
          </div>

          <div className="actions">
            <button
              className="btn"
              type="button"
              onClick={() => {
                resetForm();
                setActiveSection('measurements');
              }}
            >
              Перейти к замерам
            </button>
            <button className="btn secondary" type="button" onClick={() => setActiveSection('history')}>
              Открыть историю
            </button>
          </div>
        </div>
      ) : null}

      {activeSection === 'passport' ? (
        <div className="card stack">
          <div className="section-heading">
            <div>
              <h3>Паспорт водоема</h3>
              <div className="muted">
                Все паспортные поля собраны отдельно и больше не мешают работе с замерами.
              </div>
            </div>
          </div>

          <div className="form-grid">
            <label className="field">
              <span>Площадь (га)</span>
              <input value={passportForm.area} onChange={(e) => setPassportForm({ ...passportForm, area: e.target.value })} />
            </label>
            <label className="field">
              <span>Площадь зарастания (га)</span>
              <input value={passportForm.overgrowthArea} onChange={(e) => setPassportForm({ ...passportForm, overgrowthArea: e.target.value })} />
            </label>
            <label className="field">
              <span>Высота (м)</span>
              <input value={passportForm.altitude} onChange={(e) => setPassportForm({ ...passportForm, altitude: e.target.value })} />
            </label>
            <label className="field">
              <span>Длина (км)</span>
              <input value={passportForm.length} onChange={(e) => setPassportForm({ ...passportForm, length: e.target.value })} />
            </label>
            <label className="field">
              <span>Макс. ширина (км)</span>
              <input value={passportForm.maxWidth} onChange={(e) => setPassportForm({ ...passportForm, maxWidth: e.target.value })} />
            </label>
            <label className="field">
              <span>Длина береговой линии (км)</span>
              <input value={passportForm.coastlineLength} onChange={(e) => setPassportForm({ ...passportForm, coastlineLength: e.target.value })} />
            </label>
            <label className="field">
              <span>Развитие береговой линии</span>
              <input value={passportForm.coastlineDev} onChange={(e) => setPassportForm({ ...passportForm, coastlineDev: e.target.value })} />
            </label>
            <label className="field">
              <span>Водосборная площадь (кв. км)</span>
              <input value={passportForm.catchmentArea} onChange={(e) => setPassportForm({ ...passportForm, catchmentArea: e.target.value })} />
            </label>
            <label className="field">
              <span>Текущая глубина (м)</span>
              <input value={passportForm.currentDepth} onChange={(e) => setPassportForm({ ...passportForm, currentDepth: e.target.value })} />
            </label>
            <label className="field">
              <span>Макс. глубина (м)</span>
              <input value={passportForm.maxDepth} onChange={(e) => setPassportForm({ ...passportForm, maxDepth: e.target.value })} />
            </label>
            <label className="field">
              <span>Средняя глубина (м)</span>
              <input value={passportForm.avgDepth} onChange={(e) => setPassportForm({ ...passportForm, avgDepth: e.target.value })} />
            </label>
            <label className="field">
              <span>Объем (млн м3)</span>
              <input value={passportForm.volume} onChange={(e) => setPassportForm({ ...passportForm, volume: e.target.value })} />
            </label>
            <label className="field">
              <span>Вид рыбного хозяйства</span>
              <input value={passportForm.fisheryType} onChange={(e) => setPassportForm({ ...passportForm, fisheryType: e.target.value })} />
            </label>
            <label className="field">
              <span>Рыбопродуктивность</span>
              <input value={passportForm.fishProductivity} onChange={(e) => setPassportForm({ ...passportForm, fishProductivity: e.target.value })} />
            </label>
            <label className="field" style={{ gridColumn: '1 / -1' }}>
              <span>Хозяйственная характеристика</span>
              <textarea value={passportForm.economicDesc} onChange={(e) => setPassportForm({ ...passportForm, economicDesc: e.target.value })} />
            </label>
            <label className="field">
              <span>Водоохранная зона</span>
              <input value={passportForm.waterProtectionZone} onChange={(e) => setPassportForm({ ...passportForm, waterProtectionZone: e.target.value })} />
            </label>
            <label className="field">
              <span>Водоохранная полоса</span>
              <input value={passportForm.waterProtectionStrip} onChange={(e) => setPassportForm({ ...passportForm, waterProtectionStrip: e.target.value })} />
            </label>
            <label className="field" style={{ gridColumn: '1 / -1' }}>
              <span>Ихтиофауна</span>
              <textarea value={passportForm.ichthyofauna} onChange={(e) => setPassportForm({ ...passportForm, ichthyofauna: e.target.value })} />
            </label>
            <label className="field" style={{ gridColumn: '1 / -1' }}>
              <span>Млекопитающие</span>
              <textarea value={passportForm.mammals} onChange={(e) => setPassportForm({ ...passportForm, mammals: e.target.value })} />
            </label>
            <label className="field" style={{ gridColumn: '1 / -1' }}>
              <span>Беспозвоночные</span>
              <textarea value={passportForm.invertebrates} onChange={(e) => setPassportForm({ ...passportForm, invertebrates: e.target.value })} />
            </label>
          </div>

          <div className="actions">
            <button className="btn" type="button" onClick={handleSavePassport} disabled={passportSaving}>
              {passportSaving ? 'Сохранение...' : 'Сохранить паспорт'}
            </button>
            <button className="btn secondary" type="button" onClick={() => setActiveSection('measurements')}>
              К замерам
            </button>
          </div>
        </div>
      ) : null}

      {activeSection === 'measurements' ? (
        <div className="card stack">
          <div className="section-heading">
            <div>
              <h3>{editingMeasurementId ? 'Редактирование замера' : 'Добавление замера'}</h3>
              <div className="muted">
                Форма вынесена в отдельный раздел, чтобы можно было быстро вносить данные без прокрутки всей карточки.
              </div>
            </div>
            <span className="badge">
              {editingMeasurementId ? 'Режим редактирования' : 'Новая запись'}
            </span>
          </div>

          <div className="form-grid">
            <label className="field">
              <span>Дата записи</span>
              <input type="date" value={form.recordDate} onChange={(e) => setForm({ ...form, recordDate: e.target.value })} />
            </label>
            <label className="field">
              <span>pH</span>
              <input value={form.ph} onChange={(e) => setForm({ ...form, ph: e.target.value })} />
            </label>
            <label className="field">
              <span>Мутность</span>
              <input value={form.turbidity} onChange={(e) => setForm({ ...form, turbidity: e.target.value })} />
            </label>
            <label className="field">
              <span>Растворенные газы</span>
              <input value={form.dissolvedGases} onChange={(e) => setForm({ ...form, dissolvedGases: e.target.value })} />
            </label>
            <label className="field">
              <span>Биогенные соединения</span>
              <input value={form.biogenicCompounds} onChange={(e) => setForm({ ...form, biogenicCompounds: e.target.value })} />
            </label>
            <label className="field">
              <span>Перманганатная окисляемость</span>
              <input value={form.permanganateOxid} onChange={(e) => setForm({ ...form, permanganateOxid: e.target.value })} />
            </label>
            <label className="field">
              <span>Минерализация</span>
              <input value={form.mineralization} onChange={(e) => setForm({ ...form, mineralization: e.target.value })} />
            </label>
            <label className="field">
              <span>Соленость</span>
              <input value={form.salinity} onChange={(e) => setForm({ ...form, salinity: e.target.value })} />
            </label>
            <label className="field">
              <span>Жесткость</span>
              <input value={form.hardness} onChange={(e) => setForm({ ...form, hardness: e.target.value })} />
            </label>
            <label className="field">
              <span>Кальций</span>
              <input value={form.calcium} onChange={(e) => setForm({ ...form, calcium: e.target.value })} />
            </label>
            <label className="field">
              <span>Магний</span>
              <input value={form.magnesium} onChange={(e) => setForm({ ...form, magnesium: e.target.value })} />
            </label>
            <label className="field">
              <span>Хлориды</span>
              <input value={form.chlorides} onChange={(e) => setForm({ ...form, chlorides: e.target.value })} />
            </label>
            <label className="field">
              <span>Сульфаты</span>
              <input value={form.sulfates} onChange={(e) => setForm({ ...form, sulfates: e.target.value })} />
            </label>
            <label className="field">
              <span>Гидрокарбонаты</span>
              <input value={form.hydrocarbonates} onChange={(e) => setForm({ ...form, hydrocarbonates: e.target.value })} />
            </label>
            <label className="field">
              <span>Калий + натрий</span>
              <input value={form.potassiumSodium} onChange={(e) => setForm({ ...form, potassiumSodium: e.target.value })} />
            </label>
            <label className="field">
              <span>Процент зарастания</span>
              <input value={form.overgrowthPercent} onChange={(e) => setForm({ ...form, overgrowthPercent: e.target.value })} />
            </label>
            <label className="field">
              <span>Степень зарастания</span>
              <input value={form.overgrowthDegree} onChange={(e) => setForm({ ...form, overgrowthDegree: e.target.value })} />
            </label>
            <label className="field">
              <span>Развитие фитопланктона</span>
              <input value={form.phytoplanktonDev} onChange={(e) => setForm({ ...form, phytoplanktonDev: e.target.value })} />
            </label>
            <label className="field" style={{ gridColumn: '1 / -1' }}>
              <span>Таксономия зоопланктона</span>
              <textarea value={form.zooplanktonTaxa} onChange={(e) => setForm({ ...form, zooplanktonTaxa: e.target.value })} />
            </label>
            <label className="field" style={{ gridColumn: '1 / -1' }}>
              <span>Группы зоопланктона</span>
              <textarea value={form.zooplanktonGroups} onChange={(e) => setForm({ ...form, zooplanktonGroups: e.target.value })} />
            </label>
            <label className="field" style={{ gridColumn: '1 / -1' }}>
              <span>Таксономия зообентоса</span>
              <textarea value={form.zoobenthosTaxa} onChange={(e) => setForm({ ...form, zoobenthosTaxa: e.target.value })} />
            </label>
            <label className="field" style={{ gridColumn: '1 / -1' }}>
              <span>Группы зообентоса</span>
              <textarea value={form.zoobenthosGroups} onChange={(e) => setForm({ ...form, zoobenthosGroups: e.target.value })} />
            </label>
            <label className="field" style={{ gridColumn: '1 / -1' }}>
              <span>Трофический статус</span>
              <input value={form.trophicStatus} onChange={(e) => setForm({ ...form, trophicStatus: e.target.value })} />
            </label>
          </div>

          <div className="actions">
            <button className="btn" type="button" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Сохранение...' : editingMeasurementId ? 'Сохранить' : 'Добавить'}
            </button>
            <button className="btn secondary" type="button" onClick={resetForm} disabled={saving}>
              Очистить
            </button>
            <button className="btn secondary" type="button" onClick={() => setActiveSection('history')}>
              К истории замеров
            </button>
          </div>
        </div>
      ) : null}

      {activeSection === 'history' ? (
        <>
          <div className="card stack">
            <div className="section-heading">
              <div>
                <h3>График показателей воды</h3>
                <div className="muted">
                  Аналитика и список замеров вынесены отдельно, чтобы не перегружать форму ввода.
                </div>
              </div>
            </div>
            <WaterQualityChart measurements={measurements} />
          </div>

          <div className="card stack">
            <div className="section-heading">
              <div>
                <h3>Экологические записи</h3>
                <div className="muted">
                  Здесь можно просматривать историю и быстро переходить к редактированию нужного замера.
                </div>
              </div>
            </div>

            {/* Поиск в истории */}
            <div className="form-grid" style={{ marginBottom: 20 }}>
              <label className="field">
                <span>🔍 Поиск в истории</span>
                <input
                  type="text"
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  placeholder="Поиск по дате, pH, мутности или трофическому статусу..."
                />
              </label>
              {historySearchQuery && (
                <div style={{ gridColumn: '1 / -1', marginTop: -8 }}>
                  <div style={{ fontSize: 14, color: '#666', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Найдено: {filteredMeasurements.length} из {measurements.length} записей</span>
                    <button
                      onClick={() => setHistorySearchQuery('')}
                      style={{
                        padding: '2px 8px',
                        fontSize: 12,
                        cursor: 'pointer',
                      }}
                      className="btn secondary"
                      type="button"
                    >
                      Очистить поиск
                    </button>
                  </div>
                </div>
              )}
            </div>

            {filteredMeasurements.length === 0 ? (
              <p>{historySearchQuery ? 'Записи не найдены по вашему запросу' : 'Записей пока нет'}</p>
            ) : (
              <>
                <div className="table-wrap">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Дата</th>
                        <th>pH</th>
                        <th>Мутность</th>
                        <th>Трофический статус</th>
                        <th>Действия</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedMeasurements.map((measurement) => (
                        <tr key={measurement.id}>
                          <td>{formatDate(measurement.recordDate || undefined)}</td>
                          <td>{measurement.ph ?? '—'}</td>
                          <td>{measurement.turbidity ?? '—'}</td>
                          <td>{measurement.trophicStatus || '—'}</td>
                          <td>
                            <div className="actions table-actions">
                              <button
                                className="btn edit icon"
                                type="button"
                                title="Редактировать замер"
                                aria-label="Редактировать замер"
                                onClick={() => startEditMeasurement(measurement)}
                              >
                                <ActionIcon name="edit" />
                              </button>
                              <button
                                className="btn delete icon"
                                type="button"
                                title="Удалить замер"
                                aria-label="Удалить замер"
                                onClick={() => void handleDeleteMeasurement(measurement.id)}
                              >
                                <ActionIcon name="delete" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Пагинация */}
                {totalHistoryPages > 1 && (
                  <div className="pagination" style={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    gap: '8px', 
                    marginTop: '20px',
                    flexWrap: 'wrap'
                  }}>
                    <button
                      type="button"
                      className="pagination-btn"
                      disabled={historyPage === 1}
                      onClick={() => setHistoryPage((prev) => Math.max(prev - 1, 1))}
                      style={{
                        padding: '6px 12px',
                        border: '1px solid #ddd',
                        background: historyPage === 1 ? '#f5f5f5' : 'white',
                        cursor: historyPage === 1 ? 'not-allowed' : 'pointer',
                        borderRadius: '4px'
                      }}
                    >
                      ← Назад
                    </button>

                    {Array.from({ length: totalHistoryPages }, (_, index) => {
                      const page = index + 1;
                      // Показываем максимум 5 страниц с текущей в центре
                      if (totalHistoryPages <= 7) {
                        return (
                          <button
                            key={page}
                            type="button"
                            className={historyPage === page ? 'pagination-btn active' : 'pagination-btn'}
                            onClick={() => setHistoryPage(page)}
                            style={{
                              padding: '6px 12px',
                              border: '1px solid #ddd',
                              background: historyPage === page ? '#007bff' : 'white',
                              color: historyPage === page ? 'white' : 'black',
                              cursor: 'pointer',
                              borderRadius: '4px'
                            }}
                          >
                            {page}
                          </button>
                        );
                      }
                      
                      // Показываем сокращенную пагинацию
                      if (page === 1 || page === totalHistoryPages || (page >= historyPage - 1 && page <= historyPage + 1)) {
                        return (
                          <button
                            key={page}
                            type="button"
                            className={historyPage === page ? 'pagination-btn active' : 'pagination-btn'}
                            onClick={() => setHistoryPage(page)}
                            style={{
                              padding: '6px 12px',
                              border: '1px solid #ddd',
                              background: historyPage === page ? '#007bff' : 'white',
                              color: historyPage === page ? 'white' : 'black',
                              cursor: 'pointer',
                              borderRadius: '4px'
                            }}
                          >
                            {page}
                          </button>
                        );
                      }
                      
                      // Показываем многоточие
                      if (page === 2 && historyPage > 3) {
                        return <span key="ellipsis1" style={{ padding: '6px 12px' }}>...</span>;
                      }
                      if (page === totalHistoryPages - 1 && historyPage < totalHistoryPages - 2) {
                        return <span key="ellipsis2" style={{ padding: '6px 12px' }}>...</span>;
                      }
                      
                      return null;
                    })}

                    <button
                      type="button"
                      className="pagination-btn"
                      disabled={historyPage === totalHistoryPages}
                      onClick={() => setHistoryPage((prev) => Math.min(prev + 1, totalHistoryPages))}
                      style={{
                        padding: '6px 12px',
                        border: '1px solid #ddd',
                        background: historyPage === totalHistoryPages ? '#f5f5f5' : 'white',
                        cursor: historyPage === totalHistoryPages ? 'not-allowed' : 'pointer',
                        borderRadius: '4px'
                      }}
                    >
                      Вперёд →
                    </button>
                  </div>
                )}
                
                {/* Информация о странице */}
                {totalHistoryPages > 1 && (
                  <div style={{ 
                    textAlign: 'center', 
                    marginTop: '12px', 
                    fontSize: '14px', 
                    color: '#666' 
                  }}>
                    Страница {historyPage} из {totalHistoryPages} · Показано {paginatedMeasurements.length} из {filteredMeasurements.length} записей
                  </div>
                )}
              </>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}