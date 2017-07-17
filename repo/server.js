const express = require('express')
const app = express()
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);
const bodyParser= require('body-parser')
const MongoClient = require('mongodb').MongoClient
const uri = 'mongodb://localhost:27017/'
var path = require('path')
var db
var currentUser
var viewsFolder = __dirname + "/public/views"
var guiFolder = __dirname + "/gui"
const User = require("./public/classes/User.js");
var Singleton = require("./public/classes/Singleton.js");

app.use(bodyParser.urlencoded({extended: true}))
app.set('views', __dirname+'/views');
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

/*
*   Inicialização do servidor
*/
var url = uri + "database";
MongoClient.connect(url, (err, database) => {
    if (err){
        return console.log(err);
    }
    else{
        db = database;
        server.listen(3000);
        console.log("Listening on port 3000");
    }
});

/*
*   Handlers do socket.io
*/
io.on('connection', function (socket) {

    socket.on('login', function (data){
        performLogin(data);
    });
    socket.on('registerEmployee', function(data){
        performRegisterEmployee(data);
    });
    socket.on('logout', function(data){
        console.log("Sinal recebido");
        performLogout(data);
    })
    socket.on('search', function(data){
        performSearch(data);
    })
});

/*
*   Página inicial do site
*/
app.get('/', (req, res) => {
    
    if(Singleton.getUser() == null){
        //Se o usuário não está logado, cria um cliente não identificado
        Singleton.clearUser();
    }
    res.redirect('/viagens');
})

/*
*   Página de cadastro de funcionários
*/
app.get('/cadastrar', (req,res) => {
    res.sendFile(viewsFolder + "/registerEmployee.html");
})

/*
*   Página com a lista de pacotes disponíveis
*/
app.get('/viagens',(req,res) => {

    console.log("Buscando dados do banco em: " + url);
    MongoClient.connect(url, (err, database) => {
        if (err) {
            return console.log(err);
        }
        db = database;
    });
    db.collection('packages').find().toArray((err, result) => {
        if (err) {
            return console.log(err);
        }
        if(Singleton.getUser() == null){
            //Se o usuário não está logado, cria um cliente não identificado
            Singleton.clearUser();
        }
        // renders index.ejs
        console.log("Renderizando a página");
        console.log("email: " + Singleton.getUser().getEmail());
        res.render(viewsFolder + "/flights.ejs", {packages: result, user: Singleton.getUser()});
    });
    db.close();
})

/*
*   Pagina para adição de viagens
*/
app.get('/viagens/adicionar', (req, res) => {
    if(currentUser.adm || currentUser.manager)
        res.sendFile(__dirname + '/flights.html');
    else {
        res.sendFile(__dirname + '/403.html');
    }
})

/*
*   Página de pesquisa por planos
*/
app.get('/pesquisar', (req, res) => {

    res.sendFile(viewsFolder + '/search.html');
})





/*
*
*/
app.get('/adm/register', (req, res) => {
    if(currentUser.adm){
        res.sendFile(__dirname + '/admregister.html');
    }
    else{
        res.sendFile(__dirname + '/403.html')
    }
})

/*
*   Salva um novo vôo
*/
app.post('/travels', (req, res) => {
    console.log(req.body) // validation point
    var url = uri + "flights";
    MongoClient.connect(url, (err, database) => {
        if (err){
            return console.log(err);
        }
        db = database;
    });
    db.collection('flights').save(req.body, (err, result) => {
        if (err){
            return console.log(err);
        }
        console.log('saved to database');
    })
    db.close();
    res.redirect('/viagens');
})

/*
*   Formulário de login
*/
app.get('/login', (req, res) => {
    res.sendFile(viewsFolder + '/login.html');
})

/*
*   Página de logout
*/
// app.get('/logout', (req, res) => {
//     res.redirect('/');
// });

/*
*   Registro de usuários
*/
// app.post('/register', (req, res) => {
//     var email = req.body.email;
//     var password = req.body.password;
//     var username = req.body.username;
//     var adm = false;
//     var manager = false;
//     var vendor = true;
//     var url = uri + "users";
//     MongoClient.connect(url, (err, database) => {
//         if (err){
//             return console.log(err);
//         }
//         db = database;
//     });

//     db.collection('users').insert({email: email, password: password, username: username, adm: adm, manager: manager, vendor: vendor});
//     db.close();
//     currentUser = {
//         email: req.body.email,
//         username: req.body.username,
//         adm: false,
//         manager: false,
//         vendor: true
//     };
//     res.sendFile(__dirname + '/500.html');
// })

/*
*
*/
app.post('/admregister', (req, res) => {
    var email = req.body.email;
    var password = req.body.password;
    var username = req.body.username;
    var adm = req.body.adm;
    var manager = req.body.manager;
    var vendor = req.body.vendor;
    if(adm === 'on'){
        adm = true;
        manager = false;
        vendor = false;
    }
    else if (manager === 'on'){
        adm = false;
        manager = true;
        vendor = false;
    }
    else if(vendor === 'on'){
        adm = false;
        manager = false;
        vendor = true;
    }
    var url = uri + "users";
    MongoClient.connect(url, (err, database) => {
        if (err){
            return console.log(err);
        }
        db = database;
    })
    db.collection('users').insert({email: email, password: password, username: username, adm: adm, manager: manager, vendor: vendor});
    db.close();
    res.sendFile(__dirname + '/500.html');
})

//-------------------------------Funções internas
function performLogin(data){
    
    var email = data.email;
    var password = data.password;

    MongoClient.connect(url, (err, database) => {
        if (err){
            return console.log(err);
        }
        db = database;
    });

    db.collection('users').find({email: email, password: password}).toArray((err,result) => {
        if (err){
            console.log(err);
            io.emit('loginAnswer', {status: false});
            return;
        }

        if(result.length > 1){
            console.log("Foi encontrado mais do que 1 um usuário no login");
        }
        else if(result.length == 0){
            console.log("Nenhum usuário encontrado");
            io.emit('loginAnswer', {status: false});
            return;
        }
    
        console.log("Found: " + result[0].email + ", " + result[0].password + ", " + result[0].accessLevel);        
        Singleton.setUser(result[0].name, result[0].email, result[0].password, result[0].accessLevel);
        io.emit('loginAnswer', {status: true});
        return;
    });
    
    db.close();
    // res.redirect('/viagens');    
}

function performRegisterEmployee(data){

    console.log("Nome: " + data.name + " Email: " + data.email + " Password: " + data.password);

    var name = data.name;
    var email = data.email;
    var password = data.password;
    var accessLevel = data.accessLevel;
    MongoClient.connect(url, (err, database) => {
        if (err){
            return console.log(err);
            io.emit('registerEmployeeAnswer', {status: false});
        }
        db = database;
    });
    console.log("CADASTRANDO: " + name + ", " + email + ", " + password + ", " + accessLevel);
    db.collection('users').insert({ name: name, email: email, password: password, accessLevel: accessLevel});
    db.close();
    io.emit('registerEmployeeAnswer', {status: true});
    // res.sendFile(__dirname + '/500.html');
}

function performLogout(data){

    Singleton.clearUser();
    io.emit('logoutAnswer', {status: true});
}

function performSearch(data){

    var destination = data.destination;
    var duration = data.duration;
    var startDate = data.startDate;
    var maxPrice = data.maxPrice;

    console.log("Search: " + destination + ", " + duration + ", " + startDate + ", " + maxPrice + ", ");
}