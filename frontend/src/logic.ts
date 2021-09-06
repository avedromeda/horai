import Client from "./api/wrapper/client";
import Note from "./api/wrapper/note";
import Subject from "./api/wrapper/subject";
import { Component } from "./components";
import Editing, { addToolbarListener } from "./editor";


const options = { weekday: "short", year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" } as const;

export default class Horai {
    currentSubjectId: number;
    currentNoteId: number;

    client: Client;
    editor: Editing;

    constructor(client: Client) {
        this.client = client;
        this.editor = new Editing();
    }

    async getSubject() {
        return await this.client.getSubject(this.currentSubjectId);
    }

    async getNote() {
        return await (await this.getSubject()).getNote(this.currentNoteId);
    }

    // Purely display
    highlightActiveSubject() {
        $(".subject--action.active").removeClass("active");
        $(".subject--action[data-id=\"{0}\"]".formatUnicorn(this.currentSubjectId)).addClass("active");
    }

    async setCurrentSubjectDisplay() {
        const subject = await this.getSubject();
        $("#current-subject").text(subject.name);
        $("#current-subject-modified").text(subject.updatedOn.toLocaleString(undefined, options));
        $("#note-column").removeClass("invisible");
    }

    clearCurrentSubjectDisplay() {
        this.clearCurrentNoteDisplay();
        $("#current-subject").text("");
        $("#current-subject-modified").text("");
        $("#note-column").addClass("invisible");
    }

    highlightActiveNote() {
        $(".note--action.active").removeClass("active");
        $(".note--action[data-id=\"{0}\"]".formatUnicorn(this.currentNoteId)).addClass("active");
    }

    async setCurrentNoteDisplay() {
        const note = await this.getNote();
        $("#current-note").text(note.title);
        $("#current-note-modified").text(note.updatedOn.toLocaleString(undefined, options));

        $("#editing-column").removeClass("invisible");
    }

    clearCurrentNoteDisplay() {
        $("#current-note").text("");
        $("#current-note-modified").text("");
        $("#editing-column").addClass("invisible");
    }

    showSavedInfo() {
        if (this.editor.lastSaved) {
            bootbox.alert("Your note was last uploaded at {0}".formatUnicorn(this.editor.lastSaved.toLocaleTimeString()))
        } else {
            bootbox.alert("Your note has not yet been saved. It is likely newly open, or there is no note currently being edited");
        }
    }

    showSettings() {
        bootbox.alert("This feature is coming soon");
    }

    // Data loading
    async loadNotesIntoDOM() {
        // Load subject
        if (!this.currentSubjectId) {
            return $("#notes").empty();
        }

        const subject = await this.getSubject();

        $("#notes").empty();
        this.setCurrentSubjectDisplay();

        for (const note of subject.notes) {
            const component = await Component("note.html", {
                title: note.title,
                preview: strip(note.content) || "No content",
                id: note.id,
                subjectId: subject.id,
                updated: note.updatedOn.toLocaleString(undefined, options)
            })

            // Add labels to module
            const labels = await note.getLabels();
            component.find(".labels").append(
                ...await Promise.all(labels.map(async (label) => {
                    return await Component("note-label.html", {
                        label: label.name,
                        color: label.color
                    })
                }))
            );

            $("#notes").append(component);
        }

        this.addNoteEventHandlers();
    }

    async loadLabelsIntoDOM() {
        $("#current-note-labels").find(".label--action").remove();

        const note = await this.getNote();
        const labels = await note.getLabels();
        $("#current-note-labels").append(
            ...await Promise.all(labels.map(async (label) => {
                return await Component("note-label-editable.html", {
                    label: label.name,
                    color: label.color,
                    id: label.id
                })
            }))
        );

        this.addLabelEventHandlers();
    }

    async loadSubjectsIntoDOM() {
        const subjects = await this.client.getSubjects();

        $("#subjects").find(".subject--action").remove();
        for (const subject of subjects) {
            $("#subjects").append(await Component("subject.html", {
                name: subject.name,
                note_count: subject.notes.length,
                id: subject.id,
                updated: subject.updatedOn.toLocaleString(undefined, options)
            }))
        }

        this.addSubjectEventHandlers();
    }

    addLabelEventHandlers() {
        const that = this;
        // Set up click listener
        $(".label-delete").on("click", async function () {
            const id = $(this).data("id");

            const note = await that.getNote();
            await note.removeLabelById(id);
            that.loadLabelsIntoDOM();
        });

        $("#add-label").on("click", async () => {
            const note = await that.getNote();
            const labels = await that.client.getLabels();

            bootbox.prompt({
                title: "Pick a label to add",
                inputType: "select",
                inputOptions: [...labels.map(label => {
                    return {
                        text: label.name,
                        value: label.id
                    }
                })],
                callback: async (result: any) => {
                    if (result) {
                        await note.addLabelById(result);
                        that.loadLabelsIntoDOM();
                    }
                }
            })
        })
    }

    addNoteEventHandlers() {
        const that = this;
        // Set up click listener
        $(".note--action").on("click", function () {
            const id = $(this).data("id");
            that.currentNoteId = id;
            that.highlightActiveNote();

            that.loadNote();
            goToNote();
        });

        $(".note--action .delete-this").on("click", function (event) {
            event.stopPropagation();
            that.deleteNoteCallback(event, $(this).data("id"));
        });

        $(".note--action .edit-this").on("click", function (event) {
            event.stopPropagation();
            that.editNoteCallback(event, $(this).data("id"));
        });
    }

    addSubjectEventHandlers() {
        const that = this;
        $(".subject--action").on("click", function () {
            // Remove any active labels...
            const id = $(this).data("id");
            if (id !== that.currentSubjectId) {
                that.editor.save().then(() => {
                    that.editor.destroyEditor();
                    that.clearCurrentNoteDisplay();
                });
            }

            that.currentSubjectId = id;
            that.highlightActiveSubject();

            that.loadNotesIntoDOM();
            goToNotes();
        })

        $(".subject--action .delete-this").on("click", function (event) {
            event.stopPropagation();
            that.deleteSubjectCallback(event, $(this).data("id"));
        });

        $(".subject--action .edit-this").on("click", function (event) {
            event.stopPropagation();
            that.editSubjectCallback(event, $(this).data("id"));
        });
    }


    addEventHandlers() {
        $("#go-to-subjects").on("click", (event) => goToSubjects());
        $("#go-to-notes").on("click", (event) => goToNotes());

        $("#add-subject").on("click", (event) => this.addSubjectCallback(event));
        $("#add-note").on("click", (event) => this.addNoteCallback(event));

        $("#edit-subject").on("click", (event) => this.editSubjectCallback(event));
        $("#edit-note").on("click", (event) => this.editNoteCallback(event));

        $("#delete-subject").on("click", (event) => this.deleteSubjectCallback(event));
        $("#delete-note").on("click", (event) => this.deleteNoteCallback(event));

        $("#saved").on("click", (event) => this.showSavedInfo());
        $("#settings-btn").on("click", (event) => this.showSettings());
        $("#logout").on("click", (event) => this.logout());
    }

    async refreshSubjectView() {
        await this.loadSubjectsIntoDOM();
        this.highlightActiveSubject();
        await this.loadNotesIntoDOM();
    }

    async loadNote() {
        addToolbarListener(this.editor);
        this.editor.destroyEditor();

        const note = await this.getNote();
        await this.setCurrentNoteDisplay();
        this.editor.createEditor(note);

        await this.loadLabelsIntoDOM();
    }

    // Auth flow
    async logout() {
        await this.client.logout();
        location.reload();
    }

    // Data control
    async removeLabelCallback(event: JQuery.ClickEvent, labelId: number) {
        const note = await this.getNote();
        await note.removeLabelById(labelId);
    }

    addSubjectCallback(event: JQuery.ClickEvent) {
        bootbox.prompt("Subject name?", async (result: string) => {
            if (result !== null) {
                await this.client.createSubject({ name: result });
                await this.loadSubjectsIntoDOM();
            }
        })
    }

    addNoteCallback(event: JQuery.ClickEvent) {
        if (this.currentSubjectId) {
            bootbox.prompt("Note title?", async (result: string) => {
                if (result !== null) {
                    await (await this.client.getSubject(this.currentSubjectId)).createNote({ title: result, content: "", label: [] });
                    await this.refreshSubjectView();
                }
            })
        }
    }

    editSubjectCallback(event: JQuery.ClickEvent, subjectId?: number) {
        const targetSubjectId = subjectId || this.currentSubjectId;
        if (targetSubjectId) {
            bootbox.prompt("New subject name?", async (result: string) => {
                if (result !== null) {
                    await (await this.client.getSubject(targetSubjectId)).setName(result);
                    await this.loadSubjectsIntoDOM();
                }
            });
        }
    }

    editNoteCallback(event: JQuery.ClickEvent, noteId?: number) {
        const targetNoteId = noteId || this.currentNoteId;
        if (targetNoteId) {
            bootbox.prompt("New note title?", async (result: string) => {
                if (result !== null) {
                    const subject = await this.client.getSubject(this.currentSubjectId);
                    await (await subject.getNote(targetNoteId)).setTitle(result);
                    await this.refreshSubjectView();
                }
            })
        }
    }

    deleteSubjectCallback(event: JQuery.ClickEvent, subjectId?: number) {
        const targetSubjectId = subjectId || this.currentSubjectId;
        if (targetSubjectId) {
            bootbox.confirm("Are you sure you want to delete this subject and all of its notes?", async (result: boolean) => {
                if (result) {
                    await this.client.api.subject.delete(targetSubjectId);
                    this.currentSubjectId = null;
                    await this.refreshSubjectView();
                    this.clearCurrentSubjectDisplay();
                }

            })
        }
    }

    deleteNoteCallback(event: JQuery.ClickEvent, noteId?: number) {
        const targetNoteId = noteId || this.currentNoteId;
        if (targetNoteId) {
            bootbox.confirm("Are you sure you want to delete this note?", async (result: boolean) => {
                if (result) {
                    this.editor.destroyEditor();
                    await this.client.api.note.delete(this.currentSubjectId, targetNoteId);
                    this.currentNoteId = null;
                    await this.refreshSubjectView();
                    this.clearCurrentNoteDisplay();
                }

            })
        }
    }


}

function goToSubjects() {
    $("#subject-column").addClass("d-flex").removeClass("d-none");
    $("#note-column").removeClass("d-flex").addClass("d-none");
}

function goToNotes() {
    // Change display focus...
    $("#subject-column").removeClass("d-flex").addClass("d-none");
    $("#editing-column").removeClass("d-block").addClass("d-none");
    $("#note-column").addClass("d-flex").removeClass("d-none");
}

function goToNote() {
    // Change display focus...
    $("#note-column").removeClass("d-flex").addClass("d-none");
    $("#editing-column").addClass("d-block").removeClass("d-none");
}

function strip(html: string) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
}
