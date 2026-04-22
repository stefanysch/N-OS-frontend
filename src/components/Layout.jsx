/**
 * N-OS Layout principal
 *
 * Lógica de sidebar:
 * - Rotas /clientes, /veiculos, /pecas, /servicos  → mostra SidebarCadastros à esquerda
 * - Todas as outras rotas                           → conteúdo ocupa largura total
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
    <div className="flex min-h-screen flex-col bg-[#0d0d0d] font-mono text-white">
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