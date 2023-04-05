chrome.bookmarks.onCreated.addListener(function(id, info) {
    console.log(info);
    fetch("http://localhost:3000/add_bookmark", {
    method: "POST",
    body: JSON.stringify(info),
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
   });
  });

chrome.bookmarks.onChanged.addListener(function(id, info) {
    console.log(id)
    console.log(info)
  });

chrome.bookmarks.onMoved.addListener(function(id, info) {
    console.log(id)
    console.log(info)
  });

chrome.bookmarks.onRemoved.addListener(function(id, info) {
    console.log(id)
    console.log(info)
  });

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