import 'dart:io';
import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:datetime_picker_formfield/datetime_picker_formfield.dart';

class AddTripPage extends StatefulWidget {
  final String truckNo;
  AddTripPage([this.truckNo]);
  @override
  _AddTripPage createState() => _AddTripPage();
}

class _AddTripPage extends State<AddTripPage> {
  Map<String, dynamic> _formData = {
    "truck": null,
    "owner": null,
    "driver": null,
    "source": null,
    "destination": null,
    "startDate": null,
    "endDate": null,
  };

  final format = DateFormat("dd-MM-yyyy");
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  final _truckNoFocus = FocusNode();
  final _sourceFocus = FocusNode();
  final _destinationFocus = FocusNode();
  final _startDateFocus = FocusNode();
  final _endDateFocus = FocusNode();

  @override
  Widget build(BuildContext context) {
    return null;
  }
}
