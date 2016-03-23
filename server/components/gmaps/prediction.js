class Prediction {
	constructor(placeid, description) {
		this.placeid = placeid;
		this.description = description;
	}

	getId() {
		return this.placeid;
	}

	getDescription() {
		return this.description;
	}
}

export default Prediction;
