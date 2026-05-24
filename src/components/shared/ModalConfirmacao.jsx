import Button from '@/components/ui/Button'

export default function ModalConfirmacao({
  aberto,
  mensagem,
  carregando,
  onConfirmar,
  onCancelar
}) {

  if (!aberto) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">

      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onCancelar}
      />

      <div className="relative z-10 w-full max-w-sm border border-[#2a2a2a] bg-[#111] p-6">

        <p className="mb-6 font-mono text-sm text-white">
          {mensagem}
        </p>

        <div className="flex justify-end gap-3">

          <Button
            variant="ghost"
            onClick={onCancelar}
            disabled={carregando}
          >
            Cancelar
          </Button>

          <Button
            variant="danger"
            onClick={onConfirmar}
            loading={carregando}
          >
            Deletar
          </Button>

        </div>
      </div>
    </div>
  )
}