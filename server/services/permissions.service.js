const Permissions = {
    admin: {
        level: 10,
        actions: [
            'view', 'create', 'delete', 'modify', 'admin'
        ]
    },
    dev: {
        level: 9,
        actions: [
            'view', 'create', 'delete', 'modify', 'admin'
        ]
    },

    command: {
        level: 5,
        actions: [
            'view', 'create', 'delete', 'modify', 'manage'
        ]
    },
    supervisor: {
        level: 4,
        actions: [
            'view', 'create', 'delete', 'modify', 'manage'
        ]
    },
    senior: {
        level: 3,
        actions: [
            'view', 'create', 'delete', 'modify'
        ]
    },
    officer: {
        level: 2,
        actions: [
            'view', 'create', 'delete', 'modify'
        ]
    },
    user: {
        level: 1,
        actions: [
            'view'
        ]
    },
}

export const GetPermissionLevel = (role) => {
    return Permissions[role];
}

export const PermissionsCheck = (level, action) => {

}