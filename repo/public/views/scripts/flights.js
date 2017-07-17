function purchase(){

	alert("purchase() - begin");

	var destination = document.getElementById("destination");
	alert("Destination: " + destination);
	//Não sei como pegar o valor do iterador i para identificar qual pacote foi escolhido
}

function logout(){

	var socket = io();
    socket.emit('logout', { msg: "logout" });
	socket.on('logoutAnswer', function (data){
		if(data.status == true){
			//Lougout efetuado, volta para a página de login
			window.location = "http://localhost:3000/viagens"
		}
		else{
			alert("Falha no lougout");
		}
	});
}

function login(){

	window.location = "http://localhost:3000/login";
}