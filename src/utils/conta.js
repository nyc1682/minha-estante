export const CARACTERES_ESPECIAIS = `^$*.[]{}()?"!@#%&/\\,><':;|_~`;

export function normalizarEmail(email) {
  return email.trim().toLowerCase();
}

export function emailTemFormatoValido(email) {
  const texto = normalizarEmail(email);
  return texto.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(texto);
}

export function requisitosSenha(senha) {
  return [
    { texto: 'Pelo menos 8 caracteres', atendido: senha.length >= 8 },
    { texto: 'Uma letra maiúscula (A–Z)', atendido: /[A-Z]/.test(senha) },
    { texto: 'Um número (0–9)', atendido: /[0-9]/.test(senha) },
    { texto: 'Um caractere especial, como @, # ou !',
      atendido: Array.from(senha).some((letra) => CARACTERES_ESPECIAIS.includes(letra)) },
  ];
}

export function validarConta(email, senha, confirmacao) {
  if (!emailTemFormatoValido(email)) return 'Informe um e-mail válido, como nome@exemplo.com.';
  if (senha.length > 128) return 'Use uma senha com no máximo 128 caracteres.';
  if (requisitosSenha(senha).some((item) => !item.atendido)) return 'Sua senha precisa atender às quatro regras abaixo.';
  if (senha !== confirmacao) return 'As senhas não são iguais.';
  return null;
}

export function mensagemAutenticacao(erro) {
  const mensagens = {
    'auth/invalid-credential': 'Não foi possível entrar. Confira seu e-mail e sua senha.',
    'auth/invalid-login-credentials': 'Não foi possível entrar. Confira seu e-mail e sua senha.',
    'auth/user-not-found': 'Não foi possível entrar. Confira seu e-mail e sua senha.',
    'auth/wrong-password': 'Não foi possível entrar. Confira seu e-mail e sua senha.',
    'auth/email-already-in-use': 'Não foi possível criar a conta. Se já possui cadastro, entre ou recupere a senha.',
    'auth/invalid-email': 'Confira o formato do seu e-mail.',
    'auth/weak-password': 'Escolha uma senha que atenda às quatro regras do cadastro.',
    'auth/password-does-not-meet-requirements': 'Escolha uma senha que atenda às quatro regras do cadastro.',
    'auth/network-request-failed': 'Sem conexão com o serviço de contas. Confira sua internet e tente novamente.',
    'auth/too-many-requests': 'Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.',
    'auth/user-disabled': 'Não foi possível acessar esta conta. Entre em contato com o suporte.',
    'auth/operation-not-allowed': 'O serviço de contas ainda precisa habilitar o login por e-mail e senha.',
    'auth/configuration-not-found': 'O serviço de contas ainda precisa ser ativado no Firebase.',
    'auth/email-nao-confirmado': 'Seu e-mail ainda não foi confirmado. Abra o link recebido e tente novamente.',
    'auth/configuracao-ausente': 'O serviço de contas ainda não foi configurado. Consulte o guia de autenticação.',
    'auth/politica-insegura': 'O serviço ainda precisa ativar as regras obrigatórias de senha. Consulte o guia de autenticação.',
  };
  return mensagens[erro?.code] ?? 'Não foi possível concluir esta ação. Tente novamente.';
}

export function politicaSenhaSegura(politica) {
  const regras = politica?.customStrengthOptions;
  return politica?.enforcementState === 'ENFORCE' && regras?.minPasswordLength >= 8
    && regras.containsUppercaseLetter === true && regras.containsNumericCharacter === true
    && regras.containsNonAlphanumericCharacter === true;
}

export function chaveEstante(uid) {
  if (typeof uid !== 'string' || !/^[a-zA-Z0-9_-]{1,128}$/.test(uid)) throw new Error('Usuário inválido.');
  return `@minha-estante/usuarios/${uid}/obras-v1`;
}
