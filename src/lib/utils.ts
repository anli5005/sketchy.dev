/**
 * Checks whether the given pathname equals or is a child route of the href.
 *
 * @param {string} href - The href string. Should be a valid route, e.g. '/path/to/resource'.
 * @param {string} pathname - The pathname string. Should be a valid route, e.g. '/path/to'.
 * @returns {boolean} Returns true if the pathname equals or is a child route of href, false otherwise.
 * 
 * @author ChatGPT
 */
export function isChildRoute(href: string, pathname: string): boolean {
    // Normalize both href and pathname by removing leading/trailing slashes and split into parts
    const hrefParts = href.replace(/^\/+|\/+$/g, "").split("/");
    const pathnameParts = pathname.replace(/^\/+|\/+$/g, "").split("/");

    // If pathname has more parts than href, it cannot be a child route or equal to href
    if (pathnameParts.length > hrefParts.length) {
        return false;
    }

    // Use every to check if all parts in pathname are equal to the corresponding part in href
    return pathnameParts.every((part, index) => part === hrefParts[index]);
}