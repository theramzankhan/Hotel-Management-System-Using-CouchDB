const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const NodeCouchDb = require('node-couchdb');

const couch = new NodeCouchDb({
	auth: {
		user:'admin',
		password:'12345'
	}
});

const dbName = 'customers';
const viewUrl = '_design/all_customers2/_view/all'

couch.listDatabases().then(function(dbs){
    console.log(dbs);
});

const app = express();

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/', function(req, res)
{
	couch.get(dbName, viewUrl).then(
		function(data,headers,status){
			console.log(data.data.rows);
			res.render('index',{
				customers:data.data.rows,
				status: false
			})
		},
		function(err){
			res.send(err);
		})
});

app.post('/customer/add', function(req,res){
	const name=req.body.name;
	const email=req.body.email;
	const Gender=req.body.Gender;
	const DOB=req.body.DOB;
	const Address=req.body.Address;
	const City=req.body.City;
	const State=req.body.State;
	const Country=req.body.Country;
	console.log('Body')
	console.log(req.body)
	couch.uniqid().then(function(ids){
		const id=ids[0];

		couch.insert('customers',{
			_id: id,
			name:name,
			email:email,
			Gender:Gender,
			DOB:DOB,
			Address:Address,
			City:City,
			State:State,
			Country:Country
		}).then(
		function(data,headers,status){
			// res.send({ status: 'ok'});
			// res.redirect('/customer/info')
			// res.redirect('/')
			console.log('Here')
			console.log(data)
			res.render('index',{
				customers:data.data.rows,
				status: true
			})
		});
	});
});



app.get('/customer/info', (req, res) => {
	couch.get(dbName, viewUrl).then(
		function(data,headers,status){
			console.log('------hsis')
			console.log(data.data.rows);
			console.log(data)
			res.render('info',{
				customers:data.data.rows
			})
		},
		function(err){
			res.send(err);
		})
})

app.post('/customer/delete/:id',function(req,res){
	const id=req.params.id;
	const rev=req.body.rev;
	couch.del(dbName,id,rev).then(
		function(data,headers,status){
			res.redirect('/customer/info');
		},
		function(err){
			res.send(err);
		});
})

app.post('/customer/c/:id',function(req,res){
	const id=req.params.id;
	const rev=req.body.rev;
	couch.get(dbName, id)
		.then((r) => {
			console.log(r.data)
			res.render('update',{
				customer:r.data
			})
		})
})

app.post('/customer/update/:id',function(req,res){
	const id=req.params.id;
	const rev=req.body.rev;
	const name=req.body.name;
	const email=req.body.email;
	const Gender=req.body.Gender;
	const DOB=req.body.DOB;
	const Address=req.body.Address;
	const City=req.body.City;
	const State=req.body.State;
	const Country=req.body.Country;
	couch.update(dbName, {
		_id: id,
		_rev: rev,
		name,
		email,
		Gender,
		DOB,
		Address,
		City,
		State,
		Country
	})
		.then((r) => {
			res.redirect('/customer/info')
		})
})

app.listen(3000,function()
{
	console.log('Server Started On Port 3000');
});