import Input from '@/components/ui/Input'

function aplicarMaskPlaca(valor) {
  const raw = valor
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 7)

  if (raw.length <= 3) return raw

  return raw.slice(0, 3) + '-' + raw.slice(3)
}

function aplicarMaskAno(valor) {
  return valor.replace(/\D/g, '').slice(0, 4)
}

/**
 * Campos do formulário de veículo — placa, marca, modelo, ano, cor, chassi.
 * Não inclui o seletor de cliente: no VeiculoModal ele é tratado à parte
 * (select normal ou badge de wizard); na página de detalhe do veículo o
 * cliente é fixo e mostrado só no cabeçalho.
 */
export default function VeiculoCampos({
  formulario,
  setFormulario,
  erros,
  setErros,
}) {
  function alterarCampo(e) {
    const { name, value } = e.target

    let valorFinal = value

    if (name === 'placa') {
      valorFinal = aplicarMaskPlaca(value)
    }

    if (name === 'ano') {
      valorFinal = aplicarMaskAno(value)
    }

    setFormulario((ant) => ({
      ...ant,
      [name]: valorFinal,
    }))

    if (erros[name]) {
      setErros((ant) => ({ ...ant, [name]: null }))
    }
  }

  return (
    <>
      <Input
        label="// PLACA"
        name="placa"
        value={formulario.placa}
        onChange={alterarCampo}
        placeholder="ABC-1234"
        error={erros.placa}
        required
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="// MARCA"
          name="marca"
          value={formulario.marca}
          onChange={alterarCampo}
          placeholder="Honda, Yamaha, Suzuki..."
          error={erros.marca}
          required
        />

        <Input
          label="// MODELO"
          name="modelo"
          value={formulario.modelo}
          onChange={alterarCampo}
          placeholder="CG 160, Factor 150..."
          error={erros.modelo}
          required
        />
      </div>

      <div className="grid grid-cols-[120px_1fr] gap-3">
        <Input
          label="// ANO"
          name="ano"
          value={formulario.ano}
          onChange={alterarCampo}
          placeholder="2024"
          error={erros.ano}
          required
        />

        <Input
          label="// COR"
          name="cor"
          value={formulario.cor}
          onChange={alterarCampo}
          placeholder="Preta, Vermelha... (opcional)"
          error={erros.cor}
        />
      </div>

      <Input
        label="// CHASSI"
        name="chassi"
        value={formulario.chassi}
        onChange={alterarCampo}
        placeholder="Opcional"
        error={erros.chassi}
      />
    </>
  )
}
