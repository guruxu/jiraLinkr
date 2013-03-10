var jiraBaseUrl;
var jiraProjKeys;
var jiraRegex;
chrome.extension.sendMessage({action: 'getJiraProjectKeys'}, function(response) {
    if (response) {
        jiraProjKeys = '(' + response + ')';
        jiraRegex = new RegExp('(' + jiraProjKeys + '-[1-9][0-9]{0,4})', 'ig');
    }
});

// find and replace Jira issue keys with proper links
function replaceJiraIssueKeyTextWithLink(element, pattern) {
    if (!jiraRegex) {
        return;
    }
    for (var i = 0; i < element.childNodes.length; i++) {
        var child = element.childNodes[i];
        if (child.nodeType == window.Node.ELEMENT_NODE &&
            child.getAttribute("__jiraLinkrIgnore_") != "true" &&
            child.nodeName != "A" &&
            child.nodeName != "SCRIPT") {
            // recurse if node is element, but not <a> since we don't want to mess with existing hyperlinks
            // or anything in <script>
                replaceJiraIssueKeyTextWithLink(child, pattern);
        } else if (child.nodeType == window.Node.TEXT_NODE) { // process it if plain text node
            if (child.data.match(jiraRegex)) {
                var oldText = child.data.toString();
                var span = document.createElement('span');
                child.parentNode.insertBefore(span, child);
                child.parentNode.removeChild(child);
                span.innerHTML = oldText.replace(jiraRegex, function(match, p1, offset, original) {
                    return '<a href="#" target="_blank">' + p1 + '</a>';
                });
                for (var j = 0; j < span.childNodes.length; j++) {
                    var aNode = span.childNodes[j];
                    if (aNode.nodeName == 'A') {
                        fixJiraUrl(aNode);
                        fixJiraTitle(aNode);
                    }
                }
            }
        }
    }
}

function fixJiraUrl(node) {
    if(!jiraBaseUrl) {
        chrome.extension.sendMessage({action: 'getJiraBaseUrl'}, function(response) {
            jiraBaseUrl = response;
            if (jiraBaseUrl) {
                node.href = jiraBaseUrl + '/browse/' + node.innerText.toUpperCase();
            }
        });
    } else {
        node.href = jiraBaseUrl + '/browse/' + node.innerText.toUpperCase();
    }
}

function fixJiraTitle(node) {
    chrome.extension.sendMessage({action: 'getJiraTitle', key: node.innerText.toUpperCase()}, function(response) {
        console.log(node.innerText + ":" + response);
        if (response) {
            node.setAttribute('title', node.innerText.toUpperCase() + ': ' + escapeHtml(response));
            node.className = 'jiraLinkr';
            node.style.paddingLeft = node.offsetHeight + 'px';
            node.style.paddingRight = (node.offsetHeight/10 > 0 ? node.offsetHeight/10 : 1) + 'px';
            node.style.borderRadius = node.offsetHeight/6 + 'px';
        } else {
            // remove the hyperlink if no response from jira API call
            var parent = node.parentNode;
            var content = node.innerHTML;
            var newNode = document.createElement('span');
            newNode.setAttribute("__jiraLinkrIgnore_", true);
            newNode.textContent = content;
            parent.insertBefore(newNode, node);
            parent.removeChild(node);
        }
    });
}

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&(?!amp;)/g, "&amp;")
        .replace(/<(?!lt;)/g, "&lt;")
        .replace(/>(?!gt;)/g, "&gt;")
        .replace(/"(?!quot;)/g, "&quot;");
}

// wait until everything in the DOM is loaded and displayed
window.onload = function() {
    chrome.extension.sendMessage({action: 'isPageDomainWatched', pageDomain: document.domain}, function() {
        replaceJiraIssueKeyTextWithLink(document.body, jiraRegex);
        // this addresses dynamic changes in the DOM made by javascript
        MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
        var observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                replaceJiraIssueKeyTextWithLink(mutation.target, jiraRegex);
            });
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    });
};