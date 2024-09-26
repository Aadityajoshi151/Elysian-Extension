# Elysian Extension
A browser extension to backup regularly used bookmarks of your browser to Elysian server running in your home lab.

It uses the chrome's [bookmarks event listeners](https://developer.chrome.com/docs/extensions/reference/api/bookmarks#event) to detect when a bookmark is added, updated, changed etc. and performs the same action on server side through REST API calls.

## Getting Started
- Click [here]() to see the full setup instructions (Elysian server + Extension)
- Already have Elysian server running? Follow these steps for setting up the extension:
> [!NOTE]
> Currently, Elysian is only avaible for Chrome/Brave. Firefox extension is coming soon. Once both extensions are created, they will be eventually made available on their respective browser's marketplace.
1. Download and extract the extension's zip file from the releases section of Elysian extension repository.

2. Open the Chrome/Brave browser and go to the installed extensions page.
3. Turn on the developer mode.
4. Click on _Load Unpacked Extension_ and select the extracted folder. You will be redirected to the _Add/Update Server Details_ page.
5. Enter the URL of your server (without trailing /) and the API key you used while setting up Elysian on server side.
> [!TIP]
> Elysian notifies you about CRUD/Import/Export operations via browser notifications. It is recomended to allow the browser to show notifications at this point.
6. Upon saving the credentials, you will be asked to export the browser's bookmarks to Elysian server. Once exported, any operation (Create, Re-order, Update, Delete) that you do on the browser's bookmarks, will be updated on Elysian server.

Feel free to open an issue if you come across any bugs or have some feature suggestions.