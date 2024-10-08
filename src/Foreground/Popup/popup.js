
document.getElementById("export_to_server").addEventListener("click", function(){
    chrome.runtime.sendMessage({content: "export_to_elysian"})
})

document.getElementById("add_credentials").addEventListener("click", function(){
    chrome.tabs.create({ url: "../src/Foreground/Server_Details/add_server_details.html" });
})

document.getElementById("github_repo").addEventListener("click", function(){
    chrome.tabs.create({ url: "https://github.com/Aadityajoshi151/Elysian" });
})

document.getElementById("import_from_server").addEventListener("click", function(){
    chrome.runtime.sendMessage({content: "import_from_elysian"})
})

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('version').innerText = chrome.runtime.getManifest().version;
});