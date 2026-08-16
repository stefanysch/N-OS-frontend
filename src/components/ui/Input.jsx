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
  onBlur,
  placeholder,
  required,
  disabled,
  error,
  hint,
  as: Tag = 'input',
  options = [],
  className = '',
  ...props
}) {
  const baseClass = [
    'w-full bg-transparent',
    'pb-2 font-mono text-sm',
    'text-(--nos-text)',
    'placeholder-(--nos-text-faint)',
    'outline-none transition-colors duration-150',
    // borda inferior — muda conforme estado
    error
      ? 'border-b border-(--nos-red) focus:border-(--nos-red)'
      : required && !value
        ? 'border-b border-(--nos-red-border) focus:border-(--nos-red)'
        : 'border-b border-(--nos-border-2) focus:border-(--nos-red)',
    disabled ? 'opacity-40 pointer-events-none' : '',
    className,
  ].filter(Boolean).join(' ')

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label
          htmlFor={name}
          className={[
            'font-mono text-[10px] uppercase tracking-[0.15em] transition-colors duration-150',
            // label fica vermelha se tem erro ou se é required e está vazio
            error
              ? 'text-(--nos-red)'
              : required && !value
                ? 'text-(--nos-red-border)'
                : 'text-(--nos-text-muted)',
          ].join(' ')}
        >
          {label}
          {required && (
            <span className="ml-1 text-(--nos-red)">*</span>
          )}
        </label>
      )}

      {Tag === 'select' ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          className={[baseClass, 'appearance-none cursor-pointer'].join(' ')}
          {...props}
        >
          {options.map((opt) => (
            <option
              key={opt.value}
              value={opt.value}
              className="bg-(--nos-surface) text-(--nos-text)"
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
          onBlur={onBlur}
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
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={baseClass}
          {...props}
        />
      )}

      {error && (
        <span className="font-mono text-[9px] uppercase tracking-widest text-(--nos-red)">
          {error}
        </span>
      )}

      {hint && !error && (
        <span className="font-mono text-[9px] text-(--nos-text-faint)">
          {hint}
        </span>
      )}
    </div>
  )
}