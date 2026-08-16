/**
 * N-OS Stepper
 * Indica progresso no fluxo guiado de criação.
 *
 * O fluxo possui três etapas principais:
 *   Cliente → Veículo → Ordem de Serviço
 *
 * Cliente e Veículo são preenchidos através de modais,
 * enquanto Ordem de Serviço possui uma tela dedicada.
 *
 * Uso:
 *   const steps = [
 *     { id: 'cliente', label: 'Cliente' },
 *     { id: 'veiculo', label: 'Veículo' },
 *     { id: 'os', label: 'Ordem de Serviço' },
 *   ]
 *
 *   <Stepper
 *     steps={steps}
 *     currentStep="veiculo"
 *     completedSteps={['cliente']}
 *   />
 */

function StepCircle({ index, state }) {
  if (state === 'done') {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-emerald-500 bg-emerald-500/10">
        <span className="font-mono text-[11px] font-medium text-emerald-500">
          ✓
        </span>
      </div>
    )
  }

  if (state === 'current') {
    return (
      <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-(--nos-red) bg-(--nos-red)/10">
        <span className="font-mono text-[11px] font-medium text-(--nos-red)">
          {String(index + 1).padStart(2, '0')}
        </span>
      </div>
    )
  }

  return (
    <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-(--nos-border-2) bg-transparent">
      <span className="font-mono text-[11px] text-(--nos-text-muted)">
        {String(index + 1).padStart(2, '0')}
      </span>
    </div>
  )
}

function Step({ step, index, state }) {
  return (
    <div className="flex shrink-0 flex-col items-center gap-2">
      <StepCircle
        index={index}
        state={state}
      />

      <span
        className={[
          'whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.15em]',
          state === 'done'
            ? 'text-emerald-500'
            : state === 'current'
              ? 'text-(--nos-red)'
              : 'text-(--nos-text-muted)',
        ].join(' ')}
      >
        {step.label}
      </span>
    </div>
  )
}

function Connector({ done }) {
  return (
    <div className="flex min-w-[80px] flex-1 items-center pt-4">
      <div
        className={[
          'h-px w-full',
          done
            ? 'bg-emerald-500/50'
            : 'bg-(--nos-border-2)',
        ].join(' ')}
      />
    </div>
  )
}

export default function Stepper({
  steps = [],
  currentStep,
  completedSteps = [],
}) {
  const getState = (stepId) => {
    if (completedSteps.includes(stepId)) return 'done'
    if (stepId === currentStep) return 'current'
    return 'pending'
  }

  return (
    <div className="flex w-full items-start">
      {steps.map((step, index) => {
        const state = getState(step.id)
        const isLast = index === steps.length - 1

        return (
          <div
            key={step.id}
            className="contents"
          >
            <Step
              step={step}
              index={index}
              state={state}
            />

            {!isLast && (
              <Connector
                done={completedSteps.includes(step.id)}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}