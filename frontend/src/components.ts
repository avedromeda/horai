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


export async function loadDOMComponents(parent?: JQuery) {
    // Load dom expected as list
    const components = ($(parent || "*" as any) as JQuery).find("[data-component]").toArray();
    const componentPromises: Promise<any>[] = [];

    for (const component of components) {
        const $component = $(component);
        componentPromises.push(loadComponentElement($component.attr("data-component"), $component));
        componentPromises.push(loadDOMComponents($component));
    }

    await Promise.all(componentPromises);
    console.log("loaded")
}


export async function loadComponentElement(name: string, element: JQuery): Promise<JQuery> {
    const component = await loadBareComponent(name);

    element.replaceWith(component);

    return element;
}


export function loadBareComponent(name: string): Promise<JQuery> {
    return new Promise((resolve, reject) => {
        const element = $("<div></div>");
        element.load("components/" + name, () => {
            resolve(element);
        });
    })
}


export async function Component(name: string, ...variables: any[]) {
    const element = await loadBareComponent(name);
    element.html(element.html().formatUnicorn(...variables));
    return element;
}