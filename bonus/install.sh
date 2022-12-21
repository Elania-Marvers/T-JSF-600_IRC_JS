#!/bin/bash
pushd ..
node -v
npm -v

npm init -y
npm install express socket.io
npm install react react-dom
popd