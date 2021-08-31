import Client from "./api/wrapper/client";
import { loadDOMComponents } from "./components";
import { beginInteractions } from "./logic";
import { setupAndGetClient } from "./login";


$(document).ready(async () => {
    await loadDOMComponents();

    const client = await setupAndGetClient();
    $("#current-user").text(client.api.auth.dataMe.name);

    await beginInteractions(client);
});