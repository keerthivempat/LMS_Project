const asyncHandler = (requestHandler) => {
    return async (req, res, next) => {
        try {
            await requestHandler(req, res, next);
        } catch (error) {
            if (typeof next === 'function') {
                next(error);
            } else {
                res.status(500).json({
                    success: false,
                    message: "Internal Server Error",
                    error: error?.message || error
                });
            }
        }
    }
}

export { asyncHandler };