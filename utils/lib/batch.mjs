import {relative} from 'node:path';

export function normalize(text) {
  return String(text).replace(/[,\s]/g, '');
}

export function isCorrect(text, expect) {
  if (expect === undefined) return undefined;
  return normalize(text).includes(normalize(expect));
}

export function firstLine(text) {
  return String(text).split('\n').find(line => line.trim().length) || '';
}

const esc = s => String(s).replace(/\|/g, '\\|');

// results: [{model, run, status, text, textFile, correct, error}], textFile absolute, out the batch directory.
export function buildResultsMarkdown({prompt, provider, n, expect, results, out}) {
  const header = ['model', 'run', 'answer (first line)'];
  if (expect !== undefined) header.push('correct?');
  header.push('full text');
  const lines = [
    `# Text batch: ${prompt}`,
    '',
    `Provider: ${provider} · ${n} run${n === 1 ? '' : 's'} each${expect !== undefined ? ` · expecting a match for "${expect}"` : ''}`,
    '',
    `| ${header.join(' | ')} |`,
    `| ${header.map(() => '---').join(' | ')} |`,
  ];
  for (const r of results) {
    const row = [esc(r.model), String(r.run)];
    if (r.status !== 'ok') {
      row.push(`FAILED: ${esc(r.error || '')}`);
      if (expect !== undefined) row.push('');
      row.push('');
      lines.push(`| ${row.join(' | ')} |`);
      continue;
    }
    row.push(esc(firstLine(r.text)));
    if (expect !== undefined) row.push(r.correct ? 'yes' : 'no');
    row.push(`[text](${relative(out, r.textFile).split('\\').join('/')})`);
    lines.push(`| ${row.join(' | ')} |`);
  }
  return lines.join('\n') + '\n';
}
