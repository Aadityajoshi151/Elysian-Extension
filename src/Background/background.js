import { showNotification } from "./utils/showNotification.js";
import { getBrowserBookmarks } from "./utils/getBrowserBookmarks.js";
import { sendRequest } from "./requests/sendRequest.js";
import { sendGETRequest } from "./requests/sendGetRequest.js";
import { create_bookmarks } from "./utils/createBookmarks.js";

chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === "install") {
    chrome.tabs.create({ url: "src/Foreground/Server_Details/add_server_details.html" });
  }
});

async function sendBookmarkToElysian(id, info) {
  await sendRequest("POST", JSON.stringify(info), "add_bookmark", 201, info.title + '|' + info.url, "Bookmark added to Elysian")
}

chrome.bookmarks.onCreated.addListener(sendBookmarkToElysian);

chrome.bookmarks.onRemoved.addListener(async function (id, info) {
  sendRequest("DELETE", JSON.stringify({ "id": id }), "delete_bookmark", 200, "Bookmark Deleted", "The bookmark is sucessfully deleted from Elysian")
});

chrome.bookmarks.onChanged.addListener(async function (id, info) {
  sendRequest("PATCH", JSON.stringify({ "id": id, "title": info.title, "url": info.url }), "update_bookmark", 200, "Bookmark Updated", "The bookmark is sucessfully updated in Elysian")
})

chrome.bookmarks.onMoved.addListener(async function (id, info) {
  const bookmarks = await getBrowserBookmarks()
  sendRequest("POST", JSON.stringify(bookmarks), "export_to_elysian", 200, "Bookmark Moved", "Sucessfully moved the bookmark in Elysian")
})

chrome.bookmarks.onImportBegan.addListener(async function () {
  chrome.bookmarks.onCreated.removeListener(sendBookmarkToElysian);
})

chrome.bookmarks.onImportEnded.addListener(async function () {
  chrome.bookmarks.onCreated.addListener(sendBookmarkToElysian);
  const bookmarks = await getBrowserBookmarks()
  sendRequest("POST", JSON.stringify(bookmarks), "export_to_elysian", 200, "Export successful", "Bookmarks from this browser are added in Elysian")
})

chrome.runtime.onMessage.addListener(async function (message) {
  if (message.content === "export_to_elysian") {
    const bookmarks = await getBrowserBookmarks()
    sendRequest("POST", JSON.stringify(bookmarks), "export_to_elysian", 200, "Export successful", "Bookmarks from this browser are added in Elysian")

  }
  if (message.content === "import_from_elysian") {
    console.debug("Removing add listener")
    chrome.bookmarks.onCreated.removeListener(sendBookmarkToElysian);
    const response = await sendGETRequest("import_from_elysian")
    if (response != false){
      await create_bookmarks(response)
      const bookmarks = await getBrowserBookmarks()
      sendRequest("POST", JSON.stringify(bookmarks), "export_to_elysian", 200, "Export successful", "Bookmarks from this browser are added in Elysian")
    }
    else{
      showNotification("Authentication failed", "Please check the API key added in Elysian extension");
    }
    console.debug("adding add listener back");
    chrome.bookmarks.onCreated.addListener(sendBookmarkToElysian);
  }
})



