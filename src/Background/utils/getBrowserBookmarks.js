import "./crossBrowser.js";

export function getBrowserBookmarks() {
    return new Promise(function (resolve, reject) {
        browser.bookmarks.getTree(function (bookmarkTreeNodes) {
            if (browser.runtime.lastError) {
                return reject(browser.runtime.lastError);
            }
            const bookmarks = bookmarkTreeNodes[0].children[0].children;
            resolve(bookmarks);
        });
    });
}