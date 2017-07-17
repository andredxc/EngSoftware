
function registerEmployee(){

	// alert("registerEmployee() - begin");

	var name = document.getElementById("name").value;
	var email = document.getElementById("email").value;
	var password = document.getElementById("password").value;
	var password2 = document.getElementById("password2").value;
	var radios = document.getElementsByName("accessLevel");
	var accessLevel = -1;

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

	for (var i = 0, length = radios.length; i < length; i++){
		//Encontra o radio button marcado
	    if (radios[i].checked) {
	    	accessLevel = i + 1;	//Soma 1 ao índice para obter o nível
	        break;
	    }
	}

	if(accessLevel == -1){
		console.log("Nível de acesso não selecionado");
		alert("Nível de acesso não selecionado");
		return;
	}

	//Emite o sinal para cadastrar o usuário por meio do servidor
	var socket = io();
    socket.emit('registerEmployee', { name: name, email: email, password: password, accessLevel: accessLevel });
    socket.on('registerEmployeeAnswer', function (data){
    	if(data.status == true){
    		//Cadastrado com sucesso
    		alert("Usuário cadastrado com sucesso");
    	}
    	else{
    		//Erro no cadastro
    		alert("Erro no cadastro");
    	}
    });
	
	return;
}