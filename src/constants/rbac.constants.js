/**
 * Role-Based Access Control (RBAC) for Notes Upload Platform
 */

// User Roles
export const ROLES = {
  STUDENT: "student",
  TEACHER: "teacher",
  ADMIN: "admin",
  SUPER_ADMIN: "super_admin"
};

// Resource Types
export const RESOURCES = {
  // Profile Management
  STUDENT_PROFILE: "student_profile",
  TEACHER_PROFILE: "teacher_profile",
  USER_PROFILE: "user_profile",

  // Notes Resources
  NOTES: "notes",
  NOTES_REVIEW: "notes_review",

  // User Management
  USER: "user",
  ROLE: "role",
  PERMISSION: "permission",

  // System Resources
  SYSTEM_SETTINGS: "system_settings",
  ANALYTICS: "analytics",
  REPORTS: "reports",

  // Content / Communication
  NOTIFICATION: "notification",
  COMMENT: "comment"
};

// Actions
export const ACTIONS = {
  CREATE: "create",
  READ: "read",
  UPDATE: "update",
  DELETE: "delete",

  LIST: "list",
  SEARCH: "search",
  EXPORT: "export",

  UPLOAD_FILES: "upload_files",
  DELETE_FILES: "delete_files",

  REVIEW: "review",
  APPROVE: "approve",
  REJECT: "reject",

  MANAGE_USERS: "manage_users",
  MANAGE_ROLES: "manage_roles",
  MANAGE_SYSTEM: "manage_system",
  VIEW_ANALYTICS: "view_analytics"
};

// Permission Matrix
export const PERMISSIONS = {
  // Student Role
  [ROLES.STUDENT]: {
    [RESOURCES.STUDENT_PROFILE]: [
      ACTIONS.READ,
      ACTIONS.UPDATE,
      ACTIONS.UPLOAD_FILES,
      ACTIONS.DELETE_FILES
    ],
    [RESOURCES.TEACHER_PROFILE]: [ACTIONS.READ],
    [RESOURCES.NOTES]: [
      ACTIONS.READ,
      ACTIONS.LIST,
      ACTIONS.SEARCH,
      ACTIONS.CREATE,
      ACTIONS.UPDATE
    ],
    [RESOURCES.NOTIFICATION]: [ACTIONS.READ, ACTIONS.UPDATE],
    [RESOURCES.COMMENT]: [ACTIONS.CREATE, ACTIONS.READ, ACTIONS.DELETE]
  },

  // Teacher Role
  [ROLES.TEACHER]: {
    [RESOURCES.TEACHER_PROFILE]: [
      ACTIONS.READ,
      ACTIONS.UPDATE,
      ACTIONS.UPLOAD_FILES,
      ACTIONS.DELETE_FILES
    ],
    [RESOURCES.STUDENT_PROFILE]: [ACTIONS.READ, ACTIONS.SEARCH],
    [RESOURCES.NOTES]: [
      ACTIONS.CREATE,
      ACTIONS.READ,
      ACTIONS.UPDATE,
      ACTIONS.DELETE,
      ACTIONS.LIST,
      ACTIONS.SEARCH
    ],
    [RESOURCES.NOTES_REVIEW]: [
      ACTIONS.REVIEW,
      ACTIONS.APPROVE,
      ACTIONS.REJECT
    ],
    [RESOURCES.NOTIFICATION]: [ACTIONS.READ, ACTIONS.UPDATE],
    [RESOURCES.ANALYTICS]: [ACTIONS.READ, ACTIONS.VIEW_ANALYTICS]
  },

  // Admin Role
  [ROLES.ADMIN]: {
    [RESOURCES.USER]: [
      ACTIONS.CREATE,
      ACTIONS.READ,
      ACTIONS.UPDATE,
      ACTIONS.DELETE,
      ACTIONS.LIST,
      ACTIONS.MANAGE_USERS
    ],
    [RESOURCES.NOTES]: [
      ACTIONS.CREATE,
      ACTIONS.READ,
      ACTIONS.UPDATE,
      ACTIONS.DELETE,
      ACTIONS.LIST,
      ACTIONS.SEARCH,
      ACTIONS.APPROVE,
      ACTIONS.REJECT
    ],
    [RESOURCES.REPORTS]: [ACTIONS.READ, ACTIONS.EXPORT],
    [RESOURCES.ANALYTICS]: [ACTIONS.READ, ACTIONS.VIEW_ANALYTICS],
    [RESOURCES.SYSTEM_SETTINGS]: [ACTIONS.READ, ACTIONS.UPDATE],
    [RESOURCES.NOTIFICATION]: [
      ACTIONS.CREATE,
      ACTIONS.READ,
      ACTIONS.UPDATE,
      ACTIONS.DELETE,
      ACTIONS.LIST
    ]
  },

  // Super Admin — full access
  [ROLES.SUPER_ADMIN]: { "*": "*" }
};

// Role Hierarchy (inherit permissions)
export const ROLE_HIERARCHY = {
  [ROLES.SUPER_ADMIN]: 4,
  [ROLES.ADMIN]: 3,
  [ROLES.TEACHER]: 2,
  [ROLES.STUDENT]: 1
};

// Access Policies
export const ACCESS_POLICIES = {
  SELF_ACCESS: {
    condition: "self_access",
    description: "Users can always access their own profile."
  },
  VERIFIED_ONLY: {
    condition: "verified_profile",
    description: "Only verified accounts' notes are visible to others."
  }
};

// API Permission Mapping
export const API_PERMISSIONS = {
  "POST /api/v1/notes": {
    roles: [ROLES.STUDENT, ROLES.TEACHER],
    permissions: [{ resource: RESOURCES.NOTES, action: ACTIONS.CREATE }]
  },
  "GET /api/v1/notes": {
    roles: [ROLES.STUDENT, ROLES.TEACHER, ROLES.ADMIN],
    permissions: [{ resource: RESOURCES.NOTES, action: ACTIONS.LIST }]
  },
  "POST /api/v1/notes/review/:note_id": {
    roles: [ROLES.TEACHER, ROLES.ADMIN],
    permissions: [{ resource: RESOURCES.NOTES_REVIEW, action: ACTIONS.REVIEW }]
  }
};

// Error Messages
export const RBAC_MESSAGES = {
  ACCESS_DENIED: "Access denied. Insufficient permissions.",
  ROLE_REQUIRED: "Role required to perform this action.",
  PERMISSION_DENIED: "You do not have permission for this resource.",
  UNAUTHORIZED_ACCESS: "Unauthorized access.",
  PROFILE_NOT_VERIFIED: "Profile must be verified.",
  SELF_ACCESS_ONLY: "You can only access your own profile."
};

// Utility Helpers
export const isValidRole = (role) => Object.values(ROLES).includes(role);
export const isValidResource = (resource) =>
  Object.values(RESOURCES).includes(resource);
export const isValidAction = (action) =>
  Object.values(ACTIONS).includes(action);
export const getRoleLevel = (role) => ROLE_HIERARCHY[role] || 0;
export const hasHigherOrEqualRole = (userRole, requiredRole) =>
  getRoleLevel(userRole) >= getRoleLevel(requiredRole);
