function purchase(packageId){

	//Mandar o servidor computar a venda
	// var chosenPackage = new Package(package.id, package.description, package.startDate, package.startHour, package.endDate, package.endHour, package.price);
	var socket = io();
	socket.emit('purchasePackage', packageId);
	socket.on('purchaseAnswer', function(data){
		if(data.status == true){
			alert("Pacote comprado");
		}
		else{
			alert("Erro - " + data.msg);
		}
	});
}

function logout(){

	var socket = io();
    socket.emit('logout', { msg: "logout" });
	socket.on('logoutAnswer', function(data){
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