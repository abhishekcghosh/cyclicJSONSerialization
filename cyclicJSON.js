// node constructor
function Node(key, value) {
	this.name = key;
	this.value = value;
	this.next = null;
}

function normalStringify(jsonObject) {
	// this will generate an error when trying to serialize
	// an object with cyclic references
	return JSON.stringify(jsonObject);
}

function cyclicStringify(jsonObject) {
	// this will successfully serialize objects with cyclic
	// references by supplying @name for an object already
	// serialized instead of passing the actual object again,
	// thus breaking the vicious circle
	var alreadyVisited = [];
    var serializedData = JSON.stringify(jsonObject, function(key, value) {
        if (typeof value == "object") {
            if (alreadyVisited.indexOf(value.name) >= 0) {
                // do something other that putting the reference, like 
                // putting some name that you can use to build the 
                // reference again later, for eg.
                return "@" + value.name;
            }
            alreadyVisited.push(value.name);
        }
        return value;
    });
    //console.log(serializedData);
    return serializedData;
}


function recreateNode(obj, nodeArr) {
	// create new node from object
	var newNode = new Node(obj.name, obj.value);
	// push into provided array for reference
	nodeArr.push(newNode);
	if (obj.hasOwnProperty("next")) {
		// if points to another node	
		if (typeof obj.next == "object") {
			// and that another node is an actual node and not named reference		
			// create the new node and attach to this node
			newNode.next = recreateNode(obj.next, nodeArr);	
		} else if (obj.next.indexOf("@") == 0) {
			// else if its a named reference using a @
			// get the name
			var nodeName = obj.next.substr(1, obj.next.length);
			// find which node to attach from already created nodes
			for (i = 0; i < nodeArr.length; i++) {
				if (nodeArr[i].name == nodeName) {
					newNode.next = nodeArr[i];
					break;
				}
			}			
		}
	}
	// return this node
	return newNode;
}


function recreate(jsonString) {
	// create an array to store all the created nodes from JSON data
	var nodeArray = [];
	// get object from serialized JSON
	var jsonObject = JSON.parse(jsonString);
	// create nodes from JSON object
	recreateNode(jsonObject, nodeArray);
	// return the array of created nodes
	return nodeArray;
}

function runDemo() {
	//create some nodes
	var n1 = new Node("A", 1);
	var n2 = new Node("B", 2);
	var n3 = new Node("C", 3);
	var n4 = new Node("D", 4);
	// set up some cyclic references
	n1.next = n2;
	n2.next = n3;
	n3.next = n4;
	n4.next = n1;
	// serialize
	var sData = cyclicStringify(n1);
	// recreate 
	var rData = recreate(sData);
	// show the resultant nodes in an array
	console.log(rData);
}