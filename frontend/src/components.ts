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


    const loadComponentAndChildren = async ($component: JQuery) => {
        await loadComponentElement($component.attr("data-component"), $component)
        await loadDOMComponents($component);

    }

    for (const component of components) {
        const $component = $(component);
        componentPromises.push(loadComponentAndChildren($component));
    }

    await Promise.all(componentPromises);
}


export async function loadComponentElement(name: string, element: JQuery): Promise<JQuery> {
    await loadBareComponent(name, element);

    return element;
}


export function loadBareComponent(name: string, element?: JQuery): Promise<JQuery> {
    return new Promise((resolve, reject) => {
        const target = element ?? $("<div></div>");
        target.load("components/" + name, () => {
            resolve(target);
        });
    })
}


export async function Component(name: string, ...variables: any[]) {
    const element = await loadBareComponent(name);
    element.html(element.html().formatUnicorn(...variables));
    return element;
}