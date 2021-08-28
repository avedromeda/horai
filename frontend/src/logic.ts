import Client from "./api/wrapper/client";
import { component } from "./components";

export async function beginInteractions(client: Client) {
    // Start logic here
    if (!client.isLoggedIn) {
        return;
    }

    await loadSubjects(client);
    addListeners(client);
}

async function loadSubjects(client: Client) {
    // Load subjects and put into HTML
    $("#subjects").empty();

    (await client.getSubjects()).forEach(async subject => {
        $("#subjects").append(await component("subject.html", {
            name: subject.name,
            note_count: subject.notes.length
        }))
    })
}

function addListeners(client: Client) {
    $("#add-subject").on("click", (event) => addSubjectCallback(client, event));
    $("#add-note").on("click", (event) => addNoteCallback(client, event));
}

function addSubjectCallback(client: Client, event: JQuery.ClickEvent) {
    bootbox.prompt("Subject name?", async (result: string) => {
        if (result !== null) {
            await client.createSubject({name: result});
            await loadSubjects(client);
        }
    })
}

function addNoteCallback(client: Client, event: JQuery.ClickEvent) {
    return;
}
