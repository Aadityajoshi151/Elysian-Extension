export async function create_bookmarks(bookmarksData) {
  // Start creating bookmarks in the Chrome browser
  await createBookmarksHierarchy(bookmarksData, null);
  // Reattach the event listener after all bookmarks have been created
}

function createBookmarksHierarchy(bookmarks, parentId) {
  return Promise.all(bookmarks.map(bookmark => {
    return new Promise((resolve) => {
      const newBookmark = {
        parentId: parentId || '1', // '1' is the root "Bookmarks Bar" ID
        title: bookmark.title || "Untitled",
        url: bookmark.url || null
      };
      chrome.bookmarks.create(newBookmark, (createdBookmark) => {
        console.log(newBookmark.title+" created")
        if (bookmark.children && bookmark.children.length > 0) {
          // Recursively create children bookmarks
          createBookmarksHierarchy(bookmark.children, createdBookmark.id).then(resolve);
        } else {
          resolve();
        }
      });
    });
  }));
}