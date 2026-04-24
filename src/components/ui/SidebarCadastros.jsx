/**
 * N-OS SidebarCadastros
 * Aparece APENAS quando o usuário está em qualquer rota de /clientes, /veiculos, /pecas ou /servicos.
 * Fica fixada à esquerda do conteúdo, como um sub-menu persistente.
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
    <aside className="w-[200px] shrink-0 border-r border-[#1e1e1e] bg-[#0a0a0a]">
      {/* título do grupo */}
      <div className="border-b border-[#1e1e1e] px-5 py-4">
        <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#e11d48]">
          N-OS
        </p>
        <p className="font-mono text-[11px] uppercase tracking-widest text-[#555]">
          Cadastros
        </p>
      </div>

      {/* itens de navegação */}
      <nav className="py-2">
        {itens.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                'group flex items-center gap-3 px-5 py-3',
                'border-l-2 transition-all duration-150',
                isActive
                  ? 'border-[#e11d48] bg-[#e11d48]/5 text-[#e11d48]'
                  : 'border-transparent text-[#444] hover:border-[#2a2a2a] hover:bg-[#111] hover:text-[#888]',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <span className={isActive ? 'text-[#e11d48]' : 'text-[#333] group-hover:text-[#555]'}>
                  {item.icon}
                </span>
                <div className="min-w-0">
                  <p className="font-mono text-[10px] uppercase tracking-widest leading-none">
                    {item.label}
                  </p>
                  <p className="mt-0.5 font-mono text-[9px] text-[#333] group-hover:text-[#444]">
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