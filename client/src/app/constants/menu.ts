import { environment } from 'src/environments/environment';
import { UserRole } from '../shared/auth_roles';
const adminRoot = environment.adminRoot;

export interface IMenuItem {
    id?: string;
    icon?: string;
    label: string;
    to: string;
    newWindow?: boolean;
    subs?: IMenuItem[];
    roles?: UserRole[];
}

const data: IMenuItem[] = [{
    icon: 'iconsminds-air-balloon-1',
    label: 'menu.perface',
    to: `${adminRoot}/vien`,
    roles: [UserRole.Admin, UserRole.Editor]
}, {
    icon: 'simple-icon-eyeglass',
    label: 'menu.second-menu',
    to: `${adminRoot}/second-menu`,
    // roles: [UserRole.Editor],
    subs: [{
        icon: 'simple-icon-ghost',
        label: 'menu.second.role',
        to: `${adminRoot}/second-menu/role`,
    }, {
        icon: 'simple-icon-ghost',
        label: 'menu.second.mode',
        to: `${adminRoot}/second-menu/mode`,
    }],
}, {
    icon: 'iconsminds-clothing-store',
    label: 'menu.store-menu',
    to: `${adminRoot}/store`,
    // roles: [UserRole.Editor],
    subs: [{
        icon: 'simple-icon-ghost',
        label: 'menu.store.function',
        to: `${adminRoot}/store/function`,
    }, {
        icon: 'simple-icon-ghost',
        label: 'menu.store.decoration',
        to: `${adminRoot}/store/decoration`,
    },{
        icon: 'simple-icon-ghost',
        label: 'menu.store.gear',
        to: `${adminRoot}/store/gear`,
    }, {
        icon: 'simple-icon-ghost',
        label: 'menu.store.pet',
        to: `${adminRoot}/store/pet`,
    }],
}, {
    icon: 'iconsminds-library',
    label: 'menu.todo',
    to: `${adminRoot}/todo`,
}
    // {
    //     icon: 'iconsminds-bucket',
    //     label: 'menu.blank-page',
    //     to: `${adminRoot}/blank-page`,
    // }, {
    //   icon: 'iconsminds-library',
    //   label: 'menu.docs',
    //   to: 'https://vien-docs.coloredstrategies.com/',
    //   newWindow: true,
    // },
];
export default data;
