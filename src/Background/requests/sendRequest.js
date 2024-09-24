import { showNotification } from "../utils/showNotification.js";
import { getFromLocalStorage } from "../utils/getFromLocalStorage.js";

export async function sendRequest(method, info, endpoint, expected_response_code, notification_title, notification_message) {
    try {
      const BASE_URL = await getFromLocalStorage('server_url')
      const response = await fetch(BASE_URL.concat('/api/' + endpoint), {
        method: method,
        body: info,
        headers: {
          "Authorization": await getFromLocalStorage('elysian_api_key'),
          "Content-type": "application/json"
        }
      });
      if (response.status == expected_response_code) {
        showNotification(notification_title, notification_message);
      }
      else if (response.status == 401) {
        showNotification("Authentication failed", "Please check the API key added in Elysian extension");
      }
    } catch (error) {
      //TODO change the notification title below
      showNotification("Error Occurrerd!", error.message);
    }
  }