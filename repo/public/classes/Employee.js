class Employee extends User{

	constructor(name, email, password, accessLevel){
		console.log("Criou novo usuário");
		super(name, email, pasword, accessLevel);
	}
}

module.exports = Employee;