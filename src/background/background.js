function showNotification(title, message){
  chrome.notifications.create({
  type: 'basic',
  iconUrl: 'snowflake.png',
  title: title,
  message: message
}, function() {});
}


chrome.bookmarks.onCreated.addListener(async function(id, info) {
    response = await fetch("http://localhost:3000/add_bookmark", {
    method: "POST",
    body: JSON.stringify(info),
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
   });
   console.log(info)
   if(response.status == 201){
    showNotification(info.title, "Bookmark added to Elysian")
   }
   
  });

chrome.bookmarks.onChanged.addListener(async function(id, info) {
  info.id = id //Adding id in the object that will be sent to the server
  response = await fetch("http://localhost:3000/update_bookmark", {
    method: "POST",
    body: JSON.stringify(info),
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
   });
   console.log("here")
   if(response.status == 201){
    showNotification(info.title, "Bookmark updated in Elysian")
   }
  });

chrome.bookmarks.onMoved.addListener(function(id, info) {
    console.log(id)
    console.log(info)
  });

chrome.bookmarks.onRemoved.addListener(async function(id, info) {
  response = await fetch("http://localhost:3000/delete_bookmark", {
    method: "POST",
    body: JSON.stringify({id}),
    headers: {
      "Content-type": "application/json; charset=UTF-8"
    }
   });
   if(response.status == 201){
    showNotification("Deleted", "Bookmark removed from Elysian")
   }
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