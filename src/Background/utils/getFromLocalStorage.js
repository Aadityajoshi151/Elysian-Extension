import "./crossBrowser.js";

export function getFromLocalStorage(key) {
    return new Promise(function(resolve, reject) {
      browser.storage.local.get([key], function (result) {
        if (browser.runtime.lastError) {
          return reject(browser.runtime.lastError);
        }
        if (result[key] === undefined) {
            console.error(key+" not found in local storage")
            return reject(Error(key+" not found in local storage"))
        }
        resolve(result[key])
      });
    });
  }