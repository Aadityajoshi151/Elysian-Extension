import { showNotification } from "../utils/showNotification.js";
import { getFromLocalStorage } from "../utils/getFromLocalStorage.js";

export async function sendPostRequest(info, endpoint, response_code, notification_title, notification_message) {
    try {
      const BASE_URL = await getFromLocalStorage('server_url')
      const response = await fetch(BASE_URL.concat('/api/' + endpoint), {
        method: "POST",
        body: JSON.stringify(info),
        headers: {
          "Authorization": await getFromLocalStorage('elysian_api_key'),
          "Content-type": "application/json"
        }
      });
      console.log(response.status)
      console.log(response_code)
      if (response.status == response_code) {
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