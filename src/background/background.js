function showLogs(id, info){
    console.log(id);
    console.log(info);
}

chrome.bookmarks.onCreated.addListener(showLogs);
chrome.bookmarks.onChanged.addListener(showLogs);
chrome.bookmarks.onMoved.addListener(showLogs);
chrome.bookmarks.onRemoved.addListener(showLogs);
//TODO Check importBegan and importEnded are required or not