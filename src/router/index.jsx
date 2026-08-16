import { createBrowserRouter, Navigate } from 'react-router-dom'
import Layout    from '@/components/Layout'
import RotaProtegida from '@/components/RotaProtegida'
import LoginPage from '@/features/auth/pages/LoginPage'
import ClientePage from '@/features/clientes/pages/ClientePage'
import VeiculoPage from '@/features/veiculos/pages/VeiculoPage'
import PecaPage from '@/features/pecas/pages/PecaPage'
import ServicoPage from '@/features/servicos/pages/ServicoPage'
import OrdemDeServicoPage from '@/features/os/pages/OrdemDeServicoPage'
import NovaOrdemDeServicoPage from '@/features/os/pages/NovaOrdemDeServicoPage'
import EditarOrdemDeServicoPage from '@/features/os/pages/EditarOrdemDeServicoPage'

const EmBreve = ({ nome }) => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 font-mono">
    <span className="text-[10px] uppercase tracking-[0.25em] text-(--nos-red)">N-OS</span>
    <span className="text-sm uppercase tracking-widest text-(--nos-text-faint)">// {nome}</span>
    <span className="text-[10px] text-(--nos-text-faint)] uppercase tracking-widest">em desenvolvimento</span>
  </div>
)

export const router = createBrowserRouter([
  {path: '/login', element: <LoginPage />, },
  {
    path: '/',
    element: <RotaProtegida />,
    children: [
      {
        element: <Layout />,
        children: [
          { index: true, element: <Navigate to="/ordens" replace /> },

          { path: 'dashboard', element: <EmBreve nome="Dashboard" /> },

          { path: 'clientes', element: <ClientePage /> },
          { path: 'veiculos', element: <VeiculoPage /> },
          { path: 'pecas', element: <PecaPage /> },
          { path: 'servicos', element: <ServicoPage /> },

          { path: 'ordens', element: <OrdemDeServicoPage /> },
          { path: 'ordens/nova', element: <NovaOrdemDeServicoPage /> },
          { path: 'ordens/:id/editar', element: <EditarOrdemDeServicoPage /> },
        ],
      },
    ],
  },
])