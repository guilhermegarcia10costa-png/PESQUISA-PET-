// RAIO-X v5 · Dear Bron · acessórios de passeio personalizados para cães
// Gera as 12 telas do padrão V3 "case file operacional" + build.json.
// Modela templates/exemplo-layout/paginas/exemplo.mjs. Nenhum número inventado:
// contagens de anúncio = conector Meta (refresh 01/09/2026); economia = calculada.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const PAG = path.join(ROOT, 'paginas');

/* ---------- formatação ---------- */
const esc = (v = '') => String(v).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const attr = v => esc(v).replaceAll("'", '&#39;');
const n = (v, d = 0) => Number(v).toLocaleString('pt-BR', { maximumFractionDigits: d });
const usd = (v, d = 2) => '$' + Number(v).toLocaleString('en-US', { maximumFractionDigits: d, minimumFractionDigits: d });
const pct = (v, d = 0) => n(v, d) + '%';

/* ---------- componentes ---------- */
const NAT = { obs: 'observado', calc: 'calculado', inf: 'inferido', rec: 'recomendado', ex: 'exemplo' };
const nat = k => '<span class="nat ' + k + '">' + NAT[k] + '</span>';
const legendNat = () => '<div class="legend"><span>' + nat('obs') + ' visto na fonte</span><span>' + nat('calc') + ' conta declarada</span><span>' + nat('inf') + ' leitura do analista</span><span>' + nat('rec') + ' ação sugerida</span><span><span class="na">não obtido</span> a fonte não entregou, motivo ao lado</span></div>';
const pill = (t, c = 'n') => '<span class="pill ' + c + '">' + esc(t) + '</span>';
const na = (why) => '<span class="na">não obtido' + (why ? '<span class="why">' + esc(why) + '</span>' : '') + '</span>';
function stat({ v, l, d, k = 'obs', src, naWhy, bar, trend }) {
  const value = naWhy ? '<div class="v na">não obtido</div>' : '<div class="v">' + v + (trend != null ? '<span class="trend ' + (trend >= 0 ? 'up' : 'down') + '">' + (trend >= 0 ? '▲' : '▼') + ' ' + pct(Math.abs(trend), 1) + '</span>' : '') + '</div>';
  return '<div class="stat">' + value + '<div class="l">' + l + '</div>' + (naWhy ? '<div class="d">' + esc(naWhy) + '</div>' : d ? '<div class="d">' + d + '</div>' : '') +
    (bar != null ? '<div class="bar"><i style="width:' + Math.max(0, Math.min(100, bar)) + '%"></i></div>' : '') +
    '<div>' + nat(naWhy ? 'obs' : k) + (src ? ' <small>· ' + src + '</small>' : '') + '</div></div>';
}
const note = (text, c = '', eyebrow = '') => '<div class="note ' + c + '">' + (eyebrow ? '<span class="eyebrow ' + (c || '') + '">' + esc(eyebrow) + '</span>' : '') + text + '</div>';
function table(head, rows, opts = {}) {
  const th = head.map(h => '<th' + (h.num ? ' class="num"' : '') + '>' + (h.t || h) + '</th>').join('');
  return '<div class="tbl"><table class="' + (opts.cls || '') + '"><thead><tr>' + th + '</tr></thead><tbody>' + rows.join('') + '</tbody></table></div>';
}
const td = (v, cls = '') => '<td' + (cls ? ' class="' + cls + '"' : '') + '>' + v + '</td>';
const tr = (cells, cls = '') => '<tr' + (cls ? ' class="' + cls + '"' : '') + '>' + cells.join('') + '</tr>';
function evidence({ fonte, obs, interp, dec, next, decCls = '' }) {
  const st = (cls, lb, sub, tx, tag) => '<div class="st ' + cls + '"><div class="lb">' + lb + '<small>' + sub + '</small></div><div class="tx">' + tx + ' <small>' + nat(tag) + '</small></div></div>';
  return '<div class="ev">' +
    st('fonte', 'Fonte', 'de onde veio', fonte, 'obs') +
    st('obs', 'Observação', 'o que foi visto', obs, 'obs') +
    st('interp', 'Interpretação', 'o que isso sugere', interp, 'inf') +
    st('dec ' + decCls, 'Decisão', 'o que a régua diz', dec, 'calc') +
    st('next', 'Próxima ação', 'o que fazer agora', next, 'rec') + '</div>';
}
const GATE_NAMES = ['Demanda', 'Catálogo', 'Criativos', 'Economia', 'Janela', 'Vantagem', 'Operação'];
const GATE_Q = ['Tem gente comprando isso agora?', 'Dá para crescer o catálogo depois?', 'Os criativos aguentam variação?', 'A conta fecha em cada venda?', 'Ainda dá tempo de entrar?', 'Você tem alguma vantagem aqui?', 'Você consegue operar isso hoje?'];
const SYM = { pass: '✓', warn: '!', fail: '✕', na: '–' };
const STATE_LABEL = { pass: 'abriu', warn: 'abriu com condição', fail: 'fechou', na: 'não medido' };
const STATE_PILL = { pass: 'g', warn: 'a', fail: 'r', na: 'a' };
function gates(id, list) {
  const btns = list.map((g, i) => '<button class="gate ' + g.st + '" role="tab" data-gate="G' + (i + 1) + '" aria-selected="false" aria-controls="' + id + '"><span class="sym">' + SYM[g.st] + '</span><span class="k">G' + (i + 1) + '</span>' + GATE_NAMES[i] + '</button>').join('');
  const dataObj = {};
  list.forEach((g, i) => { dataObj['G' + (i + 1)] = { nome: GATE_NAMES[i], q: GATE_Q[i], o: g.o, src: g.src, state: pill(STATE_LABEL[g.st], STATE_PILL[g.st]) + ' ' + nat(g.k || 'inf') }; });
  return '<div class="gates" role="tablist" aria-label="Portões" data-detail="' + id + '">' + btns + '</div>' +
    '<div class="legend"><span><span class="gate pass" style="min-height:0;padding:2px 8px"><span class="sym">✓</span></span> abriu</span><span><span class="gate warn" style="min-height:0;padding:2px 8px"><span class="sym">!</span></span> abriu com condição</span><span><span class="gate fail" style="min-height:0;padding:2px 8px"><span class="sym">✕</span></span> fechou</span><span><span class="gate na" style="min-height:0;padding:2px 8px"><span class="sym">–</span></span> não medido</span></div>' +
    '<div class="gate-detail" id="' + id + '" hidden data-gates=\'' + JSON.stringify(dataObj).replaceAll("'", '&#39;') + '\'><div><span class="eyebrow gd-code"></span><div class="q" style="margin-top:6px"></div><div class="o"></div><div class="state"></div></div><div class="gside"><span class="eyebrow b">Fonte e limite</span><div class="src"></div></div></div>';
}
const btn = (label, href, cls = '', ext = false) => '<a class="btn ' + cls + '" href="' + href + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' + label + (ext ? ' <span class="ar">↗</span>' : '') + '</a>';
const spark = (arr) => '<span class="spark" title="variação mensal">' + arr.map(v => '<i class="' + (v >= 0 ? 'up' : 'dn') + '" style="height:' + Math.max(3, Math.min(18, Math.round(Math.abs(v) / 30 * 18 + 3))) + 'px"></i>').join('') + '</span>';
const adlibUrl = d => 'https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=ALL&q=' + encodeURIComponent(d) + '&search_type=keyword_unordered';

/* ---------- navegação ---------- */
const NAV = [
  { grp: 'DECISÃO' },
  { id: 'central', label: 'Central da oportunidade', file: 'Pesquisa - clique aqui.html', k: '00', root: true, short: 'Central' },
  { grp: 'EVIDÊNCIAS' },
  { id: 'demanda', label: 'Demanda observada', file: 'demanda.html', k: '01' },
  { id: 'mercados', label: 'Mercados e país', file: 'mercados.html', k: '02' },
  { id: 'concorrentes', label: 'Concorrentes', file: 'concorrentes.html', k: '03', short: 'Lojas' },
  { id: 'anuncios', label: 'Criativos e prova', file: 'anuncios.html', k: '04' },
  { grp: 'EXECUÇÃO' },
  { id: 'estrategia', label: 'Estratégia', file: 'estrategia.html', k: '05' },
  { id: 'plano', label: 'Plano de ação', file: 'plano-de-acao.html', k: '06', short: 'Plano' },
  { id: 'catalogo', label: 'Catálogo e oferta', file: 'catalogo-oferta.html', k: '07' },
  { id: 'benchmark', label: 'Loja: benchmark e blueprint', file: 'benchmark-visual.html', k: '08' },
  { id: 'identidade', label: 'Identidade e imagens', file: 'identidade-visual.html', k: '09' },
  { grp: 'APOIO' },
  { id: 'dados', label: 'Dados, fontes e artefatos', file: 'dados-fontes.html', k: '10' },
  { id: 'metodo', label: 'Método, limites e auditoria', file: 'metodo.html', k: '11' },
];
const href = (item, fromRoot) => item.root ? (fromRoot ? encodeURIComponent(item.file) : '../' + encodeURIComponent(item.file)) : (fromRoot ? 'paginas/' : '') + item.file;

const D = JSON.parse(fs.readFileSync(path.join(__dirname, 'dados-brutos.json'), 'utf8'));
const C = D.case;

function sidebar(current, fromRoot) {
  let out = '';
  for (const it of NAV) {
    if (it.grp) { out += '<div class="grp">' + it.grp + '</div>'; continue; }
    const cur = current === it.id;
    out += '<a class="' + (cur ? 'on' : '') + '" href="' + href(it, fromRoot) + '"' + (cur ? ' aria-current="page"' : '') + '><span class="dot"></span>' + it.label + '<span class="k">' + it.k + '</span></a>';
    if (it.id === 'concorrentes') out += D.lojas.map(s => '<a class="sub ' + (current === s.slug ? 'on' : '') + '" href="' + (fromRoot ? 'paginas/' : '') + 'loja-' + s.slug + '.html"><span class="dot"></span>' + esc(s.nome) + '<span class="k">' + pill(s.veredito.slice(0, 3), { MODELAR: 'g', OBSERVAR: 'a', IGNORAR: 'r' }[s.veredito]) + '</span></a>').join('');
  }
  return '<aside class="side" id="side"><div class="brand"><span class="mark"><i></i></span><b>RAIO-X</b><span class="v">ENTREGA V3</span></div>' +
    '<div class="case"><div class="code">' + C.code + '</div><div class="name">' + esc(C.nicho) + ' · ' + C.paisAnuncio + '</div><div class="dec"><span class="pill a">' + esc(C.decisao) + '</span></div></div>' +
    '<nav aria-label="Navegação global">' + out + '</nav>' +
    '<div class="rule"><b>Régua desta entrega.</b> Todo número traz a natureza (observado, calculado, inferido, recomendado). Dado que a fonte não entregou aparece como <span class="na">não obtido</span>, com o motivo. Anúncio ativo prova continuidade, não escala.</div></aside>';
}
function bottomnav(current, fromRoot) {
  const items = ['central', 'demanda', 'concorrentes', 'plano', 'metodo'].map(id => NAV.find(i => i.id === id));
  return '<nav class="bottomnav" aria-label="Navegação principal">' + items.map(i => '<a class="' + (current === i.id ? 'on' : '') + '" href="' + (current === i.id ? '#top' : href(i, fromRoot)) + '"><span class="ic"></span>' + (i.short || i.label.split(' ')[0]) + '</a>').join('') + '</nav>';
}
function doc({ title, current, screen, body, fromRoot = false, next }) {
  const base = fromRoot ? 'paginas/' : '';
  const nextBar = next ? '<div class="next-action"><span class="eyebrow">Próxima ação</span><div class="tx">' + next.t + (next.s ? '<small>' + next.s + '</small>' : '') + '</div>' + btn(next.b, next.h, 'primary', !!next.ext) + '</div>' : '';
  const html = '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' + esc(title) + '</title><link rel="stylesheet" href="' + base + 'estilo.css"></head><body><div class="app" id="top">' +
    sidebar(current, fromRoot) + '<div class="side-bd"></div><div class="main">' +
    '<div class="topbar"><button class="menu" aria-label="Abrir menu" aria-expanded="false" aria-controls="side">☰</button><span class="code">TELA<b>' + esc(screen.code) + '</b></span><span class="sep"></span><span class="title">' + esc(screen.title) + '</span><span class="sp"></span><span class="date">coleta ' + C.coleta + ' · auditoria ' + C.auditoria + ' · entrega v5 ' + C.entrega + '</span></div>' +
    '<main class="page">' + body + nextBar + '</main></div></div>' + bottomnav(current, fromRoot) +
    '<div class="drawer" id="drawer" role="dialog" aria-modal="true" aria-label="Prova"><div class="bd"></div><div class="panel"><button class="close" aria-label="Fechar">✕</button><div class="content"></div></div></div>' +
    '<script src="' + base + 'app.js"></script></body></html>';
  return html.replaceAll(' — ', ', ').replaceAll('—', ', ');
}
const pageHead = ({ eyebrow, h1, answer, meta = [], eyeCls = '' }) => '<header class="ph"><span class="eyebrow ' + eyeCls + '">' + eyebrow + '</span><h1>' + h1 + '</h1>' + (answer ? '<p class="answer">' + answer + '</p>' : '') + (meta.length ? '<div class="meta">' + meta.map(m => '<span>' + m + '</span>').join('') + '</div>' : '') + '</header>';
const toc = items => '<nav class="toc" aria-label="Nesta tela">' + items.map(([id, l]) => '<a href="#' + id + '">' + l + '</a>').join('') + '</nav>';
const sec = (id, num, title, inner, lead = '') => '<section class="blk" id="' + id + '"><h2><span class="n">' + num + '</span>' + title + '</h2>' + (lead ? '<p class="lead">' + lead + '</p>' : '') + inner + '</section>';
function footer(fromRoot) {
  const m = NAV.find(i => i.id === 'metodo');
  return '<footer class="foot"><span>Raio-X v5, ' + esc(C.code) + '. Contagens de anúncio pelo conector Meta (' + C.auditoria + ').</span><span>Estimativas são faixas de decisão, não dados contábeis.</span><a href="' + href(m, fromRoot) + '">Método, limites e auditoria</a><a class="backtop" href="#top">↑ topo</a></footer>';
}
const write = (f, html) => { fs.writeFileSync(path.join(f === C.central ? ROOT : PAG, f), html); console.log('  ' + f); };
const verPill = v => pill(v, { MODELAR: 'g', OBSERVAR: 'a', IGNORAR: 'r' }[v]);
const legendVer = () => '<div class="legend"><span>' + pill('MODELAR', 'g') + ' estrutura replicável por iniciante</span><span>' + pill('OBSERVAR', 'a') + ' referência, não clone</span><span>' + pill('IGNORAR', 'r') + ' sem prioridade</span></div>';

/* ================= TELA 00 · CENTRAL ================= */
function central() {
  const o = D.oferta, e = D.economia;
  const body = pageHead({
    eyebrow: C.code + ' · raio-x de nicho, modo profundo · nível iniciante',
    h1: C.nicho + ': <em>' + C.emphasis + '</em>',
    answer: 'Seis operações e um mercado lidos para uma pergunta só: <b>vale entrar, com o quê, e qual é o primeiro passo?</b>',
    meta: ['coleta ' + C.coleta, 'contagem auditada ' + C.auditoria, 'Meta pública (conector) · Shopify products.json · Instagram público', '<a href="paginas/metodo.html">dicionário</a>'],
  }) +
  toc([['decisao', 'Decisão'], ['portoes', 'Portões G1-G7'], ['evidencia', 'Evidência'], ['numeros', 'Números'], ['faturamento', 'Faturamento por loja'], ['ranking', 'Ranking'], ['economia', 'Economia'], ['limites', 'Limites'], ['proxima', 'Próxima ação']]) +
  sec('decisao', '00', 'Decisão',
    '<div class="decision"><div class="main-card"><span class="badge">' + esc(C.decisao) + '</span> ' + pill('no vocabulário do painel: entra com condições', 'n') +
    '<p class="tese">Existe demanda paga real e estável por peitoral personalizado no Reino Unido, e um operador (DoggyKings) prova o modelo exato, oferta + nome bordado, que um iniciante consegue copiar.</p>' +
    '<p class="why"><b>Por quê:</b> o cluster leve tem margem, criativo provado e nenhuma marca dominando o segmento "walking set personalizado". A conta só fecha com a escada de oferta ligada; sem bump + upsell, o CPA do herói sozinho dá prejuízo. Entra quem entra com a escada montada, um mercado de anúncio (UK) e amostra do fornecedor na mão antes do 1º envio.</p>' +
    '<div class="btns">' + btn('Ver o plano', 'paginas/plano-de-acao.html', 'primary') + btn('Abrir a estratégia', 'paginas/estrategia.html') + btn('Ver limites da análise', 'paginas/metodo.html', 'ghost') + '</div></div>' +
    '<div class="q3"><div class="q"><span class="eyebrow">1 · Qual oportunidade</span><p><b>' + esc(o.core.titulo) + '</b>, ' + usd(o.core.preco) + ' (âncora ' + usd(o.core.de) + '), com order bump de frete segurado e upsell da guia combinando. Marca <b>' + esc(C.marca) + '</b>, loja global em USD, 1º mercado de anúncio Reino Unido.</p></div>' +
    '<div class="q"><span class="eyebrow b">2 · O que os dados sustentam</span><p>Mídia ativa nas 6 operações mapeadas; 1 modelo direto (DoggyKings, ' + n(D.lojas.find(l => l.slug === 'doggykings').ativos) + ' ativos, nome bordado + escada) e contribuição positiva por pedido com a escada no CPA alvo. Não sustentam: gasto real dos concorrentes, receita contábil, curva de sazonalidade.</p></div>' +
    '<div class="q"><span class="eyebrow g">3 · Próxima ação</span><p>Buscar "Dear Bron" no UK IPO + USPTO, registrar o domínio, e pedir amostra do fornecedor (com bordado do nome + envio global) agora, é o gargalo de 1-2 semanas. Criativo de IA pode lançar em paralelo; amostra tem que chegar antes do 1º envio.</p></div></div></div>') +
  sec('portoes', '01', 'Os sete portões', gates('gd-central', D.portoes), 'Cada portão é uma pergunta humana. Clique para ver o que foi observado, a fonte e o limite.') +
  sec('evidencia', '02', 'Linha de evidência', evidence(D.evidenciaCentral) + legendNat()) +
  sec('numeros', '03', 'Os números que sustentam a decisão',
    '<div class="grid g4">' +
    stat({ v: '6', l: 'operações mapeadas', d: '4 MODELAR, 1 OBSERVAR, 1 IGNORAR', k: 'obs' }) +
    stat({ v: n(D.demanda.termoNichoAtivos), l: "'personalized dog harness' ativos no UK", d: 'sub-nicho pequeno e limpo (conector Meta, ' + C.auditoria + ')', k: 'obs' }) +
    stat({ v: n(D.lojas.find(l => l.slug === 'doggykings').ativos), l: 'anúncios ativos do modelo direto', d: 'DoggyKings, nome bordado + escada de oferta', k: 'obs' }) +
    stat({ v: pill('ESCALANDO', 'b'), l: 'momentum do nicho', d: 'demanda estável + operadores lucrando + sem marca dominante', k: 'inf' }) +
    '</div>' +
    table([{ t: 'Benchmark de custo (anúncio no Reino Unido, conta USD)' }, { t: 'Valor', num: 1 }], [
      tr([td('CPM médio'), td(usd(D.benchmark.cpm[0]) + ' a ' + usd(D.benchmark.cpm[1]), 'num')]),
      tr([td('CPC de link'), td(usd(D.benchmark.cpc[0]) + ' a ' + usd(D.benchmark.cpc[1]), 'num')]),
      tr([td('CPA benchmark do setor'), td('~' + usd(D.benchmark.cpa), 'num')]),
    ]) +
    note('Leitura: há demanda, mas não para uma loja genérica de "acessório de cão". A porta é o peitoral no-pull com o nome do cão, demonstrável em segundos e com fosso de personalização.', 'b')) +
  sec('faturamento', '03b', 'Quanto cada loja fatura (faixa de decisão, não contábil)',
    table([{ t: 'Loja' }, { t: 'Central/mês', num: 1 }, { t: 'Faixa', num: 1 }, { t: 'Mídia/mês', num: 1 }, { t: 'Método' }],
      D.lojas.map(l => tr([
        td('<a href="paginas/loja-' + l.slug + '.html">' + esc(l.nome) + '</a>'),
        td(l.fatCentro ? usd(l.fatCentro, 0) : na('sem tráfego medido'), 'num'),
        td(l.fatFaixa || '—', 'num'),
        td(l.midiaMes ? usd(l.midiaMes, 0) : na('—'), 'num'),
        td(l.fatMetodo + ' ' + nat(l.fatCentro ? 'calc' : 'inf')),
      ]))) +
    note('Método: nº de anúncios ativos auditados × AOV observado × janela de veiculação, sem SimilarWeb nesta rodada. Proxy de ordem de grandeza, não medição.', 'a', 'Limite')) +
  sec('ranking', '04', 'O ranking das operações', legendVer() +
    table([{ t: '#' }, { t: 'Operação' }, { t: 'Ativos', num: 1 }, { t: 'Sobrev.', num: 1 }, { t: 'Ticket herói', num: 1 }, { t: 'Produtos', num: 1 }, { t: 'Momentum' }, { t: 'Veredito' }],
      D.lojas.map((l, i) => tr([
        td(String(i + 1)),
        td('<a href="paginas/loja-' + l.slug + '.html"><b>' + esc(l.nome) + '</b></a><div class="d">' + esc(l.dominio) + ' · ' + esc(l.modeloCurto) + '</div>'),
        td(n(l.ativos), 'num'),
        td(pct(l.sobrev), 'num'),
        td(usd(l.ticketHero, 2), 'num'),
        td(n(l.catalogoN), 'num'),
        td(esc(l.momentum)),
        td(verPill(l.veredito)),
      ], i === 0 ? 'hl' : '')), { cls: 'rank' })) +
  sec('economia', '05', 'A conta por venda',
    '<div class="grid g4">' +
    stat({ v: usd(o.core.preco), l: 'preço do herói', d: 'compare-at ' + usd(o.core.de), k: 'rec' }) +
    stat({ v: usd(e.cpaEquilibrioEscada), l: 'CPA de equilíbrio (escada)', d: 'o que sobra pra mídia antes de dar prejuízo', k: 'calc' }) +
    stat({ v: usd(e.cpaAlvo), l: 'CPA alvo do teste', d: 'financia atendimento e troca', k: 'rec' }) +
    stat({ v: usd(e.contribEscada), l: 'contribuição por pedido na escada', d: pct(e.contribEscadaPct) + ' do AOV projetado ' + usd(e.aov), k: 'calc' }) +
    '</div>' +
    table([{ t: 'Cenário' }, { t: 'Receita', num: 1 }, { t: 'Custo', num: 1 }, { t: 'Frete', num: 1 }, { t: 'Taxa', num: 1 }, { t: 'CPA', num: 1 }, { t: 'Sobra', num: 1 }, { t: 'Leitura' }], [
      tr([td('Só herói'), td(usd(o.core.preco), 'num'), td(usd(o.core.custo), 'num'), td(usd(e.frete), 'num'), td(usd(o.core.preco * e.taxaPct), 'num'), td(usd(e.cpaAlvo), 'num'), td(usd(e.contribCore) + ' · ' + pct(e.contribCorePct), 'num'), td('apertado, viável só com CPA abaixo de ' + usd(e.cpaEquilibrioCore))]),
      tr([td('<b>Escada completa</b> (herói + bump ' + pct(o.bump.aceite * 100) + ' + upsell ' + pct(o.upsell.aceite * 100) + ')'), td(usd(e.aov), 'num'), td(usd(e.custoEscada), 'num'), td(usd(e.frete), 'num'), td(usd(e.aov * e.taxaPct), 'num'), td(usd(e.cpaAlvo), 'num'), td(usd(e.contribEscada) + ' · ' + pct(e.contribEscadaPct), 'num'), td('a meta do teste, ROAS de equilíbrio ~1,7x')], 'hl'),
    ]) +
    note('Custos são estimativa por categoria (30 a 40% do preço) até a amostra do fornecedor. O número que decide continuar ou matar o teste é o CPA na 1ª semana: acima de ' + usd(e.cpaEquilibrioEscada) + ' com a escada ligada = matar o criativo.', 'a', 'Limite')) +
  sec('limites', '06', 'Limites desta análise',
    table([{ t: 'Dado' }, { t: 'Situação' }, { t: 'O que foi feito no lugar' }],
      D.limites.map(l => tr([td(esc(l.dado)), td(pill(l.situacao, 'a')), td(esc(l.feito))]))) +
    '<div class="btns">' + btn('Ver método, limites e auditoria completos', 'paginas/metodo.html') + '</div>') +
  sec('proxima', '07', 'Próxima ação: 14 dias',
    '<ol class="steps">' + D.cronograma.map(c => '<li><b>' + esc(c.q) + ':</b> ' + esc(c.d) + '</li>').join('') + '</ol>' +
    '<div class="btns">' + btn('Abrir o plano completo com checklist', 'paginas/plano-de-acao.html', 'primary') + '</div>') +
  footer(true);
  return doc({ title: 'Central da oportunidade · Raio-X · ' + C.nicho, current: 'central', screen: { code: '00', title: 'Central da oportunidade' }, body, fromRoot: true, next: { t: 'Buscar a marca no UK IPO + USPTO e pedir amostra do fornecedor', s: 'dias 1 a 3 do plano; a amostra é o gargalo de 1-2 semanas', b: 'Abrir plano', h: 'paginas/plano-de-acao.html' } });
}

/* ================= TELA 01 · DEMANDA ================= */
function demanda() {
  const dm = D.demanda;
  const body = pageHead({ eyebrow: '01 · evidências · demanda observada · Reino Unido', h1: 'As pessoas <em>procuram e compram</em> peitoral personalizado', answer: 'Sinal de demanda por 3 medidas: contagem de anúncios ativos, uso do termo no título dos concorrentes e a voz do dono nos fóruns.', meta: ['Reino Unido', 'conector Meta ' + C.auditoria, 'sem volume mensal exato (sem API paga)'] }) +
  toc([['sinal', 'Sinal mais forte'], ['termos', 'Termos com contagem'], ['motivos', 'Por que compra'], ['midia', 'Mídia qualificada'], ['voz', 'Voz do mercado'], ['decisao', 'Decisão']]) +
  sec('sinal', '01', 'O sinal mais forte',
    '<div class="grid g4">' +
    stat({ v: n(dm.termoNichoAtivos), l: "'personalized dog harness' ativos no UK", d: 'topo: ParoPet, "Thousands Of UK Dog Owners Have Made The Switch"', k: 'obs', src: 'conector Meta' }) +
    stat({ v: n(dm.harnessAmploUK), l: "'dog harness' ativos no UK (termo amplo)", d: 'categoria madura e evergreen', k: 'obs' }) +
    stat({ v: n(dm.harnessAmploUS), l: "'dog harness' ativos nos EUA", d: 'mercado ~3,5x maior, guardado pra fase 2', k: 'obs' }) +
    stat({ v: '3 de 6', l: 'concorrentes usam "personalised" no título', d: 'DoggyKings, Tidy Tails, ParoPet', k: 'obs' }) +
    '</div>' +
    note('Em resumo: o termo amplo "dog harness" é um oceano; o sub-nicho "personalizado" é um lago pequeno, limpo e com operador provando que converte. É lago que dá pra pescar sendo iniciante.', 'b', 'em resumo')) +
  sec('termos', '02', 'Termos com contagem real (conector Meta, Reino Unido)',
    table([{ t: 'Termo' }, { t: 'Ativos UK', num: 1 }, { t: 'Intenção' }, { t: 'Serve para' }, { t: 'Abrir' }],
      dm.termos.map(t => tr([
        td('<b>' + esc(t.termo) + '</b>'),
        td(t.ativos == null ? na('não levantado nesta rodada') : n(t.ativos), 'num'),
        td(esc(t.intencao)),
        td(esc(t.serve)),
        td('<a href="https://trends.google.com/trends/explore?date=today%205-y&geo=GB&hl=en&q=' + encodeURIComponent(t.termo) + '" target="_blank" rel="noopener">Trends ↗</a> · <a href="' + attr(t.link) + '" target="_blank" rel="noopener">Biblioteca ↗</a> · <a href="https://www.amazon.co.uk/s?k=' + encodeURIComponent(t.termo) + '" target="_blank" rel="noopener">Amazon ↗</a>'),
      ]))) +
    note('O link do <b>Google Trends</b> abre a curva de 5 anos no Reino Unido já filtrada, o aluno clica e vê o gráfico (a skill não estima volume mensal sem API paga). A contagem do termo amplo vem contaminada pelo matching largo da Biblioteca; o número que vale é o do termo específico "personalized dog harness".', 'a')) +
  sec('motivos', '03', 'Por que o dono compra (e por que se frustra)',
    '<div class="grid g2">' + dm.motivos.map(m => '<div class="card"><span class="eyebrow ' + (m.c || '') + '">' + esc(m.t) + '</span><p>' + esc(m.d) + '</p></div>').join('') + '</div>') +
  sec('midia', '05', 'Mídia qualificada: o que confirma, o que não',
    table([{ t: 'Camada' }, { t: 'O que confirma' }, { t: 'O que não permite concluir' }], [
      tr([td('Contagem de anúncios ativos'), td('há operadores gastando dinheiro agora no termo'), td('não diz gasto, ROAS nem receita')]),
      tr([td('Histórico total (ALL)'), td('quantos anúncios já rodaram, e a sobrevivência'), td('não diz por quanto tempo cada um ficou no ar')]),
      tr([td('Título do criativo'), td('o ângulo e o gancho de oferta'), td('não traz o corpo do anúncio nem o vídeo (conector não devolve)')]),
    ])) +
  sec('voz', '06', 'A voz do mercado (linguagem literal do dono)',
    '<div class="grid g2">' + dm.voz.map(v => '<div class="card"><p>“' + esc(v.q) + '”</p><small>' + esc(v.fonte) + '</small></div>').join('') + '</div>') +
  sec('decisao', '07', 'Decisão de demanda',
    evidence(dm.decisao) + '<div class="btns">' + btn('Ver os criativos', 'anuncios.html') + btn('Abrir o plano', 'plano-de-acao.html') + '</div>') +
  footer(false);
  return doc({ title: 'Demanda observada · Raio-X · ' + C.nicho, current: 'demanda', screen: { code: '01', title: 'Demanda observada' }, body, next: { t: 'Ver o mercado por país e a sequência de entrada', b: 'Abrir mercados', h: 'mercados.html' } });
}

/* ================= TELA 02 · MERCADOS ================= */
function mercados() {
  const mk = D.mercados;
  const body = pageHead({ eyebrow: '02 · evidências · mercados · matriz de ' + mk.paises.length + ' países', h1: 'Reino Unido <em>primeiro</em>, EUA na fase 2', answer: 'A loja é global em USD desde o dia 1; a decisão aqui é onde apontar o orçamento de anúncio no 1º mês.', meta: ['matriz de ' + mk.paises.length + ' países', 'termo: "dog harness" + "personalized dog harness"', 'conector Meta ' + C.auditoria] }) +
  toc([['metodo', 'Método'], ['tabela', 'Tabela de países'], ['cruzamento', 'Cruzamento'], ['sequencia', 'Sequência de entrada']]) +
  sec('metodo', '01', 'Método: termo amplo vs ângulo',
    '<div class="grid g2"><div class="card"><span class="eyebrow">termo amplo</span><p>"dog harness": mede o tamanho bruto da categoria naquele país. Serve pra ver se o mercado existe.</p></div><div class="card"><span class="eyebrow b">ângulo</span><p>"personalized dog harness" + "no pull dog harness": mede o sub-nicho exato que a Dear Bron vai atacar.</p></div></div>') +
  sec('tabela', '02', 'Matriz de países',
    table([{ t: 'País' }, { t: 'dog harness (amplo)', num: 1 }, { t: 'personalized (ângulo)', num: 1 }, { t: 'Razão de assimetria' }, { t: 'Leitura' }],
      mk.paises.map(p => tr([td('<b>' + esc(p.pais) + '</b>'), td(p.amplo == null ? na('não levantado') : n(p.amplo), 'num'), td(p.angulo == null ? na('não levantado') : n(p.angulo), 'num'), td(esc(p.razao)), td(esc(p.leitura) + ' ' + nat('inf'))]))) +
    note('A razão de assimetria (demanda vs concorrência) é leitura do analista, não índice fechado. EUA tem ~3,5x a demanda mas concorrência DTC mais pesada e CPM ~2 a 3x maior.', 'a') + legendNat()) +
  sec('cruzamento', '03', 'Cruzamento com a demanda observada',
    '<div class="grid g3">' +
    stat({ v: n(D.demanda.termoNichoAtivos), l: 'sub-nicho ativos UK', k: 'obs' }) +
    stat({ v: '~2 a 3x', l: 'CPM EUA vs UK', d: 'benchmark de categoria', k: 'inf' }) +
    stat({ v: 'en-GB', l: 'idioma do 1º criativo', d: 'porta direto pra EUA/IE sem retrabalho', k: 'rec' }) +
    '</div>') +
  sec('sequencia', '04', 'Sequência de entrada',
    '<ol class="steps">' + mk.sequencia.map(s => '<li><b>' + esc(s.t) + ':</b> ' + esc(s.d) + '</li>').join('') + '</ol>' + evidence(mk.decisao)) +
  footer(false);
  return doc({ title: 'Mercados e país · Raio-X · ' + C.nicho, current: 'mercados', screen: { code: '02', title: 'Mercados e país' }, body, next: { t: 'Ver as operações concorrentes uma a uma', b: 'Abrir concorrentes', h: 'concorrentes.html' } });
}

/* ================= TELA 03 · CONCORRENTES (índice) ================= */
function concorrentes() {
  const body = pageHead({ eyebrow: '03 · evidências · ' + D.lojas.length + ' operações · veredito por loja', h1: 'Seis lojas, <em>quatro para modelar</em>', answer: 'Uma prova o modelo exato (DoggyKings), duas ensinam oferta e marca, uma é grooming de baixo ticket, uma pivotou, uma é marca grande demais pra copiar.', meta: [D.lojas.length + ' operações mapeadas', 'nicho: ' + C.nicho, 'Reino Unido'] }) +
  toc([['lojas', 'As ' + D.lojas.length + ' lojas'], ['faturamento', 'Faturamento estimado'], ['auditoria', 'Auditoria de contagem'], ['leitura', 'Leitura']]) +
  sec('lojas', '01', 'As ' + D.lojas.length + ' operações', legendVer() +
    '<div class="grid g2">' + D.lojas.map(l => '<a class="card link" href="loja-' + l.slug + '.html"><span class="eyebrow">' + esc(l.modeloCurto) + ' · nível ' + esc(l.nivel) + '</span>' +
      '<h3 style="margin:6px 0 4px;display:flex;justify-content:space-between;gap:8px">' + esc(l.nome) + verPill(l.veredito) + '</h3>' +
      '<div class="stats mini"><div class="stat"><div class="v">' + n(l.ativos) + '</div><div class="l">anúncios ativos</div><div>' + nat('obs') + '</div></div><div class="stat"><div class="v">' + pct(l.sobrev) + '</div><div class="l">sobrevivência</div><div>' + nat('obs') + '</div></div></div>' +
      '<p>' + esc(l.resumo) + '</p></a>').join('') + '</div>') +
  sec('faturamento', '02', 'Faturamento estimado por operação',
    table([{ t: 'Loja' }, { t: 'Central/mês', num: 1 }, { t: 'Faixa' }, { t: 'Mídia/mês', num: 1 }, { t: 'Método' }],
      D.lojas.map(l => tr([td('<a href="loja-' + l.slug + '.html"><b>' + esc(l.nome) + '</b></a>'), td(l.fatCentro ? usd(l.fatCentro, 0) : na('sem tráfego medido'), 'num'), td(l.fatFaixa || '—'), td(l.midiaMes ? usd(l.midiaMes, 0) : '—', 'num'), td(esc(l.fatMetodo) + ' ' + nat(l.fatCentro ? 'calc' : 'inf'))]))) +
    note('São faixas de decisão a partir de anúncios ativos × AOV observado × janela, não dado contábil de nenhuma das lojas.', 'a', 'Limite')) +
  sec('auditoria', '03', 'Auditoria de contagem de anúncios',
    '<div class="audit">' + D.lojas.map(l => '<div class="card"><b>' + esc(l.nome) + '</b><div class="vs"><b>' + n(l.ativos) + '</b><s>' + n(l.ativosV4) + '</s><span class="ar">v5 auditado → v4</span></div><div style="margin-top:6px">' + pill(l.auditoriaNota, l.auditoriaNota.startsWith('ok') ? 'g' : 'a') + '</div></div>').join('') + '</div>' +
    note('Regra: o número auditado na v5 (conector Meta, ' + C.auditoria + ') prevalece. O V4 tinha Luther Bennett com histórico = ativos, a chamada ALL tinha falhado.', 'b')) +
  sec('leitura', '04', 'Leitura: o que fazer com isso', evidence(D.evidenciaConcorrentes)) +
  footer(false);
  return doc({ title: 'Concorrentes · Raio-X · ' + C.nicho, current: 'concorrentes', screen: { code: '03', title: 'Concorrentes' }, body, next: { t: 'Abrir o dossiê da loja-modelo (DoggyKings)', b: 'Ver DoggyKings', h: 'loja-doggykings.html' } });
}

/* ================= TELA 03.x · DOSSIÊ POR LOJA ================= */
function loja(l) {
  const body = pageHead({
    eyebrow: '03 · concorrente · ' + esc(l.modelo) + ' · nível ' + esc(l.nivel), eyeCls: 'b',
    h1: esc(l.nome) + ' ' + verPill(l.veredito),
    answer: '<b>' + esc(l.oQueCopiar) + '</b>',
    meta: ['<a href="https://' + esc(l.dominio) + '" target="_blank" rel="noopener">' + esc(l.dominio) + ' ↗</a>', esc(l.idade), esc(l.plataforma), l.instagram ? esc(l.instagram) : 'Instagram ' + na('não levantado')],
  }) +
  '<div class="btns" style="margin:-8px 0 20px">' + btn('Abrir loja', 'https://' + l.dominio, 'primary', true) + btn('Biblioteca de anúncios', adlibUrl(l.dominio), '', true) + '</div>' +
  toc([['campeao', 'Produto campeão'], ['midia', 'Mídia paga'], ['trafego', 'Tráfego'], ['faturamento', 'Faturamento'], ['paginas', 'Páginas'], ['anatomia', 'Anatomia'], ['catalogo', 'Catálogo e stack'], ['nao-obtido', 'Não obtido'], ['veredito', 'Veredito']]) +
  sec('campeao', '01', 'Produto campeão',
    '<div class="hero-prod"><img loading="lazy" src="prints/' + l.slug + '-pdp.jpg" alt="PDP ' + esc(l.nome) + '"><div><span class="eyebrow">produto usado na captura</span><h3>' + esc(l.hero.titulo) + '</h3><div class="price">' + usd(l.hero.preco) + '<small>âncora ' + usd(l.hero.de) + ' · ' + n(l.catalogoN) + ' produtos no catálogo · mediana ' + usd(l.precoMediana) + '</small></div><p style="margin-top:10px">' + esc(l.hero.nota) + ' ' + nat('obs') + '</p></div></div>') +
  sec('midia', '02', 'Mídia paga',
    '<div class="grid g4">' +
    stat({ v: n(l.ativos), l: 'anúncios ativos na Biblioteca', d: 'conector Meta, ' + C.auditoria, k: 'obs' }) +
    stat({ v: n(l.historico), l: 'no histórico (ALL)', d: 'chamada ALL rodada na v5', k: 'obs' }) +
    stat({ v: pct(l.sobrev), l: 'sobrevivência', d: 'fatia do histórico ainda ativa', bar: l.sobrev, k: 'obs' }) +
    stat({ v: l.gads == null ? na('Transparency Center não checado nesta rodada') : n(l.gads), l: 'peças no Google Ads', k: 'obs' }) +
    '</div>' +
    table([{ t: 'Ritmo de criativo' }, { t: 'Valor' }, { t: 'Leitura' }], l.ritmo.map(r => tr([td(esc(r.k)), td(esc(r.v)), td(esc(r.l))])), { cls: 'kv2' }) +
    '<h3 style="margin:18px 0 8px">Criativo campeão desta loja</h3><p>' + esc(l.criativoCampeao) + '</p>' +
    '<div class="btns">' + btn('Ver ranking de criativos na Biblioteca', adlibUrl(l.dominio), '', true) + '</div>') +
  sec('trafego', '03', 'Tráfego real',
    l.trafego ? '<div class="grid g4">' + stat({ v: n(l.trafego.visitas), l: 'visitas no mês', d: l.trafego.fonte, k: 'obs' }) + stat({ v: pct(l.trafego.bounce), l: 'bounce', k: 'obs' }) + '</div>'
      : note(na('SimilarWeb não rodado nesta rodada (a v5 pediu foco na contagem de anúncio pelo conector). O momentum sai por sobrevivência + idade do domínio.'), 'a', 'Não obtido')) +
  sec('faturamento', '04', 'Faturamento mensal estimado',
    (l.fatCentro ? '<div class="grid g4">' +
      stat({ v: usd(l.fatCentro, 0), l: 'receita bruta/mês, centro', k: 'calc' }) +
      stat({ v: usd(l.fatPiso, 0), l: 'piso', k: 'calc' }) +
      stat({ v: usd(l.fatTeto, 0), l: 'teto', k: 'calc' }) +
      stat({ v: l.midiaMes ? usd(l.midiaMes, 0) : na('—'), l: 'mídia/mês', d: 'proxy por porte, nunca medido', k: 'inf' }) + '</div>'
      : note(na('Sem tráfego medido nem escala grande o suficiente pra proxy confiável. ' + esc(l.fatMetodo)), 'a', 'Não obtido')) +
    note('Método: ' + esc(l.fatMetodo) + '. Faixa de decisão, não dado contábil. Benchmark do setor: CPM ' + usd(D.benchmark.cpm[0]) + ' a ' + usd(D.benchmark.cpm[1]) + ', CPC ' + usd(D.benchmark.cpc[0]) + ' a ' + usd(D.benchmark.cpc[1]) + ', CPA ~' + usd(D.benchmark.cpa) + '.', 'a', 'Limite')) +
  sec('paginas', '05', 'Páginas capturadas',
    '<div class="shots">' +
    ['home', 'pdp', 'carrinho'].map(t => '<div class="shot"><div class="cap">' + { home: 'Home', pdp: 'PDP · ' + esc(l.hero.titulo), carrinho: 'Carrinho, item adicionado' }[t] + '<a href="prints/' + l.slug + '-' + t + '.jpg" target="_blank">abrir ↗</a></div><div class="frame"><img loading="lazy" src="prints/' + l.slug + '-' + t + '.jpg" alt="' + t + ' ' + esc(l.nome) + '"></div></div>').join('') +
    '</div>') +
  sec('anatomia', '06', 'Anatomia do vencedor ' + nat('inf'),
    table([{ t: 'Elemento' }, { t: 'Leitura' }], l.anatomia.map(a => tr([td(esc(a.k)), td(esc(a.v))])), { cls: 'kv2' }) +
    note('<b>Momentum da operação: ' + esc(l.momentum.toUpperCase()) + '.</b> ' + esc(l.momentumNota), 'b', 'Inferido')) +
  sec('catalogo', '07', 'Catálogo, oferta e identificação',
    '<dl class="kv">' + l.stack.map(s => '<dt>' + esc(s.k) + '</dt><dd>' + (s.na ? na(s.na) : esc(s.v)) + '</dd>').join('') + '</dl>' +
    note('O que copiar: ' + esc(l.oQueCopiar2), l.veredito === 'MODELAR' ? 'g' : 'a')) +
  sec('nao-obtido', '08', 'Dados não obtidos',
    table([{ t: 'Dado' }, { t: 'Motivo' }, { t: 'Método tentado' }], l.naoObtido.map(x => tr([td(esc(x.d)), td(esc(x.m)), td(esc(x.t))])))) +
  sec('veredito', '09', 'Veredito e classificação',
    '<div class="grid g4">' +
    stat({ v: pill(l.modelo, 'n'), l: 'modelo', k: 'inf' }) +
    stat({ v: verPill(l.veredito), l: 'veredito', k: 'rec' }) +
    stat({ v: pill('NÍVEL ' + l.nivel.toUpperCase(), 'b'), l: 'nível', k: 'inf' }) +
    stat({ v: pill(l.defensabilidade, 'n'), l: 'defensabilidade', k: 'inf' }) +
    '</div>' +
    table([{ t: 'Eixo' }, { t: 'Nota' }, { t: 'Base' }], l.scorecard.rows.map(r => tr([td(esc(r.e)), td(esc(r.n)), td(esc(r.b))])).concat([tr([td('<b>Soma</b>'), td('<b>' + esc(l.scorecard.soma) + '</b>'), td('scorecard da pesquisa ' + nat('calc'))], 'hl')]), { cls: 'kv2' }) +
    evidence(l.evidencia)) +
  footer(false);
  return doc({ title: esc(l.nome) + ' · Raio-X · ' + C.nicho, current: l.slug, screen: { code: '03', title: 'Concorrente · ' + l.nome }, body, next: { t: esc(l.proximaAcao), b: 'Ver plano', h: 'plano-de-acao.html' } });
}

/* ================= TELA 04 · ANÚNCIOS ================= */
function anuncios() {
  const sw = D.swipe;
  const body = pageHead({ eyebrow: '04 · evidências · swipe curado · ' + sw.criativos.length + ' criativos públicos', h1: 'O que <em>sobrevive há mais tempo</em> no nicho', answer: 'Ranking de escala pelos 4 sinais públicos (longevidade, cópias, espalhamento, engajamento) e os ângulos que se repetem entre marcas diferentes.', meta: [sw.criativos.length + ' criativos baixados localmente', 'conector Meta + Biblioteca pública', 'sem corpo do anúncio nem vídeo (conector não devolve)'] }) +
  toc([['ranking', 'Ranking de escala'], ['angulos', 'Ângulos'], ['galeria', 'Galeria com prova'], ['formato', 'Formato e roteiro'], ['limites', 'Fonte e limites']]) +
  sec('ranking', '01', 'Ranking de escala',
    table([{ t: 'Operação' }, { t: 'Ativos', num: 1 }, { t: 'Longevidade máx.', num: 1 }, { t: 'Duplicação', num: 1 }, { t: 'Veredito' }, { t: 'Link' }],
      sw.ranking.map(r => tr([td('<b>' + esc(r.loja) + '</b>'), td(n(r.ativos), 'num'), td(esc(r.longevidade), 'num'), td(esc(r.dup), 'num'), td(verPill(r.veredito)), td(btn('Biblioteca', adlibUrl(r.dominio), 'sm', true))]))) +
    note('Longevidade = dias desde a data de início do anúncio ativo mais antigo. É o proxy nº1 de "isto está funcionando", já que a Meta não expõe impressão pra e-commerce.', 'b')) +
  sec('angulos', '02', 'Ângulos que se repetem entre marcas diferentes',
    '<div class="grid g3">' + sw.angulos.map(a => '<div class="card"><span class="eyebrow ' + (a.c || '') + '">' + esc(a.t) + '</span><p>' + esc(a.d) + '</p><small>' + esc(a.fonte) + '</small></div>').join('') + '</div>') +
  sec('galeria', '03', 'Galeria com prova',
    '<div class="ads">' + sw.criativos.map(c => '<article class="ad"><div class="media"><img loading="lazy" src="criativos/' + esc(c.arquivo) + '" alt="' + attr(c.titulo) + '"></div><div class="body"><span class="eyebrow">' + esc(c.loja) + '</span><h4>' + esc(c.titulo) + '</h4><p>' + esc(c.leitura) + '</p></div><div class="foot"><span>' + esc(c.formato) + '</span>' + btn('Biblioteca', adlibUrl(c.dominio), 'sm', true) + '</div></article>').join('') + '</div>' +
    note('As imagens são cópias locais baixadas na coleta (a URL da Meta expira em horas). Não temos o corpo do anúncio nem o vídeo, o conector só devolve título, datas e a imagem de prévia.', 'a', 'Limite de prévia local')) +
  sec('formato', '04', 'Formato e roteiro',
    table([{ t: 'Formato' }, { t: 'Roteiro observado' }, { t: 'Uso' }], sw.formatos.map(f => tr([td(esc(f.f)), td(esc(f.r)), td(esc(f.u))])))) +
  sec('limites', '05', 'Fonte e limites', note('Amostra vem ordenada por recência, não é share de mercado. Contagem exata por termo/página vem do conector com limit=1. O ranking de escala usa os 4 sinais públicos, nunca gasto (não é divulgado fora da UE).', 'a') + legendNat()) +
  footer(false);
  return doc({ title: 'Criativos e prova · Raio-X · ' + C.nicho, current: 'anuncios', screen: { code: '04', title: 'Criativos e prova' }, body, next: { t: 'Ver a estratégia: onde entrar e com que ângulo', b: 'Abrir estratégia', h: 'estrategia.html' } });
}

/* ================= TELA 05 · ESTRATÉGIA ================= */
function estrategia() {
  const st2 = D.estrategia;
  const body = pageHead({ eyebrow: '05 · execução · estratégia · onde entrar', eyeCls: 'g', h1: 'Entrar pelo <em>cluster leve</em>, herói personalizado', answer: 'Vale a pena? <b>Sim, com a escada de oferta ligada.</b> Serve pra iniciante? <b>Serve, é o cluster leve, não o de carro.</b>', meta: ['nível iniciante', 'Reino Unido no 1º mês', 'momentum ESCALANDO'] }) +
  toc([['resumo', 'Resumo em 1 minuto'], ['ranking', 'Ranking de operações'], ['benchmark', 'Benchmark das lojas'], ['oportunidades', 'Oportunidades'], ['angulo', 'Ângulo dominante'], ['voz', 'Voz do mercado'], ['quando', 'Quando entrar'], ['regras', 'Regras de iniciante']]) +
  sec('resumo', '00', 'Resumo em 1 minuto',
    note('<b>Vale entrar.</b> Demanda paga sólida no UK, um operador (DoggyKings) prova o modelo exato pra iniciante (nome bordado + escada de oferta), e nenhuma marca domina o segmento. <b>O risco não está na demanda, está na execução:</b> a conta só fecha com bump + upsell, e a personalização exige fornecedor confiável. O cluster de carro (RuffRover, Luther Bennett) converte e escala mas é volumoso, frete e devolução caros, não é entrada de iniciante.', 'g')) +
  sec('ranking', '01', 'Ranking de operações', legendVer() +
    '<div class="grid g2">' + D.lojas.map(l => '<a class="card link" href="loja-' + l.slug + '.html"><span class="eyebrow">' + esc(l.modeloCurto) + ' · nível ' + esc(l.nivel) + '</span><h3 style="margin:6px 0 4px;display:flex;justify-content:space-between;gap:8px">' + esc(l.nome) + verPill(l.veredito) + '</h3><p>' + esc(l.oQueCopiar2) + '</p></a>').join('') + '</div>' +
    note('<b>Oportunidade nº 1: walking set personalizado.</b> Herói ' + usd(D.oferta.core.preco) + ' (âncora ' + usd(D.oferta.core.de) + '). CPA de equilíbrio na escada ' + usd(D.economia.cpaEquilibrioEscada) + ', alvo ' + usd(D.economia.cpaAlvo) + ', margem de contribuição ~' + pct(D.economia.contribEscadaPct) + '.', 'g') +
    note(esc(D.dfcContexto), 'a', 'contexto: marca fora do gate')) +
  sec('benchmark', '02', 'Benchmark de todas as lojas',
    table([{ t: 'Loja' }, { t: 'Ativos', num: 1 }, { t: 'Sobrev.', num: 1 }, { t: 'Faturamento est./mês', num: 1 }, { t: 'Ticket herói', num: 1 }, { t: 'Mídia/mês', num: 1 }, { t: 'Veredito' }],
      D.lojas.map(l => tr([td('<a href="loja-' + l.slug + '.html">' + esc(l.nome) + '</a>'), td(n(l.ativos), 'num'), td(pct(l.sobrev), 'num'), td(l.fatCentro ? usd(l.fatCentro, 0) : na('—'), 'num'), td(usd(l.ticketHero, 2), 'num'), td(l.midiaMes ? usd(l.midiaMes, 0) : '—', 'num'), td(verPill(l.veredito))])))) +
  sec('oportunidades', '03', 'Ranking de oportunidades', legendVer() +
    '<div class="grid g2">' + st2.oportunidades.map(o => '<div class="card"><span class="eyebrow ' + (o.c || '') + '">' + esc(o.tag) + '</span><h3 style="margin:6px 0 4px">' + esc(o.t) + '</h3><p>' + esc(o.d) + '</p></div>').join('') + '</div>') +
  sec('angulo', '04', 'Ângulo dominante do nicho',
    '<div class="card"><span class="eyebrow">big idea</span><p>' + esc(st2.bigIdea) + '</p></div>' +
    note('Mecanismo: ' + esc(st2.mecanismo), 'b') +
    note('Ângulo de anúncio: ' + esc(st2.anguloAnuncio), 'g')) +
  sec('voz', '04b', 'Voz do mercado: objeção → brecha',
    table([{ t: 'Objeção' }, { t: 'Gatilho' }, { t: 'Linguagem observada' }, { t: 'Brecha da Dear Bron' }], st2.objecoes.map(o => tr([td(esc(o.obj)), td(esc(o.gat)), td(esc(o.lng)), td(esc(o.br))])))) +
  sec('quando', '05', 'Quando entrar',
    note('Ciclo do nicho: <b>ESCALANDO</b>. Demanda estável, múltiplos operadores lucrando, sub-nicho personalizado sem marca dominante. Janela aberta pra operação pequena e bem executada.', 'b') +
    evidence(st2.decisao)) +
  sec('regras', '06', 'Regras de iniciante ' + nat('rec'),
    '<ul class="cl">' + st2.regras.map(r => '<li>' + esc(r) + '</li>').join('') + '</ul>') +
  footer(false);
  return doc({ title: 'Estratégia · Raio-X · ' + C.nicho, current: 'estrategia', screen: { code: '05', title: 'Estratégia' }, body, next: { t: 'Abrir o plano de ação com a escada de oferta e o checklist', b: 'Abrir plano', h: 'plano-de-acao.html' } });
}

/* ================= TELA 06 · PLANO DE AÇÃO ================= */
function plano() {
  const o = D.oferta, e = D.economia, b = D.marca;
  const linhaPL = (nome, rec, cogs, frete, cpa, contrib, contribPct, hl) => tr([td(nome), td(usd(rec), 'num'), td(usd(cogs), 'num'), td(usd(frete), 'num'), td(usd(rec * e.taxaPct), 'num'), td(cpa == null ? '—' : usd(cpa), 'num'), td(usd(contrib) + ' · ' + pct(contribPct), 'num')], hl ? 'hl' : '');
  const body = pageHead({ eyebrow: '06 · execução · plano de ação · do zero à venda em 14 dias', eyeCls: 'g', h1: esc(C.marca), answer: 'Uma marca de acessórios de passeio para cães com o nome do cão do fundador. Loja global em USD, 1º teste mirando o Reino Unido, orçamento concentrado, critérios de parada fixos.', meta: ['nível iniciante', 'loja global · USD · Shopify Markets', 'domínio dearbron.com'] }) +
  toc([['mercado', 'Mercado'], ['marca', 'Marca'], ['avatar', 'Avatar'], ['catalogo', 'Catálogo'], ['oferta', 'Oferta e P&L'], ['identidade', 'Identidade'], ['funil', 'Funil e cronograma'], ['ref', 'Referências'], ['regua', 'Régua'], ['suas', 'Decisões suas'], ['checklist', 'Checklist']]) +
  sec('mercado', '00', 'Decisão de mercado',
    '<div class="card"><span class="eyebrow g">Loja global · USD · Shopify Markets converte por país</span><h3 style="font-family:var(--font-display);font-size:20px;margin:6px 0">1º mercado de anúncio: Reino Unido</h3><p>Criativo en-GB, orçamento concentrado no UK no 1º mês. EUA e Irlanda na fase 2, com o mesmo criativo, sem retrabalho de loja. Envio rastreado mundial, devolução 30 dias.</p></div>') +
  sec('marca', '01', 'A marca',
    '<dl class="kv">' + b.ficha.map(f => '<dt>' + esc(f.k) + '</dt><dd>' + esc(f.v) + '</dd>').join('') + '</dl>' +
    note('Ângulo de anúncio: "' + esc(b.anguloAnuncio) + '"', 'b')) +
  sec('avatar', '02', 'Avatar',
    table([{ t: 'Momento' }, { t: 'Dores' }, { t: 'Desejo' }, { t: 'Objeções' }, { t: 'Linguagem' }], [tr([td(esc(b.avatar.momento)), td(esc(b.avatar.dores)), td(esc(b.avatar.desejo)), td(esc(b.avatar.objecoes)), td(esc(b.avatar.linguagem))])])) +
  sec('catalogo', '03', 'Arquitetura de catálogo',
    table([{ t: 'Produto' }, { t: 'Palavra-chave' }, { t: 'Fornecedor' }, { t: 'Custo', num: 1 }, { t: 'Preço', num: 1 }, { t: 'Compare-at', num: 1 }],
      o.catalogo.map(p => tr([
        td('<b>' + esc(p.titulo) + '</b><div class="d">' + esc(p.sku) + ' · ' + esc(p.papel) + '</div>'),
        td(esc(p.kw)),
        td('<a href="https://www.aliexpress.com/w/wholesale-' + encodeURIComponent(p.kw).replace(/%20/g, '-') + '.html?SortType=total_tranpro_desc" target="_blank" rel="noopener">AliExpress, ordenar por pedidos ↗</a><div class="d">produto encontrado: <a href="' + attr(p.link) + '" target="_blank" rel="noopener">item ' + esc((p.link.match(/item\/(\d+)/) || [, '?'])[1]) + ' ↗</a></div>'),
        td(usd(p.custo), 'num'),
        td(usd(p.preco), 'num'),
        td(usd(p.de), 'num'),
      ]))) +
    note('<b>' + o.catalogo.length + ' produtos em 4 coleções.</b> A coleção principal é Walking Sets; Harnesses, Leads e Add-ons completam. Cada link é uma busca de sourcing, não fornecedor aprovado. O fornecedor precisa fazer bordado/heat-press do nome e enviar global.', 'a', 'Limite')) +
  sec('oferta', '04', 'Escada de oferta e P&L',
    table([{ t: 'Oferta' }, { t: 'Receita', num: 1 }, { t: 'COGS', num: 1 }, { t: 'Frete', num: 1 }, { t: 'Taxa 3%', num: 1 }, { t: 'CPA alvo', num: 1 }, { t: 'Contribuição', num: 1 }], [
      linhaPL('Item avulso (herói sem escada)', o.core.preco, o.core.custo, e.frete, e.cpaAlvo, e.contribCore, e.contribCorePct),
      linhaPL('<b>' + esc(o.core.titulo) + '</b> (compare-at ' + usd(o.core.de) + ', economia ' + usd(o.core.de - o.core.preco) + ')', o.core.preco, o.core.custo, e.frete, e.cpaAlvo, e.contribCore, e.contribCorePct, true),
      linhaPL('<b>Bump: ' + esc(o.bump.titulo) + '</b> (' + usd(o.bump.preco) + ', âncora ' + usd(o.bump.de) + ')', o.bump.preco, o.bump.custo, 0, null, o.bump.preco - o.bump.custo - o.bump.preco * e.taxaPct, Math.round((o.bump.preco - o.bump.custo - o.bump.preco * e.taxaPct) / o.bump.preco * 100)),
      linhaPL('<b>Upsell pós-compra: ' + esc(o.upsell.titulo) + '</b>', o.upsell.preco, o.upsell.custo, 0, null, o.upsell.preco - o.upsell.custo - o.upsell.preco * e.taxaPct, Math.round((o.upsell.preco - o.upsell.custo - o.upsell.preco * e.taxaPct) / o.upsell.preco * 100)),
      linhaPL('<b>Bundle: ' + esc(o.bundle.titulo) + '</b> (âncora ' + usd(o.bundle.de) + ')', o.bundle.preco, o.bundle.custo, e.frete, e.cpaAlvo, o.bundle.preco - o.bundle.custo - e.frete - o.bundle.preco * e.taxaPct - e.cpaAlvo, Math.round((o.bundle.preco - o.bundle.custo - e.frete - o.bundle.preco * e.taxaPct - e.cpaAlvo) / o.bundle.preco * 100)),
    ]) +
    note('<b>CPA de equilíbrio do herói na escada: ' + usd(e.cpaEquilibrioEscada) + '.</b> ROAS de equilíbrio ~1,7x, calculado por margem, não por média genérica. <b>AOV projetado: ' + usd(e.aov) + '</b> = herói ' + usd(o.core.preco) + ' + bump ' + usd(o.bump.preco) + ' × ' + pct(o.bump.aceite * 100) + ' + upsell ' + usd(o.upsell.preco) + ' × ' + pct(o.upsell.aceite * 100) + '. ' + nat('calc'), 'g')) +
  sec('identidade', '05', 'Identidade visual',
    '<div class="palette">' + b.paleta.map(p => '<div class="swatch"><div class="sw" style="background:' + p.hex + '"></div><div class="i"><b>' + esc(p.nome) + '</b><span class="hex">' + p.hex + '</span></div></div>').join('') + '</div>' +
    '<p style="margin-top:10px">Fontes: <b>Fraunces</b> (título) e <b>Inter</b> (corpo, handle <code>inter_n4</code>). O handle da Fraunces no sistema de fontes da Shopify é <b>fonte a confirmar</b> no editor de tema (Configurações → Temas → Editar → Tipografia) antes de aplicar; o par seguro já validado é <code>cormorant_n5</code> + <code>inter_n4</code> se a Fraunces não tiver handle.</p>' +
    '<div class="btns">' + btn('Abrir identidade, logos e prompts', 'identidade-visual.html', 'primary') + '</div>') +
  sec('funil', '06', 'Funil, orçamento e cronograma',
    '<ol class="steps">' + D.cronograma.map(c => '<li><b>' + esc(c.q) + ':</b> ' + esc(c.d) + '</li>').join('') + '</ol>' +
    note('<b>Critério de parada:</b> pause o criativo após 1.500 impressões se o CTR de link ficar abaixo de 1,2%; mate o criativo se o CPA passar de ' + usd(e.cpaEquilibrioEscada) + ' com a escada ligada por 4 a 5 dias.', 'r', 'Regra fixa')) +
  sec('ref', '07', 'Referências para modelar',
    '<div class="grid g2">' + D.swipe.referenciasPlano.map(r => '<div class="card"><h3>' + esc(r.t) + '</h3><p>' + esc(r.d) + '</p><a href="' + attr(adlibUrl(r.dominio)) + '" target="_blank" rel="noopener">Abrir na Biblioteca ↗</a></div>').join('') + '</div>' +
    table([{ t: 'Referência' }, { t: 'Copiar' }, { t: 'Evitar' }], D.swipe.copiarEvitar.map(x => tr([td(esc(x.ref)), td(esc(x.copiar)), td(esc(x.evitar))]))) +
    '<div class="btns">' + btn('Ver blueprint da sua loja', 'benchmark-visual.html') + '</div>') +
  sec('regua', '08', 'Régua de métricas do teste',
    table([{ t: 'Métrica' }, { t: 'Benchmark', num: 1 }, { t: 'Meta do teste', num: 1 }, { t: 'Ação' }], D.regua.map(r => tr([td(esc(r.m)), td(esc(r.b), 'num'), td(esc(r.meta), 'num'), td(esc(r.acao))])))) +
  sec('suas', '09', 'As decisões que são suas',
    '<div class="grid g2">' + b.decisoesSuas.map(d => '<div class="card"><h3>' + esc(d.t) + '</h3><p>' + esc(d.d) + '</p></div>').join('') + '</div>') +
  sec('checklist', '10', 'Checklist de execução',
    '<ul class="check" data-key="dearbron:checklist">' + D.checklist.map((c, i) => '<li><input type="checkbox" id="ck-' + i + '" value="' + i + '"><label for="ck-' + i + '">' + esc(c.t) + '</label><span class="who">' + esc(c.who) + '</span></li>').join('') + '</ul><div class="check-sum"></div>' +
    note('<b>"Montada" e "pronta para vender" não são sinônimos.</b> Os itens "com você" acontecem fora do Raio-X: trademark, domínio, amostra do fornecedor, reset da loja Serena.', 'a')) +
  footer(false);
  return doc({ title: 'Plano de ação · ' + C.marca + ' · Raio-X', current: 'plano', screen: { code: '06', title: 'Plano de ação' }, body, next: { t: 'Buscar "Dear Bron" no UK IPO + USPTO e pedir a amostra do fornecedor', s: 'os dois gargalos; o resto do plano roda em paralelo', b: 'Ver catálogo e oferta', h: 'catalogo-oferta.html' } });
}

/* ================= TELA 07 · CATÁLOGO E OFERTA ================= */
function catalogo() {
  const o = D.oferta;
  const prod = p => '<div class="product-deep"><div class="row"><div><span class="eyebrow">' + esc(p.sku) + ' · ' + esc(p.papel) + '</span><h3>' + esc(p.titulo) + '</h3></div><div class="price">' + usd(p.preco) + '<small>âncora ' + usd(p.de) + '</small></div></div>' +
    '<div class="stats"><div class="stat"><div class="v">' + esc(p.tipo) + '</div><div class="l">product_type</div></div><div class="stat"><div class="v">' + esc(p.colecao) + '</div><div class="l">coleção</div></div><div class="stat"><div class="v">' + usd(p.custo) + '</div><div class="l">custo estimado</div><div>' + nat('inf') + '</div></div></div>' +
    '<dl class="kv"><dt>Eyebrow</dt><dd>' + esc(p.pdp.eyebrow) + '</dd><dt>Lede</dt><dd>' + esc(p.pdp.lede) + '</dd><dt>Prova</dt><dd>' + (p.pdp.proof ? esc(p.pdp.proof) : na('citação real não coletada nesta rodada, deixar em branco no build')) + '</dd><dt>Estação</dt><dd>' + esc(p.pdp.season) + '</dd></dl>' +
    '<details class="promptbox"><summary>Descrição completa e SEO</summary><div class="pbody">' + p.descricao_html + '<p style="margin-top:8px"><b>SEO título:</b> ' + esc(p.seo_titulo) + '<br><b>SEO descrição:</b> ' + esc(p.seo_descricao) + '</p></div></details></div>';
  const body = pageHead({ eyebrow: '07 · execução · catálogo · oferta · conteúdo de loja', h1: 'O catálogo <em>produto por produto</em>, pronto pro build', answer: 'Cada produto com SKU, papel comercial, preço, copy completa e SEO. É o que o build.json entrega pra /montar-loja sem reperguntar.', meta: [o.catalogo.length + ' produtos', '4 coleções', '5 páginas institucionais em rascunho'] }) +
  toc([['resumo', 'Resumo'], ['oferta', 'Oferta'], ['produtos', 'Produtos'], ['colecoes', 'Coleções'], ['menu', 'Menu'], ['paginas', 'Páginas'], ['prontidao', 'Prontidão']]) +
  sec('resumo', '00', 'Resumo',
    '<div class="grid g4">' + stat({ v: String(o.catalogo.length), l: 'produtos', k: 'rec' }) + stat({ v: '4', l: 'coleções', k: 'rec' }) + stat({ v: String(D.identidade.sequencia.length), l: 'posições de imagem', k: 'rec' }) + stat({ v: na('nenhum aprovado, sem amostra do fornecedor'), l: 'Product Masters aprovados', k: 'obs' }) + '</div>' +
    evidence(D.catalogoEvidencia)) +
  sec('oferta', '01', 'A escada de oferta',
    table([{ t: 'Degrau' }, { t: 'Item' }, { t: 'Preço', num: 1 }, { t: 'Papel' }], [
      tr([td('Principal'), td(esc(o.core.titulo)), td(usd(o.core.preco) + ' <s>' + usd(o.core.de) + '</s>', 'num'), td('o que o anúncio vende')]),
      tr([td('Order bump'), td(esc(o.bump.titulo)), td(usd(o.bump.preco) + ' <s>' + usd(o.bump.de) + '</s>', 'num'), td('PDP + checkout, eleva AOV')]),
      tr([td('Upsell'), td(esc(o.upsell.titulo)), td(usd(o.upsell.preco) + ' <s>' + usd(o.upsell.de) + '</s>', 'num'), td('1-clique pós-compra')]),
      tr([td('Cross-sell'), td(esc(o.crossSell.titulo)), td(usd(o.crossSell.preco) + ' <s>' + usd(o.crossSell.de) + '</s>', 'num'), td('PDP e e-mail D+30')]),
      tr([td('Bundle'), td(esc(o.bundle.titulo)), td(usd(o.bundle.preco) + ' <s>' + usd(o.bundle.de) + '</s>', 'num'), td('opção de maior valor')]),
    ]) +
    note('Economia proposta: o bundle sai ' + usd(o.core.preco + o.upsell.preco + o.crossSell.preco - o.bundle.preco) + ' abaixo dos 3 itens avulsos.', 'g')) +
  sec('produtos', '02', 'Produtos',
    '<div class="product-list">' + o.catalogo.map(prod).join('') + '</div>') +
  sec('colecoes', '03', 'Coleções',
    table([{ t: 'Coleção' }, { t: 'Handle' }, { t: 'Descrição' }, { t: 'Produtos', num: 1 }], D.identidade.colecoes.map(c => tr([td(esc(c.titulo)), td('<code>' + esc(c.handle) + '</code>'), td(esc(c.desc)), td(String(c.n), 'num')])))) +
  sec('menu', '04', 'Menu principal',
    table([{ t: '#' }, { t: 'Título' }, { t: 'Tipo' }, { t: 'Destino' }], D.identidade.menu.map((m, i) => tr([td(String(i + 1)), td(esc(m.titulo)), td('<code>' + esc(m.tipo) + '</code>'), td(esc(m.destino))])))) +
  sec('paginas', '05', 'Páginas institucionais (rascunho)',
    note('Prazo, garantia e tom calibrados pelo padrão dos concorrentes qualificados (30 dias de troca, "no-quibble", envio rastreado).', 'b', 'estado: rascunho') +
    D.identidade.paginasInst.map(p => '<details class="legal"><summary>' + esc(p.titulo) + '</summary><div>' + p.corpo + '</div></details>').join('')) +
  sec('prontidao', '06', 'Prontidão por produto',
    table([{ t: 'Produto' }, { t: 'Papel' }, { t: 'Referências' }, { t: 'Product Master' }, { t: 'Estado de origem' }],
      o.catalogo.map(p => tr([td(esc(p.titulo)), td(esc(p.papel)), td(p.refs + ' cenas'), td(na('sem amostra')), td(pill('sample_required', 'a'))]))) +
    note('Status do handoff: <b>validation_only</b>. Vira ready_for_store quando: amostra do fornecedor verificada + Product Master + imagens finais aprovadas.', 'a')) +
  footer(false);
  return doc({ title: 'Catálogo e oferta · ' + C.marca + ' · Raio-X', current: 'catalogo', screen: { code: '07', title: 'Catálogo e oferta' }, body, next: { t: 'Fechar fornecedor e a variante exata do herói', b: 'Ver benchmark e blueprint', h: 'benchmark-visual.html' } });
}

/* ================= TELA 08 · BENCHMARK VISUAL + BLUEPRINT ================= */
function benchmark() {
  const bm = D.benchmarkVisual;
  const cmp = (titulo, campo, mob) => '<div class="compare">' + bm.concorrentes.map(cc => '<div class="c"><div class="h">' + esc(cc.nome) + '</div><div class="screen ' + (mob ? 'mob' : 'desk') + '"><img loading="lazy" src="prints/' + cc.slug + '-' + campo + (mob ? '-mobile' : '') + '.jpg" alt="' + esc(cc.nome) + '"></div><div class="f">' + esc(cc[campo + 'Leitura'] || cc.leitura) + '</div></div>').join('') +
    '<div class="c ours"><div class="h">' + esc(C.marca) + ' (proposta)</div><div class="screen ' + (mob ? 'mob' : 'desk') + '"><iframe src="mockup-' + (campo === 'home' ? 'home' : 'pdp') + '.html" title="proposta" loading="lazy" style="width:100%;height:100%;border:0"></iframe></div><div class="f">' + esc(bm.nossa[campo]) + '</div></div></div>';
  const body = pageHead({ eyebrow: '08 · execução · loja · benchmark visual responsivo + blueprint', eyeCls: 'g', h1: 'A loja <em>lado a lado</em> com os 4 que mais vendem', answer: 'Home e PDP dos concorrentes fortes contra a proposta da Dear Bron, desktop e celular, com o que copiar e o que evitar por loja. Termina com o blueprint.', meta: [bm.concorrentes.length + ' concorrentes no comparativo', 'critério: sinal de escala, não gosto visual', 'blueprint na última seção'] }) +
  toc([['porque', 'Por que estas 4'], ['home-d', 'Home desktop'], ['home-m', 'Home celular'], ['pdp-d', 'PDP desktop'], ['pdp-m', 'PDP celular'], ['leitura', 'Leitura'], ['perf', 'Carregamento'], ['blueprint', 'Blueprint']]) +
  sec('porque', '01', 'Por que estas ' + bm.concorrentes.length,
    '<div class="grid g4">' + bm.concorrentes.map(cc => stat({ v: n(D.lojas.find(l => l.slug === cc.slug).ativos), l: esc(cc.nome) + ': anúncios ativos', d: esc(cc.porque), k: 'obs' })).join('') + '</div>' +
    note('Critério de entrada no comparativo: sinal de escala (anúncios ativos + histórico), não achismo visual.', 'a')) +
  sec('home-d', '02', 'Home, desktop', cmp('Home desktop', 'home', false)) +
  sec('home-m', '03', 'Home, celular', cmp('Home celular', 'home', true)) +
  sec('pdp-d', '04', 'PDP, desktop', cmp('PDP desktop', 'pdp', false)) +
  sec('pdp-m', '05', 'PDP, celular', cmp('PDP celular', 'pdp', true)) +
  sec('leitura', '06', 'Leitura: critério por critério',
    table([{ t: 'Critério' }, { t: 'Vencedor entre os concorrentes' }, { t: 'Direção da Dear Bron' }], bm.criterios.map(x => tr([td(esc(x.c)), td(esc(x.venc)), td('<b>' + esc(x.nossa) + '</b>')])))) +
  sec('perf', '07', 'Carregamento observado',
    table([{ t: 'Loja' }, { t: 'Observação' }], bm.perf.map(p => tr([td(esc(p.loja)), td(esc(p.obs))]))) +
    note('É medição de laboratório (Playwright headless), não Core Web Vitals de campo. Orçamento da Dear Bron: LCP < 2,5s, CLS < 0,1, menos de 300KB de JS.', 'a')) +
  sec('imagens', '08', 'Auditoria de imagens',
    '<div class="grid g4">' + stat({ v: String(D.identidade.sequencia.length), l: 'posições planejadas', k: 'rec' }) + stat({ v: '0', l: 'geradas', naWhy: 'sem Product Master (amostra do fornecedor pendente)' }) + '</div>' +
    table([{ t: 'Produto' }, { t: 'Carrossel concorrente' }, { t: 'Baixadas' }, { t: 'Status' }], D.identidade.auditoriaImagens.map(a => tr([td(esc(a.produto)), td(esc(a.concorrente)), td(String(a.baixadas)), td(pill(a.status, 'a'))]))) +
    note('Método: as cenas de referência foram herdadas da auditoria de carrossel do V4 (' + D.identidade.sequencia.length + ' posições). O download 1:1 do carrossel completo (scripts/carrosseis.mjs) não rodou nesta passada; as referências apontam pros arquivos do V4.', 'a')) +
  ('<section class="blk" id="blueprint"><h2><span class="n">09</span>Blueprint da sua loja <span class="eyebrow g" style="margin-left:8px">monte a SUA assim</span></h2>' +
    '<p class="lead">A planta visual da SUA loja: home e página de produto já desenhadas na identidade ' + C.marca + ', em inglês (1º mercado Reino Unido). É o layout pra reproduzir no tema Shopify. Preços em USD, imagens são placeholder.</p>' +
    '<div class="note"><b>Como ler.</b> Os blocos com fundo claro e um rótulo são onde entram as fotos reais do produto. Todo o resto (copy, botões, preço, seletor de cor, order bump, tabela de medidas, FAQ) já está no lugar final.</div>' +
    '<div class="bpv"><h3>1 · Layout desktop <small style="color:var(--low);font-weight:400">· Home à esquerda, página de produto à direita</small></h3>' +
    '<p class="cap">Role dentro de cada janela pra ver a página inteira.</p>' +
    '<div class="bprow"><div class="bpcol"><div class="browser"><div class="bar"><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="url">dearbron.com</span></div><div class="shotf desk" data-base="1280"><iframe src="mockup-home.html" title="Home desktop" loading="lazy"></iframe></div></div><div class="bplbl">Home &nbsp;·&nbsp; <a href="mockup-home.html" target="_blank">tela cheia ↗</a></div></div>' +
    '<div class="bpcol"><div class="browser"><div class="bar"><span class="dot"></span><span class="dot"></span><span class="dot"></span><span class="url">dearbron.com/products/personalised-no-pull-harness</span></div><div class="shotf desk" data-base="1280"><iframe src="mockup-pdp.html" title="PDP desktop" loading="lazy"></iframe></div></div><div class="bplbl">Página de produto &nbsp;·&nbsp; <a href="mockup-pdp.html" target="_blank">tela cheia ↗</a></div></div></div>' +
    '<h3 style="margin-top:24px">2 · Layout celular <span class="eyebrow g" style="margin-left:8px">a prioridade: 90% do tráfego é mobile</span></h3>' +
    '<p class="cap">É aqui que o layout tem que estar impecável.</p>' +
    '<div class="bprow"><div class="bpcol"><div class="phone"><div class="shotf" data-base="390"><iframe src="mockup-home.html" title="Home celular" loading="lazy"></iframe></div></div><div class="bplbl">Home &nbsp;·&nbsp; <a href="mockup-home.html" target="_blank">tela cheia ↗</a></div></div>' +
    '<div class="bpcol"><div class="phone"><div class="shotf" data-base="390"><iframe src="mockup-pdp.html" title="PDP celular" loading="lazy"></iframe></div></div><div class="bplbl">Página de produto &nbsp;·&nbsp; <a href="mockup-pdp.html" target="_blank">tela cheia ↗</a></div></div></div></div>' +
    '<div class="note g"><b>A ordem dos blocos não é estética, é psicológica.</b> Home: promessa de encaixe + 1 CTA + 3 selos acima da dobra (modela RuffRover) → kit picker → comparação genérico vs Dear Bron (modela Ruff & Wild) → personalização com preview (modela DoggyKings) → prova social só quando for real → escada de oferta. PDP: galeria → buybox com âncora + SAVE% + tamanho + cor + campo de nome + order bump → por que para o puxão → tabela de medidas com troca grátis → FAQ. No mobile o add-to-cart fica em barra fixa sem cobrir o campo do nome.</div></section>') +
  footer(false);
  return doc({ title: 'Benchmark visual e blueprint · Raio-X · ' + C.nicho, current: 'benchmark', screen: { code: '08', title: 'Loja: benchmark e blueprint' }, body, next: { t: 'Montar home e PDP mobile-first conforme o blueprint', b: 'Ver identidade e imagens', h: 'identidade-visual.html' } });
}

/* ================= TELA 09 · IDENTIDADE VISUAL ================= */
function identidade() {
  const id = D.identidade, b = D.marca;
  const imgcard = s => '<div class="imgcard">' + (s.arquivo ? '<img loading="lazy" src="' + attr(s.arquivo) + '" alt="' + attr(s.titulo) + '">' : '') + '<div class="head"><span class="num">' + s.num + '</span><h4>' + esc(s.titulo) + '</h4></div><div class="what">' + esc(s.what) + '</div>' + (s.ref ? '<div class="ref">Anexar: <code>' + esc(s.ref) + '</code></div>' : '') +
    (s.prompt ? '<details class="promptbox"><summary>Prompt completo (inglês)</summary><div class="pbody"><button class="cp">copiar</button><pre>' + esc(s.prompt) + '</pre></div></details>' : '<div class="ref">' + pill('status: ' + s.status, 'a') + '</div>') + '</div>';
  const body = pageHead({ eyebrow: '09 · execução · identidade · imagens', eyeCls: 'g', h1: 'O kit visual: <em>paleta, logo e prompts</em>', answer: 'Página independente pra quem vai gerar as imagens pegar só isto e sair executando. Wordmark montado em vetor; símbolo por prompt.', meta: ['paleta ' + b.paleta.length + ' cores', 'Fraunces + Inter', id.sequencia.length + ' posições de imagem'] }) +
  toc([['como', 'Como usar'], ['paleta', 'Paleta'], ['logos', 'Logo'], ['banner', 'Banner da home'], ['sequencia', 'Sequência da PDP'], ['carrosseis', 'Carrosséis por produto']]) +
  sec('como', '00', 'Como usar',
    '<ol class="steps"><li>Escolha a posição da imagem na lista abaixo.</li><li>Localize o arquivo de referência de cena (concorrente) que a posição aponta.</li><li>Anexe a referência de cena + a foto real do produto (Product Master) no gerador.</li><li>Copie o prompt em inglês da posição.</li><li>Cole no gerador e confira contra a referência.</li></ol>' +
    note('Hierarquia: a <b>referência de cena</b> manda no enquadramento e na composição; o <b>Product Master</b> manda na forma, cor e acabamento do produto.', 'b') +
    note('Status: todas as posições de produto estão <b>pendentes</b> até existir amostra do fornecedor e a foto real. Nenhum lifestyle antes da foto do produto real.', 'a')) +
  sec('paleta', '01', 'Paleta e tipografia',
    '<div class="palette">' + b.paleta.map(p => '<div class="swatch"><div class="sw" style="background:' + p.hex + '"></div><div class="i"><b>' + esc(p.nome) + '</b><span class="hex">' + p.hex + '</span></div></div>').join('') + '</div>' +
    '<p style="margin-top:10px"><b>Fraunces</b> (títulos, logo, preço) + <b>Inter</b> (corpo). <b>Voz:</b> ' + b.voz.map(esc).join(' · ') + '.</p>') +
  sec('logos', '02', 'Logo',
    '<div class="grid g2"><div class="card"><h3>Wordmark (montar em vetor, não gerar)</h3><ul class="cl"><li>Fonte Fraunces, opsz Display, SemiBold, tracking −15</li><li>Texto "Dear Bron", title case, nunca "DearBron" nem "Dearborn"</li><li>Cor Ink #33352C sobre claro; Sand Light #F4EEE2 sobre Moss</li><li>Lockups: horizontal · empilhado · selo circular</li></ul></div>' +
    '<div class="card"><h3>Fluxo</h3><ul class="cl"><li>Gerar 4 a 6 variações de um prompt de símbolo</li><li>Escolher a mais limpa</li><li>Designer redesenha em vetor</li><li>Juntar ao wordmark, gerar favicon + selo + versão mono pra bordado</li></ul></div></div>' +
    '<div class="grid g3">' + id.logos.map(imgcard).join('') + '</div>' +
    note('Negative prompt (campo "avoid"): <code>cartoon mascot, paw-print cliché, googly eyes, bone shapes, gradient, drop shadow, 3D bevel, photorealistic, multiple colours, text, letters, watermark</code>', 'r')) +
  sec('banner', '03', 'Banner da home',
    note('A 1ª imagem que o cliente vê. São <b>duas</b> versões, nunca a mesma cortada: uma horizontal pro desktop (1920×1080) e uma vertical dedicada pro celular (1080×1350).', 'b') +
    '<div class="grid g3">' + id.sequencia.filter(s => s.tipo === 'banner_home').map(s => imgcard({ num: String(s.num), titulo: s.titulo, what: s.what, ref: null, status: s.status, prompt: 'CONTEXTO: banner de home premium de acessórios para cães. Cão de médio porte usando o peitoral Dear Bron na cor Moss, num passeio, luz dourada. Paleta Moss #7D8A5C / Terracotta #C56A44 / Sand #E8DDC9 como ambiente real. ZONA DE TEXTO: reservar o terço esquerdo (desktop) ou a metade inferior (mobile) pro headline e o CTA. FOTORREALISMO: catálogo comercial, sem aparência de IA, sem texto. FORMATO: ' + (s.titulo.includes('mobile') || s.titulo.includes('celular') ? 'Portrait 4:5, 1080x1350px.' : 'Landscape 16:9, 1920x1080px.') })).join('') + '</div>') +
  sec('sequencia', '04', 'Sequência de imagem da PDP',
    table([{ t: '#' }, { t: 'Tipo' }, { t: 'Descrição' }, { t: 'Referência de cena' }, { t: 'Status' }], id.sequencia.map(s => tr([td(String(s.num)), td(esc(s.tipo)), td(esc(s.titulo)), td(s.ref ? '<code>' + esc(s.ref) + '</code>' : '—'), td(pill(s.status, 'a'))]))) +
    note('Faixa do nicho: ' + id.faixaNicho.min + ' a ' + id.faixaNicho.max + ' imagens únicas por PDP (auditoria de carrossel do V4). Achado: ' + esc(id.achado), 'b')) +
  sec('carrosseis', '05', 'Carrosséis por produto',
    '<div role="tablist" aria-label="Produto">' + id.carrosseis.map((c, i) => '<button role="tab" id="tab-' + c.handle + '" aria-controls="panel-' + c.handle + '" aria-selected="' + (i === 0 ? 'true' : 'false') + '"' + (i > 0 ? ' tabindex="-1"' : '') + '>' + esc(c.titulo) + '</button>').join('') + '</div>' +
    id.carrosseis.map((c, i) => '<div role="tabpanel" id="panel-' + c.handle + '" aria-labelledby="tab-' + c.handle + '"' + (i > 0 ? ' hidden' : '') + '><div class="grid g3">' + c.imagens.map(imgcard).join('') + '</div></div>').join('')) +
  footer(false);
  return doc({ title: 'Identidade e imagens · ' + C.marca + ' · Raio-X', current: 'identidade', screen: { code: '09', title: 'Identidade e imagens' }, body, next: { t: 'Fotografar o produto real antes de gerar qualquer lifestyle', b: 'Ver dados e fontes', h: 'dados-fontes.html' } });
}

/* ================= TELA 10 · DADOS E FONTES ================= */
function dadosFontes() {
  const body = pageHead({ eyebrow: '10 · apoio · cobertura · fontes · artefatos', h1: 'O que foi coletado, <em>onde e com que cobertura</em>', answer: 'Inventário dos arquivos-fonte, cobertura de cada bloco, auditoria de contagem e as lacunas com consequência.', meta: ['nada foi publicado', 'entrega local', C.code] }) +
  toc([['cobertura', 'Cobertura'], ['arquivos', 'Arquivos'], ['volume', 'Volume'], ['contagem', 'Contagem'], ['lacunas', 'Lacunas'], ['prontidao', 'Prontidão']]) +
  sec('cobertura', '00', 'Cobertura por bloco',
    '<div class="grid g4">' + D.cobertura.map(c => stat({ v: c.v, l: esc(c.l), k: c.k, naWhy: c.naWhy })).join('') + '</div>' + legendNat()) +
  sec('arquivos', '01', 'Arquivos-fonte',
    table([{ t: 'Arquivo' }, { t: 'Conteúdo' }, { t: 'Onde aparece' }, { t: 'Estado' }], D.arquivos.map(a => tr([td('<code>' + esc(a.f) + '</code>'), td(esc(a.c)), td(esc(a.onde)), td(pill(a.estado, a.estado === 'ok' ? 'g' : 'a'))])))) +
  sec('volume', '02', 'Volume da entrega',
    '<div class="grid g2"><div class="card"><span class="eyebrow">pesquisa e decisão</span><ul class="cl">' + D.volume.pesquisa.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul></div><div class="card"><span class="eyebrow b">execução</span><ul class="cl">' + D.volume.execucao.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul></div></div>') +
  sec('contagem', '03', 'Auditoria de contagem de anúncios',
    table([{ t: 'Loja' }, { t: 'V4 reportado', num: 1 }, { t: 'V5 auditado (ativos)', num: 1 }, { t: 'Histórico (ALL)', num: 1 }, { t: 'Divergência' }, { t: 'Tratamento' }],
      D.lojas.map(l => tr([td(esc(l.nome)), td(n(l.ativosV4), 'num'), td(n(l.ativos), 'num'), td(n(l.historico), 'num'), td(esc(l.divergencia)), td('ficha usa o número v5')]))) +
    note('Regra: o número auditado (conector Meta, ' + C.auditoria + ') prevalece sobre o V4. Luther Bennett: o V4 tinha histórico 101 = ativos, a chamada ALL tinha falhado; real 1.025.', 'b')) +
  sec('lacunas', '04', 'Lacunas com consequência',
    table([{ t: 'Dado' }, { t: 'Motivo' }, { t: 'Como a entrega trata' }], D.lacunasConsequencia.map(x => tr([td(esc(x.d)), td(esc(x.m)), td(esc(x.t))])))) +
  sec('prontidao', '05', 'Prontidão do pacote',
    evidence(D.prontidaoEvidencia) + note('Nada foi publicado. A entrega abre local; o build.json alimenta a /montar-loja quando o usuário decidir montar.', 'a')) +
  footer(false);
  return doc({ title: 'Dados, fontes e artefatos · Raio-X · ' + C.nicho, current: 'dados', screen: { code: '10', title: 'Dados, fontes e artefatos' }, body, next: { t: 'Revisar as lacunas antes de autorizar qualquer montagem', b: 'Ver método', h: 'metodo.html' } });
}

/* ================= TELA 11 · MÉTODO ================= */
function metodo() {
  const body = pageHead({ eyebrow: '11 · apoio · método, limites e auditoria', h1: 'A régua desta entrega', answer: 'Como cada número foi obtido, o que cada fonte entrega e não entrega, e o dicionário dos termos técnicos.', meta: ['raio-x v5', C.code, 'conector Meta ' + C.auditoria] }) +
  toc([['regua', 'A régua'], ['fontes', 'Fontes'], ['nao-obtido', 'Não obtido'], ['auditoria', 'Auditoria de contagem'], ['revisao', 'Revisão de qualidade'], ['dicionario', 'Dicionário rápido']]) +
  sec('regua', '01', 'A régua', legendNat() +
    '<div class="grid g2"><div class="card"><span class="eyebrow">regras fixas</span><ul class="cl"><li>Nunca inventar número: lacuna declarada com o que foi tentado.</li><li>Medido (products.json) vs estimado (faturamento) sempre explícito.</li><li>Todo dado vem com a leitura: o que significa pra quem quer entrar.</li><li>Toda loja passa pela classificação de modelo antes do veredito.</li></ul></div>' +
    '<div class="card"><span class="eyebrow b">o que mudou nesta versão</span><ul class="cl"><li>Formato V3 "case file" (era o tema preto/verde Shopify do V4).</li><li>Contagens de anúncio refeitas pelo conector Meta (as do V4 eram de 27/08).</li><li>Luther Bennett: histórico corrigido de 101 pra 1.025.</li><li>Loja global em USD (era 100% UK em GBP no V4).</li></ul></div></div>') +
  sec('fontes', '02', 'Fontes',
    table([{ t: 'Fonte' }, { t: 'O que entregou' }, { t: 'Limite' }], D.fontes.map(f => tr([td(esc(f.f)), td(esc(f.e)), td(esc(f.l))])))) +
  sec('nao-obtido', '03', 'Dados não obtidos',
    table([{ t: 'Dado' }, { t: 'Situação' }, { t: 'O que foi feito no lugar' }], D.limites.map(l => tr([td(esc(l.dado)), td(esc(l.situacao)), td(esc(l.feito))])))) +
  sec('auditoria', '04', 'Auditoria de contagem',
    table([{ t: 'Loja' }, { t: 'Ativos (v5)', num: 1 }, { t: 'Histórico', num: 1 }, { t: 'Divergência vs V4' }], D.lojas.map(l => tr([td(esc(l.nome)), td(n(l.ativos), 'num'), td(n(l.historico), 'num'), td(esc(l.divergencia))]))) +
    note('Detalhe completo em <a href="dados-fontes.html">Dados, fontes e artefatos</a>.', 'b')) +
  sec('revisao', '05', 'Revisão de qualidade',
    '<ul class="cl">' + D.revisao.map(r => '<li>' + esc(r) + '</li>').join('') + '</ul>' +
    note('Conclusão: a pesquisa está correta nos números auditados. A decisão de negócio (entrar agora, topar o risco da amostra) é do usuário, apresentada em "As decisões que são suas" no plano.', 'g')) +
  sec('dicionario', '06', 'Dicionário rápido',
    '<dl class="kv">' + D.dicionario.map(d => '<dt>' + esc(d.t) + '</dt><dd>' + esc(d.d) + '</dd>').join('') + '</dl>') +
  footer(false);
  return doc({ title: 'Método, limites e auditoria · Raio-X · ' + C.nicho, current: 'metodo', screen: { code: '11', title: 'Método, limites e auditoria' }, body, next: { t: 'Voltar para a decisão', b: 'Central da oportunidade', h: '../' + encodeURIComponent(C.central) } });
}

/* ================= BUILD.JSON ================= */
function buildJson() {
  const o = D.oferta, b = D.marca;
  const money = v => Number(v).toFixed(2);
  const bj = {
    _nota: 'Gerado pela Fase 6 do raio-x v5. Contrato de execução da /montar-loja. status validation_only.',
    marca: {
      nome: C.marca, pais: 'GB', moeda: 'USD', idioma: 'en',
      paleta: { bg: '#FFFDF8', bg2: '#F4EEE2', primary: '#7D8A5C', accent: '#C56A44', ink: '#33352C', good: '#7D8A5C', line: '#DDD3BD' },
      fontes: { titulo: { nome: 'Fraunces', handle: null }, corpo: { nome: 'Inter', handle: 'inter_n4' } },
      logo: null,
      announcement: 'Personalised no-pull harness with their name, tracked worldwide shipping',
    },
    identidade_visual: { logos: D.identidade.logosBuild },
    colecoes: D.identidade.colecoes.map(c => ({ handle: c.handle, titulo: c.titulo, descricao_html: '<p>' + c.desc + '</p>' })),
    produtos: o.catalogo.map(p => ({
      handle: p.handle, titulo: p.titulo, tipo: p.tipo, tags: p.tags, colecao: p.colecao,
      preco: money(p.preco), de: money(p.de), sku: p.sku, status: 'active',
      descricao_html: p.descricao_html,
      seo_titulo: p.seo_titulo, seo_descricao: p.seo_descricao,
      pdp: p.pdp,
      imagens: p.imagens || [],
    })),
    addons: [
      { handle: o.bump.handle, titulo: o.bump.titulo, preco: money(o.bump.preco), de: money(o.bump.de), sku: 'DB-BUMP-01' },
      { handle: o.upsell.handle, titulo: o.upsell.titulo, preco: money(o.upsell.preco), de: money(o.upsell.de), sku: 'DB-LEAD-01' },
      { handle: o.crossSell.handle, titulo: o.crossSell.titulo, preco: money(o.crossSell.preco), de: money(o.crossSell.de), sku: 'DB-COL-01' },
    ],
    bump_pdp: { handle: o.bump.handle },
    paginas: D.identidade.paginasBuild,
    menu: [{ tipo: 'frontpage', titulo: 'Home' }].concat(D.identidade.colecoes.map(c => ({ tipo: 'collection', titulo: c.titulo, handle: c.handle }))),
    tema: { settings: {} },
    imagens_pdp: {
      fonte: 'auditoria_carrossel_concorrentes',
      concorrentes_auditados: D.identidade.auditadosBuild,
      faixa_nicho: D.identidade.faixaNicho,
      achado: D.identidade.achado,
      sequencia: D.identidade.sequenciaBuild,
      conferencia_produto: [],
    },
    _status: 'validation_only',
    _decisions_required: D.checklist.filter(c => c.who.includes('você')).map(c => c.t),
  };
  fs.writeFileSync(path.join(__dirname, 'build.json'), JSON.stringify(bj, null, 2));
  console.log('  build.json');
}

/* ================= WRITE ================= */
fs.mkdirSync(PAG, { recursive: true });
write(C.central, central());
write('demanda.html', demanda());
write('mercados.html', mercados());
write('concorrentes.html', concorrentes());
for (const l of D.lojas) write('loja-' + l.slug + '.html', loja(l));
write('anuncios.html', anuncios());
write('estrategia.html', estrategia());
write('plano-de-acao.html', plano());
write('catalogo-oferta.html', catalogo());
write('benchmark-visual.html', benchmark());
write('identidade-visual.html', identidade());
write('dados-fontes.html', dadosFontes());
write('metodo.html', metodo());
buildJson();
console.log('OK, v5 gerado.');
