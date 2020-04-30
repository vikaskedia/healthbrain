# healthbrian

## Used Technologies
Front-end framework: [Vue.js](http://vuejs.org/)

UI Library: [Bootstrap-vue](https://bootstrap-vue.org/)

## How to use run the each components
Open the component directory. (ex. recommendation-card).

Install the dependencies
```
npm install
```
After that run the Vue application run the following URL
```
npm run serve
```

## How to publish components to the NPM
First sign-in to the NPM library
```
npm login
```
On the each component directory, please type the following commands. Then you'll get the destination file on the "dist" folder.
```
npm run build:npm
```
After build the component, publish the component by using the follow command.
```
npm publish
```

