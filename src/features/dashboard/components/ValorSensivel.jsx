import { formatarMoeda } from '@/utils/formatters'

/**
 * mostra um valor monetário só quando `mostrar` é true — senão, uma máscara.
 * usado no dashboard pra esconder valores quando o painel pode estar visível pra um cliente na oficina.
 */
export default function ValorSensivel({ valor, mostrar, className = '' }) {
  return (
    <span className={className}>
      {mostrar ? formatarMoeda(valor) : '••••••'}
    </span>
  )
}
