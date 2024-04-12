import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:root_app/helper/config.dart';
import 'package:scoped_model/scoped_model.dart';
import 'package:http/http.dart' as http;
import 'package:location/location.dart' as geoloc;

import '../widgets/multiselectchip.dart';
import '../scoped_models/main.dart';
import '../widgets/navigation_drawer.dart';
import '../models/location-model.dart';
import '../pages/add_truck.dart';

class RegisterIncidentPage extends StatefulWidget {
  final String title;
  final MainModel model;
  RegisterIncidentPage(this.model, {Key key, this.title}) : super(key: key);
  @override
  State<StatefulWidget> createState() {
    return _RegisterIncidentPage();
  }
}

class _RegisterIncidentPage extends State<RegisterIncidentPage> {
  Map<String, dynamic> _formData = {
    'truckNum': null,
    'incident': null,
    'description': null,
    'location': null,
    'type': []
  };

  @override
  void initState() {
    _getUserCurrentLocation();
    super.initState();
  }

  void _getUserCurrentLocation() async {
    try {
      Map<String, String> addressData = {
        'stateName': null,
        'cityName': null,
      };
      final location = geoloc.Location();
      final currentLocation = await location.getLocation();
      final lat = currentLocation.latitude;
      final lng = currentLocation.longitude;
      final Uri uri = Uri.https('maps.googleapis.com', '/maps/api/geocode/json',
          {'latlng': '${lat.toString()}, ${lng.toString()}', 'key': apiKey});
      final http.Response response = await http.get(uri);
      final decodedResponse = json.decode(response.body);
      final formattedAddress = decodedResponse['results'][0]['formatted_address'];
      final addressComponent = decodedResponse['results'][0]['address_components'];
      final componentLength = addressComponent.length;

      for (var i = 0; i < componentLength; i++) {
        final component = addressComponent[i];
        if (isState(component)) {
          addressData['stateName'] = component['long_name'];
        }
        if (isCity(component)) {
          addressData['cityName'] = component['long_name'];
        }
      }
      _formData['location'] = LocationData(
          address: formattedAddress,
          latitude: lat,
          longitude: lng,
          stateName: addressData['stateName'],
          cityName: addressData['cityName']);
    } catch (e) {
      print(e);
    }
  }

  bool isState(component) {
    return component['types'].contains('administrative_area_level_1');
  }

  bool isCity(component) {
    return component['types'].contains('locality');
  }

  List<String> selectedTypesList = [];
  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  Widget _buildTruckNumField() {
    return TextFormField(
      decoration: InputDecoration(labelText: 'Truck Number', filled: true, fillColor: Colors.white),
      textCapitalization: TextCapitalization.characters,
      keyboardType: TextInputType.text,
      validator: (String value) {
        String truckPattern = r'^[A-Z]{2}[0-9]{1,2}(?:[A-Z])?(?:[A-Z]*)?[0-9]{4}$';
        RegExp regExp = new RegExp(truckPattern);
        if (value.isEmpty) {
          return 'Ragistration Number Should Not Be Empty!';
        } else if (!regExp.hasMatch(value)) {
          return 'Registration Number Should be Valid!';
        }
        return null;
      },
      onSaved: (String value) {
        _formData['truckNum'] = value;
      },
    );
  }

  Widget _buildDescriptionNoField() {
    return TextFormField(
      decoration: InputDecoration(
          labelText: 'Please Describe What You Need Help with and Toolls You Need ',
          filled: true,
          fillColor: Colors.white),
      validator: (String value) {
        if (value.isEmpty) {
          return 'Description is required';
        }
        return null;
      },
      keyboardType: TextInputType.multiline,
      maxLines: null,
      onSaved: (String value) {
        _formData['description'] = value;
      },
    );
  }

  DecorationImage _buildBackgroundImage() {
    return DecorationImage(
      fit: BoxFit.cover,
      image: AssetImage('assets/background.jpg'),
      colorFilter: ColorFilter.mode(Colors.black.withOpacity(0.5), BlendMode.dstATop),
    );
  }

  void _submitForm(Function registerIncident) async {
    if (!_formKey.currentState.validate()) {
      return;
    }
    _formKey.currentState.save();
    Map<String, dynamic> successMessage = await registerIncident(
      _formData['truckNum'],
      selectedTypesList,
      _formData['description'],
      _formData['location'],
    );
    if (successMessage['success'] == 'SUCCESS') {
      Navigator.pushReplacementNamed(context, '/home');
    } else if (successMessage['success'] == 'NOT_FOUND') {
      showDialog(
          context: context,
          builder: (BuildContext context) {
            return AlertDialog(
              contentPadding: EdgeInsets.all(20),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: <Widget>[
                  Text(successMessage['message']),
                ],
              ),
              actions: <Widget>[
                FlatButton(
                  child: Text('Okay'),
                  onPressed: () {
                    Navigator.of(context).pop();
                  },
                ),
                FlatButton(
                  child: Text('Add Truck'),
                  onPressed: () {
                    Navigator.of(context).push(
                      MaterialPageRoute(
                        builder: (BuildContext context) {
                          return AddTruckPage(_formData['truckNum']);
                        },
                      ),
                    );
                  },
                ),
              ],
            );
          });
    } else {
      showDialog(
          context: context,
          builder: (BuildContext context) {
            return AlertDialog(
              contentPadding: EdgeInsets.all(20),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: <Widget>[
                  Text(successMessage['message']),
                ],
              ),
              actions: <Widget>[
                FlatButton(
                  child: Text('Okay'),
                  onPressed: () {
                    Navigator.of(context).pop();
                  },
                ),
              ],
            );
          });
    }
  }

  @override
  Widget build(BuildContext context) {
    return ScopedModelDescendant<MainModel>(
      builder: (BuildContext contecxt, Widget child, MainModel model) {
        return Scaffold(
          drawer: NavigationDrawer(),
          appBar: AppBar(
            automaticallyImplyLeading: true,
            title: Text('Register Incident'),
            leading: IconButton(
              icon: Icon(Icons.arrow_back),
              onPressed: () => Navigator.pushReplacementNamed(context, '/home'),
            ),
          ),
          body: WillPopScope(
            onWillPop: () => Navigator.pushReplacementNamed(context, '/home'),
            child: Container(
              decoration: BoxDecoration(image: _buildBackgroundImage()),
              padding: EdgeInsets.all(10.0),
              child: Center(
                child: SingleChildScrollView(
                  child: Form(
                    key: _formKey,
                    child: Column(
                      children: <Widget>[
                        MultiSelectChip(
                          model,
                          onSelectionChanged: (selectedList) {
                            setState(() {
                              selectedTypesList = selectedList;
                            });
                          },
                        ),
                        SizedBox(
                          height: 8.0,
                        ),
                        _buildTruckNumField(),
                        SizedBox(
                          height: 8.0,
                        ),
                        _buildDescriptionNoField(),
                        SizedBox(
                          height: 8.0,
                        ),
                        model.isIncidentLoading
                            ? CircularProgressIndicator()
                            : RaisedButton(
                                textColor: Colors.white,
                                child: Text(' Save '),
                                onPressed: () => _submitForm(model.registerIncident),
                              ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }
}
