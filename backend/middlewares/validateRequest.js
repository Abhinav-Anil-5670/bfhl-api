const validateBfhlInput = (req, res, next) => {
    const { data } = req.body;

    if (!data || !Array.isArray(data)) {
        return res.status(400).json({
            is_success: false,
            message: "Invalid input structure. 'data' must be an array."
        });
    }

    next();
};

module.exports = { validateBfhlInput };