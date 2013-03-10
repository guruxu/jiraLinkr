// handle events from foreground pages
chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action == "getJiraBaseUrl") {
        sendResponse(getJiraBaseUrl());
        return;
    }

    if (request.action == "getJiraTitle") {
        getJiraTitle(request.key, sendResponse);
        return;
    }

    if (request.action == "getJiraProjectKeys") {
        getJiraProjectKeys(sendResponse);
        return;
    }

    if (request.action == "isPageDomainWatched") {
        var pageDomain = request.pageDomain.toLowerCase();
        var watchedDomains = localStorage["jiraWatchDomains"];
        if (watchedDomains) {
            var domains = watchedDomains.split(',');
            for (var i = 0; i < domains.length; i++) {
                if (pageDomain == domains[i].toLowerCase()) {
                    sendResponse();
                    return;
                }
                var domain = domains[i].startsWith('.') ? domains[i].toLowerCase() : '.' + domains[i].toLowerCase();
                if (pageDomain.endsWith(domain)) {
                    sendResponse();
                    return;
                }
            }
        } else {
            sendResponse();
        }
    }
});

function getJiraBaseUrl() {
    return localStorage["jiraBaseUrl"];
}

function getJiraTitle(key, callback) {
    if (!getJiraBaseUrl()) return;
    var endpoint = getJiraBaseUrl() + '/rest/api/2/issue/' + key;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", endpoint, false);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            var response;
            if (xhr.status == 200) {
                if (xhr.responseText) {
                    var fields = JSON.parse(xhr.responseText).fields;
                    if (fields) {
                        response = fields.summary;
                    } else {
                        console.log('Issue title not available for ' + key);
                    }
                } else {
                    console.log('Issue detail not available for  ' + key);
                }
            } else {
                console.log('Error calling Jira server for ' + key);
            }
            if (callback) {
                callback(response);
            }
        }
    };
    xhr.send();
}

function getJiraProjectKeys(callback) {
    if (!getJiraBaseUrl()) return;

    var jiraProjectChoice = localStorage["jiraProjectChoice"];
    var jiraProjectRefreshFrequency = localStorage["jiraProjectRefreshFrequency"];
    var jiraProjectKeys = localStorage["jiraProjectKeys"];

    // use user defined project keys
    if (jiraProjectChoice == "custom" && jiraProjectKeys) {
        jiraProjectKeys = jiraProjectKeys.replace(/,/g, '|');
        callback(jiraProjectKeys);
        return;
    }

    // use cached projects if recently updated from server, expiration threshold defined by user
    if (localStorage["cachedJiraProjectKeys"]) {
        var cachedJiraProjectKeysJson = JSON.parse(localStorage["cachedJiraProjectKeys"]);
        var cachedJiraProjectKeys = cachedJiraProjectKeysJson.projectKeys;
        var now = new Date().getTime();
        jiraProjectRefreshFrequency = jiraProjectRefreshFrequency ? jiraProjectRefreshFrequency : 24;
        jiraProjectRefreshFrequency = jiraProjectRefreshFrequency*3600*1000;
        if (cachedJiraProjectKeys && (now - cachedJiraProjectKeysJson.timestamp) < jiraProjectRefreshFrequency) {
            callback(cachedJiraProjectKeys.join('|'));
            return;
        }
    }

    var endpoint = getJiraBaseUrl() + '/rest/api/2/project';
    var xhr = new XMLHttpRequest();
    xhr.open("GET", endpoint, false);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            var response = JSON.parse(xhr.responseText);
            if (response) {
                var keys = [];
                for (var i = 0; i < response.length; i++) {
                    keys.push(response[i].key);
                }
                if (keys.length > 0) {
                    var now = new Date().getTime();
                    localStorage["cachedJiraProjectKeys"] = JSON.stringify({
                        'timestamp': now,
                        'projectKeys': keys
                    });
                    callback(keys.join('|'));
                }
            }
        } else {
            console.log('Error retrieving detail for ' + key);
        }
    };
    xhr.send();
}

if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str){
        return this.slice(0, str.length) == str;
    };
}

if (typeof String.prototype.endsWith != 'function') {
    String.prototype.endsWith = function (str){
        return this.slice(-str.length) == str;
    };
}