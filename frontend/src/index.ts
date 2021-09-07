import Client from "./api/wrapper/client";
import { loadDOMComponents } from "./components";
import HoraiNotes from "./note-logic";
import HoraiPlanner from "./planner-logic";
import { setupAndGetClient } from "./login";


$(document).ready(async () => {
    await loadDOMComponents();

    const client = await setupAndGetClient();
    $("#current-user").text(client.api.auth.dataMe.name);

    const horai_notes = new HoraiNotes(client);
    horai_notes.addEventHandlers();
    horai_notes.loadSubjectsIntoDOM();

    const horai_planner = new HoraiPlanner();
});