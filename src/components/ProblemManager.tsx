'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import {
  ProblemSeverity,
  ProblemStatus,
  WaterBodyProblem,
} from '@/types';
import { ActionIcon } from './ActionIcon';

const emptyForm = {
  title: '',
  description: '',
  severity: 'MEDIUM' as ProblemSeverity,
  status: 'PENDING' as ProblemStatus,
  moderationNote: '',
};

const severityOptions: ProblemSeverity[] = ['LOW', 'MEDIUM', 'HIGH'];
const statusOptions: ProblemStatus[] = ['PENDING', 'APPROVED', 'REJECTED'];

function severityLabel(severity: ProblemSeverity) {
  switch (severity) {
    case 'LOW':
      return 'Низкая';
    case 'HIGH':
      return 'Высокая';
    default:
      return 'Средняя';
  }
}

function statusLabel(status: ProblemStatus) {
  switch (status) {
    case 'APPROVED':
      return 'Одобрено';
    case 'REJECTED':
      return 'Отклонено';
    default:
      return 'На проверке';
  }
}

function severityBadgeStyle(severity: ProblemSeverity) {
  switch (severity) {
    case 'LOW':
      return { background: '#e8f7ee', color: '#1f6f3f' };
    case 'HIGH':
      return { background: '#fde8e8', color: '#b52f2f' };
    default:
      return { background: '#fff4dd', color: '#9a6500' };
  }
}

function statusBadgeStyle(status: ProblemStatus) {
  switch (status) {
    case 'APPROVED':
      return { background: '#e8f7ee', color: '#1f6f3f' };
    case 'REJECTED':
      return { background: '#fde8e8', color: '#b52f2f' };
    default:
      return { background: '#edf3ff', color: '#345dd8' };
  }
}

export function ProblemManager() {
  const [problems, setProblems] = useState<WaterBodyProblem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedProblem, setSelectedProblem] = useState<WaterBodyProblem | null>(null);
  const [form, setForm] = useState(emptyForm);

  async function loadProblems() {
    setLoading(true);
    setError(null);

    try {
      const data = await api.getProblems();
      setProblems(data);
      setSelectedProblem((current) =>
        current ? data.find((problem) => problem.id === current.id) ?? null : null,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProblems();
  }, []);

  function formatWaterBody(problem: WaterBodyProblem) {
    const waterBody = problem.waterBody;

    if (typeof waterBody === 'object' && waterBody) {
      return waterBody.name;
    }

    return waterBody || problem.waterBodyId || '—';
  }

  function formatDate(value?: string) {
    if (!value) {
      return '—';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('ru-RU', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  }

  function selectProblem(problem: WaterBodyProblem) {
    setSelectedProblem(problem);
  }

  function startEdit(problem: WaterBodyProblem) {
    setSelectedProblem(problem);
    setEditingId(problem.id);
    setForm({
      title: problem.title || '',
      description: problem.description || '',
      severity: problem.severity || 'MEDIUM',
      status: problem.status || 'PENDING',
      moderationNote: problem.moderationNote || '',
    });
  }

  function resetEditor() {
    setEditingId(null);
    setSelectedProblem(null);
    setForm(emptyForm);
  }

  async function submit() {
    if (!editingId) {
      alert('Сначала выберите проблему для редактирования');
      return;
    }

    if (!form.title.trim()) {
      alert('Введите заголовок проблемы');
      return;
    }

    if (!form.description.trim()) {
      alert('Введите описание проблемы');
      return;
    }

    try {
      setSaving(true);
      await api.updateProblem(editingId, {
        title: form.title.trim(),
        description: form.description.trim(),
        severity: form.severity,
        status: form.status,
        moderationNote: form.moderationNote.trim() || null,
      });

      resetEditor();
      await loadProblems();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Не удалось сохранить изменения');
    } finally {
      setSaving(false);
    }
  }

  async function removeProblem(problem: WaterBodyProblem) {
    if (!confirm(`Удалить проблему "${problem.title || 'без названия'}"?`)) {
      return;
    }

    try {
      setDeletingId(problem.id);
      await api.deleteProblem(problem.id);

      if (selectedProblem?.id === problem.id) {
        setSelectedProblem(null);
      }

      if (editingId === problem.id) {
        resetEditor();
      }

      await loadProblems();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Не удалось удалить проблему');
    } finally {
      setDeletingId(null);
    }
  }

  const pendingCount = problems.filter((problem) => problem.status === 'PENDING').length;
  const approvedCount = problems.filter((problem) => problem.status === 'APPROVED').length;
  const rejectedCount = problems.filter((problem) => problem.status === 'REJECTED').length;

  return (
    <div className="stack">
      {selectedProblem ? (
        <div className="card stack">
          <div className="topbar" style={{ padding: 0, marginBottom: 4 }}>
            <div>
              <h3 style={{ marginBottom: 6 }}>Просмотр проблемы</h3>
              <p className="muted" style={{ margin: 0 }}>
                Здесь можно быстро посмотреть детали выбранной жалобы.
              </p>
            </div>
            <div className="actions">
              <button
                className="btn edit icon"
                type="button"
                title="Редактировать"
                aria-label="Редактировать"
                onClick={() => startEdit(selectedProblem)}
              >
                <ActionIcon name="edit" />
              </button>
              <button
                className="btn close icon"
                type="button"
                title="Закрыть просмотр"
                aria-label="Закрыть просмотр"
                onClick={() => setSelectedProblem(null)}
              >
                <ActionIcon name="close" />
              </button>
            </div>
          </div>

          <div className="form-grid">
            <div>
              <strong>Водоем:</strong> {formatWaterBody(selectedProblem)}
            </div>
            <div>
              <strong>ID жалобы:</strong> {selectedProblem.id}
            </div>
            <div>
              <strong>Создано:</strong> {formatDate(selectedProblem.createdAt)}
            </div>
            <div>
              <strong>Обновлено:</strong> {formatDate(selectedProblem.updatedAt)}
            </div>
          </div>

          <div>
            <h4 style={{ marginBottom: 8 }}>{selectedProblem.title || 'Без заголовка'}</h4>
            <p className="muted" style={{ marginTop: 0 }}>
              {selectedProblem.description || 'Описание отсутствует.'}
            </p>
          </div>

          <div className="row">
            <span className="badge" style={severityBadgeStyle(selectedProblem.severity)}>
              Серьезность: {severityLabel(selectedProblem.severity)}
            </span>
            <span className="badge" style={statusBadgeStyle(selectedProblem.status)}>
              Статус: {statusLabel(selectedProblem.status)}
            </span>
          </div>

          <p style={{ margin: 0 }}>
            <strong>Комментарий администратора:</strong>{' '}
            {selectedProblem.moderationNote?.trim() || 'Комментарий пока не добавлен.'}
          </p>
        </div>
      ) : null}

      <div className="card stack">
        <div className="topbar" style={{ padding: 0, marginBottom: 4 }}>
          <div>
            <h3 style={{ marginBottom: 6 }}>Редактирование проблемы</h3>
          </div>
          <div className="row" style={{ gap: 10 }}>
            <span className="badge">На проверке: {pendingCount}</span>
            <span className="badge" style={{ background: '#e8f7ee', color: '#1f6f3f' }}>
              Одобрено: {approvedCount}
            </span>
            <span className="badge" style={{ background: '#fde8e8', color: '#b52f2f' }}>
              Отклонено: {rejectedCount}
            </span>
          </div>
        </div>

        {editingId ? (
          <>
            <div className="form-grid">
              <label className="field" style={{ gridColumn: '1 / -1' }}>
                <span>Заголовок</span>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Короткий заголовок проблемы"
                />
              </label>

              <label className="field" style={{ gridColumn: '1 / -1' }}>
                <span>Описание</span>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Подробное описание проблемы"
                />
              </label>

              <label className="field">
                <span>Серьезность</span>
                <select
                  value={form.severity}
                  onChange={(e) =>
                    setForm({ ...form, severity: e.target.value as ProblemSeverity })
                  }
                >
                  {severityOptions.map((severity) => (
                    <option key={severity} value={severity}>
                      {severityLabel(severity)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span>Статус модерации</span>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as ProblemStatus })}
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {statusLabel(status)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field" style={{ gridColumn: '1 / -1' }}>
                <span>Комментарий администратора</span>
                <textarea
                  value={form.moderationNote}
                  onChange={(e) => setForm({ ...form, moderationNote: e.target.value })}
                  placeholder="Комментарий после проверки"
                />
              </label>
            </div>

            <div className="actions">
              <button className="btn" type="button" onClick={submit} disabled={saving}>
                {saving ? 'Сохранение...' : 'Сохранить изменения'}
              </button>
              <button className="btn secondary" type="button" onClick={resetEditor} disabled={saving}>
                Отмена
              </button>
            </div>
          </>
        ) : (
          <p className="muted" style={{ margin: 0 }}>
            Выберите проблему в таблице ниже и нажмите кнопку редактирования или просмотра.
          </p>
        )}
      </div>

      <div className="card">
        <h3>Список проблем</h3>

        {loading ? (
          <p>Загрузка проблем...</p>
        ) : error ? (
          <p style={{ color: '#d83b3b' }}>{error}</p>
        ) : problems.length === 0 ? (
          <p>Проблемы не найдены.</p>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Заголовок</th>
                  <th>Водоем</th>
                  <th>Серьезность</th>
                  <th>Статус</th>
                  <th>Обновлено</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {problems.map((problem) => (
                  <tr key={problem.id}>
                    <td>
                      <strong>{problem.title || 'Без заголовка'}</strong>
                      <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>
                        {problem.description || 'Описание отсутствует'}
                      </div>
                    </td>
                    <td>{formatWaterBody(problem)}</td>
                    <td>
                      <span className="badge" style={severityBadgeStyle(problem.severity)}>
                        {severityLabel(problem.severity)}
                      </span>
                    </td>
                    <td>
                      <span className="badge" style={statusBadgeStyle(problem.status)}>
                        {statusLabel(problem.status)}
                      </span>
                    </td>
                    <td>{formatDate(problem.updatedAt)}</td>
                    <td>
                      <div className="actions table-actions">
                        <button
                          className="btn view icon"
                          type="button"
                          title="Просмотреть"
                          aria-label="Просмотреть"
                          onClick={() => selectProblem(problem)}
                        >
                          <ActionIcon name="view" />
                        </button>
                        <button
                          className="btn edit icon"
                          type="button"
                          title="Редактировать"
                          aria-label="Редактировать"
                          onClick={() => startEdit(problem)}
                        >
                          <ActionIcon name="edit" />
                        </button>
                        <button
                          className="btn delete icon"
                          type="button"
                          title="Удалить"
                          aria-label="Удалить"
                          onClick={() => void removeProblem(problem)}
                          disabled={deletingId === problem.id}
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
        )}
      </div>
    </div>
  );
}
