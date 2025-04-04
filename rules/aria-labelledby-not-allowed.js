const utils = require('./utils');
module.exports = {
    meta: {
        docs: {
            description: 'aria-labelledby in not allowed HTML Tags',
            category: 'Possible Errors'
        },
        schema: []
    },
    create: function (context) {
        return {
            Program(node) {
                const htmlTag = node.templateBody?.name;
                if (htmlTag === 'template') {
                    return utils.checkChildren({ node, context, sourceNode: node, ariaType: 'aria-labelledby' });
                }
            }
        };
    }
};
