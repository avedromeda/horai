import Client from "./api/wrapper/client";
import { loadDOMComponents } from "./components";
import Horai from "./logic";
import { setupAndGetClient } from "./login";


$(document).ready(async () => {
    await loadDOMComponents();

    const client = await setupAndGetClient();
    $("#current-user").text(client.api.auth.dataMe.name);

    const horai = new Horai(client);
    horai.addEventHandlers();
    horai.loadSubjectsIntoDOM();
});