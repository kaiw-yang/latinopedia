const assert = require('node:assert/strict');
const {annotate} = require('../assets/names.js');
const cases = [
 ['圣佩德罗苏拉','圣佩德罗苏拉'],
 ['蒙特祖玛二世','蒙特祖玛二世（Moctezuma II）'],
 ['巴西和墨西哥','巴西（Brasil）和墨西哥（México）'],
 ['萨尔瓦多·阿连德','萨尔瓦多·阿连德（Salvador Allende）'],
 ['巴西利亚、墨西哥城、沿海地区','巴西利亚、墨西哥城、沿海地区'],
 ['伊达尔戈（Miguel Hidalgo）','伊达尔戈（Miguel Hidalgo）'],
 ['卡德纳斯（Lázaro Cárdenas，1934—1940 年执政）','卡德纳斯（Lázaro Cárdenas，1934—1940 年执政）'],
 ['罗梅罗政府与罗梅罗大主教','罗梅罗（Carlos Humberto Romero）政府与罗梅罗（Óscar Arnulfo Romero）大主教'],
 ['首都苏克雷和苏克雷率军','首都苏克雷和苏克雷（Antonio José de Sucre）率军'],
 ['苏克雷贬值；首都苏克雷','苏克雷贬值；首都苏克雷'],
 ['萨尔瓦多','萨尔瓦多（El Salvador）'],
 ['萨尔瓦多','萨尔瓦多（Salvador）','br'],
 ['格雷罗等力量与格雷罗州','格雷罗（Vicente Guerrero）等力量与格雷罗州'],
];
for (const [input, output, context] of cases) {
 assert.equal(annotate(input,context), output);
 assert.equal(annotate(output,context), output, 'annotations must be idempotent');
}
const fs=require('node:fs'), vm=require('node:vm');
const sandbox={window:{}}; vm.runInNewContext(fs.readFileSync('assets/quiz-bank.js','utf8'),sandbox);
const bank=sandbox.window.latinopediaCountryQuiz;
for (const q of bank) for (const text of [q.q,...q.opts,q.why]) {
 const once=annotate(text,q.country);
 assert.equal(annotate(once,q.country),once, q.id);
 assert(!/巴西（Brasil）利亚|海地（Haïti）区/.test(once),q.id);
}
assert.equal(bank.length,420);
console.log('Passed name disambiguation, duplicate prevention, and all 420 questions.');
