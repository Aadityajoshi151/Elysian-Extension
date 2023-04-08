document.getElementById("export_to_server").addEventListener("click", function(){
    chrome.runtime.sendMessage({content: "export_to_elysian"})
})