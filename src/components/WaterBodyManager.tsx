'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { WaterBody } from '@/types';
import { ActionIcon } from './ActionIcon';

type WaterBodyForm = {
  name: string;
  district: string;
  latitude: string;
  longitude: string;
  imageUrl: string;
};

const emptyForm: WaterBodyForm = {
  name: '',
  district: '',
  latitude: '',
  longitude: '',
  imageUrl: '',
};

function toNumber(value: string): number | undefined {
  if (!value.trim()) return undefined;

  const num = Number(value);
  return Number.isNaN(num) ? undefined : num;
}

export function WaterBodyManager() {
  const [items, setItems] = useState<WaterBody[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState<WaterBodyForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  async function load() {
    try {
      setLoading(true);
      setError('');
      const data = await api.getWaterBodies();
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось загрузить водоемы');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function submit() {
    try {
      if (!form.name.trim()) {
        alert('Введите название водоема');
        return;
      }

      const payload = {
        name: form.name.trim(),
        district: form.district.trim() || undefined,
        latitude: toNumber(form.latitude),
        longitude: toNumber(form.longitude),
        imageUrl: form.imageUrl.trim() || undefined,
      };

      if (editingId) {
        await api.updateWaterBody(editingId, payload);
      } else {
        await api.createWaterBody(payload);
      }

      setForm(emptyForm);
      setEditingId(null);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Не удалось сохранить водоем');
    }
  }

  async function remove(id: string) {
    if (!confirm('Удалить водоем?')) return;

    try {
      await api.deleteWaterBody(id);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Не удалось удалить водоем');
    }
  }

  function startEdit(item: WaterBody) {
    setEditingId(item.id);
    setForm({
      name: item.name || '',
      district: item.district || '',
      latitude: item.latitude != null ? String(item.latitude) : '',
      longitude: item.longitude != null ? String(item.longitude) : '',
      imageUrl: item.imageUrl || '',
    });
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  // Фильтрация водоемов по поисковому запросу
  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase().trim();
    return (
      item.name.toLowerCase().includes(query) ||
      (item.district && item.district.toLowerCase().includes(query)) ||
      (item.latitude?.toString().includes(query)) ||
      (item.longitude?.toString().includes(query))
    );
  });

  return (
    <div className="stack">
      <div className="card stack">
        <h3>{editingId ? 'Редактирование водоема' : 'Создание водоема'}</h3>

        <div className="form-grid">
          <label className="field">
            <span>Название водоема</span>
            <input
              placeholder="Введите название"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </label>

          <label className="field">
            <span>Район</span>
            <input
              placeholder="Введите район"
              value={form.district}
              onChange={(e) => setForm({ ...form, district: e.target.value })}
            />
          </label>

          <label className="field">
            <span>Широта</span>
            <input
              placeholder="Например: 54.8721"
              value={form.latitude}
              onChange={(e) => setForm({ ...form, latitude: e.target.value })}
            />
          </label>

          <label className="field">
            <span>Долгота</span>
            <input
              placeholder="Например: 69.1430"
              value={form.longitude}
              onChange={(e) => setForm({ ...form, longitude: e.target.value })}
            />
          </label>

          <label className="field">
            <span>Ссылка на изображение</span>
            <input
              placeholder="https://... или /images/..."
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            />
          </label>
        </div>

        {form.imageUrl ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img
              src={form.imageUrl}
              alt="Превью водоема"
              className="table-thumb"
              style={{ width: 120, height: 80, borderRadius: 16 }}
            />
            <span className="muted">Превью изображения</span>
          </div>
        ) : null}

        <div className="actions">
          <button className="btn" type="button" onClick={submit}>
            {editingId ? 'Сохранить' : 'Создать'}
          </button>

          <button className="btn secondary" type="button" onClick={resetForm}>
            Очистить
          </button>
        </div>
      </div>

      <div className="card">
        <div className="topbar" style={{ padding: 0, marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>Водоемы</h3>
        </div>

        {/* Поиск в стиле формы создания */}
        <div className="form-grid" style={{ marginBottom: 20 }}>
          <label className="field">
            <span>Поиск водоемов</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по названию, району, широте или долготе..."
            />
          </label>
          {searchQuery && (
            <div style={{ gridColumn: '1 / -1', marginTop: -8 }}>
              <div style={{ fontSize: 14, color: '#666', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Найдено: {filteredItems.length} из {items.length} водоемов</span>
                <button
                  onClick={() => setSearchQuery('')}
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

        {loading && <p>Загрузка...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Название</th>
                <th>Район</th>
                <th>Изображение</th>
                <th>Широта</th>
                <th>Долгота</th>
                <th>Действия</th>
              </tr>
            </thead>

            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.district || '—'}</td>
                  <td>
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="table-thumb"
                      />
                    ) : (
                      <span className="badge" style={{ background: '#eef3fb', color: '#345dd8' }}>
                        Нет
                      </span>
                    )}
                  </td>
                  <td>{item.latitude ?? '—'}</td>
                  <td>{item.longitude ?? '—'}</td>

                  <td>
                    <div className="actions table-actions">
                      <Link
                        className="btn details icon"
                        href={`/water-bodies/${item.id}`}
                        title="Открыть карточку"
                        aria-label="Открыть карточку"
                      >
                        <ActionIcon name="details" />
                      </Link>

                      <button
                        className="btn edit icon"
                        type="button"
                        title="Редактировать"
                        aria-label="Редактировать"
                        onClick={() => startEdit(item)}
                      >
                        <ActionIcon name="edit" />
                      </button>

                      <button
                        className="btn delete icon"
                        type="button"
                        title="Удалить"
                        aria-label="Удалить"
                        onClick={() => void remove(item.id)}
                      >
                        <ActionIcon name="delete" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && filteredItems.length === 0 ? (
                <td>
                  <td colSpan={6}>
                    {searchQuery ? 'Водоемы не найдены по вашему запросу' : 'Водоемы не найдены'}
                  </td>
                </td>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}