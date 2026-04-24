import { useEffect, useState } from 'react'
import Button    from '@/components/ui/Button'
import Badge     from '@/components/ui/Badge'
import PecaModal from '../components/PecaModal'
import { pecaService } from '../services/pecaService'

const moeda = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

function ModalConfirmacao({ dados, onConfirmar, onCancelar, carregando }) {
  if (!dados) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onCancelar} />
      <div className="relative z-10 w-full max-w-sm border border-[#2a2a2a] bg-[#111] p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e11d48] mb-2">
        </p>
        <p className="font-mono text-sm text-white mb-6">{dados.mensagem}</p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onCancelar} disabled={carregando}>
            Cancelar
          </Button>
          <Button
               /* variant={dados.ativo ? 'danger' : 'secondary'} */
            variant='danger'
            onClick={onConfirmar}
            loading={carregando} 
          >
            Deletar
            {/*dados.ativo ? 'Inativar' : 'Reativar'*/}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function PecasPage() {
  const [pecas, setPecas]             = useState([])
  const [carregando, setCarregando]   = useState(true)
  const [erro, setErro]               = useState(null)

  const [modalAberto, setModalAberto] = useState(false)
  const [pecaEdicao, setPecaEdicao]   = useState(null)

  const [confirmacao, setConfirmacao]         = useState(null)  
  const [alterandoStatus, setAlterandoStatus] = useState(false)

  const carregar = async () => {
    setCarregando(true)
    setErro(null)
    try {
      const res = await pecaService.listar()
      setPecas(res.data.filter((p) => p.ativo)) // exibir apenas peças ativas por padrão
    } catch {
      setErro('Falha ao carregar peças. Verifique se o backend está rodando.')
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => { carregar() }, [])

  const abrirCriacao = () => { setPecaEdicao(null); setModalAberto(true) }
  const abrirEdicao  = (p) => { setPecaEdicao(p);   setModalAberto(true) }

  const pedirConfirmacaoStatus = (peca) =>
    setConfirmacao({
      /*id:       peca.id,
      ativo:    peca.ativo,
      mensagem: peca.ativo
        ? `Deseja inativar? "${peca.nome}"?`
        : `Deseja reativar "${peca.nome}"?`, */
      id: peca.id,
      mensagem: `Deseja deletar "${peca.nome}"?`
    })

  const handleAlterarStatus = async () => {
    setAlterandoStatus(true)

    try {
      /*if (confirmacao.ativo) {
        await pecaService.inativar(confirmacao.id)
      } else {
        await pecaService.reativar(confirmacao.id)
      }
      await carregar()*/

      await pecaService.inativar(confirmacao.id)

      setPecas((lista) =>
        lista.filter((p) => p.id !== confirmacao.id)
      )

    } catch {
      alert('Erro ao deletar peça.')
    } finally {
      setAlterandoStatus(false)
      setConfirmacao(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] font-mono text-white">

      <div className="border-b border-[#1e1e1e] px-8 py-5 flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-[#e11d48]">
            N-OS / PEÇAS
          </p>
          <h1 className="text-sm uppercase tracking-widest text-white">// PEÇAS</h1>
        </div>
        <Button variant="secondary" onClick={abrirCriacao}>
          + Nova Peça
        </Button>
      </div>

      <div className="px-8 py-6">

        {carregando && (
          <div className="flex items-center justify-center gap-2 py-16 text-xs uppercase tracking-widest text-[#444]">
            <span className="animate-pulse text-[#e11d48]">■</span> Carregando...
          </div>
        )}
        {erro && !carregando && (
          <div className="border border-[#e11d48]/30 bg-[#e11d48]/10 px-4 py-3">
            <p className="font-mono text-xs text-[#e11d48]">{erro}</p>
            <Button variant="ghost" size="sm" className="mt-2" onClick={carregar}>
              Tentar novamente
            </Button>
          </div>
        )}

        {!carregando && !erro && (
          <div className="border border-[#1e1e1e]">

            <div className="grid grid-cols-[80px_1fr_2fr_130px_90px_120px_100px] border-b border-[#1e1e1e] bg-[#111] px-4 py-3">
              {['// ID', '// NOME', '// DESCRIÇÃO', '// VALOR', '// STATUS', '// AÇÕES'].map((col) => (
                <span key={col} className="text-[10px] uppercase tracking-[0.15em] text-[#444]">
                  {col}
                </span>
              ))}
            </div>

            {pecas.length === 0 && (
              <div className="py-12 text-center text-xs uppercase tracking-widest text-[#333]">
                Nenhuma peça cadastrada
              </div>
            )}

            {pecas.map((peca, i) => (
              <div
                key={peca.id}
                className={[
                  'grid grid-cols-[80px_1fr_2fr_130px_90px_120px_100px] items-center px-4 py-3',
                  'transition-colors hover:bg-[#161616]',
                  i !== pecas.length - 1 ? 'border-b border-[#1a1a1a]' : '',
                  !peca.ativo ? 'opacity-40' : '',
                ].join(' ')}
              >
                <span className="font-mono text-xs text-[#e11d48]">
                  #{String(peca.id).padStart(4, '0')}
                </span>

                <span className="truncate pr-4 text-xs text-white">{peca.nome}</span>

                <span className="truncate pr-4 text-xs text-[#555]">
                  {peca.descricao || '—'}
                </span>

                <span className="text-xs text-white">{moeda(peca.valor)}</span>

                <Badge status={peca.ativo ? 'ativo' : 'inativo'} />

                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={() => abrirEdicao(peca)}>
                    Editar
                  </Button>
                  <span className="text-[#222]">|</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => pedirConfirmacaoStatus(peca)}
                    className={peca.ativo ? 'hover:!text-[#e11d48]' : 'hover:!text-emerald-500'}
                  >
                    Deletar
                    {/*peca.ativo ? 'Inativar' : 'Reativar'} */}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!carregando && !erro && pecas.length > 0 && (
          <div className="mt-3 flex justify-between text-[10px] uppercase tracking-widest text-[#333]">
            <span>{pecas.length} peça(s)</span>
            <span>
              {pecas.filter((p) => p.ativo).length} ativas{' '}
              {/*{pecas.filter((p) => !p.ativo).length} inativas */}
            </span>
          </div>
        )}
      </div>

      <PecaModal
        aberto={modalAberto}
        onFechar={() => setModalAberto(false)}
        pecaEdicao={pecaEdicao}
        onSucesso={carregar}
      />

      <ModalConfirmacao
        dados={confirmacao}
        onConfirmar={handleAlterarStatus}
        onCancelar={() => setConfirmacao(null)}
        carregando={alterandoStatus}
      />
    </div>
  )
}