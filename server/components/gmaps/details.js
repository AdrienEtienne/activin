class Details {
  constructor(placeid, name, long, lat) {
    this.placeid = placeid;
    this.name = name;
    this.location = [long, lat];
  }

  getId() {
    return this.placeid;
  }

  getName() {
    return this.name;
  }
  getLocation() {
    return this.location;
  }
}

export default Details;
