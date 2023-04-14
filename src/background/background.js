const BASE_URL="http://localhost:3000/";
const ELYSIAN_API_KEY="Rmu2jhNTbdSEA5Oq0nQcc0A198qGOthyP7p"
//This is just a random string for testing.
//TODO: remove this and use chrome's local storage to retrieve the value

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

chrome.bookmarks.onCreated.addListener(async function(id, info) {
   await sendPostRequest(info, "add_bookmark", 201, info.title, "Bookmark added to Elysian")
  });

chrome.bookmarks.onChanged.addListener(async function(id, info) {
   info.id = id //Adding id in the object that will be sent to the server
   await sendPostRequest(info, "update_bookmark", 200, info.title, "Bookmark updated in Elysian")
  });

chrome.bookmarks.onMoved.addListener(async function(id, info) {
   info.id = id //Adding id in the object that will be sent to the server
   await sendPostRequest(info, "update_bookmark", 200, "Reordered", "Bookmark re-ordered in Elysian")
  });

chrome.bookmarks.onRemoved.addListener(async function(id, info) {
   await sendPostRequest({id}, "delete_bookmark", 410, "Deleted", "Bookmark removed from Elysian")
  });

//TODO Check importBegan, importEnded and onReordered are required or not

chrome.runtime.onMessage.addListener(function(message) {
  if (message.content === "export_to_elysian"){
    chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
      bookmarks = bookmarkTreeNodes[0].children[0].children;
      console.log(bookmarks)
      sendPostRequest({"bookmarks":bookmarks}, "export_to_elysian", 200, "Export successful", "Bookmarks from this browser are added in Elysian")
   });
  }
  if (message.content === "import_from_elysian"){
    fetch("http://localhost:3000/bookmarks", {
      headers: {
        'Authorization': ELYSIAN_API_KEY
      }
    })
    .then(response => response.json())
    .then(data => {
      all_bookmarks = data
      data.forEach(item => {  
        if (item.parentId === "1"){
            if (item.url) {
              // create bookmark with URL
              console.log("Creating RAW bookmark "+item.title)
              chrome.bookmarks.create({
                parentId: item.parentId,
                title: item.title,
                url: item.url
              });
            } else {
              // create folder
              console.log("Creating folder "+item.title)
              chrome.bookmarks.create({
                parentId: item.parentId,
                title: item.title
              });
            }
        }
      
      });
      console.log("--------------------------------------------------------")
      data.forEach(item => {     
        if (item.parentId !== "1"){          
          let obj = all_bookmarks.find(o => o.id === item.parentId)
          chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
            bookmarks = bookmarkTreeNodes[0].children[0].children;
          //console.log(bookmarks)
          bookmarks.forEach(function(bookmark) {
          if (bookmark.title === obj.title){
            console.log("SAme title found")
            console.log(bookmark)
            console.log("Creating Nested "+item.title+" which is a child of "+bookmark.title+" which as an id of "+bookmark.id)
            chrome.bookmarks.create({
              parentId: bookmark.id,
              title: item.title,
              url: item.url
            });
          }
  });
});
          
        }
      });

    })
      .catch(error => {
        console.error('Error:', error);
      });
  }
  
})