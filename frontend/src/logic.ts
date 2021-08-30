import Client from "./api/wrapper/client";
import { Component } from "./components";


let currentSubjectId: number;
let currentNoteId: number;

function highlightActiveSubject() {
    $(".subject--action.active").removeClass("active");
    $(".subject--action[data-id={0}]".formatUnicorn(currentSubjectId)).addClass("active");
}

function highlightActiveNote() {
    $(".note--action.active").removeClass("active");
    $(".note--action[data-id={0}]".formatUnicorn(currentNoteId)).addClass("active");
}

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
    const subjects = await client.getSubjects()
    $("#subjects").empty();

    for (const subject of subjects) {
        $("#subjects").append(await Component("subject.html", {
            name: subject.name,
            note_count: subject.notes.length,
            id: subject.id
        }))
    }

    console.log($(".subject--action"));
    $(".subject--action").on("click", function () {
        // Remove any active labels...
        const id = $(this).data("id");
        currentSubjectId = id;
        highlightActiveSubject();

        loadNotes(client, id);
    })
}

async function loadNotes(client: Client, subjectId: number) {
    // Load subject
    const subject = await client.getSubject(subjectId);
    $("#notes").empty();

    for (const note of subject.notes) {
        $("#notes").append(await Component("note.html", {
            title: note.title,
            preview: note.content.slice(0, 20) || "No content",
            id: note.id,
            subjectId: subject.id
        }))
    }

    // Set up click listener
    $(".note--action").on("click", function () {
        const id = $(this).data("id");
        currentNoteId = id;
        highlightActiveNote();

        // loadNote(client, id);
    })
}


function addListeners(client: Client) {
    $("#add-subject").on("click", (event) => addSubjectCallback(client, event));
    $("#add-note").on("click", (event) => addNoteCallback(client, event));
}

function addSubjectCallback(client: Client, event: JQuery.ClickEvent) {
    bootbox.prompt("Subject name?", async (result: string) => {
        if (result !== null) {
            await client.createSubject({ name: result });
            await loadSubjects(client);
        }
    })
}

function addNoteCallback(client: Client, event: JQuery.ClickEvent) {
    bootbox.prompt("Note title?", async (result: string) => {
        if (result !== null) {
            await (await client.getSubject(currentSubjectId)).createNote({ title: result, content: "", label: [] });
            await loadSubjects(client);
            highlightActiveSubject();
            await loadNotes(client, currentSubjectId);
        }
    })
}
