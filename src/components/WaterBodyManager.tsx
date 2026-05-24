'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { WaterBody } from '@/types';
import { ActionIcon } from './ActionIcon';

type WaterBodyForm = {
  name: string;
  district: string;
  imageUrl: string;
};

const emptyForm: WaterBodyForm = {
  name: '',
  district: '',
  imageUrl: '',
};

const ITEMS_PER_PAGE = 10;

export function WaterBodyManager() {
  const [items, setItems] = useState<WaterBody[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState<WaterBodyForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [boundariesFile, setBoundariesFile] = useState<File | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError('');
      const data = await api.getWaterBodies();
      setItems(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось загрузить водоёмы');
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
        alert('Введите название водоёма');
        return;
      }

      const payload = {
        name: form.name.trim(),
        district: form.district.trim() || undefined,
        imageUrl: form.imageUrl.trim() || undefined,
      };

      let savedWaterBody: WaterBody;

      if (editingId) {
        savedWaterBody = await api.updateWaterBody(editingId, payload);
      } else {
        savedWaterBody = await api.createWaterBody(payload);
      }

      if (boundariesFile) {
        await api.uploadWaterBodyBoundaries(savedWaterBody.id, boundariesFile);
      }

      setForm(emptyForm);
      setBoundariesFile(null);
      setEditingId(null);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Не удалось сохранить водоём');
    }
  }

  async function remove(id: string) {
    if (!confirm('Удалить водоём?')) return;

    try {
      await api.deleteWaterBody(id);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Не удалось удалить водоём');
    }
  }

  function startEdit(item: WaterBody) {
    setEditingId(item.id);
    setBoundariesFile(null);
    setForm({
      name: item.name || '',
      district: item.district || '',
      imageUrl: item.imageUrl || '',
    });
  }

  function resetForm() {
    setForm(emptyForm);
    setBoundariesFile(null);
    setEditingId(null);
  }

  // Фильтрация водоёмов по поисковому запросу
  const filteredItems = items.filter((item) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase().trim();
    return (
      item.name.toLowerCase().includes(query) ||
      (item.district && item.district.toLowerCase().includes(query))
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / ITEMS_PER_PAGE));
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const editingItem = editingId
    ? items.find((item) => item.id === editingId) || null
    : null;

  return (
    <div className="stack">
      <div className="card stack">
        <h3>{editingId ? 'Редактирование водоёма' : 'Создание водоёма'}</h3>

        <div className="form-grid">
          <label className="field">
            <span>Название водоёма</span>
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
            <span>Ссылка на изображение</span>
            <input
              placeholder="https://..."
              value={form.imageUrl}
              onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
            />
          </label>

          <div className="field geojson-upload-field">
            <span>Границы водоёма</span>
            <input
              key={boundariesFile ? 'boundaries-selected' : 'boundaries-empty'}
              id="water-body-boundaries-file"
              className="geojson-upload-input"
              type="file"
              accept=".json,.geojson,application/json,application/geo+json"
              onChange={(event) => {
                setBoundariesFile(event.target.files?.[0] ?? null);
              }}
            />
            <label className="geojson-upload" htmlFor="water-body-boundaries-file">
              <span className="geojson-upload__icon">JSON</span>
              <span className="geojson-upload__body">
                <strong>
                  {boundariesFile
                    ? boundariesFile.name
                    : editingItem?.boundaries
                      ? 'Границы уже загружены'
                      : 'Выберите файл границ'}
                </strong>
                <small>
                  {boundariesFile
                    ? `${(boundariesFile.size / 1024).toFixed(1)} КБ`
                    : 'Polygon, MultiPolygon, LineString или MultiLineString'}
                </small>
              </span>
              <span className="geojson-upload__action">
                {boundariesFile ? 'Заменить' : 'Выбрать'}
              </span>
            </label>
          </div>
        </div>

        {boundariesFile ? (
          <div className="geojson-upload-note">
            <span>Файл будет сохранён вместе с водоёмом.</span>
            <button
              className="btn secondary"
              type="button"
              onClick={() => setBoundariesFile(null)}
            >
              Убрать файл
            </button>
          </div>
        ) : null}

        {form.imageUrl ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img
              src={form.imageUrl}
              alt="Превью водоёма"
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
          <h3 style={{ margin: 0 }}>Водоёмы</h3>
        </div>

        {/* Поиск в стиле формы создания */}
        <div className="form-grid" style={{ marginBottom: 20 }}>
          <label className="field">
            <span>Поиск водоёмов</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по названию или району..."
            />
          </label>
          {searchQuery && (
            <div style={{ gridColumn: '1 / -1', marginTop: -8 }}>
              <div style={{ fontSize: 14, color: '#666', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Найдено: {filteredItems.length} из {items.length} водоёмов</span>
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
                <th>Границы</th>
                <th>Действия</th>
              </tr>
            </thead>

            <tbody>
              {paginatedItems.map((item) => (
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
                  <td>
                    <span
                      className={
                        item.boundaries
                          ? 'badge geojson-status geojson-status--ready'
                          : 'badge geojson-status'
                      }
                    >
                      {item.boundaries ? 'Загружены' : 'Нет'}
                    </span>
                  </td>

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
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>
                    {searchQuery
                      ? 'Водоёмы не найдены по вашему запросу'
                      : 'Водоёмы не найдены'}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        {totalPages > 1 ? (
          <div className="pagination">
            <button
              type="button"
              className="pagination-btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            >
              Назад
            </button>

            {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
              <button
                key={page}
                type="button"
                className={currentPage === page ? 'pagination-btn active' : 'pagination-btn'}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}

            <button
              type="button"
              className="pagination-btn"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            >
              Вперёд
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
