import { checkAPIPermission, getUserPermissionsSummary } from '../helpers/rbac.helper.js';
import { RBAC_MESSAGES } from '../constants/rbac.constants.js';
import { HTTP_STATUS } from '../constants/common.constants.js';


export const requirePermission = (requiredRoles, resource, action, options = {}) => {
  return async (req, res, next) => {
    try {

      if (!req.user || !req.user.id) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: RBAC_MESSAGES.UNAUTHORIZED_ACCESS,
        });
      }

      const userRole = req.user.userType; 
      const userId = req.user.id;

      const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

      if (!rolesArray.includes(userRole)) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: RBAC_MESSAGES.ROLE_REQUIRED,
          requiredRoles: rolesArray,
          userRole
        });
      }

      // Check permission
      const hasAccess = checkAPIPermission(
        req.method,
        req.route?.path || req.path,
        userRole,
        userId,
        { ...req.params, ...req.query }
      );

      if (!hasAccess.allowed) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: hasAccess.message || RBAC_MESSAGES.ACCESS_DENIED,
          reason: hasAccess.reason,
          resource,
          action,
          userRole
        });
      }

      // Add user permissions to request object for use in controllers
      req.userPermissions = getUserPermissionsSummary(userRole, userId);

      next();
    } catch (error) {
      console.error('RBAC middleware error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: RBAC_MESSAGES.ACCESS_DENIED,
        error: error.message
      });
    }
  };
};

export const requireRole = (roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: RBAC_MESSAGES.UNAUTHORIZED_ACCESS,
        });
      }

      const userRole = req.user.userType;
      const rolesArray = Array.isArray(roles) ? roles : [roles];

      if (!rolesArray.includes(userRole)) {
        return res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: RBAC_MESSAGES.ROLE_REQUIRED,
          requiredRoles: rolesArray,
          userRole
        });
      }

      req.userPermissions = getUserPermissionsSummary(userRole);
      next();
    } catch (error) {
      console.error('Role middleware error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: RBAC_MESSAGES.ACCESS_DENIED,
        error: error.message
      });
    }
  };
};


export const requireAdmin = () => {
  return requireRole(['admin', 'super_admin']);
};


export const requireTeacher = () => {
  return requireRole(['teacher', 'admin', 'super_admin']);
};

export const requireStudent = () => {
  return requireRole(['student', 'teacher', 'admin', 'super_admin']);
};


export const requireOwnership = (userIdParam = 'user_id') => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: RBAC_MESSAGES.UNAUTHORIZED_ACCESS,
        });
      }

      const userId = req.user.id;
      const resourceUserId = req.params[userIdParam];

      // Allow if accessing own resource
      if (userId === resourceUserId) {
        req.userPermissions = getUserPermissionsSummary(req.user.userType);
        return next();
      }

      // Check if user has admin privileges
      if (['admin', 'super_admin'].includes(req.user.userType)) {
        req.userPermissions = getUserPermissionsSummary(req.user.userType);
        return next();
      }

      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: RBAC_MESSAGES.SELF_ACCESS_ONLY,
        userRole: req.user.userType
      });
    } catch (error) {
      console.error('Ownership middleware error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: RBAC_MESSAGES.ACCESS_DENIED,
        error: error.message
      });
    }
  };
};


export const requireCustomCheck = (checkFunction) => {
  return async (req, res, next) => {
    try {
      await checkFunction(req, res, next);
    } catch (error) {
      console.error('Custom check middleware error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: RBAC_MESSAGES.ACCESS_DENIED,
        error: error.message
      });
    }
  };
};

export const addUserPermissions = (req, res, next) => {
    try {
      if (req.user && req.user.id && req.user.userType) {
        req.userPermissions = getUserPermissionsSummary(req.user.userType);
      }
      next();
    } catch (error) {
      console.error('Add permissions middleware error:', error);
      next(); // Continue even if permissions can't be added
    }
};


export const requireContactDetailsAccess = (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          success: false,
          message: RBAC_MESSAGES.UNAUTHORIZED_ACCESS,
        });
      }

      const userId = req.user.id;
      const userRole = req.user.userType;
      const resourceUserId = req.params.user_id;
      req.hideContactDetails = false;


      // Allow if accessing own resource
      if (userId === resourceUserId) {
        req.userPermissions = getUserPermissionsSummary(userRole);
        return next();
      }

      // Allow admins
      if (['admin', 'super_admin'].includes(userRole)) {
        req.userPermissions = getUserPermissionsSummary(userRole);
        return next();
      }

      // Check time restriction for contact details

      // If not time allowed, remove contact details from response
      req.hideContactDetails = true;
      req.userPermissions = getUserPermissionsSummary(userRole);
      next();
    } catch (error) {
      console.error('Contact details access middleware error:', error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: RBAC_MESSAGES.ACCESS_DENIED,
        error: error.message
      });
    }
};
