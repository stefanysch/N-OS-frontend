/**
 * N-OS Input / Textarea / Select
 *
 * Uso:
 *   <Input label="// NOME" name="nome" value={v} onChange={fn} required />
 *   <Input label="// DESCRIÇÃO" as="textarea" rows={3} ... />
 *   <Input label="// STATUS" as="select" options={[{value:'', label:'Selecionar...'}]} ... />
 */

export default function Input({
  label,
  name,
  value,
  onChange,
  placeholder,
  required,
  disabled,
  error,
  hint,
  as: Tag = 'input',
  options = [],       // só pra select
  className = '',
  ...props
}) {
  const baseClass = [
    'w-full bg-transparent',
    'border-b border-[#2a2a2a]',
    'pb-2 font-mono text-sm text-[var(--nos-text)]',
    'placeholder-[#333] outline-none',
    'transition-colors duration-150',
    'focus:border-[#e11d48]',
    error ? 'border-[#e11d48]/60' : '',
    disabled ? 'opacity-40 pointer-events-none' : '',
    className,
  ].join(' ')

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={name}
          className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#555]"
        >
          {label}
          {required && <span className="ml-1 text-[#e11d48]">*</span>}
        </label>
      )}

      {Tag === 'select' ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={[baseClass, 'appearance-none cursor-pointer'].join(' ')}
          {...props}
        >
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className="bg-[#111] text-white"
            >
              {opt.label}
            </option>
          ))}
        </select>
      ) : Tag === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={[baseClass, 'resize-none'].join(' ')}
          {...props}
        />
      ) : (
        <input
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={baseClass}
          {...props}
        />
      )}

      {error && (
        <span className="font-mono text-[9px] uppercase tracking-widest text-[#e11d48]">
          {error}
        </span>
      )}
      {hint && !error && (
        <span className="font-mono text-[9px] text-[#444]">{hint}</span>
      )}
    </div>
  )
}