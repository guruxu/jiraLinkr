function save_options() {
    var warnings = document.getElementsByClassName("warning");
    Array.prototype.forEach.call(warnings, function(warning) {
       warning.style.display = "none";
    });

    var jiraBaseUrl = document.getElementById("jiraBaseUrl").value.trim();
    if (! jiraBaseUrl.match(/^https?:\/\/.+\..+/)) {
        document.getElementById("jiraBaseUrlWarning").style.display = "block";
        return;
    }
    if (localStorage["jiraBaseUrl"] != jiraBaseUrl) {
        localStorage["jiraBaseUrl"] = jiraBaseUrl.replace(/\/$/, '');
        localStorage.removeItem("cachedJiraProjectKeys");
    }

    localStorage["jiraProjectChoice"]  = document.querySelector('input[name=jiraProjectChoice]:checked').value;

    var jiraProjectRefreshFrequency = document.getElementById("jiraProjectRefreshFrequency").value.trim();
    if (jiraProjectRefreshFrequency) {
        if (jiraProjectRefreshFrequency.match(/^[1-9]\d*$/)) {
            localStorage["jiraProjectRefreshFrequency"] = jiraProjectRefreshFrequency;
        } else {
            document.getElementById("jiraProjectRefreshFrequencyWarning").style.display = "block";
            return;
        }
    } else {
        localStorage.removeItem("jiraProjectRefreshFrequency");
    }

    var jiraProjectKeys = document.getElementById("jiraProjectKeys").value;
    jiraProjectKeys = jiraProjectKeys.replace(/\s+/g, '').replace(/,,+/g, ',').replace(/,+$/, '').toUpperCase();
    if (jiraProjectKeys) {
        localStorage["jiraProjectKeys"] = jiraProjectKeys;
    } else {
        localStorage.removeItem("jiraProjectKeys");
    }

    var jiraWatchDomains = document.getElementById("jiraWatchDomains").value;
    jiraWatchDomains = jiraWatchDomains.replace(/\s+/g, '').replace(/,,+/g, ',').replace(/,+$/, '').toLowerCase();
    if (jiraWatchDomains) {
        localStorage["jiraWatchDomains"] = jiraWatchDomains;
    } else {
        localStorage.removeItem("jiraWatchDomains");
    }

    // Update status to let user know options were saved.
    var status = document.getElementById("status");
    status.innerHTML = "Options Saved.";
    setTimeout(function() {
        status.innerHTML = "";
    }, 750);
}

function restore_options() {
    var jiraBaseUrl = localStorage["jiraBaseUrl"];
    if (jiraBaseUrl) {
        document.getElementById("jiraBaseUrl").value = jiraBaseUrl;
    }

    var jiraProjectChoice = localStorage["jiraProjectChoice"];
    if (jiraProjectChoice == "custom") {
        document.querySelector("input[type=radio][name=jiraProjectChoice][value=default]").checked = false;
        document.querySelector("input[type=radio][name=jiraProjectChoice][value=custom]").checked = true;
    }

    var jiraProjectRefreshFrequency = localStorage["jiraProjectRefreshFrequency"];
    if (jiraProjectRefreshFrequency) {
        document.getElementById("jiraProjectRefreshFrequency").value = jiraProjectRefreshFrequency;
    }

    var jiraProjectKeys = localStorage["jiraProjectKeys"];
    if (jiraProjectKeys) {
        document.getElementById("jiraProjectKeys").value = jiraProjectKeys;
    }

    var jiraWatchDomains = localStorage["jiraWatchDomains"];
    if(jiraWatchDomains) {
        document.getElementById("jiraWatchDomains").value = jiraWatchDomains;
    }
}

document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);