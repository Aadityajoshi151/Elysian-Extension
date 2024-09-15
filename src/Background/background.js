function getFromLocalStorage(key) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([key], function(result) {
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      resolve(result[key] || null); // Return null if key not found
    });
  });
}


chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason === "install") {
    chrome.tabs.create({ url: "src/Foreground/Server_Details/add_server_details.html" });
  }
});

function showNotification(title, message){
  chrome.notifications.create({
  type: 'basic',
  iconUrl: chrome.runtime.getURL('assets/Elysian_Logo.png'),
  title: title,
  message: message
}, function() {});
}

function getBrowserBookmarks() {
  return new Promise((resolve, reject) => {
      chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
          if (chrome.runtime.lastError) {
              return reject(chrome.runtime.lastError);
          }
          const bookmarks = bookmarkTreeNodes[0].children[0].children;
          resolve(bookmarks);
      });
  });
}

async function sendPostRequest(info, endpoint, response_code, notification_title, notification_message) {
  try {
    const BASE_URL = await getFromLocalStorage('server_url')
    const response = await fetch(BASE_URL.concat('/api/'+endpoint), {
      method: "POST",
      body: JSON.stringify(info),
      headers: {
        "Authorization": await getFromLocalStorage('elysian_api_key'),
        "Content-type": "application/json"
      }
    });
    if (response.status == response_code) {
      showNotification(notification_title, notification_message);
    }
    else if (response.status == 401){
      showNotification("Authentication failed", "Please check the API key added in Elysian extension");
    }
  } catch (error) {
    //TODO change the notification title below
    showNotification("Error Occurrerd!", error.message);
  }
}


async function sendGETRequest(endpoint){
  const BASE_URL = await getFromLocalStorage('server_url')
  const response = await fetch(BASE_URL.concat("/api/"+endpoint), {
    method: "GET",
    headers: {
      "Authorization": await getFromLocalStorage('elysian_api_key'),
      "Content-type": "application/json"
    }

  });
  return response.json()
}

async function sendBookmarkToElysian(id, info) {
   await sendPostRequest(info, "add_bookmark", 201, info.title+'|'+info.url, "Bookmark added to Elysian")
}

async function sendDeleteBookmarkFromElysian(id, info) {
  await sendDeleteRequest(id, "delete_bookmark")
}

chrome.bookmarks.onCreated.addListener(sendBookmarkToElysian);

chrome.bookmarks.onRemoved.addListener(async function(id, info){
  try{
  const BASE_URL = await getFromLocalStorage('server_url')
  const response = await fetch(BASE_URL.concat("/api/delete_bookmark"), {
    method: "DELETE",
    headers: {
      "Authorization": await getFromLocalStorage('elysian_api_key'),
      "Content-type": "application/json"
    },
    body: JSON.stringify({ "id": id })
  });
  if (response.status == 200){
    showNotification("Bookmark Deleted", "The bookmark is sucessfully deleted from Elysian");
  }
  else if (response.status == 401){
    showNotification("Authentication failed", "Please check the API key added in Elysian extension");
  }
}
catch (error) {
  //TODO change the notification title below
  showNotification("Error Occurrerd!", error.message);
}
});

chrome.bookmarks.onChanged.addListener(async function(id, info){
    const BASE_URL = await getFromLocalStorage('server_url')
    const response = await fetch(BASE_URL.concat("/api/update_bookmark"), {
      method: "PATCH",
      headers: {
        "Authorization": await getFromLocalStorage('elysian_api_key'),
        "Content-type": "application/json"
      },
      body: JSON.stringify({ "id": id, "title": info.title, "url": info.url})
    });
    showNotification("Bookmark Updated", "The bookmark is sucessfully updated in Elysian");
})


chrome.bookmarks.onMoved.addListener(async function(id, info){
    bookmarks = await getBrowserBookmarks()
    sendPostRequest(bookmarks, "export_to_elysian", 200, "Bookmark Moved", "Sucessfully moved the bookmark in Elysian")
})

chrome.bookmarks.onImportBegan.addListener(async function(){
  chrome.bookmarks.onCreated.removeListener(sendBookmarkToElysian);
})

chrome.bookmarks.onImportEnded.addListener(async function(){
  chrome.bookmarks.onCreated.addListener(sendBookmarkToElysian);
  bookmarks = await getBrowserBookmarks()
  sendPostRequest(bookmarks, "export_to_elysian", 200, "Export successful", "Bookmarks from this browser are added in Elysian")
})

chrome.runtime.onMessage.addListener(async function(message) {
  if (message.content === "export_to_elysian"){
  bookmarks = await getBrowserBookmarks()
  sendPostRequest(bookmarks, "export_to_elysian", 200, "Export successful", "Bookmarks from this browser are added in Elysian")

  }
  if (message.content === "import_from_elysian"){
    console.log("Removing add listener")
    chrome.bookmarks.onCreated.removeListener(sendBookmarkToElysian);
    response = await sendGETRequest("import_from_elysian")
    create_bookmarks(response)
    
    async function create_bookmarks(bookmarksData) {
      // Start creating bookmarks in the Chrome browser
      
      createBookmarksHierarchy(bookmarksData, null).then(() => {
        // Reattach the event listener after all bookmarks have been created
        console.log("adding add listener back")
        chrome.bookmarks.onCreated.addListener(sendBookmarkToElysian);
    });;
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

  if (message.content === "check_sync_status"){
    bb = await getBrowserBookmarks()
    eb = await sendGETRequest("import_from_elysian")
    diff = deepEqual(bb, eb)
    if (diff.length == 0){
      console.log("100% in sync")
    }
    else{
      console.log(diff)
      console.log("Use Export To Elysian to Sync")
    }

    function deepEqual(obj1, obj2, path = '', ignoreKeys = ['dateAdded']) {
      let differences = [];
  
      // If both are objects (including arrays), continue recursion
      if (typeof obj1 === 'object' && typeof obj2 === 'object' && obj1 !== null && obj2 !== null) {
          const keys1 = Object.keys(obj1);
          const keys2 = Object.keys(obj2);
  
          // Compare keys in obj1
          for (let key of keys1) {
              // Skip comparison for ignored keys
              if (ignoreKeys.includes(key)) continue;
  
              const fullPath = path ? `${path}.${key}` : key;
              if (!obj2.hasOwnProperty(key)) {
                  differences.push(`Missing key '${fullPath}' in the second object`);
              } else {
                  const result = deepEqual(obj1[key], obj2[key], fullPath, ignoreKeys);
                  differences = differences.concat(result);
              }
          }
  
          // Check keys in obj2 that are missing in obj1
          for (let key of keys2) {
              // Skip ignored keys
              if (ignoreKeys.includes(key)) continue;
  
              const fullPath = path ? `${path}.${key}` : key;
              if (!obj1.hasOwnProperty(key)) {
                  differences.push(`Extra key '${fullPath}' in the second object`);
              }
          }
      } else {
          // For primitive values, compare and log if different
          if (obj1 !== obj2) {
              differences.push(`Value mismatch at '${path}': ${obj1} !== ${obj2}`);
          }
      }
  
      return differences;
  }
  
  
  }

})



