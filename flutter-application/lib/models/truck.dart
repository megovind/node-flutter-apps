import 'location-model.dart';
import 'driver.dart';

class DocumentTypes {
  final String id;
  final String type;

  DocumentTypes({this.id, this.type});
}

class Documents {
  final String id;
  final String type;
  final DateTime expireyDate;
  final String imageUrl;

  Documents({
    this.id,
    this.type,
    this.expireyDate,
    this.imageUrl,
  });
}

class Truck {
  final String id;
  final String modelNo;
  final String regNo;
  final String phone;
  final DateTime manufacturingDate;
  final String manufacturer;
  final String rcImageUrl;
  final LocationData location;
  final List<Documents> documets;
  Driver driver;

  Truck(
      {this.id,
      this.modelNo,
      this.regNo,
      this.phone,
      this.location,
      this.driver,
      this.documets,
      this.manufacturingDate,
      this.manufacturer,
      this.rcImageUrl});
}
