/**
 * N-OS SidebarCadastros
 * aparece APENAS quando o usuário está em qualquer rota de /clientes, /veiculos, /pecas ou /servicos.
 * fica fixada à esquerda do conteúdo, como um sub-menu persistente.
 */

import { NavLink } from 'react-router-dom'

const itens = [
  {
    to: '/clientes',
    label: 'Clientes',
    descricao: 'Pessoas / Empresas',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
        <circle cx="9" cy="7" r="4"/>
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    to: '/veiculos',
    label: 'Veículos',
    descricao: 'Base de Veículos',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="3" width="15" height="13" rx="1"/>
        <path d="M16 8h4l3 5v3h-7V8z"/>
        <circle cx="5.5" cy="18.5" r="2.5"/>
        <circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
  },
  {
    to: '/pecas',
    label: 'Peças',
    descricao: 'Produtos / Peças',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/>
        <path d="M7 7h.01"/>
      </svg>
    ),
  },
  {
    to: '/servicos',
    label: 'Serviços',
    descricao: 'Procedimentos',
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
      </svg>
    ),
  },
]

export default function SidebarCadastros() {
  return (
    <aside
      className="w-[200px] shrink-0 border-r bg-(--nos-surface)"
      style={{ borderColor: 'var(--nos-border)' }}
    >
      <div
        className="border-b px-5 py-4"
        style={{ borderColor: 'var(--nos-border)' }}
      >
        <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-(--nos-red)">
          N-OS
        </p>
        <p className="font-mono text-[11px] uppercase tracking-widest text-(--nos-text-muted)">
          Cadastros
        </p>
      </div>

      <nav className="py-2">
        {itens.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="group flex items-center gap-3 border-l-2 px-5 py-3 transition-colors"
            style={({ isActive }) => ({
              borderColor: isActive
                ? 'var(--nos-red)'
                : 'transparent',
              background: isActive
                ? 'var(--nos-red-dim)'
                : 'transparent',
              color: isActive
                ? 'var(--nos-red)'
                : 'var(--nos-text-muted)',
            })}
          >
            {({ isActive }) => (
              <>
                <span
                  className="text-sm"
                  style={{
                    color: isActive
                      ? 'var(--nos-red)'
                      : 'var(--nos-text-faint)',
                  }}
                >
                  {item.icon}
                </span>

                <div>
                  <p className="font-mono text-[10px] uppercase tracking-widest">
                    {item.label}
                  </p>

                  <p className="font-mono text-[9px] text-(--nos-text-faint)">
                    {item.descricao}
                  </p>
                </div>
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}