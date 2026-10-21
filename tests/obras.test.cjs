const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFile } = require('node:fs/promises');
const path = require('node:path');

const utilitarios = readFile(path.join(__dirname, '../src/utils/obras.js'), 'utf8')
  .then((codigo) => import(`data:text/javascript;base64,${Buffer.from(codigo).toString('base64')}`));

const obras = [
  { id: '1', titulo: 'O Senhor dos Anéis', status: 'lendo' },
  { id: '2', titulo: 'É Assim que Acaba', status: 'concluido' },
  { id: '3', titulo: 'Senhor das Moscas', status: 'quero-ler' },
];

test('busca por trecho ignora maiúsculas, acentos e espaços externos', async () => {
  const { filtrarObras } = await utilitarios;
  assert.deepEqual(filtrarObras(obras, 'todos', '  ANEIS  '), [obras[0]]);
  assert.deepEqual(filtrarObras(obras, 'todos', 'é ASSIM'), [obras[1]]);
  assert.deepEqual(filtrarObras(obras, 'todos', 'senhor'), [obras[0], obras[2]]);
});

test('combina o filtro de status com o título', async () => {
  const { filtrarObras } = await utilitarios;
  assert.deepEqual(filtrarObras(obras, 'quero-ler', 'senhor'), [obras[2]]);
  assert.deepEqual(filtrarObras(obras, 'concluido', 'senhor'), []);
});

test('consulta vazia mantém as obras da seção', async () => {
  const { filtrarObras } = await utilitarios;
  assert.deepEqual(filtrarObras(obras, 'todos'), obras);
  assert.deepEqual(filtrarObras(obras, 'lendo', '   '), [obras[0]]);
  assert.deepEqual(filtrarObras([], 'todos', 'livro'), []);
  assert.deepEqual(filtrarObras(obras, 'todos', 'inexistente'), []);
});

test('preserva a ordem e não modifica a lista nem seus registros', async () => {
  const { filtrarObras } = await utilitarios;
  const registros = Object.freeze(obras.map((obra) => Object.freeze({ ...obra })));
  const antes = JSON.stringify(registros);
  const resultado = filtrarObras(registros, 'todos', 'senhor');
  assert.equal(JSON.stringify(registros), antes);
  assert.notEqual(resultado, registros);
  assert.deepEqual(resultado, [registros[0], registros[2]]);
});
