# Orange Theory Node-API Test

[![N|Solid](/c1.jpg)]

This is a an API using Node and Express and POSTman is used to test it.

## The main workflow of this is that we will:
Have unprotected and protected routes
 - A user will authenticate by calling /api/authenticate and get back a token
- The user will store this token on their client-side and send it for every request
- We will validate this token, and if all is good, pass back information in JSON format
Our API will be built with:

- normal routes (not authenticated)
- route middleware to authenticate the token
- route to authenticate and get a token
- authenticated routes to get all users

## Tools Needed
- node and npm
- POSTman
## Getting Started

Let's take a look at our file structure for our Node application. server.js will contain all the functionalities.

### File Structure
----- models/
---------- user.js
------certs/
----- config.js
----- package.json
----- server.js
## AWS Cloud hosted mongodb
`https://mlab.com/databases/orange-theory-db`
 ### configure database in Config File (config.js)
 - you can either create local mongodb instance or create it in mLabs using cloud platform.
 - Following the format:
 - mongodb://<username>:<password>@ds153719.mlab.com:53719/orange-theory-d
 - secret: used when we create and verify JSON Web Tokens
- database: the URI with username and password to your MongoDB installation

        module.exports = {
        
        	'secret': 'fitnessOrangeTheory',
        	'database': 'mongodb://orange-theory-admin:greatorange@ds153719.mlab.com:53719/orange-theory-db'
      };
## Set Up Our Node Application 
   `npm install`
   `npm install -g nodemon`
### Start your server 
`nodemon server.js`

## Run The Actual Node Application (server.js)
`nodemon server.js`
In this file, we will:

### Grab All the Packages 
This will include the packages we installed earlier (express, body-parser, morgan, mongoose, and jsonwebtoken) and also we'll be grabbing the model and config that we created.

### Configure Our Application 
We will set our important variables, configure our packages, and connect to our database here.

### Create Basic Routes 
#### unprotected route
These are the unprotected routes like the home page (`http://localhost:8888/api`). We'll also create a /setup route here so that we can create a sample user in our new database.
 #### Protected route with ssl
` https://localhost:4433/api`
 In browser:
 - "The site's security certificate has expired!" is shown
 -  click "proceed anyway" (or "back to safety")
 
PostMan test:
 - To test in post man go to settings in wrench icon on top right corner and turn off ssl certificate verification
## PostMan collection is attached
 - use the postman.html or go to following link
 `https://www.getpostman.com/collections/9cc63dcd5d41e9022e8d`
### Create API Routes This includes the following routes:

GET https://localhost:4433/api/ 
No token attached , so will return 
-	Unauthorized users should be able to get a list of all saved data items 
•	ID and First & Last Name should only be returned
•	Ordered by Last Name, First Name
•	The calling client should be able to enable paging and page size

POST https://localhost:4433/api/authenticate get the token to be used in authenticated routes below. Save the token

    {
        "success": true,
        "message": "Enjoy your token!",
        "token": "eyJhbGciOiJIUzI1NiJ9.dHJ1ZQ.7p1yasaGzihJQDix5R_3Bhyih9v841RaW2JrOo2MqwY"
    }
### Configure in postman
-In Headers tab,
write in key - x-access-token
write in value - above token

-For Post requests in body tab
select x-www-urlformencoded  
and type your key and values.

GET https://localhost:4433/api/  
With above token configuration

    {
        "message": "Welcome to the OrangeFactory APIs!"
    }

### Logging
All the activities will be logged and you can see in command line
after you start the server `nodemon server.js`

GET https://localhost:4433/setup/:numUsers will initialize n number of users as specified in numUsers parameter , say GET https://localhost:4433/setup/5000 will set 5000 users.
  `credit card will be stored as encrypted record`
  `"creditcard": "$2a$08$jIvSFp9Lmf5HZTOY8o1k8ObPNYQ8IOb1JAmwpMv3VWasydG7hf6F2"`
GET https://localhost:4433/api/users get all the users in collection.

GET https://localhost:4433/api/usersLimit/:pageSize/:page
It gives number of records from the page number specified.
 sample call GET https://localhost:4433/api/usersLimit/5/3

POST https://localhost:4433/api/create
Creates a new user

GET https://localhost:4433/api/:id 
Returns user based on id.

PUT https://localhost:4433/api/:id 
Updates user value based on id

DEL https://localhost:4433/api/:id 
Deletes user based on id

DEL https://localhost:4433/api/users
Deletes all users from collection


GET http://localhost:8080/api/users List all users. This route is protected and will require a token.
With those things in our mind, let's start our server.js file:
###  Packages used
- express is the popular Node framework
- mongoose is how we interact with our MongoDB database
- morgan will log requests to the console so we can see what is happening
- body-parser will let us get parameters from our POST requests
- jsonwebtoken is how we create and verify our JSON Web Tokens


