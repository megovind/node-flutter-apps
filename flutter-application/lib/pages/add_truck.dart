import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter/painting.dart';
import 'package:scoped_model/scoped_model.dart';
import 'package:intl/intl.dart';
import 'package:datetime_picker_formfield/datetime_picker_formfield.dart';

import '../widgets/navigation_drawer.dart';
import '../scoped_models/main.dart';
import '../models/truck.dart';
import '../helper/ensure-visible.dart';
import '../widgets/image_input.dart';

class AddTruckPage extends StatefulWidget {
  final String truckNo;
  AddTruckPage([this.truckNo]);
  @override
  State<StatefulWidget> createState() {
    return _AddTruckPage();
  }
}

class _AddTruckPage extends State<AddTruckPage> {
  Map<String, dynamic> _formData = {
    'modelName': null,
    'regNo': null,
    'image': null,
    'manufacturer': null,
    'manufacturingDate': null,
  };
  final format = DateFormat("dd-MM-yyyy");
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  final _truckModelFocus = FocusNode();
  final _truckNoFocus = FocusNode();
  final _manufacturerFocus = FocusNode();
  final _manufacturingDateFocus = FocusNode();

  final _truckModelTextController = TextEditingController();
  final _truckNoTextController = TextEditingController();
  final _manufactureringTextController = TextEditingController();
  final _manufacturerTextController = TextEditingController();

  Widget _buildTruckModelField(Truck truck) {
    if (truck == null && _truckModelTextController.text.trim() == '') {
      _truckModelTextController.text = '';
    } else if (truck != null && _truckModelTextController.text.trim() == '') {
      _truckModelTextController.text = truck.modelNo;
    } else if (truck != null && _truckModelTextController.text.trim() != '') {
      _truckModelTextController.text = _truckModelTextController.text;
    } else if (truck == null && _truckModelTextController.text.trim() != '') {
      _truckModelTextController.text = _truckModelTextController.text;
    }

    return EnsureVisibleWhenFocused(
      focusNode: _truckModelFocus,
      child: TextFormField(
        focusNode: _truckModelFocus,
        decoration: InputDecoration(
          labelText: 'Truck Model',
          filled: true,
          fillColor: Colors.white,
        ),
        controller: _truckModelTextController,
        textCapitalization: TextCapitalization.characters,
        keyboardType: TextInputType.text,
        validator: (String value) {
          if (value.isEmpty) {
            return 'Truck Model Is Required';
          }
          return null;
        },
        onSaved: (String value) {
          _formData['modelName'] = value;
        },
      ),
    );
  }

  Widget _buildTruckRegNoField(Truck truck) {
    bool readOnly = false;
    if (widget.truckNo == null &&
        truck == null &&
        _truckNoTextController.text.trim() == '') {
      _truckNoTextController.text = '';
    } else if (truck != null && _truckNoTextController.text.trim() == '') {
      readOnly = true;
      _truckNoTextController.text = truck.regNo;
    } else if (truck != null && _truckNoTextController.text.trim() != '') {
      _truckNoTextController.text = _truckNoTextController.text;
    } else if (truck == null && _truckNoTextController.text.trim() != '') {
      _truckNoTextController.text = _truckNoTextController.text;
    } else if (widget.truckNo != null &&
        truck == null &&
        _truckNoTextController.text.trim() == '') {
      _truckNoTextController.text = widget.truckNo;
    }
    return EnsureVisibleWhenFocused(
      focusNode: _truckNoFocus,
      child: TextFormField(
        focusNode: _truckNoFocus,
        decoration: InputDecoration(
          labelText: 'KA01KS1234',
          filled: true,
          fillColor: Colors.white,
        ),
        readOnly: readOnly,
        controller: _truckNoTextController,
        textCapitalization: TextCapitalization.characters,
        keyboardType: TextInputType.text,
        validator: (String value) {
          String truckPattern =
              r'^[A-Z]{2}[0-9]{1,2}(?:[A-Z])?(?:[A-Z]*)?[0-9]{4}$';
          RegExp regExp = new RegExp(truckPattern);
          if (value.isEmpty) {
            return 'Ragistration Number Should Not Be Empty!';
          } else if (!regExp.hasMatch(value)) {
            return 'Registration Number Should be Valid!';
          }
          return null;
        },
        onSaved: (String value) {
          _formData['regNo'] = value;
        },
      ),
    );
  }

  Widget _buildDatePickerField(Truck truck) {
    if (truck == null && _manufactureringTextController.text.trim() == '') {
      _manufactureringTextController.text = '';
    } else if (truck != null &&
        _manufactureringTextController.text.trim() == '') {
      _manufactureringTextController.text = truck.manufacturingDate == null
          ? truck.manufacturingDate
          : DateFormat('dd-MM-yyyy').format(truck.manufacturingDate);
    } else if (truck != null &&
        _manufactureringTextController.text.trim() != '') {
      _manufactureringTextController.text = _manufactureringTextController.text;
    } else if (truck == null &&
        _manufactureringTextController.text.trim() != '') {
      _manufactureringTextController.text = _manufactureringTextController.text;
    }
    return EnsureVisibleWhenFocused(
      focusNode: _manufacturingDateFocus,
      child: DateTimeField(
        focusNode: _manufacturingDateFocus,
        decoration: InputDecoration(
          labelText: 'Manufacturing Date',
          fillColor: Colors.white,
          filled: true,
        ),
        controller: _manufactureringTextController,
        format: format,
        readOnly: true,
        onShowPicker: (context, currentValue) {
          return showDatePicker(
              context: context,
              firstDate: DateTime(1990),
              initialDate: currentValue ?? DateTime.now(),
              lastDate: DateTime(2100));
        },
        onSaved: (value) {
          _formData['manufacturingDate'] = value;
        },
      ),
    );
  }

  Widget _buildTruckManuFacturerField(Truck truck) {
    if (truck == null && _manufacturerTextController.text.trim() == '') {
      _manufacturerTextController.text = '';
    } else if (truck != null && _manufacturerTextController.text.trim() == '') {
      _manufacturerTextController.text = truck.manufacturer;
    } else if (truck != null && _manufacturerTextController.text.trim() != '') {
      _manufacturerTextController.text = _manufacturerTextController.text;
    } else if (truck == null && _manufacturerTextController.text.trim() != '') {
      _manufacturerTextController.text = _manufacturerTextController.text;
    }
    return EnsureVisibleWhenFocused(
      focusNode: _manufacturerFocus,
      child: TextFormField(
        focusNode: _manufacturerFocus,
        decoration: InputDecoration(
          labelText: 'Manufacturer',
          filled: true,
          fillColor: Colors.white,
        ),
        controller: _manufacturerTextController,
        textCapitalization: TextCapitalization.words,
        keyboardType: TextInputType.text,
        onSaved: (String value) {
          _formData['manufacturer'] = value;
        },
      ),
    );
  }

  DecorationImage _buildBackgroundImage() {
    return DecorationImage(
      fit: BoxFit.cover,
      image: AssetImage('assets/background.jpg'),
      colorFilter:
          ColorFilter.mode(Colors.black.withOpacity(0.5), BlendMode.dstATop),
    );
  }

  void _submitForm(Function addTruck, Function updateTruck,
      Truck selectedTruckToEdit, List<Truck> trucks,
      [int selesctedTruckIndex, Function setTruck]) async {
    if (!_formKey.currentState.validate()) {
      return;
    }
    _formKey.currentState.save();
    if (selesctedTruckIndex == -1) {
      final Map<String, dynamic> successMessage = await addTruck(
        _formData['modelName'],
        _formData['regNo'],
        _formData['manufacturer'],
        _formData['manufacturingDate'],
        _formData['image'],
      );
      if (successMessage['success']) {
        Navigator.pushReplacementNamed(context, '/trucks');
      } else {
        showDialog(
            context: context,
            builder: (BuildContext context) {
              return AlertDialog(
                title: Text('Alert'),
                content: Text(successMessage['message']),
                actions: <Widget>[
                  FlatButton(
                    child: Text('Okay'),
                    onPressed: () {
                      Navigator.of(context).pop();
                    },
                  )
                ],
              );
            });
      }
    } else {
      updateTruck(
        _formData['modelName'],
        _formData['regNo'],
        _formData['manufacturer'],
        _formData['manufacturingDate'],
        _formData['image'],
        selectedTruckToEdit.rcImageUrl,
        selectedTruckToEdit.id,
      ).then((_) {
        Navigator.pushReplacementNamed(context, '/trucks').then((_) {
          selectedTruckToEdit = null;
          setTruck();
        });
      });
    }
  }

  void _setImage(File image) {
    _formData['image'] = image;
  }

  Widget _buildPageContent(MainModel model) {
    Truck selectedTruck = model.selectedTruckToEdit;
    final double deviceWidth = MediaQuery.of(context).size.width;
    final double targetWidth = deviceWidth > 768.0 ? 500.0 : deviceWidth * 0.95;
    return WillPopScope(
      onWillPop: () => new Future(() => true),
      child: Scaffold(
        drawer: NavigationDrawer(),
        appBar: AppBar(
          automaticallyImplyLeading: true,
          title: Text(selectedTruck != null ? 'Update Truck' : 'Add Truck'),
          leading: IconButton(
              icon: Icon(Icons.arrow_back),
              onPressed: () {
                model.setTruck();
                Navigator.pushReplacementNamed(context, '/trucks');
              }),
        ),
        body: Container(
          decoration: BoxDecoration(image: _buildBackgroundImage()),
          padding: EdgeInsets.all(10.0),
          child: Center(
            child: SingleChildScrollView(
              child: Container(
                width: targetWidth,
                margin: EdgeInsets.all(10.0),
                child: Form(
                  key: _formKey,
                  child: Column(
                    children: <Widget>[
                      Padding(
                          padding: EdgeInsets.only(),
                          child: _buildTruckModelField(selectedTruck)),
                      Padding(
                        padding: EdgeInsets.only(top: 10),
                        child: _buildTruckRegNoField(selectedTruck),
                      ),
                      selectedTruck != null
                          ? Padding(
                              padding: EdgeInsets.only(top: 10),
                              child:
                                  _buildTruckManuFacturerField(selectedTruck),
                            )
                          : Container(),
                      selectedTruck != null
                          ? Padding(
                              padding: EdgeInsets.only(top: 10),
                              child: _buildDatePickerField(selectedTruck),
                            )
                          : Container(),
                      ImageInput(
                          _setImage,
                          'Upload RC',
                          selectedTruck != null
                              ? selectedTruck.rcImageUrl
                              : null),
                      Padding(
                        padding: EdgeInsets.only(top: 10),
                        child: model.isTrucksLoading
                            ? CircularProgressIndicator()
                            : Material(
                                elevation: 5.0,
                                color: Theme.of(context).buttonColor,
                                child: MaterialButton(
                                  minWidth: MediaQuery.of(context).size.width,
                                  padding: EdgeInsets.fromLTRB(
                                      10.0, 15.0, 20.0, 15.0),
                                  onPressed: () => _submitForm(
                                      model.addTruck,
                                      model.updateTruck,
                                      selectedTruck,
                                      model.allTrucks,
                                      model.selectedTruckIndex,
                                      model.setTruck),
                                  child: Text(
                                    'Save',
                                    style: TextStyle(
                                        fontSize: 20.0, color: Colors.white),
                                  ),
                                ),
                              ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return ScopedModelDescendant<MainModel>(
      builder: (BuildContext contecxt, Widget child, MainModel model) {
        return _buildPageContent(model);
      },
    );
  }
}
