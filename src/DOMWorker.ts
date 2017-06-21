/**
 * Utility class for modifying the DOM.
 * @constructor
 */
export class DomWorker
{
    public createElements(elementTypes, ids, texts, containerIncluded?)
    {
        let elements = [];

        elementTypes.forEach((elementType, index) =>
        {
            elements.push(document.createElement(elementType));

            if (ids)
            {
                elements[index].id = ids[index];
            }

            if (texts)
            {
                elements[index].textContent = texts[index] || '';
            }
        });

        if (containerIncluded)
        {
            this.appendChildren(elements[0], elements.slice(1, elements.length));
        }

        return elements;
    };

    public appendClassName(elements, className)
    {

        elements.forEach((element) =>
        {
            element.className = className;
        });

        return elements;
    };

    public appendChildren(parent, elements)
    {
        elements.forEach((element) =>
        {
            parent.appendChild(element);
        });
    };

}