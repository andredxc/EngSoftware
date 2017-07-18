function registerClient(){

	var name = document.getElementById("name").value;
	var email = document.getElementById("email").value;
	var password = document.getElementById("password").value;
	var password2 = document.getElementById("password2").value;
	var accessLevel = 4;

	if(name.length == 0 || email.length == 0 || password.length == 0 || password2.length == 0){
		alert("Todos os campos devem ser preenchidos");
		return;
	}

	if(password != password2){
		alert("As senhas são diferentes");
		document.getElementById("password2").value = "";
		document.getElementById("password").value = "";
		return;
	}

	//Emite o sinal para cadastrar o usuário por meio do servidor
	var socket = io();
    socket.emit('registerClient', { name: name, email: email, password: password, accessLevel: accessLevel });
    socket.on('registerClientAnswer', function (data){
    	if(data.status == true){
    		//Cadastrado com sucesso
    		alert("Usuário cadastrado com sucesso");
    		window.location = "http://localhost:3000/viagens";
    	}
    	else{
    		//Erro no cadastro
    		alert("Erro no cadastro");
    	}
    });
	
	return;
}