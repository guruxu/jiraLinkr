jiraLinkr
=========

A Chrome extension that turns any recognizable Jira issue key on a web page from text to a hyperlink that points to the issue URL with its mouseover tooltip showing the summary of the Jira issue.

![Image](../master/sample.png?raw=true)


Background
==========

I've been using Jira for the last 6-7 years and I've been pretty happy with it. However, I'm bad with numbers. To be precise, I'm bad with the meaning behind numbers. Some people have the natural ability to relate a Jira issue key such as "`SERVER-123`" to "`Memory leak detected after indexing service running overnight`", without searching their memory cells. I often times can't even tell the Jira issue key for the work I'm currently doing.

With more and more emails, IMs, blogs, wiki pages coming my way that contain these Jira issue keys, I find myself increasing repeating the task of copying the text, opening a new brower tab, loading Jira UI, pasting the text to do a search, then finally I got to see what the thing is all about. I can't ask others to always hyperlink the Jira issue keys before they send the message, that's hassle for them too. So the burden is on me to find an easier way to get I want very quickly.


Design
======

I use Chrome and all my regular communication apps are web based. So writing a [Chrome extension](http://developer.chrome.com/extensions/getstarted.html "Chrome Extension") makes natural sense. The goal is for the content script to dynamically inspect the DOM for text nodes that match a pattern for my Jira keys, then change it to a href with some visual decoration.

[DOM Mutation Events](https://developer.mozilla.org/en-US/docs/DOM/Mutation_events "Mutation Events") helps to simplify things considerably. I can rely on it to tell me anything in the subtree has changed and go to that subtree to look for the Jira key pattern without having to rescan the DOM every time.

The regex is pretty simple for now: `/(PRJA|PRJB|PRJC|PRJB)-[1-9][0-9]{0,3})/ig`. The list of project keys can be either dynamically fetched from the Jira server (then cached), or users can manually specify a list. The extension options also allow users to control with sites, by domain, they want to enable this extension.

The backend for the extension is simply the [Jira REST API](https://developer.atlassian.com/display/JIRADEV/JIRA+REST+APIs "Jira REST API"). So for the extension to work, you will need your Jira server accessible from your browser and you have pre-authenticated your session, if needed.


Todo
====
- More testing needed as I have noticed some odd case performance issues
- Better regex for key matching
- Expose more config for personalization
- A disable/enable browser action button
- Replace the simple href hover for title with something like a real mouseover issue card Greenhopper style
- Firefox add-on?

