/*
 * protect.cjs —— 构建前跑的加密 / 改名脚本
 *
 * 干两件事：
 *   1. 图片：读 data_raw/pictures/** → 写 src/resources/pictures/**
 *        store/ 下的图片改名成 sha256(storeSalt + 原相对路径) 的前 16 位十六进制，后缀不变，
 *        内容按下面的开关决定是加密还是原样拷贝
 *        mode/ role/ 原样拷贝
 *   2. 数据：读 data_raw/data_store/*.json（明文）→ AES-256-GCM 加密 → 写 src/resources/data_store/*.json（密文）
 *        加密前把每条道具的 picture 换成上一步算出来的哈希路径
 *
 * 明文 JSON 里的 picture 永远写原始文件名（如 function/function/1.png），不要手填哈希。
 *
 * 图片密文格式：[12 字节 IV][密文 ‖ 16 字节 GCM 认证标签]，二进制直接写文件。
 * 浏览器端在 src/app/data/store_service.ts 的 decryptPicture 里按同样格式切分。
 *
 * 图片要不要加密，由 src/app/shared/obfuscate_src_directive.ts 里的
 * `obfuscate_src_blob` 决定 —— 和浏览器端指令共用同一个开关，两边永远一致。
 *   true  = 加密（正式模式）
 *   false = 明文拷贝（调试模式，可以直接看原图）
 * 注意：每个 npm run dev 都会重新加密一遍全部图片（GCM 的 IV 每次随机，密文必然不同）。
 *
 * 图片走的是「按清单同步」而不是「清空重建」：先算出这次应该有哪些产物，再逐张覆盖写入，
 * 最后只删掉「上次有、这次不该有」的残留。图片没增删时一个文件都不会被删。
 *
 * 密钥从 src/environments 的两个环境文件里读，两处必须一致：
 *   environment.ts       构建时用这个
 *   environment.prod.ts  浏览器运行时用这个解密
 */
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'data_raw', 'data_store');
const OUT_DIR = path.join(ROOT, 'src', 'resources', 'data_store');
const PICS_SRC = path.join(ROOT, 'data_raw', 'pictures');
const PICS_OUT = path.join(ROOT, 'src', 'resources', 'pictures');

// 需要改名成哈希的一级分类，其余原样拷贝
const HASH_DIRS = ['store'];

// 图片加密开关所在文件 —— 和浏览器端指令共用同一个配置，避免两边不一致
const DIRECTIVE_FILE = path.join(ROOT, 'src', 'app', 'shared', 'obfuscate_src_directive.ts');

function readEnv(file_name) {
    const env_path = path.join(ROOT, 'src', 'environments', file_name);
    const src = fs.readFileSync(env_path, 'utf8');
    const key = src.match(/storeKey\s*:\s*['"]([^'"]+)['"]/);
    const salt = src.match(/storeSalt\s*:\s*['"]([^'"]+)['"]/);
    if (!key || !salt) {
        console.error('[protect] ' + file_name + ' 里找不到 storeKey / storeSalt');
        process.exit(1);
    }
    return { key: key[1], salt: salt[1] };
}

const dev = readEnv('environment.ts');
const prod = readEnv('environment.prod.ts');
if (dev.key !== prod.key || dev.salt !== prod.salt) {
    console.error('[protect] environment.ts 与 environment.prod.ts 的 storeKey / storeSalt 不一致，已停止');
    process.exit(1);
}

const aes_key = crypto.createHash('sha256').update(dev.key).digest();

// 读图片加密开关。读不到就直接停，免得悄悄按错误模式产出
function readObfuscateFlag() {
    if (!fs.existsSync(DIRECTIVE_FILE)) {
        console.error('[protect] 找不到 ' + path.relative(ROOT, DIRECTIVE_FILE));
        process.exit(1);
    }
    const src = fs.readFileSync(DIRECTIVE_FILE, 'utf8');
    const found = src.match(/export\s+const\s+obfuscate_src_blob\s*=\s*(true|false)/);
    if (!found) {
        console.error('[protect] ' + path.relative(ROOT, DIRECTIVE_FILE) + ' 里找不到 obfuscate_src_blob');
        process.exit(1);
    }
    return found[1] === 'true';
}

const obfuscate_blob = readObfuscateFlag();

// 图片密文：[12 字节 IV][密文 ‖ 16 字节 GCM 认证标签]，二进制直接写文件
function encryptPicture(buf) {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', aes_key, iv);
    const body = Buffer.concat([cipher.update(buf), cipher.final(), cipher.getAuthTag()]);
    return Buffer.concat([iv, body]);
}

// 递归列出目录下所有文件，返回相对路径（用 / 分隔），跳过 .DS_Store 之类的点文件
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

function hashName(orig, salt) {
    return crypto.createHash('sha256').update(salt + orig).digest('hex').slice(0, 16);
}

/* ---------- 1. 图片 ---------- */

// key = 相对一级分类的路径（正是 JSON 里 picture 字段的写法），value = 改名后的同格式路径
const pic_map = {};
const plan = [];       // 这次要写的文件
const expected = {};   // 这次应该存在的产物（相对 PICS_OUT）

if (!fs.existsSync(PICS_SRC)) {
    console.error('[protect] 找不到 ' + path.relative(ROOT, PICS_SRC) + '，图片全部跳过');
} else {
    for (const top of fs.readdirSync(PICS_SRC)) {
        if (top.charAt(0) === '.') {
            continue;
        }
        const top_src = path.join(PICS_SRC, top);
        if (!fs.lstatSync(top_src).isDirectory()) {
            continue;
        }
        const hash_this = HASH_DIRS.indexOf(top) >= 0;
        for (const rel of walk(top_src, '', [])) {
            let dest_rel = rel;
            if (hash_this) {
                // 哈希用「一级分类/相对路径」，避免不同分类之间撞名
                const dir = path.posix.dirname(rel);
                const hashed = hashName(top + '/' + rel, dev.salt) + path.posix.extname(rel);
                dest_rel = dir === '.' ? hashed : dir + '/' + hashed;
                pic_map[rel] = dest_rel;
            }
            expected[top + '/' + dest_rel] = true;
            plan.push({
                from: path.join(top_src, rel),
                to: path.join(PICS_OUT, top, dest_rel),
                encrypt: hash_this && obfuscate_blob
            });
        }
    }
}

// 清掉上次留下的、这次不该再有的产物（图片没增删时这里一个都不会命中）
let removed = 0;
if (fs.existsSync(PICS_OUT)) {
    for (const old of walk(PICS_OUT, '', [])) {
        if (!expected[old]) {
            fs.unlinkSync(path.join(PICS_OUT, old));
            removed++;
        }
    }
}

let encrypted = 0;
for (const one of plan) {
    fs.mkdirSync(path.dirname(one.to), { recursive: true });
    if (one.encrypt) {
        fs.writeFileSync(one.to, encryptPicture(fs.readFileSync(one.from)));
        encrypted++;
    } else {
        fs.copyFileSync(one.from, one.to);
    }
}

console.log('[protect] 图片 ' + plan.length + ' 张 -> ' + path.relative(ROOT, PICS_OUT)
    + '（' + HASH_DIRS.join(' / ') + ' 已改哈希名，其中 ' + encrypted + ' 张已加密'
    + (obfuscate_blob ? '' : '，但开关是 false，本应加密的改成了明文拷贝')
    + '；其余原样拷贝；清掉残留 ' + removed + ' 个）');

/* ---------- 2. 数据 ---------- */

fs.mkdirSync(OUT_DIR, { recursive: true });

const files = fs.readdirSync(SRC_DIR).filter((f) => f.endsWith('.json'));

// 清掉上次生成、这次已经没有对应源文件的密文（正常情况下一个都不会命中）
for (const old of fs.readdirSync(OUT_DIR)) {
    if (old.endsWith('.json') && files.indexOf(old) < 0) {
        fs.unlinkSync(path.join(OUT_DIR, old));
    }
}

let item_total = 0;
const missing = [];

for (const name of files) {
    const subs = JSON.parse(fs.readFileSync(path.join(SRC_DIR, name), 'utf8'));

    for (const sub of subs) {
        for (const item of sub.data) {
            item_total++;
            if (!item.picture) {
                continue;
            }
            const mapped = pic_map[item.picture];
            if (mapped) {
                item.picture = mapped;
            } else {
                missing.push(name + '  ' + item.picture);
            }
        }
    }

    const raw = JSON.stringify(subs, null, 4);
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', aes_key, iv);
    // 密文 + 16 字节 GCM 认证标签拼在一起，正是 Web Crypto 解密时要求的格式
    const body = Buffer.concat([cipher.update(raw, 'utf8'), cipher.final(), cipher.getAuthTag()]);
    fs.writeFileSync(path.join(OUT_DIR, name), JSON.stringify({
        iv: iv.toString('base64'),
        data: body.toString('base64')
    }));
    console.log('[protect] ' + name + '  ->  ' + path.relative(ROOT, path.join(OUT_DIR, name)));
}

if (missing.length) {
    console.error('[protect] 警告：有 ' + missing.length + ' 条道具的 picture 在 data_raw/pictures 里找不到对应文件');
    for (const one of missing.slice(0, 20)) {
        console.error('           ' + one);
    }
    if (missing.length > 20) {
        console.error('           ...还有 ' + (missing.length - 20) + ' 条');
    }
}

console.log('[protect] 完成：' + files.length + ' 份密文，' + item_total + ' 条道具');
