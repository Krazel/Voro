// One-time migration: wrap React text and canvas text at their display boundary.
import ts from 'typescript';
import fs from 'node:fs';
const files = process.argv.includes('--studios') ? ['app/animaciones/page.tsx','app/animaciones/size-comparison.tsx','app/animaciones/population.tsx','app/interfaz/page.tsx','app/orilla/page.tsx'] : ['app/page.tsx','app/final-settings.tsx','app/cristal-ui.tsx','app/adaptation-constellation.tsx','app/review-milestone.tsx','app/engine.ts','app/earth-landmark.mjs'];
for (const file of files) {
  if (process.argv.includes('--without-home') && file === 'app/page.tsx') continue;
  if (process.argv.includes('--home-only') && file !== 'app/page.tsx') continue;
  const source = fs.readFileSync(file, 'utf8');
  if (source.includes('import { t as tr }')) continue;
  const ast = ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, file.endsWith('tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const edits = [];
  const wrap = node => { edits.push([node.getStart(ast), node.getStart(ast), 'tr('], [node.end, node.end, ')']); };
  function visit(node) {
    if (ts.isJsxText(node) && node.text.trim()) {
      const normalized = node.text.replace(/\s+/g, ' ');
      edits.push([node.pos, node.end, `{tr(${JSON.stringify(normalized)})}`]);
    } else if (ts.isJsxExpression(node) && node.expression && !ts.isJsxAttribute(node.parent)) {
      wrap(node.expression);
    } else if (ts.isJsxAttribute(node) && ['aria-label','title','placeholder','alt'].includes(node.name.text) && node.initializer) {
      if (ts.isStringLiteral(node.initializer)) edits.push([node.initializer.getStart(ast), node.initializer.end, `{tr(${JSON.stringify(node.initializer.text)})}`]);
      else if (ts.isJsxExpression(node.initializer) && node.initializer.expression) wrap(node.initializer.expression);
    } else if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression) && node.expression.name.text === 'fillText' && node.arguments.length) wrap(node.arguments[0]);
    ts.forEachChild(node, visit);
  }
  visit(ast);
  if (!edits.length) continue;
  let result = source;
  for (const [start,end,text] of edits.sort((a,b)=>b[0]-a[0] || b[1]-a[1])) result=result.slice(0,start)+text+result.slice(end);
  const directive=result.indexOf("'use client';");
  const pos=directive>=0?directive+13:0;
  const relative=file.split('/').length>2?'../':'./';
  result=result.slice(0,pos)+`\nimport { t as tr } from '${relative}language.mjs';\n`+result.slice(pos);
  fs.writeFileSync(file,result);
}
