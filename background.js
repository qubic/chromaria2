/**
 * get settings
 **/

function getSettings() {
    var s = localStorage["settings"];
    return s == undefined ? s : JSON.parse(s);
}
/**
 * get default settings
 **/

function getDefaultSettings() {
    var s = {
        // enable extension:
        // file extension
        "fileExtension": "mkv,avi,mp4,wmv",
        // aria2 JSON RPC
        "aria2RPCUri": "http://localhost:6800/jsonrpc"
    };
    return s;
}
/**
 * update settings
 **/

function updateSettings(s) {
    localStorage["settings"] = JSON.stringify(s);
}
/**
 * create option
 **/

function getOption(m) {
    var o = {
        type: "basic",
        title: "To aria2",
        message: m,
        iconUrl: "icons/48.png"
    };
    return o;
}

function getOption2(m) {
    var o = {
        type: "basic",
        title: "Chrome extension for aria2",
        message: m,
        buttons: [{
            title: "OK"
        }, {
            title: "Cancel"
        }],
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
    if (fileExtensions != undefined) {
        return fileExtensions.indexOf(getFileExtension(filename)) >= 0 ? true : false;
    }
}
/**
 * Show a notification
 **/

function notification(id, text, withButtons) {
    var option;
    if (!withButtons) {
        option = getOption(text);
    } else {
        option = getOption2(text);
    }
    var settings = getSettings();
    chrome.notifications.create(id, option, function() {});
}

/**
 * Submit aria2 downlaod task
 **/

function submitTask(task, jsonRPCPath) {
    var request = new XMLHttpRequest();
    request.open("POST", jsonRPCPath + "?tm=" + (new Date()).getTime().toString(), true);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
    var content = JSON.stringify(task);
    request.send(content);
}

/**
 * Aria2 object
 **/

function aria2AddUri(url, name, header) {
    var o = [{
        "jsonrpc": "2.0",
        "method": "aria2.addUri",
        "id": (new Date()).getTime().toString(),
        "params": [
            [url],
            {
                "out": decodeURI(name),
                "header": header
            }]
    }];
    return o;
}


/**
 * initial variables
 **/

function initialize() {
    var settings = getSettings();
    if (settings == undefined) {
        settings = getDefaultSettings();
        updateSettings(settings);
    }

}

function updateTips(t) {
    tips.text(t).addClass("ui-state-highlight");
    setTimeout(function() {
        tips.removeClass("ui-state-highlight", 1500);
    }, 500);
}

function checkLength(o, n, min, max) {
    if (o.val().length > max || o.val().length < min) {
        o.addClass("ui-state-error");
        updateTips("Length of " + n + " must be between " + min + " and " + max + ".");
        return false;
    } else {
        return true;
    }
}

/**
 * Initialize on extension installed
 **/
chrome.runtime.onInstalled.addListener(function() {
    initialize();
});

/**
 * Clear notifications on notification closed
 **/
chrome.notifications.onClosed.addListener(function(notificationId, byUser) {
    chrome.notifications.clear(notificationId, function() {});
});

chrome.downloads.onDeterminingFilename.addListener(function(downloadItem, suggest) {
    // pause chrome download task
    chrome.downloads.pause(downloadItem.id, function() {});
    var settings = getSettings();
    suggest({
        filename: downloadItem.filename,
        conflict_action: 'uniquify',
        conflictAction: 'uniquify'
    });
    var cookiesStr = 'Cookie: ';
    chrome.cookies.getAll({
        url: downloadItem.url
    }, function(cookies) {
        cookies.forEach(function(entry) {
            cookiesStr += entry.name + '=' + entry.value + '; ';
        });
        if (matchFileExtension(settings.fileExtension, downloadItem.filename)) {
            // create aria2 download task
            var downloadTask = aria2AddUri(downloadItem.url, downloadItem.filename, cookiesStr);
            // submit aria2 download task
            submitTask(downloadTask, settings.aria2RPCUri);
            // cancel chrome download task
            chrome.downloads.cancel(downloadItem.id, function() {});
            // show notification
            notification((new Date()).getTime().toString(), downloadItem.filename + "\nYour download will start shortly.");
        } else {
            // show notification
            notification((new Date()).getTime().toString(), downloadItem.filename + "\nSend to Aria2?", true);
            chrome.notifications.onButtonClicked.addListener(function(notificationId, buttonIndex) {
                if (buttonIndex == 0) {
                    // create aria2 download task
                    var downloadTask = aria2AddUri(downloadItem.url, downloadItem.filename, cookiesStr);
                    // submit aria2 download task
                    submitTask(downloadTask, settings.aria2RPCUri);
                    chrome.downloads.cancel(downloadItem.id, function() {});
                } else {
                    chrome.downloads.resume(downloadItem.id, function() {});
                }
                chrome.notifications.clear(notificationId, function(wasCleared) {})
            });
        }
    });
});