
function testButton(){
	console.log("Button clicked\n");
	alert("FASOFSDJFSIJO");
}

function login(){
    
    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

    if(email.length == 0 || password.length == 0){
        alert("Email e senha são campos obrigatórios");
        return;
    }

    var socket = io();
    socket.emit('login', { email: email, password: password });
    socket.on('loginAnswer', function (data){
        if(data.status == true){
            //Logou com sucesso
            window.location = "http://localhost:3000/viagens"
        }
        else{
            //Falha no login
            alert("Falha no login, verifique os seus dados");
        }
    });
}