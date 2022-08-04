# DWDM Manager UI
This is a POC for my boy Scott. Scott, if you look at this, make me proud and turn this into a production system. 

# Features
* Node management and map placement
* Manage spans and link nodes together
* Attach wavelengths to spans and create circuits
* View circuit map and path from async search

# Backend Service
Refere to the dwdm-manager-service for the backend API server
https://github.com/dot1q/dwdm-manager-service

![alt text](/src/assets/img/readme/main-page.PNG)
![alt text](/src/assets/img/readme/circuit-search.PNG)
![alt text](/src/assets/img/readme/edit-wavelength.PNG width="200" )
![alt text](/src/assets/img/readme/circuit-map.PNG)

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

