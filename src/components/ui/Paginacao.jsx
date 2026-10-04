import Button from '@/components/ui/Button'

/**
 * N-OS Paginacao
 *
 * Uso:
 *   <Paginacao page={page} totalPages={totalPages} totalItems={totalItems}
 *     rotulo="cliente(s)" onMudar={irParaPagina} />
 */
export default function Paginacao({
  page,
  totalPages,
  totalItems,
  rotulo,
  onMudar,
}) {
  return (
    <div className="mt-3 flex items-center justify-between text-[10px] uppercase tracking-widest text-(--nos-text-faint)">

      <span>
        {totalItems} {rotulo}
      </span>

      {totalPages > 1 && (
        <div className="flex items-center gap-2">

          <Button
            size="sm"
            variant="ghost"
            disabled={page <= 1}
            onClick={() => onMudar(page - 1)}
          >
            ← Anterior
          </Button>

          <span>
            Página {page} de {totalPages}
          </span>

          <Button
            size="sm"
            variant="ghost"
            disabled={page >= totalPages}
            onClick={() => onMudar(page + 1)}
          >
            Próxima →
          </Button>

        </div>
      )}

    </div>
  )
}
