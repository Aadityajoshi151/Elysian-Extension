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


async function sendPostRequest(info, endpoint, response_code, notification_title, notification_message) {
  try {
    BASE_URL='http://localhost:6161/api/'
    ELYSIAN_API_KEY='jo'
    const response = await fetch(BASE_URL.concat(endpoint), {
      method: "POST",
      body: JSON.stringify(info),
      headers: {
        "Authorization": ELYSIAN_API_KEY,
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
    showNotification("Request failed", "Unable to reach the Elysian server");
  }
}

async function sendGETRequest(endpoint){
  BASE_URL='http://localhost:6161/api/'
  ELYSIAN_API_KEY='jo'
  const response = await fetch(BASE_URL.concat(endpoint), {
    method: "GET",
    headers: {
      "Authorization": ELYSIAN_API_KEY,
      "Content-type": "application/json"
    }

  });
  return response.json()
}

chrome.runtime.onMessage.addListener(async function(message) {
  if (message.content === "export_to_elysian"){
    chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
      bookmarks = bookmarkTreeNodes[0].children[0].children;
      sendPostRequest(bookmarks, "export_to_elysian", 200, "Export successful", "Bookmarks from this browser are added in Elysian")
   });
  }
  if (message.content === "import_from_elysian"){
    response = await sendGETRequest("import_from_elysian")
    create_bookmarks(response)
    function create_bookmarks(bookmarksData) {
      // Start creating bookmarks in the Chrome browser
      createBookmarksHierarchy(bookmarksData, null);
  }
  
  // Recursively create bookmarks in Chrome based on the hierarchy
  function createBookmarksHierarchy(bookmarks, parentId) {
      bookmarks.forEach(bookmark => {
          const newBookmark = {
              parentId: parentId || '1', // '1' is the root "Bookmarks Bar" ID
              title: bookmark.title || "Untitled",
              url: bookmark.url || null
          }; 
          chrome.bookmarks.create(newBookmark, (createdBookmark) => {
              if (bookmark.children && bookmark.children.length > 0) {
                  createBookmarksHierarchy(bookmark.children, createdBookmark.id);
              }
          });
      });
  }
    
  }
})



