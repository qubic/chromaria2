/**
 * get settings
 **/
function getSettings(){
	var s = localStorage["settings"];
	return s == undefined ? s : JSON.parse(s);
}
/**
 * get default settings
 **/
function getDefaultSettings(){
	var s = {
		// enable notification
		"notificationEnabled": "true",
		// file extension
		"fileExtension": "gz, tgz, bz2, cab, zip, 7z, lzma, jar, rar, xz, txz, exe, rpm, deb, dmg, pkg",
		// aria2 JSON RPC
		"aria2RPCUri": "http://localhost:6800/jsonrpc"
	};
	return s;
}
/**
 * update settings
 **/
function updateSettings(s){
	localStorage["settings"] = JSON.stringify(s);
}
/**
 * create option
 **/
function getOption(m){
	var o = {
		type: "basic",
		title: "Chrome extension for aria2",
		message: m,
		iconUrl: "icons/48.png"
	};
	return o;
}
/**
 * Get file extension
 **/
function getFileExtension(filename) {
	return (/[.]/.exec(filename)) ? /[^.]+$/.exec(filename) : undefined;
}
/**
 * Return true when match specified file extension
 **/
function matchFileExtension(fileExtensions, filename) {
	if(fileExtensions != undefined){
		return fileExtensions.indexOf(getFileExtension(filename)) >= 0 ? true : false;
	}
}
/**
 * Show a notification
 **/
function notification(id, text){
	var option = getOption(text);
	var settings = getSettings();

	if (settings.notificationEnabled == true) {
		chrome.notifications.create(id, option, function(){});
	}
}

/**
 * Submit aria2 downlaod task
 **/
function submitTask(task, jsonRPCPath) {
	var request = new XMLHttpRequest();
	request.open("POST", jsonRPCPath + "?tm=" + (new Date()).getTime().toString(), true);
	request.setRequestHeader("Content-Type",	"application/x-www-form-urlencoded; charset=UTF-8");
	var content = JSON.stringify(task);
	request.send(content);
}

/**
 * Aria2 object
 **/
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


/**
 * initial variables
 **/
function initialize(){
	var settings = getSettings();
	if(settings == undefined){
		settings = getDefaultSettings();
		updateSettings(settings);
	}

	if (settings.extensionEnabled == "true") {
		var option = getOption("Chromaria2 enabled!");
		chrome.notifications.create("info", option, function(){});
	} else {
		var option = getOption("Click me to enable Chromaria2!");
		chrome.notifications.create("enableExtension", option, function(){});
	}
}

/**
 * Initialize on extension installed
 **/
chrome.runtime.onInstalled.addListener(function(){
	initialize();
});

/**
 * Clear notifications on notification clicked
 **/
chrome.notifications.onClicked.addListener(function(notificationId) {
	if(notificationId == "enableExtension") {
		var settings = getSettings();
		settings.extensionEnabled = "true";
		updateSettings(settings);

		notification("info", "Now reloading Chromaria2!");
		chrome.runtime.reload();
	}
	chrome.notifications.clear(notificationId, function(){});
});

/**
 * Clear notifications on notification closed
 **/
chrome.notifications.onClosed.addListener(function (notificationId, byUser) {
	chrome.notifications.clear(notificationId, function(){});
});

chrome.downloads.onDeterminingFilename.addListener(function(downloadItem, suggest) {
	suggest({
		filename: downloadItem.filename,
		conflict_action: 'overwrite',
		conflictAction: 'overwrite'
	});

	var settings = getSettings();

	if (settings.extensionEnabled == undefined) {
		return;
	}

	if (matchFileExtension(settings.fileExtension, downloadItem.filename)) {
		// create aria2 download task
		var downloadTask = aria2AddUri(downloadItem.url, downloadItem.filename);
		// submit aria2 download task
		submitTask(downloadTask, settings.aria2RPCUri);
		// cancel chrome download task
		chrome.downloads.cancel(downloadItem.id, function(s){});
		// show notification
		notification((new Date()).getTime().toString(), downloadItem.filename + "\nYour download will start shortly.");
	}
});
