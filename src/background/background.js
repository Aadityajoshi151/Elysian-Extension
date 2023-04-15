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
    console.log("Test mode")
    const bookmarks = [
      {
        "id": "1022",
        "parentId": "1",
        "title": "Youtube",
        "index": 0,
        "dateAdded": 1674654173000,
        "url": "http://www.youtube.com/"
    },
    {
        "id": "1023",
        "parentId": "1",
        "title": "Reddit",
        "index": 1,
        "dateAdded": 1674654190000,
        "url": "http://www.reddit.com/"
    },
    {
        "id": "1024",
        "parentId": "1",
        "title": "Whatsapp Web",
        "index": 2,
        "dateAdded": 1674654209000,
        "url": "https://web.whatsapp.com/"
    },
    {
        "id": "1025",
        "parentId": "1",
        "title": "Github Repos",
        "index": 3,
        "dateAdded": 1674654233000,
        "url": "https://github.com/Aadityajoshi151?tab=repositories"
    },
    {
        "id": "1026",
        "parentId": "1",
        "title": "ChatGPT",
        "index": 4,
        "dateAdded": 1674654257000,
        "url": "https://chat.openai.com/"
    },
    {
        "id": "1027",
        "parentId": "1",
        "title": "Google",
        "index": 5,
        "dateAdded": 1681460778642
    },
    {
        "id": "1028",
        "parentId": "1027",
        "title": "Gmail",
        "index": 0,
        "dateAdded": 1674654370000,
        "url": "https://mail.google.com/"
    },
    {
        "id": "1029",
        "parentId": "1027",
        "title": "Keep Notes",
        "index": 1,
        "dateAdded": 1674654334000,
        "url": "https://keep.google.com/"
    },
    {
        "id": "1030",
        "parentId": "1027",
        "title": "Maps",
        "index": 2,
        "dateAdded": 1674654349000,
        "url": "https://www.google.com/maps"
    },
    {
        "id": "1031",
        "parentId": "1027",
        "title": "Google Search",
        "index": 3,
        "dateAdded": 1674654300000,
        "url": "https://www.google.com/"
    },
    {
        "id": "1032",
        "parentId": "1027",
        "title": "Drive",
        "index": 4,
        "dateAdded": 1676831711000,
        "url": "https://drive.google.com/drive/my-drive"
    },
    {
        "id": "1033",
        "parentId": "1",
        "title": "Banking",
        "index": 6,
        "dateAdded": 1681460778643
    },
    {
        "id": "1034",
        "parentId": "1033",
        "title": "HDFC",
        "index": 0,
        "dateAdded": 1676003332000,
        "url": "https://netbanking.hdfcbank.com/netbanking/"
    },
    {
        "id": "1035",
        "parentId": "1033",
        "title": "SBI",
        "index": 1,
        "dateAdded": 1676003765000,
        "url": "https://www.onlinesbi.sbi/"
    },
    {
        "id": "1036",
        "parentId": "1",
        "title": "Selfhosting",
        "index": 7,
        "dateAdded": 1681460778643
    },
    {
        "id": "1037",
        "parentId": "1036",
        "title": "Raspberry Pi",
        "index": 0,
        "dateAdded": 1681460778644
    },
    {
        "id": "1038",
        "parentId": "1037",
        "title": "Heimdall (Local)",
        "index": 0,
        "dateAdded": 1680576386000,
        "url": "http://192.168.0.105:81/"
    },
    {
        "id": "1039",
        "parentId": "1037",
        "title": "qBittorrent",
        "index": 1,
        "dateAdded": 1674654496000,
        "url": "http://192.168.0.105:8080/"
    },
    {
        "id": "1040",
        "parentId": "1037",
        "title": "Portainer",
        "index": 2,
        "dateAdded": 1674654509000,
        "url": "http://192.168.0.105:9000/#!/home"
    },
    {
        "id": "1041",
        "parentId": "1037",
        "title": "Jellyfin",
        "index": 3,
        "dateAdded": 1674654551000,
        "url": "http://192.168.0.105:8096/web/index.html#!/home.html"
    },
    {
        "id": "1042",
        "parentId": "1037",
        "title": "AdGuard",
        "index": 4,
        "dateAdded": 1674654589000,
        "url": "http://192.168.0.105/"
    },
    {
        "id": "1043",
        "parentId": "1037",
        "title": "Pingvin",
        "index": 5,
        "dateAdded": 1674654612000,
        "url": "http://192.168.0.105:3100/auth/signIn"
    },
    {
        "id": "1044",
        "parentId": "1037",
        "title": "Homebox",
        "index": 6,
        "dateAdded": 1674654640000,
        "url": "http://192.168.0.105:3200/"
    },
    {
        "id": "1045",
        "parentId": "1037",
        "title": "File Browser",
        "index": 7,
        "dateAdded": 1674654682000,
        "url": "http://192.168.0.105:8099/"
    },
    {
        "id": "1046",
        "parentId": "1037",
        "title": "Guacamole",
        "index": 8,
        "dateAdded": 1680535103000,
        "url": "http://192.168.0.105:8400/#/"
    },
    {
        "id": "1047",
        "parentId": "1037",
        "title": "Vaultwarden",
        "index": 9,
        "dateAdded": 1680577095000,
        "url": "https://vault.aadityajoshi.co.in/#/login"
    },
    {
        "id": "1048",
        "parentId": "1037",
        "title": "Heimdall (Public)",
        "index": 10,
        "dateAdded": 1674654737000,
        "url": "https://pi.aadityajoshi.co.in/"
    },
    {
        "id": "1049",
        "parentId": "1036",
        "title": "Noted",
        "index": 1,
        "dateAdded": 1680613781000,
        "url": "https://noted.lol/"
    },
    {
        "id": "1050",
        "parentId": "1036",
        "title": "Cloudflare",
        "index": 2,
        "dateAdded": 1680615696000,
        "url": "https://www.cloudflare.com/en-gb/"
    },
    {
        "id": "1051",
        "parentId": "1",
        "title": "PSArips",
        "index": 8,
        "dateAdded": 1678427351000,
        "url": "https://psa.re/"
    },
    {
        "id": "1052",
        "parentId": "1",
        "title": "High Seas",
        "index": 9,
        "dateAdded": 1681460778645
    },
    {
        "id": "1053",
        "parentId": "1052",
        "title": "Seedr",
        "index": 0,
        "dateAdded": 1678427384000,
        "url": "https://www.seedr.cc/"
    },
    {
        "id": "1054",
        "parentId": "1052",
        "title": "WebTorrent Checker",
        "index": 1,
        "dateAdded": 1678427427000,
        "url": "https://checker.openwebtorrent.com/"
    },
    {
        "id": "1055",
        "parentId": "1052",
        "title": "Torrent to Magnet",
        "index": 2,
        "dateAdded": 1679808378000,
        "url": "https://nutbread.github.io/t2m/"
    },
    {
        "id": "1056",
        "parentId": "1052",
        "title": "Yify",
        "index": 3,
        "dateAdded": 1678427506000,
        "url": "https://yts.mx/"
    },
    {
        "id": "1057",
        "parentId": "1052",
        "title": "Nyaa - Anime",
        "index": 4,
        "dateAdded": 1678802211000,
        "url": "https://nyaa.si/"
    },
    {
        "id": "1058",
        "parentId": "1052",
        "title": "1337x (VPN)",
        "index": 5,
        "dateAdded": 1678427531000,
        "url": "https://1337x.to/"
    },
    {
        "id": "1059",
        "parentId": "1052",
        "title": "The Pirate Bay Proxy (VPN)",
        "index": 6,
        "dateAdded": 1678427478000,
        "url": "https://www.pirateproxy-bay.com/"
    },
    {
        "id": "1060",
        "parentId": "1052",
        "title": "Google",
        "index": 7,
        "dateAdded": 1680625553000,
        "url": "https://www.google.co.in/"
    },
    {
        "id": "1061",
        "parentId": "1",
        "title": "Evernote",
        "index": 10,
        "dateAdded": 1678636747000,
        "url": "https://evernote.com/"
    },
    {
        "id": "1062",
        "parentId": "1",
        "title": "Jiosaavn",
        "index": 11,
        "dateAdded": 1676702198000,
        "url": "https://www.jiosaavn.com/"
    },
    {
        "id": "1063",
        "parentId": "1",
        "title": "Pinterest",
        "index": 12,
        "dateAdded": 1677402621000,
        "url": "https://in.pinterest.com/"
    },
    {
        "id": "1064",
        "parentId": "1",
        "title": "AirDroid",
        "index": 13,
        "dateAdded": 1679835841000,
        "url": "http://192.168.0.101:8888/"
    },
    {
        "id": "1065",
        "parentId": "1",
        "title": "Extensions",
        "index": 14,
        "dateAdded": 1680939991000,
        "url": "chrome://extensions/"
    }
    ];
  
// Create a function to recursively create bookmarks
function createBookmarks(bookmarks, parentId, swag) {
  bookmarks.forEach((bookmark) => {
    console.log("PASSED")
    console.log(bookmark.title)
    console.log(bookmark.parentId)
    console.log(parentId)
    // Check if the bookmark is a folder
    if (!bookmark.url) {
      console.log("inside if")
      // Create the folder
      if (bookmark.parentId === parentId || swag){
        console.log("Creating folder "+bookmark.title+" with parentid "+bookmark.parentId)
      chrome.bookmarks.create({ parentId, title: bookmark.title }, (newFolder) => {
        // Check if the folder has child bookmarks
        const childBookmarks = bookmarks.filter(b => b.parentId === bookmark.id);
        if (childBookmarks.length > 0) {
          // Recursively create child bookmarks
          console.log("Recursive call")
          console.log(childBookmarks)
          console.log(newFolder.id)
          createBookmarks(childBookmarks, newFolder.id, true);
        }
      });
      }
      
    } else {
      console.log("inside else")
      console.log("swag: "+swag)
      console.log("Bookmarks parentid is "+bookmark.parentId+" and passed parentid is "+parentId)
      if (bookmark.parentId === parentId || swag){
        
        const bookmarkObj = {
          title: bookmark.title,
          url: bookmark.url,
          parentId: parentId,
          index: bookmark.index === undefined ? undefined : bookmark.index // set index to undefined if it's not defined in the bookmark object
        };
  
        // Create the bookmark
        console.log("Creating "+bookmarkObj.title+" with parentid "+bookmarkObj.parentId)
        chrome.bookmarks.create(bookmarkObj);
      }
      // Create the bookmark object
      

      
    }
  });
}

// Find the top-level folder
//const topLevelFolder = bookmarks.find(b => b.parentId==="1");
//console.log(topLevelFolder)

// Call the createBookmarks function with the top-level bookmarks
createBookmarks(bookmarks, '1', false);
  }
  
})