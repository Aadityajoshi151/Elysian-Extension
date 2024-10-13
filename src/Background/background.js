import { showNotification } from "./utils/showNotification.js";
import { getBrowserBookmarks } from "./utils/getBrowserBookmarks.js";
import { sendRequest } from "./requests/sendRequest.js";
import { sendGETRequest } from "./requests/sendGetRequest.js";
import { create_bookmarks } from "./utils/createBookmarks.js";
import "./utils/crossBrowser.js";

browser.runtime.onInstalled.addListener(function (details) {
  if (details.reason === "install") {
    console.log("Elysian extension installed successfully")
    browser.tabs.create({ url: "src/Foreground/Server_Details/add_server_details.html" });
  }
});

async function sendBookmarkToElysian(id, info) {
  await sendRequest("POST", JSON.stringify(info), "add_bookmark", 201, info.title, "Bookmark added to Elysian")
}

browser.bookmarks.onCreated.addListener(sendBookmarkToElysian);

browser.bookmarks.onRemoved.addListener(async function (id, info) {
  sendRequest("DELETE", JSON.stringify({ "id": id }), "delete_bookmark", 200, "Bookmark deleted", "The bookmark is sucessfully deleted from Elysian")
});

browser.bookmarks.onChanged.addListener(async function (id, info) {
  sendRequest("PATCH", JSON.stringify({ "id": id, "title": info.title, "url": info.url }), "update_bookmark", 200, info.title + '|' + info.url, "The bookmark is sucessfully updated in Elysian")
})

browser.bookmarks.onMoved.addListener(async function (id, info) {
  const bookmarks = await getBrowserBookmarks()
  sendRequest("POST", JSON.stringify(bookmarks), "export_to_elysian", 200, "Bookmark moved", "The bookmark is sucessfully moved in Elysian")
})

browser.runtime.onMessage.addListener(async function (message) {
  if (message.content === "export_to_elysian") {
    console.log("Export to Elysian")
    const bookmarks = await getBrowserBookmarks()
    sendRequest("POST", JSON.stringify(bookmarks), "export_to_elysian", 200, "Export successful", "Bookmarks from this browser are added in Elysian")

  }
  if (message.content === "import_from_elysian") {
    console.log("Import from Elysian")
    console.debug("Removing add listener")
    browser.bookmarks.onCreated.removeListener(sendBookmarkToElysian);
    const response = await sendGETRequest("import_from_elysian")
    if (response != false){
      await create_bookmarks(response)
      const bookmarks = await getBrowserBookmarks()
      sendRequest("POST", JSON.stringify(bookmarks), "export_to_elysian", 200, "Import successful", "Bookmarks from Elysian are successfully added in this browser")
    }
    else{
      showNotification("Authentication failed", "Please check the API key added in Elysian extension");
    }
    console.debug("adding add listener back");
    browser.bookmarks.onCreated.addListener(sendBookmarkToElysian);
  }
})



