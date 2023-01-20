#!/bin/sh
ng build --configuration production --base-href ./
cd dist/ldpartmaker-web-app
awk '{gsub("type=\"module\"",""); print > "index.html"}' index.html
