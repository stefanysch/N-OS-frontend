import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'

import { perfilService } from '@/features/perfil/services/perfilService'

// o token está num cookie HttpOnly, que o JavaScript não enxerga; por isso a
// única forma de saber se há sessão é perguntar à API. Se o token de acesso
// venceu, o interceptor do axios renova a sessão sozinho antes de falhar.
export default function RotaProtegida() {
  const [estado, setEstado] = useState('verificando')

  useEffect(() => {
    let ativo = true

    perfilService
      .obter()
      .then(() => ativo && setEstado('autenticado'))
      .catch(() => ativo && setEstado('anonimo'))

    return () => {
      ativo = false
    }
  }, [])

  if (estado === 'verificando') {
    return (
      <div className="flex min-h-screen items-center justify-center gap-2 bg-(--nos-bg) font-mono text-xs uppercase tracking-widest text-(--nos-text-faint)">
        <span className="animate-pulse text-(--nos-red)">■</span>
        Carregando...
      </div>
    )
  }

  if (estado === 'anonimo') {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
