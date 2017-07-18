class Package {

	constructor(id, description, startDate, startHour, endDate, endHour, price){
		this.id = id;
		this.description = description;
		this.startDate = startDate;
		this.startHour = startHour;
		this.endDate = endDate;
		this.endHour = endHour;
		this.price = price;
	}

	getId(){ return this.id; }
	getDescription(){ return this.description; }
	getLocations(){ return this.locations; }
	getStartDate(){ return this.startDate; }
	getStartHour(){ return this.startHour; }
	getEndDate(){ return this.endDate; }
	getEndHour(){ return this.endHour; }
	getPrice(){ return this.price; }

	setLocations(locations){ this.locations = locations};
}

module.exports = Package;