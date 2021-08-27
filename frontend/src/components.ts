/**
 * Load components into HTML
 */


/* tslint:disable */
String.prototype.formatUnicorn = String.prototype.formatUnicorn ||
 function () {
     "use strict";
     let str = this.toString();
     if (arguments.length) {
         const t = typeof arguments[0];
         let key;
         const args = ("string" === t || "number" === t) ?
             Array.prototype.slice.call(arguments)
             : arguments[0];

         for (key in args) {
             str = str.replace(new RegExp("\\{" + key + "\\}", "gi"), args[key]);
         }
     }

     return str;
};
/* tslint:enable */


function loadDOMComponents(parent?: JQuery) {
    ($(parent || "*" as any) as any).find("[data-component]").each(function (index: number) {
        $(this).load("components/" + $(this).attr("data-component"), function () {
            // Allow components to load child components
            loadDOMComponents(this);
        })

    })
}


function loadBareComponent(name: string) {
    const element = $("<div></div>");
    element.load("components/" + name);
    return element;
}


function component(name: string, ...variables: any[]) {
    const element = loadBareComponent(name);

    element.html(element.html().formatUnicorn(...variables));

    return element;
}

$(document).ready(() => {
    loadDOMComponents()
});