function showLogs(id, info){
    console.log(id);
    console.log(info);
}

chrome.bookmarks.onCreated.addListener(showLogs);
chrome.bookmarks.onChanged.addListener(showLogs);
chrome.bookmarks.onMoved.addListener(showLogs);
chrome.bookmarks.onRemoved.addListener(showLogs);
//TODO Check importBegan and importEnded are required or not

chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
    bookmarks = bookmarkTreeNodes[0].children[0].children;
    console.log(bookmarks);
    fetch("http://localhost:3000/import_bookmarks", {
    method: "POST",
    body: JSON.stringify({"bookmarks":bookmarks}),
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
   });
});