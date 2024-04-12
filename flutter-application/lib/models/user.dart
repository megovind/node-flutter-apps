import '../models/location-model.dart';

class User {
  final String id;
  final String phone;
  final String name;
  final String email;
  final bool inTrial;
  final bool isTrialDone;
  final String trialStartDate;
  final String trialEndDate;
  final LocationData location;
  final String token;
  final String regId;
  final String type;

  User({
    this.id,
    this.phone,
    this.name,
    this.email,
    this.location,
    this.token,
    this.regId,
    this.type,
    this.inTrial,
    this.isTrialDone,
    this.trialStartDate,
    this.trialEndDate,
  });
}
