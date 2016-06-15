#!/bin/bash

#conflictingreports

APP_PATH="/var/www/creports/"

function init {
    clear
    echo "------------------------------"
    echo "installing conflicting reports"
    echo "------------------------------"
    cd $APP_PATH
    updateSource
    updatePackages
    restartServer
}

function restartServer {
    echo "- restarting server"
    forever restartall
}

function updateSource {
    echo "- update source"
    git pull
}

function updatePackages {
    echo "- update packages"
    npm install
}

init
