async function getServerDetails() {
  chrome.storage.sync.get(['server_url', 'elysian_api_key'], function(result) {
    console.log("inside chrome storage sync")
    console.log('url: ' + result.server_url);
    console.log('apikey: ' + result.elysian_api_key);
  // if (typeof(result.server_url) !== "undefined" && typeof(result.elysian_api_key) !== "undefined"){
      
  //   console.log("inside if condition")
    
  // }
  BASE_URL = result.server_url;
    ELYSIAN_API_KEY = result.elysian_api_key;
  // TODO: Commenting this for now. Find whether this is required here or not by testing.
  // else{
  //   showNotification("No Server Configured", "Please enter the server details.");
  // }
  console.log("before returning")
  
  return [BASE_URL, ELYSIAN_API_KEY]
});
}

chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason === "install") {
    chrome.tabs.create({ url: "add_credentials.html" });
  }
});

function showNotification(title, message){
  chrome.notifications.create({
  type: 'basic',
  iconUrl: 'Elysian_Logo.png',
  title: title,
  message: message
}, function() {});
}

async function sendPostRequest(info, endpoint, response_code, notification_title, notification_message) {
  try {
    var server_details = await getServerDetails();
    console.log("server details")
    console.log(server_details)
    const response = await fetch(BASE_URL.concat(endpoint), {
      method: "POST",
      body: JSON.stringify(info),
      headers: {
        "Authorization": ELYSIAN_API_KEY,
        "Content-type": "application/json; charset=UTF-8"
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
  const response = await fetch(BASE_URL.concat(endpoint), {
    method: "GET",
    headers: {
      "Authorization": ELYSIAN_API_KEY,
      "Content-type": "application/json; charset=UTF-8"
    }

  });
  return response.json()
}

chrome.runtime.onMessage.addListener(async function(message) {
  if (message.content === "export_to_elysian"){
    chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
      bookmarks = bookmarkTreeNodes[0].children[0].children;
      //console.log(bookmarks)
      sendPostRequest(bookmarks, "export_to_elysian", 200, "Export successful", "Bookmarks from this browser are added in Elysian")
   });
  }
  if (message.content === "import_from_elysian"){
    response = await sendGETRequest("import_from_elysian")
    console.log(response)
    create_bookmarks(response)
    function create_bookmarks(bookmarksData) {

      console.log("Inside create bookmarks function")
      // Parse the JSON data into a JavaScript object
      
  
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



