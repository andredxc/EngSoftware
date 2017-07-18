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
const Package = require("./public/classes/Package.js")
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
    socket.on('purchasePackage', function(data){
        performPurchase(data);
    })
    socket.on('registerClient', function(data){
        performRegisterClient(data);
    });
    socket.on('createPackage', function(data){
        performCreatePackage(data);
    });
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
        res.render(viewsFolder + "/flights.ejs", {packages: result, user: Singleton.getUser()});
    });
    db.close();
})

/*
*   Pagina para adição de viagens
*/
app.get('/viagens/adicionar', (req, res) => {
    res.sendFile(viewsFolder + '/createPackage.html'); 
})

/*
*   Pagina para adição de viagens
*/
app.post('/viagens/adicionar/novo', (req, res) => {
    var description = req.body.description;
    var locations = req.body.locations;
    var price = req.body.price;
    var startDate = req.body.startDate;
    var startTime = req.body.startTime;
    var endDate = req.body.endDate;
    var endTime = req.body.endTime;
    var events = req.body.event1 + ", " + req.body.event2 + ", " + req.body.event3;
    console.log(description);

    MongoClient.connect(url, (err, database) => {
        if (err){
            return console.log(err);
        }
        db = database;
    });
    //Encontra o ID do último pacote inserido
    db.collection('packages').find({}).toArray((err,result) => {
        if (err){
            console.log(err);
            db.close();
            return;
        }
        else if(result.length == 0){
            newId = 0;
            return;
        }
        newId = result[result.length-1].id;
        newId += 1;
        db.collection('packages').insert({ id: newId, description: description, locations: locations, price: price, startDate: startDate, endDate: endDate, startTime: startTime, endTime: endTime, includedEvents: events });
        db.close();
        res.redirect('/viagens');
        return;
    });
})

/*
*   Página de pesquisa por planos
*/
app.get('/pesquisar', (req, res) => {

    res.sendFile(viewsFolder + '/search.html');
})

/*
*   Tela que apresenta os resultados da pesquisa
*/
app.post('/pesquisar/resultado', (req, res) => {

    var destination = req.body.destination;
    var maxPrice = req.body.maxPrice;
    console.log(destination);
    console.log(maxPrice);

    if(maxPrice == 0){
        maxPrice = 10000;
    }

    MongoClient.connect(url, (err, database) => {
        if (err){
            return console.log(err);
        }
        db = database;
    });
    db.collection('packages').find({locations: {$regex : ".*"+destination+".*"}, price: {$lte: 10000}}).toArray((err,result) => {
        if (err){
            console.log(err);
            return;
        }

        else if(result.length == 0){
            console.log("Nenhum pacote encontrado");
            io.emit('loginAnswer', {status: false});
            return;
        }

        for(var i=0; i < result.length; i++){
            console.log("RESULTADO: " + result[i].description);
        }

        // console.log("Found: " + result[0].email + ", " + result[0].password + ", " + result[0].accessLevel);        
        // Singleton.setUser(result[0].name, result[0].email, result[0].password, result[0].accessLevel);
        // io.emit('loginAnswer', {status: true});
        return;
    });

    // res.render(viewsFolder + "/flights.ejs", {packages: result, user: Singleton.getUser()});
})

/*
*   Salva um novo vôo
*/
app.post('/travels', (req, res) => {
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
*   Formulário de cadastro de cliente
*/
app.get('/register', (req, res) => {
    res.sendFile(viewsFolder + '/registerClient.html')
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
}

function performRegisterClient(data){

    var name = data.name;
    var email = data.email;
    var password = data.password;
    var accessLevel = 4;
    
    MongoClient.connect(url, (err, database) => {
        if (err){
            return console.log(err);
            io.emit('registerClientAnswer', {status: false});
        }
        db = database;
    });
    console.log("CADASTRANDO: " + name + ", " + email + ", " + password + ", " + accessLevel);
    db.collection('users').insert({ name: name, email: email, password: password, accessLevel: accessLevel});
    db.close();
    io.emit('registerClientAnswer', {status: true});
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

function performPurchase(packageId){

    console.log("Começando compra do pacote "+ packageId);

    if(Singleton.getUser().getAccessLevel() != 4 || Singleton.getUser().getEmail() == "undefined"){
        //Não permite a compra para usuários não cadastrados e para funcionários
        io.emit('purchaseAnswer', { status: false, msg: "Somente clientes logados podem efetuar compras" });
        return;
    }

    MongoClient.connect(url, (err, database) => {
        if (err){
            return console.log(err);
        }
        db = database;
    });

    db.collection('packages').find({ id: packageId}).toArray((err,result) => {
        if (err){
            console.log(err);
            io.emit('purchaseAnswer', {status: false, msg: "Erro ao pesquisar no banco"});
            db.close();
            return;
        }

        if(result.length > 1){
            console.log("Foi encontrado mais do que 1 um pacote relacionado ao ID " + packageId);
            io.emit('purchaseAnswer', { status: false, msg: "Erro ao pesquisar no banco" });
        }
        else if(result.length == 0){
            console.log("Nenhum pacote encontrado para o ID " + packageId);
            io.emit('purchaseAnswer', {status: false, msg: "Pacote não encontrado"});
            db.close();
            return;
        }
        //Captura a data e hora atual para salvar no banco

        var date = new Date();
        var formatedDate = date.getHours()+":"+date.getMinutes()+":"+date.getSeconds()+"-"+date.getDate()+"-"+date.getMonth()+"-"+date.getFullYear();

        db.collection('purchases').insert({ email: Singleton.getUser().getEmail(), name : Singleton.getUser().getName(), purchasedPackageId: result[0].id, description: result[0].description, price: result[0].price, purchaseDate: formatedDate });
        console.log("Found package for purchase: " + result[0].description + ", " + result[0].price);
        db.close();
        return;
    });
    io.emit('purchaseAnswer', { status: true });
}

function performCreatePackage(data){
    
    console.log("Começou a performCreatePackage()");

    var description = data.description;
    var locations = data.locations;
    var price = data.price;
    var startDate = data.startDate;
    var startTime = data.startTime;
    var endDate = data.endDate;
    var endTime = data.endTime;
    var events = data.event1 + data.event2 + data.event3;
    var newId = -1;

    console.log("CADASTRANDO: " + description + ", " + locations);

    MongoClient.connect(url, (err, database) => {
        if (err){
            return console.log(err);
            io.emit('createPackageAnswer', {status: false});
        }
        db = database;
    });
    //Encontra o ID do último pacote inserido
    db.collection('packages').find({}).toArray((err,result) => {
        if (err){
            console.log(err);
            io.emit('createPackageAnswer', {status: false, msg: "Erro ao pesquisar no banco"});
            db.close();
            return;
        }
        else if(result.length == 0){
            newId = 0;
            return;
        }
        newId = result[result.length-1].id;
        return;
    });
    
    db.collection('packages').insert({ id: newId, description: description, locations: locations, price: price, startDate: startDate, endDate: endDate, startTime: startTime, endTime: endTime, includedEvents: events });
    db.close();
    io.emit('createPackageAnswer', {status: true});
}

function findPackage(package){
}