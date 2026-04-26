'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { User } from '@/types';
import { ActionIcon } from './ActionIcon';

const emptyForm = {
  email: '',
  login: '',
  role: 'CLIENT' as 'ADMIN' | 'CLIENT',
  password: '',
};

function roleLabel(role: User['role']) {
  return role === 'ADMIN' ? 'Администратор' : 'Пользователь';
}

function statusLabel(isActive?: boolean | null) {
  return isActive === false ? 'Заблокирован' : 'Активен';
}

export function UserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  async function load() {
    try {
      setLoading(true);
      setError('');
      const data = await api.getUsers();
      setUsers(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось загрузить пользователей');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function submit() {
    try {
      if (!form.email.trim()) {
        alert('Введите email');
        return;
      }

      if (!form.login.trim()) {
        alert('Введите логин');
        return;
      }

      if (!editingId && !form.password.trim()) {
        alert('Введите пароль');
        return;
      }

      const body = {
        email: form.email,
        login: form.login,
        role: form.role,
        ...(form.password.trim() ? { password: form.password } : {}),
      };

      if (editingId) {
        await api.updateUser(editingId, body);
      } else {
        await api.createUser({
          ...body,
          password: form.password,
          isActive: true,
        });
      }

      setForm(emptyForm);
      setEditingId(null);
      setViewingUser(null);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Не удалось сохранить пользователя');
    }
  }

  async function remove(id: string) {
    if (!confirm('Удалить пользователя?')) return;

    try {
      await api.deleteUser(id);
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Не удалось удалить пользователя');
    }
  }

  async function toggleActive(user: User) {
    try {
      await api.updateUser(user.id, { isActive: !user.isActive });
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Не удалось сменить статус пользователя');
    }
  }

  function startEdit(user: User) {
    setViewingUser(null);
    setEditingId(user.id);
    setForm({
      email: user.email,
      login: user.login || '',
      role: user.role,
      password: '',
    });
  }

  function viewUser(user: User) {
    setEditingId(null);
    setViewingUser(user);
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setViewingUser(null);
  }

  // Фильтрация пользователей по поисковому запросу
  const filteredUsers = users.filter((user) => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase().trim();
    return (
      user.login?.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      roleLabel(user.role).toLowerCase().includes(query) ||
      statusLabel(user.isActive).toLowerCase().includes(query)
    );
  });

  const activeCount = users.filter((user) => user.isActive !== false).length;
  const blockedCount = users.filter((user) => user.isActive === false).length;

  return (
    <div className="stack">
      <div className="card stack">
        <h3>{editingId ? 'Редактирование пользователя' : 'Создание пользователя'}</h3>

        <div className="form-grid">
          <label className="field">
            <span>Email</span>
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Введите email"
            />
          </label>

          <label className="field">
            <span>Логин</span>
            <input
              value={form.login}
              onChange={(e) => setForm({ ...form, login: e.target.value })}
              placeholder="Введите логин"
            />
          </label>

          <label className="field">
            <span>Роль</span>
            <select
              value={form.role}
              onChange={(e) =>
                setForm({ ...form, role: e.target.value as 'ADMIN' | 'CLIENT' })
              }
            >
              <option value="CLIENT">Пользователь</option>
              <option value="ADMIN">Администратор</option>
            </select>
          </label>

          <label className="field">
            <span>Пароль</span>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder={editingId ? 'Оставьте пустым, чтобы не менять' : 'Введите пароль'}
            />
          </label>
        </div>

        <div className="actions">
          <button className="btn" type="button" onClick={submit}>
            {editingId ? 'Сохранить' : 'Создать'}
          </button>

          <button className="btn secondary" type="button" onClick={resetForm}>
            Очистить
          </button>
        </div>

        {viewingUser ? (
          <div className="card" style={{ marginTop: 14 }}>
            <h4>Пользователь</h4>
            <div className="form-grid">
              <div>
                <strong>Логин:</strong> {viewingUser.login || '—'}
              </div>
              <div>
                <strong>Email:</strong> {viewingUser.email}
              </div>
              <div>
                <strong>Роль:</strong> {roleLabel(viewingUser.role)}
              </div>
              <div>
                <strong>Статус:</strong> {statusLabel(viewingUser.isActive)}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="card">
        <div className="topbar" style={{ padding: 0, marginBottom: 16 }}>
          <h3 style={{ margin: 0 }}>Пользователи</h3>
          <div className="row" style={{ gap: 10 }}>
            <span className="badge">Активные: {activeCount}</span>
            <span className="badge" style={{ background: '#fde8e8', color: '#b52f2f' }}>
              Заблокированные: {blockedCount}
            </span>
          </div>
        </div>

        {/* Блок поиска */}
        <div style={{ marginBottom: 16 }}>
          <label className="field">
            <span>Поиск пользователей</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по логину, email, роли или статусу..."
              style={{ width: '100%' }}
            />
          </label>
          {searchQuery && (
            <div style={{ marginTop: 8, fontSize: 14, color: '#666' }}>
              Найдено: {filteredUsers.length} из {users.length} пользователей
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  marginLeft: 10,
                  padding: '2px 8px',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
                className="btn secondary small"
              >
                Очистить
              </button>
            </div>
          )}
        </div>

        {loading && <p>Загрузка...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Логин</th>
                <th>Email</th>
                <th>Роль</th>
                <th>Статус</th>
                <th>Действия</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.login || '—'}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className="badge">{roleLabel(user.role)}</span>
                  </td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        background: user.isActive !== false ? '#e7f8ee' : '#fde8e8',
                        color: user.isActive !== false ? '#1f6f3f' : '#b52f2f',
                      }}
                    >
                      {statusLabel(user.isActive)}
                    </span>
                  </td>
                  <td>
                    <div className="actions table-actions">
                      <button
                        className="btn view icon"
                        type="button"
                        title="Просмотреть"
                        aria-label="Просмотреть"
                        onClick={() => viewUser(user)}
                      >
                        <ActionIcon name="view" />
                      </button>
                      <button
                        className="btn edit icon"
                        type="button"
                        title="Редактировать"
                        aria-label="Редактировать"
                        onClick={() => startEdit(user)}
                      >
                        <ActionIcon name="edit" />
                      </button>
                      <button
                        className="btn block icon"
                        type="button"
                        title={user.isActive === false ? 'Разблокировать' : 'Заблокировать'}
                        aria-label={user.isActive === false ? 'Разблокировать' : 'Заблокировать'}
                        onClick={() => void toggleActive(user)}
                      >
                        <ActionIcon name={user.isActive === false ? 'unlock' : 'lock'} />
                      </button>
                      <button
                        className="btn delete icon"
                        type="button"
                        title="Удалить"
                        aria-label="Удалить"
                        onClick={() => void remove(user.id)}
                      >
                        <ActionIcon name="delete" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!loading && filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    {searchQuery ? 'Пользователи не найдены по вашему запросу' : 'Пользователи не найдены'}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}