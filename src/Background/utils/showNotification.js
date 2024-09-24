export function showNotification(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: chrome.runtime.getURL('assets/Elysian_Logo.png'),
    title: title,
    message: message
  }, function () { });
}