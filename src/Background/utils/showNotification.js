import "./crossBrowser.js";


export function showNotification(title, message) {
  browser.notifications.create({
    type: 'basic',
    iconUrl: browser.runtime.getURL('assets/Elysian_Logo.png'),
    title: title,
    message: message
  }, function () { });
}