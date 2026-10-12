import Button from '@/components/ui/Button'

export default function ModalConfirmacao({
  aberto,
  mensagem,
  tituloItens,
  itens = [],
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
          'relative z-10 w-full',
          itens.length > 0 ? 'max-w-md' : 'max-w-sm',
          'border border-(--nos-border-2)',
          'bg-(--nos-surface)',
          'p-6',
          'text-(--nos-text)',
          'shadow-2xl',
          'animate-in fade-in slide-in-from-bottom-2 duration-200',
        ].join(' ')}
        onClick={(e) => e.stopPropagation()}
      >

        <p className={`font-mono text-sm text-(--nos-text) ${itens.length > 0 ? 'mb-4' : 'mb-6'}`}>
          {mensagem}
        </p>

        {itens.length > 0 && (
          <div className="mb-6">
            {tituloItens && (
              <p className="mb-2 text-[10px] uppercase tracking-widest text-(--nos-text-faint)">
                {tituloItens}
              </p>
            )}

            <ul className="max-h-60 overflow-y-auto border border-(--nos-border) bg-(--nos-bg)">
              {itens.map((item, indice) => (
                <li
                  key={item.chave}
                  className={[
                    'px-3 py-2',
                    indice !== itens.length - 1 ? 'border-b border-(--nos-border)' : '',
                  ].join(' ')}
                >
                  <p className="text-xs text-(--nos-text)">{item.titulo}</p>
                  {item.subtitulo && (
                    <p className="text-[10px] text-(--nos-text-muted)">{item.subtitulo}</p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

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