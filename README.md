# DWDM Manager UI

### Development building
```git checkout dev```
```npm install```
```npm run serve```

### Production Building
To build a production instance of the service, run ```npm run webpack-prod``` this will build the UI

### Running a Production Instance 
```npm start``` - This will only work if the project has been built

### Build and Run With Docker
```docker build . -t dwdm-manager-ui```
```docker run -p 8000:8000 dwdm-manager-ui```

