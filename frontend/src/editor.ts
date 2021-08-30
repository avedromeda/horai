import Note from "./api/wrapper/note";

export default class Editing {
    editor: MediumEditor;
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
            // Display last saved.
            // const date = new Date();

            // $("#last-saved").text("(last saved: " + date.toLocaleString() + ")");
            // localStorage.setItem("content-" + that.currentNote, $("#target").html());
            await note.setContent($("#target").html());
        });

        // $("#not-editing").hide();
    }

    destroyEditor() {
        if (this.editor !== null) {
            $("#toolbar").addClass("d-none");
            $("#target").addClass("d-none");


            this.editor.destroy();
            this.editor = null;
        }
    }
}

export function addToolbarListener(editor: Editing) {
    $(".toolbar-button").on("click", function () {
        editor.editor.execAction($(this).data("action"))
    })
}