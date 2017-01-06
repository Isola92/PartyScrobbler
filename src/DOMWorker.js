/**
 * Utility class for modifying the DOM.
 * @constructor
 */
function DomWorker(){

}

DomWorker.prototype.createElements = function(elementTypes, ids, texts, containerIncluded){
    let elements = [];

    elementTypes.forEach((elementType, index) =>{
        elements.push(document.createElement(elementType));

        if(ids){
            elements[index].id = ids[index];
        }

        if(texts){
            elements[index].innerHTML = texts[index] || '';
        }
    });

    if(containerIncluded){
        this.appendChildren(elements[0], elements.slice(1, elements.length));
    }

    return elements;
};

DomWorker.prototype.appendClassName = function(elements, className){

    elements.forEach((element) =>{
        element.className = className;
    });

    return elements;
};

DomWorker.prototype.appendChildren = function(parent, elements){
    elements.forEach((element) =>{
        parent.appendChild(element);
    });
};

export default DomWorker;