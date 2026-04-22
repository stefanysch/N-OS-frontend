/**
 * N-OS Stepper
 * Indica progresso no wizard de criação de OS.
 *
 * Uso:
 *   const steps = [
 *     { id: 'cliente',  label: 'Cliente' },
 *     { id: 'veiculo',  label: 'Veículo' },
 *     { id: 'os',       label: 'Ordem de Serviço' },
 *   ]
 *
 *   <Stepper steps={steps} currentStep="veiculo" completedSteps={['cliente']} />
 *
 * Estados por step: 'done' | 'current' | 'pending'
 */

function StepIcon({ state }) {
  if (state === 'done') {
    return (
      <span className="flex h-5 w-5 items-center justify-center border border-emerald-500 text-emerald-500 text-[9px]">
        ✓
      </span>
    )
  }
  if (state === 'current') {
    return (
      <span className="flex h-5 w-5 items-center justify-center border border-[#e11d48] bg-[#e11d48]/10">
        <span className="h-1.5 w-1.5 rounded-full bg-[#e11d48] animate-pulse" />
      </span>
    )
  }
  return (
    <span className="flex h-5 w-5 items-center justify-center border border-[#2a2a2a]">
      <span className="h-1 w-1 rounded-full bg-[#333]" />
    </span>
  )
}

function Connector({ done }) {
  return (
    <div className="flex-1 mx-2">
      <div
        className={[
          'h-px transition-colors duration-300',
          done ? 'bg-emerald-500/40' : 'bg-[#2a2a2a]',
        ].join(' ')}
      />
    </div>
  )
}

export default function Stepper({ steps = [], currentStep, completedSteps = [] }) {
  const getState = (stepId) => {
    if (completedSteps.includes(stepId)) return 'done'
    if (stepId === currentStep) return 'current'
    return 'pending'
  }

  return (
    <div className="flex items-center w-full font-mono">
      {steps.map((step, i) => {
        const state = getState(step.id)
        const isLast = i === steps.length - 1

        return (
          <div key={step.id} className="flex items-center flex-1">
            {/* step */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <StepIcon state={state} />
              <span
                className={[
                  'text-[9px] uppercase tracking-[0.1em] whitespace-nowrap',
                  state === 'done'    ? 'text-emerald-500' :
                  state === 'current' ? 'text-[#e11d48]'   : 'text-[#333]',
                ].join(' ')}
              >
                {step.label}
              </span>
            </div>

            {/* connector */}
            {!isLast && (
              <Connector done={completedSteps.includes(step.id)} />
            )}
          </div>
        )
      })}
    </div>
  )
}