/* Leitura dos relatórios (xlsx/csv) e normalização das linhas. */
(function (root) {
  const FAT = (root.FAT = root.FAT || {});

  function norm(s) {
    return String(s == null ? '' : s)
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toUpperCase().replace(/\s+/g, ' ').trim();
  }

  function parseNum(v) {
    if (v == null || v === '') return 0;
    if (typeof v === 'number') return v;
    let s = String(v).trim().replace(/[R$\s]/g, '');
    const neg = /^\(.*\)$/.test(s) || /^-/.test(s);
    s = s.replace(/[()]/g, '').replace(/^-/, '');
    if (s.includes(',') && s.includes('.')) s = s.lastIndexOf(',') > s.lastIndexOf('.') ? s.replace(/\./g, '').replace(',', '.') : s.replace(/,/g, '');
    else if (s.includes(',')) s = s.replace(',', '.');
    const n = parseFloat(s);
    if (isNaN(n)) return 0;
    return neg ? -n : n;
  }

  function pad(v, n) {
    if (v == null || v === '') return '';
    const s = String(v).trim();
    return /^\d+$/.test(s) && s.length < n ? s.padStart(n, '0') : s;
  }

  function toISODate(v) {
    if (v == null || v === '') return '';
    if (typeof v === 'number') {
      const d = root.XLSX && root.XLSX.SSF ? root.XLSX.SSF.parse_date_code(v) : null;
      if (d) return `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`;
    }
    if (v instanceof Date) return v.toISOString().slice(0, 10);
    const s = String(v).trim();
    let m = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (m) return `${m[1]}-${m[2]}-${m[3]}`;
    m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/);
    if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
    return s;
  }

  const r2 = (n) => Math.round(n * 100) / 100;

  // Assinaturas: cabeçalhos obrigatórios (normalizados) de cada relatório.
  const SIGNATURES = [
    { tipo: 'integracao', nome: 'Relatório de Integração (Protheus)', req: ['ID INTEGRACAO', 'ID OPERACAO LYCEUM', 'HISTORICO', 'VALOR'] },
    { tipo: 'tipoOperacao', nome: 'Tabela de Tipos de Operação', req: ['TIPO_OPERACAO', 'DESCRICAO', 'ATIVA'] },
    { tipo: 'regra', nome: 'Tabela de Regras', req: ['TIPO_OPERACAO', 'ANALISE', 'ACAO'] },
    { tipo: 'movLyceum', nome: 'Movimentação Contábil (Lyceum)', req: ['ID_OPERACAO', 'TIPO_OPERACAO', 'DATACONTAB', 'VALOR'] },
    { tipo: 'razao', nome: 'Razão (Protheus)', req: ['CONTA', 'LOTE/SUB/DOC/LINHA', 'HISTORICO', 'DEBITO', 'CREDITO'] },
    { tipo: 'baseAlunos', nome: 'Base de Alunos (BI)', req: ['RA', 'TIPO DE ALUNO', 'UNIDADE BI'] },
    { tipo: 'alunosLyceum', nome: 'Alunos por matrícula (Lyceum)', req: ['MATRICULA', 'SEMESTRE', 'TIPO'] },
  ];

  function findHeader(aoa) {
    const lim = Math.min(aoa.length, 12);
    for (let i = 0; i < lim; i++) {
      const row = aoa[i] || [];
      const idx = {};
      row.forEach((h, j) => { const k = norm(h); if (k && !(k in idx)) idx[k] = j; });
      for (const sig of SIGNATURES) {
        if (sig.req.every((h) => h in idx)) return { sig, row: i, idx };
      }
    }
    return null;
  }

  const MAPPERS = {
    integracao(r, c) {
      return {
        filial: pad(r[c['FILIAL']], 6),
        idIntegracao: r[c['ID INTEGRACAO']],
        status: String(r[c['STATUS']] ?? '').trim(),
        data: toISODate(r[c['DATA']]),
        valor: r2(Math.abs(parseNum(r[c['VALOR']]))),
        historico: String(r[c['HISTORICO']] ?? ''),
        idOp: String(r[c['ID OPERACAO LYCEUM']] ?? '').trim(),
        tipoOp: String(r[c['TIPO OPERACAO']] ?? '').trim(),
        descTipoOp: String(r[c['DESC. TIPO OPERACAO']] ?? ''),
        cobranca: String(r[c['DOC. LYCEUM']] ?? ''),
        aluno: String(r[c['NOME ALUNO']] ?? ''),
        tipoContab: String(r[c['TIPO CONTAB.']] ?? '').trim(),
        msgErro: String(r[c['MSG. ERRO']] ?? '').trim(),
      };
    },
    movLyceum(r, c, hdrNorm) {
      const raw = {};
      hdrNorm.forEach((h, j) => { if (h && !(h in raw)) raw[h] = r[j]; });
      return {
        idOp: String(r[c['ID_OPERACAO']] ?? '').trim(),
        data: toISODate(r[c['DATACONTAB']]),
        valor: r2(Math.abs(parseNum(r[c['VALOR']]))),
        tipoOp: String(r[c['TIPO_OPERACAO']] ?? '').trim(),
        nomeTipoOp: String(r[c['NOME_TIPO_OPERACAO']] ?? ''),
        cobranca: String(r[c['COBRANCA']] ?? ''),
        aluno: String(r[c['ALUNO']] ?? ''),
        unidade: pad(r[c['UNIDADE']], 2),
        raw,
      };
    },
    razao(r, c) {
      const deb = parseNum(r[c['DEBITO']]);
      const cred = parseNum(r[c['CREDITO']]);
      return {
        conta: String(r[c['CONTA']] ?? '').trim(),
        data: toISODate(r[c['DATA']]),
        lote: String(r[c['LOTE/SUB/DOC/LINHA']] ?? '').slice(0, 6),
        historico: String(r[c['HISTORICO']] ?? ''),
        filial: pad(r[c['FILIAL DE ORIGEM']], 6),
        cc: String(r[c['C CUSTO']] ?? '').trim(),
        itemConta: String(r[c['ITEM CONTA']] ?? '').trim(),
        movimento: r2(deb - cred),
        valor: r2(Math.abs(deb - cred)),
      };
    },
    baseAlunos(r, c) {
      return {
        ra: String(r[c['RA']] ?? '').trim(),
        status: c['STATUS BI'] != null ? parseNum(r[c['STATUS BI']]) : 1,
        tipoAluno: norm(r[c['TIPO DE ALUNO']]),
        unidadeBI: String(r[c['UNIDADE BI']] ?? '').trim(),
        serie: parseNum(r[c['SERIE']]),
      };
    },
    alunosLyceum(r, c) {
      return {
        ra: String(r[c['MATRICULA']] ?? '').trim(),
        tipoAluno: norm(r[c['TIPO']]),
        serie: parseNum(r[c['SEMESTRE']]),
      };
    },
    tipoOperacao(r, c) {
      return {
        codigo: String(r[c['TIPO_OPERACAO']] ?? '').trim(),
        descricao: String(r[c['DESCRICAO']] ?? '').trim(),
        tipo: String(r[c['TIPO']] ?? '').trim(),
      };
    },
    regra(r, c) {
      return {
        tipo: String(r[c['TIPO_OPERACAO']] ?? '').trim(),
        nome: String(r[c['NOME_TIPO_OPERACAO']] ?? '').trim(),
        analise: String(r[c['ANALISE']] ?? '').trim(),
        acao: String(r[c['ACAO']] ?? '').trim(),
        condicao: null,
      };
    },
  };

  const KEY_FIELD = { integracao: 'idOp', movLyceum: 'idOp', razao: 'conta', baseAlunos: 'ra', alunosLyceum: 'ra', tipoOperacao: 'codigo', regra: 'tipo' };

  // Lê um workbook (ArrayBuffer) e devolve os relatórios reconhecidos.
  function readWorkbook(data, fileName) {
    const XLSX = root.XLSX;
    const wb = XLSX.read(data, { type: 'array', dense: true, cellFormula: false, cellHTML: false, cellText: false, cellStyles: false });
    const found = [];
    for (const sn of wb.SheetNames) {
      const aoa = XLSX.utils.sheet_to_json(wb.Sheets[sn], { header: 1, raw: true, defval: null, blankrows: false });
      const h = findHeader(aoa);
      if (!h) continue;
      const hdrNorm = (aoa[h.row] || []).map(norm);
      const map = MAPPERS[h.sig.tipo];
      const rows = [];
      for (let i = h.row + 1; i < aoa.length; i++) {
        const r = aoa[i];
        if (!r) continue;
        const o = map(r, h.idx, hdrNorm);
        if (!o[KEY_FIELD[h.sig.tipo]]) continue;
        rows.push(o);
      }
      found.push({ tipo: h.sig.tipo, nome: h.sig.nome, arquivo: fileName, aba: sn, linhas: rows.length, rows });
    }
    return found;
  }

  FAT.parse = { readWorkbook, norm, parseNum, toISODate, pad, SIGNATURES };
})(typeof window !== 'undefined' ? window : globalThis);
