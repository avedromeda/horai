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

async function refreshSubjectView(client: Client) {
    await loadSubjects(client);
    highlightActiveSubject();
    await loadNotes(client, currentSubjectId);
}

function goToSubjects() {
    $("#subject-column").addClass("d-block").removeClass("d-none d-lg-block");
    $("#note-column").removeClass("d-block").addClass("d-none d-lg-block");
}

function goToNotes() {
    // Change display focus...
    $("#subject-column").removeClass("d-block").addClass("d-none d-lg-block");
    $("#note-column").addClass("d-block").removeClass("d-none d-lg-block");
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
        goToNotes();
    })
}

async function loadNotes(client: Client, subjectId: number) {
    // Load subject
    if (!subjectId) {
        return $("#notes").empty();
    }

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
    $("#go-to-subjects").on("click", (event) => goToSubjects());

    $("#add-subject").on("click", (event) => addSubjectCallback(client, event));
    $("#add-note").on("click", (event) => addNoteCallback(client, event));

    $("#delete-subject").on("click", (event) => deleteSubjectCallback(client, event));
    $("#delete-note").on("click", (event) => deleteNoteCallback(client, event));
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
    if (currentSubjectId) {
        bootbox.prompt("Note title?", async (result: string) => {
            if (result !== null) {
                await (await client.getSubject(currentSubjectId)).createNote({ title: result, content: "", label: [] });
                await refreshSubjectView(client);
            }
        })
    }
}

function deleteSubjectCallback(client: Client, event: JQuery.ClickEvent) {
    if (currentSubjectId) {
        bootbox.confirm("Are you sure you want to delete this subject and all of its notes?", async (result: boolean) => {
            if (result) {
                await client.api.subject.delete(currentSubjectId);
                currentSubjectId = null;
                await refreshSubjectView(client);
            }
        })
    }
}

function deleteNoteCallback(client: Client, event: JQuery.ClickEvent) {
    if (currentNoteId) {
        bootbox.confirm("Are you sure you want to delete this note?", async (result: boolean) => {
            if (result) {
                await client.api.note.delete(currentSubjectId, currentNoteId);
                currentNoteId = null;
                await refreshSubjectView(client);
            }
        })
    }
}
