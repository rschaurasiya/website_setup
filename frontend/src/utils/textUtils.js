/**
 * Strips HTML tags and decodes HTML entities from a string.
 * This is useful for previewing content that might contain markup.
 * @param {string} html - The HTML string to strip.
 * @returns {string} The plain text content.
 */
export const stripHtml = (html) => {
    if (!html) return '';

    // If we are in a browser environment, use DOMParser for accurate stripping
    if (typeof DOMParser !== 'undefined') {
        try {
            const doc = new DOMParser().parseFromString(html, 'text/html');
            return doc.body.textContent || "";
        } catch (e) {
            console.error("Error parsing HTML:", e);
        }
    }

    // Fallback regex for basic stripping if DOMParser fails or is unavailable
    return html.replace(/<[^>]*>?/gm, '')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'");
};
