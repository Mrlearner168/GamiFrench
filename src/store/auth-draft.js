/*
 * Hands the email typed on the login screen to the forgot-password screen.
 *
 * Kept in memory rather than passed as a route param, so the address never
 * shows up in a URL (on the web build that would land in the browser history).
 * Read once: taking it clears it.
 */
let draftEmail = '';

export function setDraftEmail(email) {
    draftEmail = String(email ?? '').trim();
}

export function takeDraftEmail() {
    const email = draftEmail;
    draftEmail = '';
    return email;
}
