function downloadMonitor(o) {
	if (matchFileSubfix(o.filename)) {
		this.task = aria2AddUri(o.url, o.filename);
		submitTask(this.task, path);
		chrome.downloads.cancel(o.id, function(s){});
		showNotification(o.filename + "\nYour download will start shortly.")

	}
}

function showNotification(msg) {
	// showNotification
	var opt = {
		type: "basic",
		title: "Aria2 for Chrome",
		message: msg,
		iconUrl: "icons/48.png"
	};
	chrome.notifications.create("info", opt, notifyCallback);
	chrome.notifications.clear("info", opt, notifyCallback);
}

function notifyCallback(o) {
	// do something
	return true;
}

// Return true when match specified file subfix
function matchFileSubfix(filename) {
	return subfix.indexOf(getFileSubfix(filename)) >= 0 ? true : false;
}

// Get File extension
function getFileSubfix(filename) {
	return (/[.]/.exec(filename)) ? /[^.]+$/.exec(filename) : undefined;
}

// submit task
function submitTask(task, jsonRPCPath) {
	var request = new XMLHttpRequest();
	/*
	   request.onreadystatechange = function() {
	// in case of network errors this might not give reliable results
	if ( this.readyState == this.DONE) {
	if ( this.status == 200 ) {
	return;
	} else {
	showNotification("HTTP" + this.status + "\nSorry, an error occurred.")
	}
	}
	};
	*/
	request.open("POST", jsonRPCPath + "?tm=" + (new Date()).getTime().toString(), true);
	request.setRequestHeader("Content-Type",	"application/x-www-form-urlencoded; charset=UTF-8");
	request.send(JSON.stringify(task));
}

///////////
// Aria2 //
///////////
function aria2AddUri(url, name) {
	var o = [ {
		"jsonrpc" : "2.0",
		"method" : "aria2.addUri",
		"id" : (new Date()).getTime().toString(),
		"params" : [ [ url ], {
			"out" : decodeURI(name)
		} ]
	} ];
	return o;
}


var path = localStorage["path"];
var subfix = localStorage["subfix"];
chrome.downloads.onDeterminingFilename.addListener(downloadMonitor);
