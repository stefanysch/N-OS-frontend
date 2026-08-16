import Button from '@/components/ui/Button'

export default function ModalConfirmacao({
  aberto,
  mensagem,
  carregando,
  onConfirmar,
  onCancelar,
  textoBotao = 'Deletar',
  varianteBotao = 'danger',
}) {
  if (!aberto) {
    return null
  }

  function cancelar() {
    if (carregando) {
      return
    }

    onCancelar()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={cancelar}
      />

      <div
        className={[
          'relative z-10 w-full max-w-sm',
          'border border-(--nos-border-2)',
          'bg-(--nos-surface)',
          'p-6',
          'text-(--nos-text)',
          'shadow-2xl',
          'animate-in fade-in slide-in-from-bottom-2 duration-200',
        ].join(' ')}
        onClick={(e) => e.stopPropagation()}
      >

        <p className="mb-6 font-mono text-sm text-(--nos-text)">
          {mensagem}
        </p>

        <div className="flex justify-end gap-3">

          <Button
            variant="ghost"
            onClick={cancelar}
            disabled={carregando}
          >
            Cancelar
          </Button>

          <Button
            variant={varianteBotao}
            onClick={onConfirmar}
            loading={carregando}
            disabled={carregando}
          >
            {textoBotao}
          </Button>

        </div>

      </div>

    </div>
  )
}