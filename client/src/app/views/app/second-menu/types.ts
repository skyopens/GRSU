export interface Role {
    name: string;
    introduce: string;
    pic_detail?: string[];
    pic_intro?: string[];
}

export interface ModeSub {
    name: string;
    key: string;
    desc: string;
    pictures?: string[];
}

export interface Mode {
    title: string;
    list: ModeSub[];
}