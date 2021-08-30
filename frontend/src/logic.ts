import Client from "./api/wrapper/client";
import Note from "./api/wrapper/note";
import Subject from "./api/wrapper/subject";
import { Component } from "./components";
import Editing, { addToolbarListener } from "./editor";


let currentSubjectId: number;
let currentNoteId: number;
const editor = new Editing();

function highlightActiveSubject() {
    $(".subject--action.active").removeClass("active");
    $(".subject--action[data-id=\"{0}\"]".formatUnicorn(currentSubjectId)).addClass("active");
}

function highlightActiveNote() {
    $(".note--action.active").removeClass("active");
    $(".note--action[data-id=\"{0}\"]".formatUnicorn(currentNoteId)).addClass("active");
}

async function refreshSubjectView(client: Client) {
    await loadSubjects(client);
    highlightActiveSubject();
    await loadNotes(client, currentSubjectId);
}

function goToSubjects() {
    $("#subject-column").addClass("d-block").removeClass("d-none");
    $("#note-column").removeClass("d-block").addClass("d-none");
}

function goToNotes() {
    // Change display focus...
    $("#subject-column").removeClass("d-block").addClass("d-none");
    $("#editing-column").removeClass("d-block").addClass("d-none");
    $("#note-column").addClass("d-block").removeClass("d-none");
}

function goToNote() {
    // Change display focus...
    $("#note-column").removeClass("d-block").addClass("d-none");
    $("#editing-column").addClass("d-block").removeClass("d-none");
}

function headerSetCurrentSubject(subject: Subject) {
    $("#current-subject").text(subject.name);
}

function headerSetCurrentNote(note: Note) {
    $("#current-note").text(note.title);
}

function headerClearCurrentNote() {
    $("#current-note").text("");
}

function headerClearCurrentSubject() {
    headerClearCurrentNote();
    $("#current-subject").text("");
}

function strip(html: string){
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
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

    $(".subject--action").on("click", function () {
        // Remove any active labels...
        const id = $(this).data("id");
        currentSubjectId = id;
        highlightActiveSubject();

        loadNotes(client, id);
        goToNotes();
    })

    $(".subject--action .delete-this").on("click", function (event) {
        event.stopPropagation();
        deleteSubjectCallback(client, event, $(this).data("id"));
    });
}

async function loadNotes(client: Client, subjectId: number) {
    // Load subject
    if (!subjectId) {
        return $("#notes").empty();
    }

    const subject = await client.getSubject(subjectId);
    $("#notes").empty();
    headerSetCurrentSubject(subject);

    for (const note of subject.notes) {
        $("#notes").append(await Component("note.html", {
            title: note.title,
            preview: strip(note.content.slice(0, 20)) || "No content",
            id: note.id,
            subjectId: subject.id
        }))
    }

    // Set up click listener
    $(".note--action").on("click", function () {
        const id = $(this).data("id");
        currentNoteId = id;
        highlightActiveNote();

        loadNote(client, id);
        goToNote();
    });

    $(".note--action .delete-this").on("click", function (event) {
        event.stopPropagation();
        deleteNoteCallback(client, event, $(this).data("id"));
    });
}


async function loadNote(client: Client, noteId: number) {
    addToolbarListener(editor);
    editor.destroyEditor();

    const note = await (await client.getSubject(currentSubjectId)).getNote(noteId);
    headerSetCurrentNote(note);
    editor.createEditor(note);
}


function addListeners(client: Client) {
    $("#go-to-subjects").on("click", (event) => goToSubjects());
    $("#go-to-notes").on("click", (event) => goToNotes());

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

function deleteSubjectCallback(client: Client, event: JQuery.ClickEvent, subjectId?: number) {
    const targetSubjectId = subjectId || currentSubjectId;
    if (targetSubjectId) {
        bootbox.confirm("Are you sure you want to delete this subject and all of its notes?", async (result: boolean) => {
            if (result) {
                await client.api.subject.delete(targetSubjectId);
                currentSubjectId = null;
                await refreshSubjectView(client);
            }

            headerClearCurrentSubject();
        })
    }
}

function deleteNoteCallback(client: Client, event: JQuery.ClickEvent, noteId?: number) {
    const targetNoteId = noteId || currentNoteId;
    if (targetNoteId) {
        bootbox.confirm("Are you sure you want to delete this note?", async (result: boolean) => {
            if (result) {
                editor.destroyEditor();
                await client.api.note.delete(currentSubjectId, targetNoteId);
                currentNoteId = null;
                await refreshSubjectView(client);
            }

            headerClearCurrentNote();
        })
    }
}
