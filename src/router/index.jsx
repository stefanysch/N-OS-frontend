import { createBrowserRouter, Navigate } from 'react-router-dom'
import Layout    from '@/components/Layout'
import PecaPage from '@/features/pecas/pages/PecaPage'
import ServicoPage from '@/features/servicos/pages/ServicoPage'
// placeholder para rotas ainda não implementadas
const EmBreve = ({ nome }) => (
  <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 font-mono">
    <span className="text-[10px] uppercase tracking-[0.25em] text-[#e11d48]">N-OS</span>
    <span className="text-sm uppercase tracking-widest text-[#333]">// {nome}</span>
    <span className="text-[10px] text-[#222] uppercase tracking-widest">em desenvolvimento</span>
  </div>
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to="/ordens" replace /> },

      { path: 'dashboard', element: <EmBreve nome="Dashboard" /> },

      { path: 'clientes',  element: <EmBreve nome="Clientes" /> },
      { path: 'veiculos',  element: <EmBreve nome="Veículos" /> },
      { path: 'pecas',     element: <PecaPage /> },   
      { path: 'servicos',  element: <ServicoPage /> },

      { path: 'ordens',        element: <EmBreve nome="Ordens de Serviço" /> },
      { path: 'ordens/nova',   element: <EmBreve nome="Nova OS — Wizard" /> },
      { path: 'ordens/:id',    element: <EmBreve nome="Detalhe da OS" /> },
    ],
  },
])