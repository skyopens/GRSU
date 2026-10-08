import { Directive, ElementRef, Input, OnChanges, OnDestroy } from '@angular/core';
import { StoreService } from '../data/store_service';

// 图片 src 的全局开关 —— 只改这一行即可。tool/protect.cjs 读的是同一个值，
// 所以两边永远一致：
//   true  = blob 模式：拉密文 → 解密 → Blob URL，正式模式
//   false = 路径模式：直接用 /resources/pictures/store/xxx，调试用，图是明文
// 注意：切到 false 之后必须重新跑一次 protect（`npm run dev` 会自动跑），
// 否则磁盘上仍是密文，路径模式会显示坏图。
export const obfuscate_src_blob = true;

// 图片固定前缀，picture 字段只存相对路径（如 decoration/sugar_bubbles/1.png）
export const picture_prefix = '/resources/pictures/store/';

@Directive({ selector: '[obfuscate_src]' })
export class ObfuscateSrcDirective implements OnChanges, OnDestroy {
    @Input('obfuscate_src') rel_path: string;

    // 本指令当前持有的 blob URL。用完立刻 revoke，所以存活时间很短
    private object_url: string | null = null;
    // 每绑一次 +1，用来丢弃过期的异步结果
    private seq = 0;

    constructor(private el: ElementRef, private store: StoreService) { }

    ngOnChanges(): void {
        const rel_path = this.rel_path;
        if (!rel_path) {
            return;
        }

        // 先放掉上一个 URL（已经是 null 就是空操作，重复 revoke 也不会报错）
        this.revokeUrl();

        if (!obfuscate_src_blob) {
            this.el.nativeElement.src = picture_prefix + rel_path;
            return;
        }

        const seq = ++this.seq;
        this.store.loadPicture(rel_path).then((blob) => {
            // 期间又绑了新路径，这次结果作废
            if (seq !== this.seq) {
                return;
            }
            const url = URL.createObjectURL(blob);
            this.object_url = url;
            const img: HTMLImageElement = this.el.nativeElement;
            // 先挂监听再赋 src：Blob 已在内存里时 load 可能来得非常快
            img.addEventListener('load', () => {
                // 只 revoke 自己这一份，别误伤后来者的 URL
                if (this.object_url === url) {
                    this.revokeUrl();
                }
            }, { once: true });
            img.src = url;
        });
    }

    ngOnDestroy(): void {
        // 兜底：图片还没 load 完组件就被销毁时，URL 不能泄漏
        this.revokeUrl();
    }

    private revokeUrl(): void {
        if (this.object_url) {
            URL.revokeObjectURL(this.object_url);
            this.object_url = null;
        }
    }
}
