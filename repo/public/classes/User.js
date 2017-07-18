class User {

	constructor(name, email, password, accessLevel){
		console.log("Criando User");
		this.name = name;
		this.email = email;
		this.password = password;
		this.accessLevel = accessLevel;
	}

	getName(){ return this.name; }
	getEmail(){ return this.email; }
	getPassword(){ return this.password; }
	getAccessLevel(){ return this.accessLevel; }

	setName(name){ this.name = name; }
	setEmail(email){ this.email = email; }
	setPassword(password){ this.password = password; }
	setAccessLevel(accessLevel){ this.accessLevel = accessLevel; }
}

module.exports = User;