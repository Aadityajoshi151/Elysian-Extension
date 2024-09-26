export function getFromLocalStorage(key) {
    return new Promise(function(resolve, reject) {
      chrome.storage.local.get([key], function (result) {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        if (result[key] === undefined) {
            console.error(key+" not found in local storage")
            return reject(Error(key+" not found in local storage"))
        }
        resolve(result[key])
      });
    });
  }