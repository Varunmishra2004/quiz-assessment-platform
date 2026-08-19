const requireRole = (role) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        if (req.user.role !== role.toUpperCase()) {
            return res.status(403).json({
                success: false,
                message: `Access denied. ${role.toUpperCase()} only.`
            });
        }

        next();
    };
};

const adminMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== "ADMIN") {
        return res.status(403).json({
            success: false,
            message: "Access denied. Admin only."
        });
    }
    next();
};

const studentMiddleware = (req, res, next) => {
    if (!req.user || req.user.role !== "STUDENT") {
        return res.status(403).json({
            success: false,
            message: "Access denied. Students only."
        });
    }
    next();
};

module.exports = {
    requireRole,
    adminMiddleware,
    studentMiddleware
};