'use strict';

const forbiddenTagsAndRoles = [
    'caption', 'code', 'definition', 'deletion', 'emphasis', 'generic', 'insertion', 'mark', 'none', 'paragraph', 'strong', 'subscript', 'suggestion', 'superscript', 'term', 'time'
];

const conditionalForbiddenTags = [
    'div', 'span'
];

function findAttr(attributes, key) {
    return attributes.find(
        (attr) => {
            const plainAttr = (attr.key && attr.key.name.toLowerCase() === key.toLowerCase()) || (attr.key && attr.key.name.toLowerCase() === `:${key.toLowerCase()}`);
            const vAttr = (attr.key && attr.key.name?.toLowerCase() === 'bind') && (attr.key && attr.key.argument?.toLowerCase() === key?.toLowerCase());
            return plainAttr || vAttr;
        }
    );
};

function validateForbiddenTagsAndRoles(child) {
    const htmlTag = child.name;
    const roleAttr = findAttr(child.startTag.attributes, 'role');
    const htmlRole = roleAttr?.value?.value;
    const genericRole = !htmlRole || htmlRole === 'generic';
    const isForbiddenTag = forbiddenTagsAndRoles.includes(htmlTag);
    const isForbiddenRole = htmlRole && forbiddenTagsAndRoles.includes(htmlRole);
    const isConditionalForbiddenTag = conditionalForbiddenTags.includes(htmlTag) && genericRole;
    return {
        isForbiddenTag,
        isForbiddenRole,
        isConditionalForbiddenTag,
        htmlRole,
        htmlTag,
        genericRole
    };
}

function checkChildrenNode({ child, context, node, ariaType }) {
    const {
        isForbiddenTag,
        isForbiddenRole,
        isConditionalForbiddenTag,
        htmlTag,
        htmlRole,
        genericRole
    } = validateForbiddenTagsAndRoles(child);
    if (isForbiddenTag || isForbiddenRole || isConditionalForbiddenTag) {
        const hasAriaLabel = findAttr(child.startTag.attributes, ariaType);
        if (hasAriaLabel) {
            context.report({
                node,
                message: `${ariaType} is not allowed on <${htmlTag}> ${htmlRole ? `with [role="${htmlRole}"]` : genericRole ? 'with generic role' : ''}`,
                loc: {
                    start: child.loc.start,
                    end: child.loc.end
                }
            });
        }
    }
};

function checkChildren({ node, context, sourceNode, ariaType }) {
    const children = node.templateBody?.children || node.children;
    if (children && children.length) {
        children.forEach((child) => {
            if (child.type === 'VElement') {
                if (child.children && child.children.length) {
                    checkChildren({ node: child, context, sourceNode, ariaType });
                }
                checkChildrenNode({ child, context, sourceNode, ariaType });
            }
        });
    }
};
module.exports = {
    checkChildren
};
