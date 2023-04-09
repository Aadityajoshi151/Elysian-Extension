document.getElementById("export_to_server").addEventListener("click", function(){
    chrome.runtime.sendMessage({content: "export_to_elysian"})
})

document.getElementById("add_credentials").addEventListener("click", function(){
    chrome.tabs.create({ url: "add_credentials.html" });
})