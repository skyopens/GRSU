#!/usr/bin/env node
/*
 * 快速 TSLint：**不建 TypeScript program**，因此比 `ng lint` 快一到两个数量级。
 *
 * 用法（在 client/ 下跑，默认项目目录 = 本脚本所在目录的上两级）：
 *   node tool/tslint_rules/lint_fast.cjs             只跑 array-layout（约 15 秒 / 250 文件）
 *   node tool/tslint_rules/lint_fast.cjs --all       跑除 TypedRule 外的全部规则（约 180 秒）
 * 也可以显式指定 Angular 项目目录（含 tslint.json 和 node_modules 的那层）：
 *   node tool/tslint_rules/lint_fast.cjs <项目目录> [--all]
 *
 * 为什么能跳过建 program：
 *   `ng lint` 慢，是因为 @angular-devkit 的 tslint builder 会
 *   `tsConfigs.map(t => Linter.createProgram(...))` —— 把源码 import 到的所有包的 .d.ts
 *   解析 + 绑定（建类型图），实测 3 个 tsConfig 串行、共约 320 秒，而且全部建完才开始 lint。
 *   但 TSLint 只有遇到 **TypedRule** 时才需要 program。本项目唯一的 TypedRule 是 `deprecation`，
 *   其余 80 条都不需要类型信息 —— 所以不建 program 也能跑。
 *   实测（249 个文件）：只跑 array-layout 14.0s；除 TypedRule 外全部规则 177.9s；
 *   而 `ng lint` 合计约 516s。array-layout 的报错结果与 `ng lint` 完全一致。
 *
 * 注意（踩过的坑）：
 *   `Linter.prototype.lint()` **不返回结果对象**，失败累积在 Linter 内部，
 *   必须在最后调 `linter.getResult()`。`lint()` 返回 undefined 不代表出错。
 *
 * 兼容 Node 12（ES2019），不要用 ?. / ?? / ||= / fs.rmSync 等。
 */
'use strict';

const fs = require('fs');
const path = require('path');

const argv = process.argv.slice(2);
const allMode = argv.indexOf('--all') >= 0;
const explicit = argv.filter(function (a) { return a.indexOf('--') !== 0; })[0];

// 默认项目目录：本脚本在 <项目>/tool/tslint_rules/ 下 → 往上两级
const beside = path.resolve(__dirname, '../..');
const root = path.resolve(explicit || (fs.existsSync(path.join(beside, 'tslint.json')) ? beside : process.cwd()));

const tslint = require(path.join(root, 'node_modules/tslint'));

const configPath = path.join(root, 'tslint.json');
const config = tslint.Configuration.findConfiguration(configPath, path.join(root, 'src/main.ts'));
const conf = config.results;

// ---- 决定这次要跑哪些规则 ----
const probe = new tslint.Linter({ fix: false });
const loaded = probe.getEnabledRules(conf, false);
const TypedRule = tslint.Rules.TypedRule;
const OptionallyTypedRule = tslint.Rules.OptionallyTypedRule;

function isTyped(rule) {
    return rule instanceof TypedRule || rule instanceof OptionallyTypedRule;
}

const keep = new Map();
const skipped = [];
loaded.forEach(function (rule) {
    const name = rule.getOptions().ruleName;
    if (!allMode && name !== 'array-layout') { return; }
    if (isTyped(rule)) { skipped.push(name); return; }
    keep.set(name, conf.rules.get(name));
});

if (keep.size === 0) {
    console.error('没有可跑的规则：检查 tslint.json 里是否注册了 array-layout，或改用 --all');
    process.exit(2);
}
conf.rules = keep;
conf.jsRules = new Map();
console.log('项目 ' + root);
console.log('规则 ' + keep.size + ' 条' + (skipped.length ? '，跳过需类型信息的：' + skipped.join(', ') : ''));

// ---- 收集 src 下的 .ts（跳过 .d.ts）----
const files = [];
(function walk(dir) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach(function (entry) {
        const p = path.join(dir, entry.name);
        if (entry.isDirectory()) { walk(p); }
        else if (/\.ts$/.test(entry.name) && !/\.d\.ts$/.test(entry.name)) { files.push(p); }
    });
})(path.join(root, 'src'));
files.sort();

// ---- 跑 ----
const linter = new tslint.Linter({ fix: false });
const t0 = Date.now();
files.forEach(function (f) {
    linter.lint(f, fs.readFileSync(f, 'utf8'), conf);
});
const result = linter.getResult();

result.failures.forEach(function (f) {
    const pos = f.getStartPosition().getLineAndCharacter();
    console.log(path.relative(root, f.getFileName()) + ':' + (pos.line + 1) +
        ' [' + f.getRuleSeverity() + '] ' + f.getFailure());
});
console.log('文件 ' + files.length + ' 个，违规 ' + result.failures.length + ' 条，耗时 ' +
    ((Date.now() - t0) / 1000).toFixed(1) + 's');
process.exit(result.failures.length > 0 ? 1 : 0);
