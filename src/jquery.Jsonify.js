/*
 * Jsonify
 * https://github.com/aion/jsonify
 *
 * Copyright (c) 2014 Aion Oliveira
 * Licensed under the MIT license.
 */




(function($) {

  var NOT_VALID_XML_DOCUMENT = -1;
  var resultObj = null;

  var obj = Object.prototype;
  Object.defineProperty(obj, "parentObject", {get: function() {

      if (!this.__parentChecked) {
        
        if (this.__self) {
          this.__parent = this.__self;
        } else {
          this.__parent = null;
        }
        
        Object.getPrototypeOf(this).__self = this;
        //this.__proto__.__self = this;
        this.__parentChecked = true;
        
      }
      
      return this.__parent;
      
    }
  });

  function Jsonify(XMLDocument) {
    
    try {
      isValidXMLDocument(XMLDocument);
      resultObj = convertToJSON(XMLDocument);
    }
    catch (e) {
      if (e instanceof XMLDocumentException) {
        console.error(e.toString() + NOT_VALID_XML_DOCUMENT);
      }
    }
    
    return resultObj;
    
  }


  function isValidXMLDocument(XMLDocument) {
    var isNotValid = (XMLDocument.toString() !== "[object XMLDocument]");

    if (isNotValid) {
      throw new XMLDocumentException(XMLDocument);
    }
  }


  function convertToJSON(XMLDocument) {

    var JSONDocument = {},
            rootElement = XMLDocument.documentElement;



    JSONDocument = starter(JSONDocument, rootElement);

    return JSONDocument;

  }

  function starter(JSONObject, element) {

    var object = JSONObject;



    if (element.hasChildNodes()) {

      object = makeTreeBranch(element, JSONObject);

    }

    return object;
  }


  function makeTreeBranch(element, object) {

    var child = element;


    if (!theElementIsMarked(child)) {

      addTransformedChild(child, object);

    }

    return object;
  }

  function findElementIndex(element) {

    if (element.parentElement) {

      var parent = element.parentElement;

      var i = 0;
      for (var childIndex = 0; childIndex < parent.childNodes.length; childIndex++) {

        if (parent.childNodes[childIndex].toString() !== "[object Text]") {
          
          if (!theElementIsMarked(parent.childNodes[childIndex])) {
            markTheElement(element);
            return i;
          }
          
          i++;
          
        }
      }
    }
    else
    {
      return 0;
    }

  }

  function seedMaker(element, object, name) {

    if (stepIn(element))
    {
      element = stepIn(element);
      object[name].parentObject;
      makeTreeBranch(element, object[name]);
    }
    else if (stepOut(element)) {

      while (!hasValidChildren(element)) {

        if (stepOut(element)) {
          element = stepOut(element);

        } else {
          
          while (object.parentObject) {
            object = object.parentObject;
          }
          break;
          
        }
      }

      if (stepIn(element))
      {
        if (!stepOut(element)) {

          while (object.parentObject) {
            object = object.parentObject;
          }
        }
        element = stepIn(element);
        makeTreeBranch(element, object);
      }


    }
  }

  function addTransformedChild(element, object) {

    var elementTransformed = transformElement(element);

    var name = elementTransformed[0] + "_" + findElementIndex(element);

    object[name] = elementTransformed[1];

    seedMaker(element, object, name);


  }

  function transformElement(element) {

    var JSONElementAttributes = new Object(),
            JSONElementName = "";

    JSONElementName = extractElementName(element);
    JSONElementAttributes = extractElementAttributes(element);

    if (element.childNodes.length <= 1 && isTheObjectEmpty(JSONElementAttributes)) {
      JSONElementAttributes.text = element.textContent;
      JSONElementAttributes = new Object(JSONElementAttributes);

    }



    return [JSONElementName, JSONElementAttributes];
  }

  function extractElementName(element) {
    var nodeName = element.nodeName;
    nodeName.replace(':', '_');
    nodeName.replace('-', '__');

    return nodeName.toLowerCase();
  }

  function extractElementAttributes(element) {

    var JSONTempElement = new Object(),
            attributes = element.attributes,
            length = element.attributes.length;
    
    for (var attr = 0; attr < length; attr++) {

      JSONTempElement[attributes[attr].name] = attributes[attr].value;

    }

    return JSONTempElement;

  }

  function hasValidChildren(element) {

    if (element.hasChildNodes()) {

      for (var child = 0; child < element.childNodes.length; child++) {
        if (element.childNodes[child].toString() !== "[object Text]") {
          if (!theElementIsMarked(element.childNodes[child])) {
            return true;
          }
        }
      }
    } else {
      return false;
    }
    return false;
  }

  function stepIn(element) {

    if (element.hasChildNodes()) {

      for (var child = 0; child < element.childNodes.length; child++) {
        if (element.childNodes[child].toString() !== "[object Text]") {
          
          if (!theElementIsMarked(element.childNodes[child])) {
            return element.childNodes[child];
          }
          
        }
      }
    } else {
      return false;
    }

  }

  function stepOut(element) {

    if (element.parentElement) {
      return element.parentElement;
    } else {
      return false;
    }
  }

  function markTheElement(element) {
    if (!theElementIsMarked(element)) {
      element.setAttribute("jsonify", true);
    }
  }

  function theElementIsMarked(element) {
    return element.hasAttribute("jsonify");
  }

  function XMLDocumentException(value) {
    this.value = value;
    this.message = " is not a valid XML document.";
    this.toString = function() {
      return (this.value + this.message);
    };
  }

  function isTheObjectEmpty(object) {
    var itens = 0;
    for (var prop in object) {
      itens++;
    }

    if (itens > 1) {
      return false;
    }

    return true;
  }

  $.jsonify = Jsonify;

})(jQuery); 
