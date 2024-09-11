url_input = document.getElementById("url_input");
api_key_input = document.getElementById("api_key_input");

chrome.storage.local.get(['server_url', 'elysian_api_key'], function(result) {
    console.log('url: ' + result.server_url);
    console.log('apikey: ' + result.elysian_api_key);
    if (typeof(result.server_url) !== "undefined" && typeof(result.elysian_api_key) !== "undefined"){
        url_input.value = result.server_url;
        api_key_input.value = result.elysian_api_key
    }
  });
document.getElementById("add_details").addEventListener("click", function(){
    server_url = url_input.value
    elysian_api_key = api_key_input.value
    //TODO: Add a POST request which checks authenticity of credentials before saving
    chrome.storage.local.set({
        "server_url": server_url,
        "elysian_api_key": elysian_api_key 
      }, function() {
        alert("Credentials Saved");
      });

})