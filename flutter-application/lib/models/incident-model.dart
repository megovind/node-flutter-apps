import './location-model.dart';
import './driver.dart';

class IncidentField {
  final String id;
  final String type;
  final String image;
  IncidentField({this.id, this.type, this.image});
}

class IncidentLogs {
  final String id;
  final String comment;
  final String commentBy;
  final String type;
  final String image;
  final DateTime dateTime;

  IncidentLogs({
    this.id,
    this.comment,
    this.commentBy,
    this.type,
    this.image,
    this.dateTime,
  });
}

class Representative {
  final String id;
  final String name;
  final String phone;

  Representative({this.id, this.name, this.phone});
}

class Expense {
  final String id;
  final String type;
  final String description;
  final String amount;

  Expense({this.id, this.type, this.description, this.amount});
}

class PaymentExpense {
  final String id;
  final String totalAmount;
  final String dueAmount;
  final String paidAmount;
  final List<Expense> expense;

  PaymentExpense(
      {this.id,
      this.totalAmount,
      this.dueAmount,
      this.paidAmount,
      this.expense});
}

class Incident {
  final String id;
  final List types;
  final String description;
  final String truckNo;
  final String truckModel;
  final String mechanic;
  final String crane;
  final String status;
  final String paymentStatus;
  final String representativeId;
  final String driverId;
  final List images;
  final Driver driver;
  final PaymentExpense paymentExpense;
  final List<Representative> representative;
  final LocationData location;
  final List<IncidentLogs> incidentLogs;

  Incident(
      {this.id,
      this.types,
      this.description,
      this.truckNo,
      this.truckModel,
      this.mechanic,
      this.crane,
      this.status,
      this.images,
      this.representativeId,
      this.paymentStatus,
      this.driverId,
      this.paymentExpense,
      this.driver,
      this.representative,
      this.location,
      this.incidentLogs});
}
