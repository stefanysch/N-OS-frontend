import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import LogoSvg from '@/assets/n-os.svg' 

const IconSun = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
)
const IconMoon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
)

const CADASTROS_PATHS = ['/clientes', '/veiculos', '/pecas', '/servicos']

export default function Header() {
  const [tema, setTema] = useState('dark')
  const navigate = useNavigate()

  const emCadastros = CADASTROS_PATHS.some((p) =>
    window.location.pathname.startsWith(p)
  )

  const toggleTema = () => {
    const novo = tema === 'dark' ? 'light' : 'dark'
    setTema(novo)
    document.documentElement.classList.toggle('light', novo === 'light')
  }

  // classe base dos links de navegação — Rajdhani
  const navClass = (isActive) =>
    [
      'font-ui text-[13px] font-semibold uppercase tracking-[0.12em]',
      'px-3 py-1.5 transition-colors duration-150',
      isActive ? 'text-white' : 'text-[#444] hover:text-[#888]',
    ].join(' ')

  return (
    <header className="sticky top-0 z-40 flex h-[49px] items-center justify-between border-b border-[#1e1e1e] bg-[#0a0a0a] px-6">

      {/* ── esquerda: logo + nav ── */}
      <div className="flex items-center gap-8">

        {/* logo  */}
        <NavLink to="/" className="shrink-0">
            <img
             src={LogoSvg}
            alt="N-OS"
            style={{ height: '22px', width: 'auto' }}
             />
        </NavLink>

        {/* navegação principal — Rajdhani */}
        <nav className="flex items-center gap-1" style={{ fontFamily: 'Rajdhani, sans-serif' }}>
          <NavLink
            to="/dashboard"
            className={({ isActive }) => navClass(isActive)}
          >
            Dashboard
          </NavLink>

          {/* "cadastros" leva para /clientes (primeira sub-rota) */}
          <NavLink
            to="/clientes"
            className={() => navClass(emCadastros)}
          >
            Cadastros
          </NavLink>

          <NavLink
            to="/ordens"
            className={({ isActive }) => navClass(isActive)}
          >
            Ordens de Serviço
          </NavLink>
        </nav>
      </div>

      {/* ── direita: nova OS + tema ── */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/ordens/nova')}
          className="border border-[#e11d48] px-4 py-1.5 text-[#e11d48] transition-all hover:bg-[#e11d48] hover:text-black"
          style={{ fontFamily: 'Rajdhani, sans-serif', fontSize: '12px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}
        >
          + Nova OS
        </button>

        <div className="h-4 w-px bg-[#1e1e1e]" />

        <button
          onClick={toggleTema}
          className="p-1 text-[#444] transition-colors hover:text-[#888]"
          title={tema === 'dark' ? 'Tema claro' : 'Tema escuro'}
        >
          {tema === 'dark' ? <IconSun /> : <IconMoon />}
        </button>
      </div>
    </header>
  )
}