const fs = require('fs');

function strip(s) {
  s = s.replace(/\/\/.*/gm, '');
  s = s.replace(/\/\*.*?\*\//gs, '');
  s = s.replace(/`([^`]*)`/g, '');
  s = s.replace(/\$\{[^}]*\}/g, '');
  const o = [], c = [], j = [];
  for (const ch of s) {
    if (ch === '(') o.push(ch);
    else if (ch === ')') {
      if (!o.length) c.push('EXTRA )');
      o.pop();
    } else if (ch === '{') c.push(ch);
    else if (ch === '}') {
      if (!c.length) j.push('EXTRA }');
      c.pop();
    } else if (ch === '[') j.push(ch);
    else if (ch === ']') {
      if (!j.length) j.push('EXTRA ]');
      j.pop();
    }
  }
  return { o: o.length, c: c.length, j: j.length };
}

const file = process.argv[2];
const src = fs.readFileSync(file, 'utf8');
const { o, c, j } = strip(src);
console.log('file:', file);
console.log('unclosed (', o, ') {', c, '} [', j, ']');
console.log(o === 0 && c === 0 && j === 0 ? 'BALANCED' : 'IMBALANCED');
