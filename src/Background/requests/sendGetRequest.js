import { getFromLocalStorage } from "../utils/getFromLocalStorage.js";

export async function sendGETRequest(endpoint) {
    const BASE_URL = await getFromLocalStorage('server_url')
    const response = await fetch(BASE_URL.concat("/api/" + endpoint), {
        method: "GET",
        headers: {
            "Authorization": await getFromLocalStorage('elysian_api_key'),
            "Content-type": "application/json"
        }
    });
    if (response.status == 200) {
        return response.json()
    }
    else { return false }
}