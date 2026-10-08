// 自定义 TSLint 规则 array-layout
//
// 作用：把「元素全是对象字面量」的数组强制成项目约定的排版：
//
//     const routes: Routes = [{
//         path: '', component: ComponentsComponent,
//     }, {
//         path: 'accordion', component: AccordionComponent
//     }];
//
// 四条规则（来源：用户手改的 components.routing.ts，即本项目的标准答案）：
//   1. `[` 与首元素的 `{` 同行；元素之间 `}, {` 同行；末元素的 `}` 与 `]` 同行。
//   2. 每个元素的**内容**独占行，缩进 = 该元素在原来源码里的行首缩进。
//   3. 元素的 `}` 缩进 = 原来源码里 `]` 的行首缩进（与第 2 条不是同一个值）。
//   4. 对象内部原本写在同一行的多个属性保持同行，不拆成一属性一行。
//
// 自动跳过、不算违规的情况：
//   * 空数组；元素不是对象字面量的数组；元素是空对象 `{}` 的数组。
//   * 元素之间、或 `]` 之前夹了注释的数组（重排后注释会跑到很奇怪的位置）。
//
// 安全设计：给自动修复之前，会先用「逐 token 指纹 + 注释清单」校验重排结果，
// 两者有任何不一致就**只报告、不给修复** —— 宁可不动，也不能改坏代码。
//
// 安装方式（两步，都在 client/tslint.json 里）：
//   1. rulesDirectory 加上 "tool/tslint_rules"（相对 tslint.json 所在目录解析）。
//   2. rules 里加上 "array-layout": true。
// 之后：`ng lint` 检查，`ng lint --fix` 自动修复。
//
// 注意：这个文件是**项目的 lint 规则**，不是一次性脚本，必须留在仓库里，
// 否则 `ng lint` 会因为找不到 rulesDirectory 直接报 FatalError。
'use strict';
const Lint = require('tslint');
const ts = require('typescript');

const IND = 4;

function SP(n) { return n > 0 ? ' '.repeat(n) : ''; }

// ---------------- 语义校验 ----------------
// ① 逐 token 指纹：getChildren() 拿到「含标点」的完整 token 树（AST 驱动，
//    所以模板表达式也能正确切分），忽略一切空白；只允许 `]` 前那个多余逗号消失。
//    不能用 transpileModule 比对 —— TS 的 emitter 会保留源码换行，比不出来。
function fingerprint(src, fileName, kind) {
    const sf = ts.createSourceFile(fileName, src, ts.ScriptTarget.Latest, true, kind);
    const raw = [];
    (function v(n) {
        const kids = n.getChildren(sf);
        if (kids.length === 0) { raw.push([n.kind, n.getText(sf)]); return; }
        kids.forEach(v);
    })(sf);
    const out = [];
    for (let i = 0; i < raw.length; i++) {
        if (raw[i][0] === ts.SyntaxKind.CommaToken &&
            raw[i + 1] && raw[i + 1][0] === ts.SyntaxKind.CloseBracketToken) { continue; }
        out.push(raw[i][0] + '|' + raw[i][1]);
    }
    return out.join('\u0001');
}

// ② 注释清单（指纹只看 token，注释要单独比）
function commentTexts(src, fileName, kind) {
    const sf = ts.createSourceFile(fileName, src, ts.ScriptTarget.Latest, true, kind);
    const out = [];
    (function v(n) {
        (ts.getLeadingCommentRanges(src, n.pos) || []).forEach(function (c) { out.push(src.slice(c.pos, c.end)); });
        if (n.getChildCount(sf) === 0) {
            (ts.getTrailingCommentRanges(src, n.end) || []).forEach(function (c) { out.push(src.slice(c.pos, c.end)); });
        }
        ts.forEachChild(n, v);
    })(sf);
    return out.sort().join('\u0001');
}

// ---------------- 工具 ----------------
function isObjArray(n) {
    if (!ts.isArrayLiteralExpression(n) || n.elements.length === 0) { return false; }
    for (let i = 0; i < n.elements.length; i++) {
        const e = n.elements[i];
        if (!ts.isObjectLiteralExpression(e) || e.properties.length === 0) { return false; }
    }
    return true;
}

function hasComment(s) {
    return s.indexOf('//') >= 0 || s.indexOf('/*') >= 0;
}

// gap 里最后一个 \n 之后的空格数；整段没有 \n（同一行）返回 -1
function indentAfterNL(text, from, to) {
    const gap = text.slice(from, to);
    const nl = gap.lastIndexOf('\n');
    if (nl < 0) { return -1; }
    let c = 0;
    for (let i = nl + 1; i < gap.length && gap.charAt(i) === ' '; i++) { c++; }
    return c;
}

// 所有候选数组（带嵌套深度）
function collect(sf) {
    const out = [];
    (function v(n, d) {
        if (isObjArray(n)) { out.push({ node: n, depth: d }); }
        ts.forEachChild(n, function (c) { v(c, d + 1); });
    })(sf, 0);
    return out;
}

// 元素之间 / 尾部夹了注释 -> 不能动
function blocked(text, sf, n) {
    const els = n.elements;
    for (let k = 0; k < els.length; k++) {
        const a = (k === 0) ? n.getStart(sf) + 1 : els[k - 1].getEnd();
        if (hasComment(text.slice(a, els[k].getStart(sf)))) { return true; }
    }
    return hasComment(text.slice(els[els.length - 1].getEnd(), n.getEnd() - 1));
}

// node 内「跨行字符串 / 模板字面量」的相对区间（相对 base）
// 注意：判断是否跨行必须用**绝对偏移**去切 text，返回的区间才减 base；
// 之前误用相对偏移切 text，会把普通的单行字符串当成跨行，导致整行漏缩进。
function frozenRanges(node, sf, base, text) {
    const out = [];
    (function v(n) {
        if (ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n) || ts.isTemplateExpression(n)) {
            const sAbs = n.getStart(sf), eAbs = n.getEnd();
            if (eAbs > sAbs && text.slice(sAbs, eAbs).indexOf('\n') >= 0) {
                out.push([sAbs - base, eAbs - base]);
            }
        }
        ts.forEachChild(n, v);
    })(node);
    return out;
}

// raw 的第 2 行起统一平移：delta>0 左移 delta 个空格，delta<0 右移 -delta 个空格。
// 落在跨行字符串 / 模板字面量里的行跳过。raw 必须从 base 位置开始。
function reindent(raw, delta, node, sf, text, base) {
    if (!delta) { return raw; }
    const frozen = frozenRanges(node, sf, base, text);
    const lines = raw.split('\n');
    let off = 0;
    for (let i = 1; i < lines.length; i++) {
        off += lines[i - 1].length + 1;
        let inside = false;
        for (let j = 0; j < frozen.length; j++) {
            if (off > frozen[j][0] && off < frozen[j][1]) { inside = true; break; }
        }
        if (inside) { continue; }
        if (delta > 0) {
            let c = 0;
            while (c < delta && lines[i].charAt(c) === ' ') { c++; }
            lines[i] = lines[i].slice(c);
        } else {
            if (lines[i].length === 0) { continue; }
            lines[i] = SP(-delta) + lines[i];
        }
    }
    return lines.join('\n');
}

// 单个元素 -> `{` \n 内容 \n `}`
function renderElem(text, sf, el, elIndent, closeIndent) {
    const elText = text.slice(el.getStart(sf), el.getEnd());
    const body0 = elText.slice(1, elText.length - 1);     // 去掉外层花括号
    const rt = body0.replace(/\s+$/, '');                 // 去掉尾部空白
    const nl = rt.indexOf('\n');

    if (nl < 0) {                                         // 单行对象：内容移到下一行
        return '{\n' + SP(elIndent) + rt.trim() + '\n' + SP(closeIndent) + '}';
    }

    // 多行对象：量出第一条内容行的缩进，把第 2 行起整体平移过去
    let ci = 0;
    const ls = rt.split('\n');
    for (let i = 1; i < ls.length; i++) {
        if (ls[i].trim() !== '') { ci = ls[i].length - ls[i].replace(/^\s+/, '').length; break; }
    }
    const shifted = reindent(rt, ci - elIndent, el, sf, text, el.getStart(sf) + 1);
    const nl2 = shifted.indexOf('\n');
    const head = shifted.slice(0, nl2).trim();
    const rest = shifted.slice(nl2 + 1);
    const body = (head === '' ? '' : SP(elIndent) + head + '\n') + rest;
    return '{\n' + body + '\n' + SP(closeIndent) + '}';
}

// 整个数组 -> `[{` \n ... \n `}, {` \n ... \n `}]`
function renderArray(text, sf, node) {
    const els = node.elements;
    const arrStart = node.getStart(sf);

    // elIndent：优先取「独占一行」的那个元素的缩进
    let elIndent = -1;
    for (let k = 0; k < els.length; k++) {
        const prevEnd = (k === 0) ? arrStart + 1 : els[k - 1].getEnd();
        const ind = indentAfterNL(text, prevEnd, els[k].getStart(sf));
        if (ind >= 0) { elIndent = ind; break; }
    }
    // closeIndent：`]` 的缩进
    let closeIndent = indentAfterNL(text, els[els.length - 1].getEnd(), node.getEnd() - 1);
    // 兜底：整个数组所在那一行的缩进
    let lineIndent = indentAfterNL(text, 0, arrStart);
    if (lineIndent < 0) { lineIndent = 0; }
    if (elIndent < 0) { elIndent = lineIndent + IND; }
    if (closeIndent < 0) { closeIndent = lineIndent; }

    const parts = [];
    for (let k = 0; k < els.length; k++) {
        parts.push(renderElem(text, sf, els[k], elIndent, closeIndent));
    }
    return '[' + parts.join(', ') + ']';
}

// 已经是目标排版了吗？（廉价的结构检查，用来判断还要不要动它）
function looksFormatted(text, sf, n) {
    const els = n.elements;
    const s = n.getStart(sf), e = n.getEnd();
    if (text.charAt(s + 1) !== '{') { return false; }        // `[{`
    if (text.charAt(e - 2) !== '}') { return false; }        // `}]`
    for (let k = 0; k < els.length; k++) {
        const es = els[k].getStart(sf), ee = els[k].getEnd();
        if (text.charAt(es + 1) !== '\n') { return false; }          // `{` 后立刻换行
        if (!/\n *$/.test(text.slice(es, ee - 1))) { return false; } // `}` 独占一行（前面只有缩进）
        if (k > 0 && text.slice(els[k - 1].getEnd(), es) !== ', ') { return false; }
    }
    return true;
}

// ---------------- 主转换 ----------------
function transform(src, fileName, kind) {
    const report = { skipped: [], arrays: 0 };

    // 先登记一次「因注释而跳过」的数组（用原始源码，报行号最准）
    const sf0 = ts.createSourceFile(fileName, src, ts.ScriptTarget.Latest, true, kind);
    collect(sf0).forEach(function (c) {
        if (blocked(src, sf0, c.node)) {
            report.skipped.push(fileName + ':' +
                (sf0.getLineAndCharacterOfPosition(c.node.getStart(sf0)).line + 1));
        }
    });

    let text = src;
    for (;;) {
        const sf = ts.createSourceFile(fileName, text, ts.ScriptTarget.Latest, true, kind);
        const cands = collect(sf).filter(function (c) {
            return !blocked(text, sf, c.node) && !looksFormatted(text, sf, c.node);
        });
        if (cands.length === 0) { break; }
        cands.sort(function (a, b) { return b.depth - a.depth; });   // 先做最内层
        let progressed = false;
        for (let i = 0; i < cands.length; i++) {
            const node = cands[i].node;
            const s = node.getStart(sf), e = node.getEnd();
            const next = text.slice(0, s) + renderArray(text, sf, node) + text.slice(e);
            if (next === text) { continue; }   // 这个数组渲染后没变，试下一个（不能直接 break）
            text = next;
            report.arrays++;
            progressed = true;
            break;
        }
        if (!progressed) { break; }            // 保险：所有候选都没变化就退出
        if (report.arrays > 20000) { throw new Error('迭代次数异常'); }
    }
    return { text: text, report: report };
}

function format(src, fileName, kind) {
    return transform(src, fileName, kind).text;
}


// ---------------- TSLint 包装 ----------------
const MESSAGE = '数组排版不符合约定：`[` 应与首元素 `{` 同行、元素之间用 `}, {`、' +
    '末元素 `}` 与 `]` 同行（可执行 `ng lint --fix` 自动修复）';

// 找出「需要重排」的数组：元素全是对象 + 当前不是目标排版 + 没夹注释
function badArrays(src, fileName, kind) {
    const sf = ts.createSourceFile(fileName, src, ts.ScriptTarget.Latest, true, kind);
    const out = [];
    collect(sf).forEach(function (c) {
        if (blocked(src, sf, c.node) || looksFormatted(src, sf, c.node)) { return; }
        out.push({ start: c.node.getStart(sf), end: c.node.getEnd() });
    });
    out.sort(function (a, b) { return a.start - b.start; });
    return out;
}

class Rule extends Lint.Rules.AbstractRule {
    apply(sourceFile) {
        return this.applyWithFunction(sourceFile, walk);
    }
}

Rule.metadata = {
    ruleName: 'array-layout',
    description: '数组排版：`[` 与首元素 `{` 同行，元素之间 `}, {` 同行，末元素 `}` 与 `]` 同行。',
    rationale: '见本文件头部注释的四条规则。',
    optionsDescription: 'Not configurable.',
    options: null,
    optionExamples: [true],
    type: 'style',
    typescriptOnly: false,
    hasFix: true,
};

function walk(ctx) {
    const sf = ctx.sourceFile;
    const src = sf.getFullText();
    const kind = /\.jsx?$/.test(sf.fileName) ? ts.ScriptKind.JS : ts.ScriptKind.TS;

    const bad = badArrays(src, sf.fileName, kind);
    if (bad.length === 0) { return; }

    // 修复做法：把「整份文件重排后」的文本作为一条替换挂到第一条报告上。
    // 为什么不是「每个数组挂一条替换」—— 嵌套数组的区间互相重叠，TSLint 会
    // 把重叠的修复直接丢掉，逐数组修复反而修不全；整份替换一条就够，一次到位。
    let fix;
    try {
        const candidate = format(src, sf.fileName, kind);
        if (candidate !== src &&
            fingerprint(src, sf.fileName, kind) === fingerprint(candidate, sf.fileName, kind) &&
            commentTexts(src, sf.fileName, kind) === commentTexts(candidate, sf.fileName, kind)) {
            fix = [Lint.Replacement.replaceFromTo(0, src.length, candidate)];
        }
    } catch (err) { fix = undefined; }

    bad.forEach(function (b, i) {
        ctx.addFailure(b.start, b.end, MESSAGE, i === 0 ? fix : undefined);
    });
}

exports.Rule = Rule;
