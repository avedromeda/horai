import Note from "./api/wrapper/note";

export default class Editing {
    editor: MediumEditor;
    interval: number;
    lastSaved: Date;
    constructor () {
        this.editor = null;
    }

    createEditor (note: Note) {
        $("#target").removeClass("d-none");
        $("#toolbar").removeClass("d-none");

        this.editor = new MediumEditor('#target', {
            toolbar: false, /* {
                buttons: [
                    'bold',
                    'italic',
                    'underline',
                    'subscript',
                    'superscript',
                    'orderedlist',
                    'unorderedlist',
                    'anchor',
                    'h1',
                    'h2',
                    'h3',
                    'quote',
                    'table'
                ],
            }, */
            keyboardCommands: {
                commands: [
                    {
                        command: 'bold',
                        key: 'B',
                        meta: true,
                        shift: false,
                        alt: false
                    },
                    {
                        command: 'italic',
                        key: 'I',
                        meta: true,
                        shift: false,
                        alt: false
                    },
                    {
                        command: 'underline',
                        key: 'U',
                        meta: true,
                        shift: false,
                        alt: false
                    }
                ],
            },
            extensions: {
              table: new MediumEditorTable()
            },
            placeholder: false,
            autoLink: true
        });

        const content = note.content;

        if (content !== null) {
            // Load previous data
            $("#target").html(content)
        } else {
            // Default data
            $("#target").html("<p>Get started by writing here!</p>")
        }

        const that = this;
        this.editor.subscribe('editableInput', async (_event, _editable) => {
            $("#saved").addClass("d-none").removeClass("d-block");
            $("#not-saved").addClass("d-block").removeClass("d-none");
        });

        this.interval = setInterval(async () => {
            const newContent =  $("#target").html();
            if (note.content !== newContent) {
                this.lastSaved = new Date();
                await note.setContent(newContent);
            }


            $("#not-saved").addClass("d-none").removeClass("d-block");
            $("#saved").addClass("d-block").removeClass("d-none");
        }, 5000) as unknown as number;
    }

    destroyEditor() {
        if (this.editor !== null) {
            $("#toolbar").addClass("d-none");
            $("#target").addClass("d-none");


            this.editor.destroy();
            this.editor = null;
        }

        if (this.interval !== null) {
            clearInterval(this.interval);
            this.interval = null;
        }

        this.lastSaved = null;
    }
}

export function addToolbarListener(editor: Editing) {
    $(".toolbar-button").on("click", function () {
        editor.editor.execAction($(this).data("action"))
    })
}
