const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');

function carregar(caminho, dependencias, exportacoes) {
  const codigo = readFileSync(path.join(__dirname, '..', caminho), 'utf8')
    .replace(/^import .*;\r?\n/gm, '').replace(/export (async function|function|const) /g, '$1 ');
  return new Function(...Object.keys(dependencias), `${codigo}\nreturn { ${exportacoes} };`)(...Object.values(dependencias));
}

function armazenamento() {
  const dados = new Map();
  let falharNaChave = null;
  const api = {
    getItem: async (chave) => dados.get(chave) ?? null,
    setItem: async (chave, valor) => {
      if (chave === falharNaChave) throw new Error('Falha simulada.');
      dados.set(chave, valor);
    },
  };
  return { dados, api, falhar: (chave) => { falharNaChave = chave; } };
}

test('estantes de contas distintas ficam isoladas e a importação do legado tem dono', async () => {
  const { api, dados } = armazenamento();
  const chaveEstante = (uid) => `usuario-${uid}`;
  const lerObras = (texto) => texto === null ? [] : JSON.parse(texto);
  const { salvarEstante, lerEstante, importarEstanteAntiga } = carregar('src/services/estante.js', {
    AsyncStorage: api, chaveEstante, lerObras,
  }, 'salvarEstante, lerEstante, importarEstanteAntiga');
  dados.set('@minha-estante/obras-v1', JSON.stringify([{ id: 'antiga', titulo: 'Livro antigo' }]));
  await salvarEstante('A', [{ id: 'nova', titulo: 'Livro da conta A' }]);
  assert.equal((await lerEstante('B')).obras.length, 0);
  assert.equal((await lerEstante('A')).temLegado, true);
  const importadas = await importarEstanteAntiga('A', (await lerEstante('A')).obras);
  assert.equal(importadas.length, 2);
  assert.equal((await lerEstante('A')).temLegado, false);
  assert.equal((await lerEstante('B')).temLegado, false);
  await assert.rejects(importarEstanteAntiga('B', []));
  await assert.rejects(importarEstanteAntiga('A', importadas));
  assert.ok(dados.has('@minha-estante/obras-v1'));
});

test('falha ao importar preserva o legado e permite retomar somente pela mesma conta', async () => {
  const { api, dados, falhar } = armazenamento();
  const { lerEstante, importarEstanteAntiga } = carregar('src/services/estante.js', {
    AsyncStorage: api, chaveEstante: (uid) => `usuario-${uid}`,
    lerObras: (texto) => texto === null ? [] : JSON.parse(texto),
  }, 'lerEstante, importarEstanteAntiga');
  dados.set('@minha-estante/obras-v1', JSON.stringify([{ id: 'antiga' }]));
  falhar('usuario-A');
  await assert.rejects(importarEstanteAntiga('A', []));
  assert.equal((await lerEstante('A')).temLegado, true);
  await assert.rejects(importarEstanteAntiga('B', []));
  falhar(null);
  assert.equal((await importarEstanteAntiga('A', [])).length, 1);
});

test('sessão grande usa o cofre, sobrevive a falha de gravação e é removida ao sair', async () => {
  const dados = new Map();
  let falharParte = false;
  const SecureStore = {
    getItemAsync: async (chave) => dados.get(chave) ?? null,
    setItemAsync: async (chave, valor) => {
      assert.match(chave, /^[a-zA-Z0-9._-]+$/);
      if (falharParte && chave.endsWith('-1')) throw new Error('Falha simulada.');
      dados.set(chave, valor);
    },
    deleteItemAsync: async (chave) => dados.delete(chave),
  };
  const { sessaoSegura } = carregar('src/services/sessaoSegura.js', { SecureStore }, 'sessaoSegura');
  const chave = 'firebase:authUser:projeto:[DEFAULT]';
  const sessao = JSON.stringify({ refreshToken: 'a'.repeat(5000) });
  await sessaoSegura.setItem(chave, sessao);
  assert.equal(await sessaoSegura.getItem(chave), sessao);
  falharParte = true;
  await assert.rejects(sessaoSegura.setItem(chave, 'b'.repeat(5000)));
  assert.equal(await sessaoSegura.getItem(chave), sessao);
  falharParte = false;
  await sessaoSegura.setItem(chave, 'nova-sessao');
  assert.equal(await sessaoSegura.getItem(chave), 'nova-sessao');
  await sessaoSegura.removeItem(chave);
  assert.equal(await sessaoSegura.getItem(chave), null);
  assert.equal(dados.size, 0);
});
