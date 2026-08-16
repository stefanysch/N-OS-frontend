import { NavLink, useNavigate } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'

import LogoSvg from '@/assets/n-os.svg'

const IconSun = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="5" />

    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />

    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />

    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />

    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
)

const IconMoon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
)

const IconUser = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
)

const IconChevron = () => (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="m6 9 6 6 6-6" />
  </svg>
)

const CADASTROS_PATHS = [
  '/clientes',
  '/veiculos',
  '/pecas',
  '/servicos',
]

export default function Header() {

  const navigate = useNavigate()

  const menuRef = useRef(null)

  const [menuPerfilAberto, setMenuPerfilAberto] =
    useState(false)

  const [tema, setTema] = useState(() => {
    return localStorage.getItem('nos-tema') ?? 'dark'
  })

  useEffect(() => {

    const html = document.documentElement

    html.classList.toggle(
      'light',
      tema === 'light'
    )

    localStorage.setItem(
      'nos-tema',
      tema
    )

  }, [tema])


  function toggleTema() {

    setTema((anterior) =>
      anterior === 'dark'
        ? 'light'
        : 'dark'
    )

  }

  useEffect(() => {

    function fecharMenu(event) {

      if (
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setMenuPerfilAberto(false)
      }

    }

    document.addEventListener(
      'mousedown',
      fecharMenu
    )

    return () => {
      document.removeEventListener(
        'mousedown',
        fecharMenu
      )
    }

  }, [])

  function togglePerfil() {

    setMenuPerfilAberto(
      (anterior) => !anterior
    )

  }

  function logout() {

    localStorage.removeItem('nos-token')

    setMenuPerfilAberto(false)

    navigate('/login')
  }

  const emCadastros =
    CADASTROS_PATHS.some((path) =>
      window.location.pathname.startsWith(path)
    )

  const navClass = (isActive) =>
    [
      'font-ui text-[13px] font-semibold uppercase tracking-[0.12em]',
      'px-3 py-1.5',
      'transition-colors duration-150',

      isActive
        ? 'text-(--nos-text)'
        : 'text-(--nos-text-muted) hover:text-(--nos-text)',
    ].join(' ')

  return (

    <header
      className="
        sticky top-0 z-40
        flex h-[49px]
        items-center justify-between
        border-b border-(--nos-border)
        bg-(--nos-bg)
        px-6
        transition-colors duration-200
      "
    >

      <div className="flex items-center gap-8">

        <NavLink
          to="/"
          className="shrink-0"
        >
          <img
            src={LogoSvg}
            alt="N-OS"
            style={{
              height: '22px',
              width: 'auto',
            }}
          />
        </NavLink>

        <nav className="flex items-center gap-1">

          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              navClass(isActive)
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/clientes"
            className={() =>
              navClass(emCadastros)
            }
          >
            Cadastros
          </NavLink>

          <NavLink
            to="/ordens"
            className={({ isActive }) =>
              navClass(isActive)
            }
          >
            Ordens de Serviço
          </NavLink>

        </nav>

      </div>

      <div className="flex items-center gap-3">

        <button
          type="button"
          onClick={() =>
            navigate('/ordens/nova')
          }
          className="
            border border-(--nos-red)
            px-4 py-1.5
            font-ui
            text-[12px]
            font-semibold
            uppercase
            tracking-[0.12em]
            text-(--nos-red)
            transition-colors duration-150
            hover:bg-(--nos-red)
            hover:text-white
          "
        >
          + Nova OS
        </button>

        <div
          className="
            h-4 w-px
            bg-(--nos-border)
          "
        />

        <button
          type="button"
          onClick={toggleTema}
          className="
            p-1
            text-(--nos-text-muted)
            transition-colors duration-150
            hover:text-(--nos-text)
          "
          title={
            tema === 'dark'
              ? 'Tema claro'
              : 'Tema escuro'
          }
        >
          {tema === 'dark'
            ? <IconSun />
            : <IconMoon />
          }
        </button>

        <div
          className="
            h-4 w-px
            bg-(--nos-border)
          "
        />

        <div
          ref={menuRef}
          className="relative"
        >

          <button
            type="button"
            onClick={togglePerfil}
            className="
              flex items-center gap-2
              px-1.5 py-1
              text-(--nos-text-muted)
              transition-colors duration-150
              hover:text-(--nos-text)
            "
          >

            <IconUser />

            <span
              className="
                font-data
                text-[10px]
                uppercase
                tracking-widest
              "
            >
              Usuário
            </span>

            <IconChevron />

          </button>

          {menuPerfilAberto && (

            <div
              className="
                absolute right-0 top-[calc(100%+10px)]
                z-50
                w-52
                overflow-hidden
                border border-(--nos-border-2)
                bg-(--nos-surface)
                shadow-2xl
              "
            >

              <div
                className="
                  border-b
                  border-(--nos-border) 
                  px-4 py-3
                "
              >

                <p
                  className="
                    font-data
                    text-[9px]
                    uppercase
                    tracking-[0.2em]
                    text-(--nos-text-faint)
                  "
                >
                  // USUÁRIO
                </p>

                <p
                  className="
                    mt-1
                    font-data
                    text-xs
                    text-(--nos-text)
                  "
                >
                  Usuário
                </p>

                <p
                  className="
                    mt-0.5
                    font-data
                    text-[9px]
                    text-(--nos-text-muted)
                  "
                >
                  usuário@nos.com
                </p>

              </div>

              <button
                type="button"
                onClick={() => {
                  setMenuPerfilAberto(false)
                  navigate('/perfil')
                }}
                className="
                  w-full
                  px-4 py-3
                  text-left
                  font-ui
                  text-[11px]
                  uppercase
                  tracking-widest
                  text-(--nos-text-muted)
                  transition-colors duration-150
                  hover:bg-(--nos-surface-2)
                  hover:text-(--nos-text)
                "
              >
                Meu perfil
              </button>

              <button
                type="button"
                onClick={logout}
                className="
                  w-full
                  border-t border-(--nos-border)
                  px-4 py-3
                  text-left
                  font-ui
                  text-[11px]
                  uppercase
                  tracking-widest
                  text-(--nos-red)
                  transition-colors duration-150
                  hover:bg-(--nos-red-dim)
                "
              >
                Sair
              </button>

            </div>

          )}

        </div>

      </div>

    </header>
  )
}