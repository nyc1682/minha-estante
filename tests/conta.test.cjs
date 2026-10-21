const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');

const codigo = readFileSync(path.join(__dirname, '../src/utils/conta.js'), 'utf8');
const modulo = import(`data:text/javascript;base64,${Buffer.from(codigo).toString('base64')}`);

test('cadastro exige formato de e-mail e as quatro regras da senha', async () => {
  const { validarConta, normalizarEmail, requisitosSenha } = await modulo;
  assert.equal(normalizarEmail('  Pessoa@EXEMPLO.COM '), 'pessoa@exemplo.com');
  const senha = 'Teste123!';
  assert.equal(validarConta('pessoa@exemplo.com', senha, senha), null);
  for (const invalida of ['Ab1!', 'teste123!', 'Testeabc!', 'Teste1234']) {
    assert.ok(validarConta('pessoa@exemplo.com', invalida, invalida));
  }
  for (const email of ['', 'pessoa', 'pessoa@', 'pessoa@site', 'pessoa @site.com']) {
    assert.ok(validarConta(email, senha, senha));
  }
  assert.ok(validarConta('pessoa@exemplo.com', senha, 'Outra123!'));
  assert.equal(requisitosSenha(senha).every((regra) => regra.atendido), true);
});

test('a política remota deve exigir complexidade, não só o formulário', async () => {
  const { politicaSenhaSegura } = await modulo;
  const politica = { enforcementState: 'ENFORCE', customStrengthOptions: {
    minPasswordLength: 8, containsUppercaseLetter: true, containsNumericCharacter: true,
    containsNonAlphanumericCharacter: true,
  } };
  assert.equal(politicaSenhaSegura(politica), true);
  assert.equal(politicaSenhaSegura({ ...politica, enforcementState: 'OFF' }), false);
  assert.equal(politicaSenhaSegura({ ...politica, customStrengthOptions: { ...politica.customStrengthOptions, minPasswordLength: 6 } }), false);
  assert.equal(politicaSenhaSegura({ ...politica, customStrengthOptions: { ...politica.customStrengthOptions, containsUppercaseLetter: false } }), false);
});

test('a chave dos dados depende do usuário e erros de login não revelam existência da conta', async () => {
  const { chaveEstante, mensagemAutenticacao } = await modulo;
  assert.notEqual(chaveEstante('usuarioA'), chaveEstante('usuarioB'));
  assert.throws(() => chaveEstante(''));
  assert.throws(() => chaveEstante('../outra-conta'));
  assert.equal(mensagemAutenticacao({ code: 'auth/user-not-found' }), mensagemAutenticacao({ code: 'auth/wrong-password' }));
  assert.equal(mensagemAutenticacao({ code: 'auth/invalid-credential' }), mensagemAutenticacao({ code: 'auth/wrong-password' }));
});
