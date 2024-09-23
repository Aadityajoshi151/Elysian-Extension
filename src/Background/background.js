import { showNotification } from "./utils/showNotification.js";
import { getBrowserBookmarks } from "./utils/getBrowserBookmarks.js";
import { getFromLocalStorage } from "./utils/getFromLocalStorage.js";

chrome.runtime.onInstalled.addListener(function (details) {
  if (details.reason === "install") {
    chrome.tabs.create({ url: "src/Foreground/Server_Details/add_server_details.html" });
  }
});

async function sendPostRequest(info, endpoint, response_code, notification_title, notification_message) {
  try {
    const BASE_URL = await getFromLocalStorage('server_url')
    const response = await fetch(BASE_URL.concat('/api/' + endpoint), {
      method: "POST",
      body: JSON.stringify(info),
      headers: {
        "Authorization": await getFromLocalStorage('elysian_api_key'),
        "Content-type": "application/json"
      }
    });
    console.log(response.status)
    console.log(response_code)
    if (response.status == response_code) {
      showNotification(notification_title, notification_message);
    }
    else if (response.status == 401) {
      showNotification("Authentication failed", "Please check the API key added in Elysian extension");
    }
  } catch (error) {
    //TODO change the notification title below
    showNotification("Error Occurrerd!", error.message);
  }
}


async function sendGETRequest(endpoint) {
  const BASE_URL = await getFromLocalStorage('server_url')
  const response = await fetch(BASE_URL.concat("/api/" + endpoint), {
    method: "GET",
    headers: {
      "Authorization": await getFromLocalStorage('elysian_api_key'),
      "Content-type": "application/json"
    }

  });
  if (response.status == 200){
    return response.json()
  }
  else{return false}
  
}

async function sendBookmarkToElysian(id, info) {
  await sendPostRequest(info, "add_bookmark", 201, info.title + '|' + info.url, "Bookmark added to Elysian")
}

async function sendDeleteBookmarkFromElysian(id, info) {
  await sendDeleteRequest(id, "delete_bookmark")
}

chrome.bookmarks.onCreated.addListener(sendBookmarkToElysian);

chrome.bookmarks.onRemoved.addListener(async function (id, info) {
  try {
    const BASE_URL = await getFromLocalStorage('server_url')
    const response = await fetch(BASE_URL.concat("/api/delete_bookmark"), {
      method: "DELETE",
      headers: {
        "Authorization": await getFromLocalStorage('elysian_api_key'),
        "Content-type": "application/json"
      },
      body: JSON.stringify({ "id": id })
    });
    if (response.status == 200) {
      showNotification("Bookmark Deleted", "The bookmark is sucessfully deleted from Elysian");
    }
    else if (response.status == 401) {
      showNotification("Authentication failed", "Please check the API key added in Elysian extension");
    }
  }
  catch (error) {
    //TODO change the notification title below
    showNotification("Error Occurrerd!", error.message);
  }
});

chrome.bookmarks.onChanged.addListener(async function (id, info) {
  const BASE_URL = await getFromLocalStorage('server_url')
  const response = await fetch(BASE_URL.concat("/api/update_bookmark"), {
    method: "PATCH",
    headers: {
      "Authorization": await getFromLocalStorage('elysian_api_key'),
      "Content-type": "application/json"
    },
    body: JSON.stringify({ "id": id, "title": info.title, "url": info.url })
  });
  if (response.status == 200) {
    showNotification("Bookmark Updated", "The bookmark is sucessfully updated in Elysian");
  }
  else if (response.status == 401) {
    showNotification("Authentication failed", "Please check the API key added in Elysian extension");
  }
})


chrome.bookmarks.onMoved.addListener(async function (id, info) {
  bookmarks = await getBrowserBookmarks()
  sendPostRequest(bookmarks, "export_to_elysian", 200, "Bookmark Moved", "Sucessfully moved the bookmark in Elysian")
})

chrome.bookmarks.onImportBegan.addListener(async function () {
  chrome.bookmarks.onCreated.removeListener(sendBookmarkToElysian);
})

chrome.bookmarks.onImportEnded.addListener(async function () {
  chrome.bookmarks.onCreated.addListener(sendBookmarkToElysian);
  bookmarks = await getBrowserBookmarks()
  sendPostRequest(bookmarks, "export_to_elysian", 200, "Export successful", "Bookmarks from this browser are added in Elysian")
})

chrome.runtime.onMessage.addListener(async function (message) {
  if (message.content === "export_to_elysian") {
    const bookmarks = await getBrowserBookmarks()
    sendPostRequest(bookmarks, "export_to_elysian", 200, "Export successful", "Bookmarks from this browser are added in Elysian")

  }
  if (message.content === "import_from_elysian") {
    console.log("Removing add listener")
    chrome.bookmarks.onCreated.removeListener(sendBookmarkToElysian);
    response = await sendGETRequest("import_from_elysian")
    if (response != false){
      await create_bookmarks(response)
      bookmarks = await getBrowserBookmarks()
      sendPostRequest(bookmarks, "export_to_elysian", 200, "Export successful", "Bookmarks from this browser are added in Elysian")
    }
    else{
      showNotification("Authentication failed", "Please check the API key added in Elysian extension");
    }
    console.log("adding add listener back");
    chrome.bookmarks.onCreated.addListener(sendBookmarkToElysian);

    async function create_bookmarks(bookmarksData) {
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

  }
})



