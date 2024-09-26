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
        console.log("notification_title")
        showNotification(notification_title, notification_message);
      }
      else if (response.status == 401) {
        console.error("Authentication failed")
        showNotification("Authentication failed", "Please check the API key added in Elysian extension");
      }
    } catch (error) {
      console.error(error.message)
      showNotification("Error Occurrerd", error.message);
    }
  }