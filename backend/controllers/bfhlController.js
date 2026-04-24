const graphService = require('../services/graphService');
const identity = require('../config/userIdentity');

const processGraphData = (req, res) => {
    try {
        const { data } = req.body;

        // Process data through the service [cite: 4]
        const result = graphService.processHierarchies(data);

        // Combine identity with result schema [cite: 13, 14]
        return res.status(200).json({
            user_id: identity.USER_ID,
            email_id: identity.EMAIL_ID,
            college_roll_number: identity.ROLL_NUMBER,
            ...result
        });

    } catch (error) {
        console.error("Error processing graph:", error);
        return res.status(500).json({
            is_success: false,
            message: "Internal Server Error"
        });
    }
};

module.exports = { processGraphData };