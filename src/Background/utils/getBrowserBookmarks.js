export function getBrowserBookmarks() {
    return new Promise(function (resolve, reject) {
        chrome.bookmarks.getTree(function (bookmarkTreeNodes) {
            if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
            }
            const bookmarks = bookmarkTreeNodes[0].children[0].children;
            resolve(bookmarks);
        });
    });
}