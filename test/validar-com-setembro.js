/*
 * Valida os motores do portal com as planilhas reais de set/26.
 * Uso: NODE_PATH=<pasta com node_modules/xlsx> node test/validar-com-setembro.js "<pasta das planilhas>"
 */
const fs = require('fs');
const path = require('path');
globalThis.XLSX = require('xlsx');
['config', 'parse', 'conferencia', 'resumo'].forEach((m) => require(path.join(__dirname, '..', 'js', m + '.js')));
const FAT = globalThis.FAT;

const pasta = process.argv[2];
const ler = (nome) => {
  const t = Date.now();
  const r = FAT.parse.readWorkbook(new Uint8Array(fs.readFileSync(path.join(pasta, nome))), nome);
  console.log(`\n[${nome}] lido em ${((Date.now() - t) / 1000).toFixed(1)}s`);
  r.forEach((x) => console.log(`  - ${x.nome} (aba "${x.aba}"): ${x.linhas} linhas`));
  return Object.fromEntries(r.map((x) => [x.tipo, x.rows]));
};
let falhas = 0;
const esperar = (rotulo, obtido, esperado, tol = 0.01) => {
  const ok = Math.abs(obtido - esperado) <= tol;
  if (!ok) falhas++;
  console.log(`  ${ok ? 'OK ' : 'ERRO'} ${rotulo}: obtido ${obtido.toFixed ? obtido.toFixed(2) : obtido} | esperado ${esperado}`);
};

// ---------- Frente 1 ----------
const a = ler('Clariens - Integração Set26_01.10.xlsx');
const c = FAT.conferencia.run({ integracao: a.integracao, mov: a.movLyceum, razao: a.razao, rotina: 'Faturamento', config: FAT.DEFAULT_CONFIG });
console.log('\nFRENTE 1 - Conferência (Faturamento):', JSON.stringify(c.kpis));
esperar('operações de faturamento no Lyceum', c.kpis.total, 47417, 0);
esperar('contabilizadas (integração + razão)', c.kpis.contabilizado, 47312, 0);
esperar('não integraram', c.kpis.nao_integrado, 105, 0);
console.log('  pendências por tipo:', c.porTipo.map((p) => `${p.tipoOp}-${p.nome}: ${p.qtd}`).join(' | '));
console.log('  dias/unidades a reprocessar:', c.reprocessar.map((r) => `${r.filial} ${r.dia} (${r.qtd})`).join(' | '));
const cb = FAT.conferencia.run({ integracao: a.integracao, mov: a.movLyceum, razao: a.razao, rotina: 'Baixa', config: FAT.DEFAULT_CONFIG });
console.log('\nFRENTE 1 - Conferência (Baixa) sobre a mesma base:', JSON.stringify({ total: cb.kpis.total, just: cb.kpis.justificado, naoInt: cb.kpis.nao_integrado }));

// ---------- Frente 2 ----------
const b = ler('CLARIENS - Resumo de Tópicos Set26.xlsx');
const r = FAT.resumo.run({ razao: b.razao, baseAlunos: b.baseAlunos, alunosLyceum: b.alunosLyceum, config: FAT.DEFAULT_CONFIG });
const T = FAT.resumo.T;
const ESPERADO = { // aba CONSOLIDADO da planilha de set/26
  'SALVADOR': [2123, -30269422.75, -24495, -62675.37, 834926.77, 1343525.7485, 1856179.73, 2602971.23, 454408.76625, 435306.17, 101558.68],
  'UNECE MED': [321, -3828839.86, -6480, 2475.93, 577870.39, 88623.3138, 321045.16, 303339.01, 76706.3972, 36929.4, 2000],
  'UNECE EXMED': [299, -433050.39, -850, -807.05, 60269.57, 8715.4425, 2123.16, 83116.07, 12149.21092, 2467.58, 91399.57],
  'ITUMBIARA': [875, -11570875.42, -5590, -28298.87, 95715.8, 309811.2081, 235452.04, 1153709.35, 266258.70466, 233349.38, 9000],
  // Divergência conhecida: a planilha não levou o CF (curso de férias) de -169.736,00 que está no razão
  // (conta 301010101002). Com ele: Impostos 150.261,74 + 3.394,72 e PDD 135.783,59 + 2.715,78.
  'POUSO ALEGRE MED': [759, -8470174.64, -16300, -11037.75, 93329.41, 153656.4614, 663933.4, 880058.16, 138499.37024, 109.05, 6000],
  'POUSO ALEGRE EXMED': [99, -377637.6, 0, 12911.72, 0, 7120.824, 29882.79, 21596.4, 755.2752, 0, 500],
  'ARAGUARI MED': [1417, -19451946.83, -33130, -55100.67, 406064.26, 533902.1919, 380563.86, 1282272.84, 194850.7683, 541526.39, 11178],
  'ARAGUARI EXMED': [1863, -2150163.7, 30200, -4637.66, 192581.01, 45891.1758, 8547.41, 406536.45, 48759.1651, 24086.71, 1200],
};
const COLS = ['qtd', T.FAT, T.TXMAT, T.RECFIN, T.DESCINC, T.IMPOSTOS, T.DEDFIES, T.PROUNI, T.PDD, T.DESCPONT, T.DESCCOND];
console.log('\nFRENTE 2 - Resumo de Tópicos x aba CONSOLIDADO:');
for (const linha of r.consolidado) {
  const esp = ESPERADO[linha.unidade];
  console.log(` ${linha.unidade}`);
  COLS.forEach((col, i) => esperar(col, linha[col], esp[i], 0.05));
}
console.log('\nCheck razão x resumo / alunos BI:');
r.unidades.forEach((u) => console.log(`  ${u.unidade}: dif faturamento ${u.check.difFaturamento.toFixed(2)} | dif alunos ${u.check.difAlunos}`));
console.log(`Exceções: ${r.excecoes.semAluno.length} lançamentos sem aluno classificado, ${r.excecoes.foraUnidade.length} fora das unidades, ${r.excecoes.contasSemTopico.length} contas de receita sem tópico (${r.excecoes.contasSemTopico.map((x) => x.conta).join(', ')})`);

console.log(falhas ? `\n${falhas} verificação(ões) falharam.` : '\nTodas as verificações bateram com as planilhas de setembro.');
process.exit(falhas ? 1 : 0);
