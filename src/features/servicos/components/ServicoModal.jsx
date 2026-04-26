import { useEffect, useState } from 'react'
import Modal  from '@/components/ui/Modal'
import Input  from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { servicoService } from '../services/servicoService'

const FORM_VAZIO = { nome: '', descricao: '', valor: ''}

export default function ServicoModal({ aberto, onFechar, servicoEdicao, onSucesso }) {
  const [form, setForm]           = useState(FORM_VAZIO)
  const [erros, setErros]         = useState({})
  const [salvando, setSalvando]   = useState(false)
  const [erroGeral, setErroGeral] = useState(null)

  const editando = !!servicoEdicao

  useEffect(() => {
    if (servicoEdicao) {
      setForm({
        nome:       servicoEdicao.nome       ?? '',
        descricao:  servicoEdicao.descricao  ?? '',
        valor:      servicoEdicao.valor      ?? ''      })
    } else {
      setForm(FORM_VAZIO)
    }
    setErros({})
    setErroGeral(null)
  }, [servicoEdicao, aberto])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (erros[name]) setErros((prev) => ({ ...prev, [name]: null }))
  }

  const validar = () => {
    const e = {}
    if (!form.nome.trim())               e.nome       = 'Nome é obrigatório'
    if (!form.valor || form.valor < 0)   e.valor      = 'Informe um valor válido'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errosValidacao = validar()
    if (Object.keys(errosValidacao).length) {
      setErros(errosValidacao)
      return
    }

    setSalvando(true)
    setErroGeral(null)

    const payload = {
      nome:       form.nome.trim(),
      descricao:  form.descricao.trim(),
      valor:      parseFloat(form.valor)
    }

    try {
      if (editando) {
        await servicoService.atualizar(servicoEdicao.id, payload)
      } else {
        await servicoService.criar(payload)
      }
      onSucesso()
      onFechar()
    } catch (err) {
      setErroGeral(
        typeof err?.response?.data === 'string'
          ? err.response.data
          : 'Erro ao salvar serviço. Tente novamente.'
      )
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Modal
      aberto={aberto}
      onFechar={onFechar}
      titulo={editando ? '// EDITAR SERVIÇO' : '// NOVO SERVIÇO'}
      subtitulo="N-OS"
      badge={editando ? `#${String(servicoEdicao.id).padStart(4, '0')}` : undefined}
      size="md"
    >
      <Modal.Body>
        <Input
          label="// NOME"
          name="nome"
          value={form.nome}
          onChange={handleChange}
          placeholder="Ex: Troca de óleo"
          required
          error={erros.nome}
        />

        <Input
          label="// DESCRIÇÃO"
          name="descricao"
          as="textarea"
          rows={2}
          value={form.descricao}
          onChange={handleChange}
          placeholder="Descrição técnica do procedimento"
        />
        <div></div>
          <Input
            label="// VALOR (R$)"
            name="valor"
            type="number"
            step="0.01"
            min="0"
            value={form.valor}
            onChange={handleChange}
            placeholder="0,00"
            required
            error={erros.valor}
          />

        {erroGeral && (
          <div className="border border-[#e11d48]/30 bg-[#e11d48]/10 px-4 py-2">
            <p className="font-mono text-xs text-[#e11d48]">{erroGeral}</p>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="ghost" onClick={onFechar} disabled={salvando}>
          Cancelar
        </Button>
        <Button
          variant={editando ? 'secondary' : 'primary'}
          type="submit"
          loading={salvando}
          onClick={handleSubmit}
        >
          {editando ? 'Salvar alterações' : '+ Cadastrar'}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}