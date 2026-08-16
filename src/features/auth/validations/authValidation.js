export function validarLogin({ email, senha }) {
  const erros = {}

  if (!email.trim()) {
    erros.email = 'Informe o e-mail.'
  }

  if (!senha.trim()) {
    erros.senha = 'Informe a senha.'
  }

  return erros
}
