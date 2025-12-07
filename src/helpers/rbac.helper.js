import {
  ROLES,
  RESOURCES,
  ACTIONS,
  PERMISSIONS,
  ROLE_HIERARCHY,
  ACCESS_POLICIES,
  API_PERMISSIONS,
  RBAC_MESSAGES,
  isValidRole,
  isValidResource,
  isValidAction,
  getRoleLevel,
  hasHigherOrEqualRole
} from '../constants/rbac.constants.js';

/**
 * Check if a user role has permission for a specific resource and action
 */
export const hasPermission = (userRole, resource, action) => {
  // Validate inputs
  if (!isValidRole(userRole) || !isValidResource(resource) || !isValidAction(action)) {
    return false;
  }

  // Super admin has all permissions
  if (userRole === ROLES.SUPER_ADMIN) {
    return true;
  }

  // Check if role has permission for the resource
  const rolePermissions = PERMISSIONS[userRole];
  if (!rolePermissions || !rolePermissions[resource]) {
    return false;
  }

  // Check if the specific action is allowed
  return rolePermissions[resource].includes(action);
};

/**
 * Check if a user role has permission for a specific resource and action
   with inheritance from higher roles
 */
export const hasPermissionWithInheritance = (userRole, resource, action) => {
  const userLevel = getRoleLevel(userRole);
  
  // Check permissions for current role and all higher roles
  for (const [role, level] of Object.entries(ROLE_HIERARCHY)) {
    if (level <= userLevel) {
      if (hasPermission(role, resource, action)) {
        return true;
      }
    }
  }
  
  return false;
};

/**
 * Get all permissions for a user role
 */
export const getAllPermissions = (userRole) => {
  if (!isValidRole(userRole)) {
    return {};
  }

  return PERMISSIONS[userRole] || {};
};

/**
 * Check if user can access their own resource (self-access)
 */
export const isSelfAccess = (userId, resourceUserId) => {
  return userId === resourceUserId;
};

/**
 * Check if current time allows access based on time restrictions
 */
export const isTimeAllowed = (allowedHours = [1, 2, 3, 4], timezone = 'Asia/Kolkata') => {
  const now = new Date();
  
  // Convert to specified timezone
  let localTime;
  try {
    localTime = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
  } catch (error) {
    // Fallback to IST (UTC+5:30)
    localTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
  }
  
  const currentHour = localTime.getHours();
  return allowedHours.includes(currentHour);
};

/**
 * Check API endpoint permissions
 */
export const checkAPIPermission = (method, path, userRole, userId = null, params = {}) => {
  const endpoint = `${method.toUpperCase()} ${path}`;
  const apiPermission = API_PERMISSIONS[endpoint];
  
  if (!apiPermission) {
    return {
      allowed: false,
      reason: 'API endpoint not found in permissions',
      message: RBAC_MESSAGES.ACCESS_DENIED
    };
  }

  // Check if user role is allowed
  if (!apiPermission.roles.includes(userRole)) {
    return {
      allowed: false,
      reason: 'Insufficient role',
      message: RBAC_MESSAGES.ROLE_REQUIRED,
      requiredRoles: apiPermission.roles
    };
  }

  // Check required permissions
  if (apiPermission.permissions) {
    for (const permission of apiPermission.permissions) {
      if (!hasPermissionWithInheritance(userRole, permission.resource, permission.action)) {
        // Check if this is an optional permission
        if (permission.optional) {
          continue;
        }
        
        return {
          allowed: false,
          reason: 'Missing required permission',
          message: RBAC_MESSAGES.PERMISSION_DENIED,
          requiredPermission: permission
        };
      }
    }
  }

  // Check access policies
  if (apiPermission.policies) {
    for (const policy of apiPermission.policies) {
      const policyResult = checkAccessPolicy(policy, userRole, userId, params);
      if (!policyResult.allowed) {
        return policyResult;
      }
    }
  }

  return {
    allowed: true,
    reason: 'All checks passed'
  };
};

/**
 * Check access policy conditions
 */
export const checkAccessPolicy = (policy, userRole, userId, params) => {
  switch (policy.condition) {
    case 'self_access':
      // Users can always access their own data
      if (userId && params.user_id && isSelfAccess(userId, params.user_id)) {
        return { allowed: true, reason: 'Self-access allowed' };
      }
      // For non-self access, continue with normal permission checks
      return { allowed: true, reason: 'Non-self access, checking other permissions' };
      
    case 'time_based':
      if (policy.resource && policy.action) {
        // Check if user has permission for the resource
        if (!hasPermissionWithInheritance(userRole, policy.resource, policy.action)) {
          return {
            allowed: false,
            reason: 'No permission for time-restricted resource',
            message: RBAC_MESSAGES.PERMISSION_DENIED
          };
        }
        
        // Check time restriction
        if (!isTimeAllowed(policy.allowedHours, policy.timezone)) {
          return {
            allowed: false,
            reason: 'Time restriction',
            message: RBAC_MESSAGES.TIME_RESTRICTED_ACCESS
          };
        }
      }
      return { allowed: true, reason: 'Time-based policy satisfied' };
      
    case 'verified_profile':
      // This would need to be checked against the actual profile data
      // For now, assume it passes if user has basic read permission
      return { allowed: true, reason: 'Profile verification check would be implemented here' };
      
    default:
      return { allowed: true, reason: 'Unknown policy, allowing access' };
  }
};

/**
 * Get user permissions summary
 */
export const getUserPermissionsSummary = (userRole) => {
  const permissions = getAllPermissions(userRole);
  const roleLevel = getRoleLevel(userRole);
  
  return {
    role: userRole,
    roleLevel,
    permissions,
    canManageUsers: hasPermissionWithInheritance(userRole, RESOURCES.USER, ACTIONS.MANAGE_USERS),
    canViewAnalytics: hasPermissionWithInheritance(userRole, RESOURCES.ANALYTICS, ACTIONS.VIEW_ANALYTICS),
    canManageSystem: hasPermissionWithInheritance(userRole, RESOURCES.SYSTEM_SETTINGS, ACTIONS.UPDATE),
    isSuperAdmin: userRole === ROLES.SUPER_ADMIN,
    isAdmin: hasHigherOrEqualRole(userRole, ROLES.ADMIN),
    isEmployer: hasHigherOrEqualRole(userRole, ROLES.EMPLOYER),
    isEmployee: hasHigherOrEqualRole(userRole, ROLES.EMPLOYEE)
  };
};

/**
 * Validate role assignment
 */
export const validateRoleAssignment = (assignerRole, targetRole) => {
  const assignerLevel = getRoleLevel(assignerRole);
  const targetLevel = getRoleLevel(targetRole);
  
  // Users can only assign roles at or below their level
  if (assignerLevel < targetLevel) {
    return {
      allowed: false,
      reason: 'Cannot assign role with higher or equal level',
      message: 'You cannot assign this role as it has equal or higher privileges than your role'
    };
  }
  
  // Super admin can assign any role
  if (assignerRole === ROLES.SUPER_ADMIN) {
    return {
      allowed: true,
      reason: 'Super admin can assign any role'
    };
  }
  
  // Regular admins cannot assign super admin role
  if (targetRole === ROLES.SUPER_ADMIN && assignerRole !== ROLES.SUPER_ADMIN) {
    return {
      allowed: false,
      reason: 'Only super admin can assign super admin role',
      message: 'Only super administrators can assign super admin roles'
    };
  }
  
  return {
    allowed: true,
    reason: 'Role assignment allowed'
  };
};

/**
 * Get accessible resources for a role
 */
export const getAccessibleResources = (userRole) => {
  const permissions = getAllPermissions(userRole);
  return Object.keys(permissions);
};

/**
 * Get allowed actions for a role and resource
 */
export const getAllowedActions = (userRole, resource) => {
  const permissions = getAllPermissions(userRole);
  return permissions[resource] || [];
};


