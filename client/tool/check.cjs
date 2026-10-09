/*
 * check.cjs —— 录入数据时的自检脚本（只读，不改任何文件）
 *
 *   node tool/check.cjs
 *
 * 检查 data_raw/data_store/*.json：
 *   - 每个二级的 title 四语是否齐全
 *   - 每条道具的 name / desc 四语是否齐全
 *   - picture 是否能在 data_raw/pictures/store/ 下找到对应文件
 *   - 同一条 picture 是否被多条道具重复引用
 *   - amount / unit / price_normal / price_member 是否合法
 * 另外统计 data_raw/pictures/store/ 里有多少图片还没被任何道具引用。
 *
 * 有问题时退出码为 1，可以直接串到别的命令里。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'data_raw', 'data_store');
const PICS_DIR = path.join(ROOT, 'data_raw', 'pictures', 'store');
const LANG_DIR = path.join(ROOT, 'src', 'lang');
const LANGS = ['zh_CN', 'en_US', 'ru_RU', 'be_BY'];
const MAX_SHOW = 30;

const problems = [];
const notes = [];

function bad(where, msg) {
    problems.push(where + '  ' + msg);
}

// 递归列出目录下所有文件，返回相对路径（用 / 分隔），跳过点文件
function walk(dir, prefix, out) {
    for (const name of fs.readdirSync(dir)) {
        if (name.charAt(0) === '.') {
            continue;
        }
        const full = path.join(dir, name);
        const rel = prefix ? prefix + '/' + name : name;
        if (fs.lstatSync(full).isDirectory()) {
            walk(full, rel, out);
        } else {
            out.push(rel);
        }
    }
    return out;
}

function checkText(where, field, value) {
    if (value === undefined || value === null || typeof value !== 'object') {
        bad(where, field + ' 缺失');
        return;
    }
    for (const lang of LANGS) {
        if (typeof value[lang] !== 'string' || value[lang] === '') {
            bad(where, field + '.' + lang + ' 为空');
        }
    }
}

function isNum(v) {
    return typeof v === 'number' && isFinite(v);
}

/* ---------- 读取单位字典 ---------- */

let unit_keys = null;
const zh_path = path.join(LANG_DIR, 'zh_CN.json');
if (fs.existsSync(zh_path)) {
    const zh = JSON.parse(fs.readFileSync(zh_path, 'utf8'));
    if (zh.qt && zh.qt.branch && zh.qt.branch.unit) {
        unit_keys = Object.keys(zh.qt.branch.unit);
    }
}

/* ---------- 逐条检查 ---------- */

const used = {};       // picture -> 第一条引用它的位置
const dup = {};
let item_total = 0;

const files = fs.readdirSync(SRC_DIR).filter((f) => f.endsWith('.json')).sort();

console.log('分类            二级   道具');
console.log('--------------------------------');

for (const name of files) {
    const menu = name.replace(/\.json$/, '');
    const subs = JSON.parse(fs.readFileSync(path.join(SRC_DIR, name), 'utf8'));

    if (!Array.isArray(subs)) {
        bad(menu, '顶层不是数组');
        continue;
    }

    let n = 0;
    const seen_keys = {};
    for (let i = 0; i < subs.length; i++) {
        const sub = subs[i];
        const where = menu + '[' + i + ']';

        if (typeof sub.key !== 'string' || sub.key === '') {
            bad(where, 'key 为空');
        } else if (seen_keys[sub.key]) {
            bad(where, 'key 重复：' + sub.key);
        } else {
            seen_keys[sub.key] = true;
        }

        checkText(where, 'title', sub.title);

        if (!Array.isArray(sub.data)) {
            bad(where, 'data 不是数组');
            continue;
        }

        for (let j = 0; j < sub.data.length; j++) {
            const item = sub.data[j];
            const at = where + '.data[' + j + ']';
            n++;
            item_total++;

            if (typeof item.picture !== 'string' || item.picture === '') {
                bad(at, 'picture 为空');
            } else if (!fs.existsSync(path.join(PICS_DIR, item.picture))) {
                bad(at, 'picture 找不到文件：' + item.picture);
            } else if (used[item.picture]) {
                dup[item.picture] = (dup[item.picture] || 1) + 1;
            } else {
                used[item.picture] = at;
            }

            // picture 形如 <一级>/<二级>/<文件名>，第二段必须和所在二级的 key 一致
            if (typeof item.picture === 'string' && item.picture && typeof sub.key === 'string' && sub.key) {
                const seg = item.picture.split('/');
                if (seg.length > 1 && seg[1] !== sub.key) {
                    bad(at, 'picture 的二级目录 "' + seg[1] + '" 与 key "' + sub.key + '" 不一致');
                }
            }

            checkText(at, 'name', item.name);
            checkText(at, 'desc', item.desc);

            if (!isNum(item.amount) || item.amount < 1 || item.amount % 1 !== 0) {
                bad(at, 'amount 不是正整数：' + JSON.stringify(item.amount));
            }

            if (typeof item.unit !== 'string' || item.unit === '') {
                bad(at, 'unit 为空');
            } else if (unit_keys && unit_keys.indexOf(item.unit) < 0) {
                bad(at, 'unit 不在 qt.branch.unit 里：' + JSON.stringify(item.unit));
            }

            if (!isNum(item.price_normal) || item.price_normal < 0) {
                bad(at, 'price_normal 非法：' + JSON.stringify(item.price_normal));
            }
            if (!isNum(item.price_member) || item.price_member < 0) {
                bad(at, 'price_member 非法：' + JSON.stringify(item.price_member));
            }
            if (isNum(item.price_normal) && isNum(item.price_member) && item.price_member > item.price_normal) {
                bad(at, 'price_member 比 price_normal 还贵');
            }
        }
    }
    console.log(menu.padEnd(16) + String(subs.length).padStart(4) + String(n).padStart(7));
}

console.log('--------------------------------');
console.log('合计'.padEnd(16) + String(files.length).padStart(4) + String(item_total).padStart(7) + '  条道具');

/* ---------- 未被引用的图片 ---------- */

if (fs.existsSync(PICS_DIR)) {
    const all = walk(PICS_DIR, '', []);
    let orphan = 0;
    for (const rel of all) {
        if (!used[rel]) {
            orphan++;
        }
    }
    if (orphan) {
        notes.push('data_raw/pictures/store/ 里有 ' + orphan + ' / ' + all.length + ' 张图片还没被任何道具引用（录入过程中正常）');
    } else {
        notes.push('data_raw/pictures/store/ 里 ' + all.length + ' 张图片全部已被引用');
    }
}

/* ---------- 报告 ---------- */

const dup_list = Object.keys(dup);
if (dup_list.length) {
    for (const pic of dup_list) {
        bad('重复引用', pic + ' 被 ' + dup[pic] + ' 条道具共用');
    }
}

if (unit_keys) {
    console.log('\n可用单位：' + unit_keys.join(' / '));
} else {
    notes.push('没读到 qt.branch.unit，跳过 unit 校验');
}

if (notes.length) {
    console.log('');
    for (const one of notes) {
        console.log('[提示] ' + one);
    }
}

if (problems.length === 0) {
    console.log('\n全部检查通过');
} else {
    console.log('\n发现 ' + problems.length + ' 个问题：');
    for (const one of problems.slice(0, MAX_SHOW)) {
        console.log('  ' + one);
    }
    if (problems.length > MAX_SHOW) {
        console.log('  ...还有 ' + (problems.length - MAX_SHOW) + ' 个');
    }
    process.exit(1);
}
