// =================================================================
// get the packages we need ========================================
// =================================================================

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var http = require('http');
var https = require('https');
var path = require('path');
var fs = require('fs');
var certsPath = path.join(__dirname, 'certs', 'server');
var caCertsPath = path.join(__dirname, 'certs', 'ca');


var httpsOptions = {
	key: fs.readFileSync(path.join(certsPath, 'my-server.key.pem'))
	// This certificate should be a bundle containing your server certificate and any intermediates
	// cat certs/cert.pem certs/chain.pem > certs/server-bundle.pem
	, cert: fs.readFileSync(path.join(certsPath, 'my-server.crt.pem'))
	// ca only needs to be specified for peer-certificates
	//, ca: [ fs.readFileSync(path.join(caCertsPath, 'my-root-ca.crt.pem')) ]
	, requestCert: false
	, rejectUnauthorized: true
};


/*var app = function (req, res) {
  res.writeHead(200);
  res.end("hello world\n");
}*/

http.createServer(app).listen(8888);
https.createServer(httpsOptions, app).listen(4433);


var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
var User = require('./app/models/user'); // get our mongoose model

// =================================================================
// configuration ===================================================
// =================================================================
var port = process.env.PORT || 8080; // used to create, sign, and verify tokens

mongoose.connect(config.database); // connect to database
app.set('superSecret', config.secret); // secret variable

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

// =================================================================
// routes ==========================================================
// =================================================================
app.get('/setup/:numUsers',  (req, res) => {

	const numUsers = Number.parseInt(req.params.numUsers);
	// create bulk insert of data
	/*const times = n => f => {
		let iter = i => {
			if (i === n) return
			f(i)
			iter(i + 1)
		}
		return iter(0)
	}*/

	var dob = new Date(1980, 0, 31);
	var ccInit = '5467-1234';
	var ccin = 1234;
	//	var user_ = {};
	var insertedDocs = [];
	for (var i = 1; i <= numUsers; i++) {
		//var i = Math.floor(Math.random() * 100) + 1 ;
		dob.setMonth(dob.getMonth() + i);
		var user_ = new User({
			firstName: 'Carrie-' + i,
			lastName: 'Mcdirmit-' + i,
			birthday: dob,
			gender: 'Male',
			email: 'Carie' + i + '@gmail.com'
		});
		//creditcard: User.generateHash(ccInit + '-' + (ccin + i)),
		user_.creditcard = user_.generateHash(ccInit + '-' + (ccin + i));
		/*	user_.save(function (err) {
					if (err) throw err;
		
					console.log('User saved successfully');
					res.json({ success: true });
				}) */
		insertedDocs.push(user_);

	}
	User.collection.insert(insertedDocs, onInsert);

	function onInsert(err, insertedDocs) {
		if (err) {
			console.error("bulkinsert fail");
			// TODO: handle error
		} else {
			console.info('%d users were successfully stored.', insertedDocs["ops"].length);
			console.info("*********** Below are the users added");
			console.log(insertedDocs);
			
		}
	}
	/*var tsave = insertedDocs.map(usr => usr.save(function (err) {
		if (err) throw err;

		console.log('User saved successfully');
		res.json({ success: true });
	}));*/

	// Utility function to bulk insert



	/*	times(20)(i => user_ = new User({
			firstName: 'Carrie-' + i,
			lastName: 'Mcdirmit-' + i,
			date: dob.setMonth(dob.getMonth() + i),
			creditcard: User.generateHash(ccInit + '-' + (ccin + i)),
			gender: 'Male',
			email: 'Carie' + i + '@gmail.com'
		}),
			user_.save(function (err) {
				if (err) throw err;
	
				console.log('User saved successfully');
				res.json({ success: true });
			})) */


});

// basic route (http://localhost:8080)
app.get('/', function (req, res) {
	res.send('Hello! The API is at http://localhost:' + port + '/api');
});

// ---------------------------------------------------------
// get an instance of the apiRoutes for api routes
// ---------------------------------------------------------
var apiRoutes = express.Router();

// ---------------------------------------------------------
// authentication (no middleware necessary since this isnt authenticated)
// ---------------------------------------------------------
// http://localhost:8080/api/authenticate
apiRoutes.post('/authenticate',  (req, res) => {

	// find the user
	User.findOne({
		name: req.body.name
	}, function (err, user) {

		if (err) throw err;

		if (!user) {
			res.json({ success: false, message: 'Authentication failed. User not found.' });
		} else if (user) {

			var token = jwt.sign(true, app.get('superSecret'), {
				expiresIn: 86400 // expires in 24 hours
			});

			res.json({
				success: true,
				message: 'Enjoy your token!',
				token: token
			});
		}



	});
});

apiRoutes.post('/create',  (req, res) => {
	var i = 31;
	var ccInit = '5467-1234';
	var ccin = 1234;
	var dob = new Date(1980, 0, 31);

	dob.setMonth(dob.getMonth() + i);
	var user_ = new User({
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		birthday: req.body.birthday,
		gender: req.body.gender,
		email: req.body.email
	});
	//creditcard: User.generateHash(ccInit + '-' + (ccin + i)),
	user_.creditcard = user_.generateHash(req.body.creditcard);
	user_.save(function (err) {
		if (err) throw err;

		console.log('User saved successfully');
		res.json({ success: true, user: user_ });
	})




});

// ---------------------------------------------------------
// route middleware to authenticate and check token
// ---------------------------------------------------------
apiRoutes.use( (req, res, next) => {

	// check header or url parameters or post parameters for token
	var token = req.body.token || req.param('token') || req.headers['x-access-token'];

	// decode token
	if (token) {

		// verifies secret and checks exp
		jwt.verify(token, app.get('superSecret'),  (err, decoded) => {
			if (err) {
				return res.json({ success: false, message: 'Failed to authenticate token.' });
			} else {
				// if everything is good, save to request for use in other routes
				req.decoded = decoded;
				next();
			}
		});

	} else {

		// if there is no token
		// return an error
		User.find({}, ['firstName', 'lastName'],  (err, users) => {
			return res.status(403).send({
				success: false,
				message: 'No token provided.',
				users: users
			});
		});
		/*return res.status(403).send({
			success: false,
			message: 'No token provided.'
		});*/

	}

});

// ---------------------------------------------------------
// authenticated routes
// ---------------------------------------------------------
apiRoutes.get('/',  (req, res) => {
	res.json({ message: 'Welcome to the OrangeFactory APIs!' });
});

//const limit = 10 //for example


apiRoutes.get('/usersLimit/:pageSize/:page', (req, res) => {
	const page = Number.parseInt(req.params.page);
	const limit = Number.parseInt(req.params.pageSize);
	if (page && limit) {
		var promiseQuery = User.find({});
		var promiseQueryLimit = promiseQuery.then(function (data) {
			User.find({}).limit(limit).skip((page - 1) * limit).sort([['lastName', 1], ['firstName', 1]]).exec(function (err, users) {
				if (err) return handleError(err);
				res.json(users);
			})
		}, function (err) {
			console.error(err);
		});
	} else {
		res.sendStatus(400)
	}
})

/* below is without use of promise and lambda
apiRoutes.get('/usersLimit/:pageSize/:page', function (req, res) {
	//const page = 1;
	const page = Number.parseInt(req.params.page);
	const limit = Number.parseInt(req.params.pageSize);

	var query = User.find({});
	// limit our results to 5 items
	query.limit(limit).skip((page - 1) * limit);
	// sort by age
	//	query.sort({ firstName: -1 });
	query.sort([['lastName', 1], ['firstName', 1]]);

	// execute the query at a later time
	query.exec(function (err, users) {
		if (err) return handleError(err);
		res.json(users);
	})

}); */
apiRoutes.get('/users', (req, res) => {

	var promiseQuery = User.find({});
	var promiseQueryLimit = promiseQuery.then(function (data) {
		res.json(data);

	}, function (err) {
		console.error(err);
	});
});



// GETS A SINGLE USER FROM THE DATABASE
apiRoutes.get('/:id', (req, res) => {
	var promiseQuery = User.findById(req.params.id);

	var promiseQueryFind = promiseQuery.then(function (data) {
		if (!data) return res.status(404).send("No user found.");
		res.status(200).send(data);

	}, function (err) {
		console.error(err);
		return res.status(500).send("There was a problem finding the user.");
	});


});

// DELETES A USER FROM THE DATABASE
apiRoutes.delete('/:id',  (req, res) => {


	var promiseQuery = User.findByIdAndRemove(req.params.id);

	var promiseQueryDel = promiseQuery.then(function (data) {
		if (!data) return res.status(404).send("There was a problem deleting the user.");
		res.status(200).send("User: " + data.firstName + " was deleted.");

	}, function (err) {
		console.error(err);
		return res.status(500).send("There was a problem deleting the user.");
	}); 
});

// DELETES aLL USERS FROM THE DATABASE
apiRoutes.delete('/users',  (req, res) => {

	var promiseQuery = User.remove({});

	var promiseQueryDel = promiseQuery.then(function (data) {
		if (!data) return res.status(404).send("There was a problem deleting the user.");
		res.status(200).send("Users " + data + " are deleted.");

	}, function (err) {
		console.error(err);
		return res.status(500).send("There was a problem deleting the users.");
	}); 
});

// UPDATES A SINGLE USER IN THE DATABASE
apiRoutes.put('/:id',  (req, res) => {

	var promiseQuery = User.findByIdAndUpdate(req.params.id, req.body, { new: true });

	var promiseQueryPut = promiseQuery.then(function (data) {
		if (!data) return res.status(404).send("There was a problem updating the user.");
		res.status(200).send(data);

	}, function (err) {
		console.error(err);
		return res.status(500).send("There was a problem updating the user.");
	});

});

app.use('/api', apiRoutes);

// =================================================================
// start the server ================================================
// =================================================================
//app.listen(port);
//console.log('Magic happens at http://localhost:' + port);

