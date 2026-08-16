/**
 * N-OS Layout principal
 *
 * Lógica de sidebar:
 * - rotas /clientes, /veiculos, /pecas, /servicos  → mostra SidebarCadastros à esquerda
 * - todas as outras rotas                           → conteúdo ocupa largura total
 */

import { Outlet, useLocation } from 'react-router-dom'
import Header           from '@/components/ui/Header'
import SidebarCadastros from '@/components/ui/SidebarCadastros'

// prefixos que ativam a sidebar de cadastros
const CADASTROS_PREFIXOS = ['/clientes', '/veiculos', '/pecas', '/servicos']

export default function Layout() {
  const { pathname } = useLocation()
  const mostrarSidebar = CADASTROS_PREFIXOS.some((p) => pathname.startsWith(p))

  return (
    <div className="flex min-h-screen flex-col bg-(--nos-bg) font-mono text-(--nos-text)">
      <Header />

      <div className="flex flex-1 overflow-hidden">
        {/* sidebar lateral — aparece só para "cadastros" */}
        {mostrarSidebar && <SidebarCadastros />}

        {/* conteúdo principal */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}