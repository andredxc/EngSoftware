function search(){

	var destination = document.getElementById("destination").value;
	var duration = document.getElementById("duration").value;
	var startDate = document.getElementById("startDate").value;
	var maxPrice = document.getElementById("maxPrice").value;

	if(destination.length == 0 && duration.length == 0 && startDate.length == 0 && maxPrice.length == 0){
		//Nenhum campo foi preenchido
		alert("Nenhum campo foi preenchido");
	}
	else{
		var socket = io();
		socket.emit('search', { destination: destination, duration: duration, startDate: startDate, maxPrice: maxPrice });

	}
}