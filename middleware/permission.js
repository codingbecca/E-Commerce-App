const unauthorizedError = { error: 'you do not have permission to access this resource' };

const checkPermission = (authenticatedUserId, requestedUserId) => {
    if (authenticatedUserId !== requestedUserId) {
        throw unauthorizedError;
    }
};

const checkPermissionMiddleware = (req, res, next) => {
    const authenticatedUserId = req.user.id;
    const requestedUserId  = req.params.userId;

    try{
        checkPermission(authenticatedUserId, requestedUserId);
        next();
    } catch(error) {
        console.error(error);
        return res.status(403).json(unauthorizedError);
    }
};

module.exports = checkPermissionMiddleware;