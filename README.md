# D3v4-BubbleChart
Creating a bubble chart based on word usage in the New Testament vs the Bhagavad Gita

## Description
This repository contains a word analysis of the New Testament (Bible) and the Bhagavad gita to comare language used and practice D3 version 4 force layouts.

## Running
D3 needs to be run from a web server due to how it imports data files.

To run this visualization locally from the Terminal, navigate to the directory you checked it out to.
`cd ~/code/path/to/D3v4-BubbleChart`

Then start a webserver locally. If you are on a Linux or Mac, you should be able to use python's built in webserver:
`python -m SimpleHTTPServer 3000`

Alternatively, I have switched to using node's http-server for local hosting.

Ensure you have the node package installed:
`npm install -g http-server`

And then run it in the root directory of the repository.
`http-server`

## Disclaimer

I'm still working out some of the kinks with the search function and plan on styling the page a bit better in the future.
