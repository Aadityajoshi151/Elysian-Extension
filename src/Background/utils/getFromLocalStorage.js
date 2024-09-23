export function getFromLocalStorage(key) {
    return new Promise(function(resolve, reject) {
      chrome.storage.local.get([key], function (result) {
        if (chrome.runtime.lastError) {
          return reject(chrome.runtime.lastError);
        }
        if (result[key] === undefined) {
            return reject(Error(key+" not found in local storage"))
        }
        resolve(result[key])
      });
    });
  }