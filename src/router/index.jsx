import { createBrowserRouter, Navigate } from 'react-router-dom'
import Layout    from '@/components/Layout'
import RotaProtegida from '@/components/RotaProtegida'
import LoginPage from '@/features/auth/pages/LoginPage'
import DashboardPage from '@/features/dashboard/pages/DashboardPage'
import ClientePage from '@/features/clientes/pages/ClientePage'
import ClienteDetalhePage from '@/features/clientes/pages/ClienteDetalhePage'
import VeiculoPage from '@/features/veiculos/pages/VeiculoPage'
import VeiculoDetalhePage from '@/features/veiculos/pages/VeiculoDetalhePage'
import PecaPage from '@/features/pecas/pages/PecaPage'
import ServicoPage from '@/features/servicos/pages/ServicoPage'
import OrdemDeServicoPage from '@/features/os/pages/OrdemDeServicoPage'
import NovaOrdemDeServicoPage from '@/features/os/pages/NovaOrdemDeServicoPage'
import EditarOrdemDeServicoPage from '@/features/os/pages/EditarOrdemDeServicoPage'
import ImprimirOrdemDeServicoPage from '@/features/os/pages/ImprimirOrdemDeServicoPage'
import EmpresaPage from '@/features/empresa/pages/EmpresaPage'
import PerfilPage from '@/features/perfil/pages/PerfilPage'

export const router = createBrowserRouter([
  {path: '/login', element: <LoginPage />, },
  {
    path: '/',
    element: <RotaProtegida />,
    children: [
      // fora do Layout — sem header/sidebar, é uma folha de impressão
      { path: 'ordens/:id/imprimir', element: <ImprimirOrdemDeServicoPage /> },

      {
        element: <Layout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },

          { path: 'dashboard', element: <DashboardPage /> },

          { path: 'clientes', element: <ClientePage /> },
          { path: 'clientes/:id', element: <ClienteDetalhePage /> },
          { path: 'veiculos', element: <VeiculoPage /> },
          { path: 'veiculos/:id', element: <VeiculoDetalhePage /> },
          { path: 'pecas', element: <PecaPage /> },
          { path: 'servicos', element: <ServicoPage /> },

          { path: 'ordens', element: <OrdemDeServicoPage /> },
          { path: 'ordens/nova', element: <NovaOrdemDeServicoPage /> },
          { path: 'ordens/:id/editar', element: <EditarOrdemDeServicoPage /> },

          { path: 'perfil', element: <PerfilPage /> },
          { path: 'empresa', element: <EmpresaPage /> },
        ],
      },
    ],
  },
])