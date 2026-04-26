'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { authStorage } from '@/lib/auth';

const links = [
  { href: '/', label: 'Главная' },
  { href: '/users', label: 'Пользователи' },
  { href: '/water-bodies', label: 'Водоемы' },
  { href: '/problems', label: 'Проблемы' },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="sidebar">
      <h2>Панель администратора</h2>
      <p>Панель управления пользователями, водоемами, замерами и экологическими проблемами.</p>
      <nav className="nav">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className={pathname === link.href ? 'active' : ''}>
            {link.label}
          </Link>
        ))}
      </nav>
      <div style={{ marginTop: 24 }}>
        <button
          className="btn secondary"
          type="button"
          onClick={() => {
            authStorage.clear();
            router.push('/login');
          }}
        >
          Выйти
        </button>
      </div>
    </aside>
  );
}
