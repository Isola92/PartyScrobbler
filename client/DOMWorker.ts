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

    public removeNode(id: string, parentId: string)
    {
        const parentNode = document.getElementById(parentId);
        const oldNode = document.getElementById(id);
        
        if(oldNode)
        {
            parentNode.removeChild(oldNode);
        }

    }

    /**
     * Adds a new node to a parent.
     * If an old node with the same ID already exists the old one is replaced
     */
    public addNode(newNodeId: string, newNode: DocumentFragment, parentId: string)
    {
        const parentNode = document.getElementById(parentId);
        const oldNode = document.getElementById(newNodeId);

        if(oldNode)
        {
            parentNode.replaceChild(newNode, oldNode);
        }
        else
        {
            parentNode.appendChild(newNode);
        }
    }

    /**
     * TOOK IT FROM THIS THREAD: http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
     * HOW ARE CLIENT SIDE QUERYSTRINGS NOT A LANGUAGE FEATURE YET SMH.
     */
    public queryString(name)
    {
        var url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results)
        {
            return null;
        }
        if (!results[2])
        {
            return '';
        }
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
}