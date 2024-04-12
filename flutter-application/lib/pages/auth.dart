import 'package:flutter/material.dart';
import 'package:flutter/painting.dart';
import 'package:scoped_model/scoped_model.dart';

import '../scoped_models/main.dart';
import '../models/location-model.dart';
import '../models/auth.dart';
import '../widgets/location.dart';

class AuthPage extends StatefulWidget {
  @override
  State<StatefulWidget> createState() {
    return _AuthPage();
  }
}

class _AuthPage extends State<AuthPage> {
  LocationData locationData;
  Map<String, dynamic> _formData = {
    'phone': null,
    'name': null,
    'location': null,
    'acceptTerms': true
  };

  final String mobilePattern = '^(\\+91[\\-\\s]?)?[0]?(91)?[6789]\\d{9}';

  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();
  AuthMode _authMode = AuthMode.Login;

  Widget _buildPhoneField() {
    return TextFormField(
      decoration: InputDecoration(
          focusColor: Theme.of(context).buttonColor,
          counterText: '',
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(30.0),
          ),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(30.0)),
          prefixIcon: Icon(Icons.phone),
          labelText: 'Phone Number',
          filled: true,
          fillColor: Colors.white),
      maxLength: 10,
      keyboardType: TextInputType.phone,
      validator: (String value) {
        String patttern = r'^[6-9]\d{9}$';
        RegExp regExp = new RegExp(patttern);
        if (value.isEmpty) {
          return 'Phone Number Is Required';
        } else if (!regExp.hasMatch(value)) {
          return 'Phone Number Should Be Valid';
        }
        return null;
      },
      onSaved: (String value) {
        _formData['phone'] = value;
      },
    );
  }

  Widget _buildNameField() {
    return TextFormField(
      decoration: InputDecoration(
        counterText: '',
        focusColor: Theme.of(context).buttonColor,
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(30.0),
        ),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(30.0)),
        prefixIcon: Icon(Icons.person),
        labelText: 'Name',
        filled: true,
        fillColor: Colors.white,
      ),
      textCapitalization: TextCapitalization.words,
      keyboardType: TextInputType.text,
      validator: (String value) {
        if (_authMode == AuthMode.Signup && value.isEmpty) {
          return 'Name Is Required.';
        }
        return null;
      },
      onSaved: (String value) {
        _formData['name'] = value;
      },
    );
  }

  void _changeTermsAndConditionTile(value) {
    setState(() {
      _formData['acceptTerms'] = value;
    });
  }

  Widget _buildCheckTermsTile() {
    return CheckboxListTile(
      value: _formData['acceptTerms'],
      onChanged: (value) => _changeTermsAndConditionTile(value),
      subtitle: !_formData['acceptTerms']
          ? Text(
              'Required',
              style: TextStyle(color: Colors.red, fontSize: 12.0),
            )
          : null,
      title: Text(
        'I Agree To The Terms and Conditions',
        style: TextStyle(fontSize: 12.0, fontWeight: FontWeight.w500),
      ),
      controlAffinity: ListTileControlAffinity.leading,
    );
  }

  _changeMode() {
    setState(() {
      _authMode =
          _authMode == AuthMode.Login ? AuthMode.Signup : AuthMode.Login;
    });
  }

  void _submitForm(Function authenticate) async {
    if (_authMode == AuthMode.Login && !_formKey.currentState.validate()) {
      return;
    } else if (!_formKey.currentState.validate() || !_formData['acceptTerms']) {
      return;
    }
    _formKey.currentState.save();
    Map<String, dynamic> successMessage;
    successMessage = await authenticate(
      _formData['phone'],
      _formData['name'],
      _formData['location'],
      _formData['acceptTerms'],
      _authMode,
    );
    if (successMessage['status'] == 'SUCCESS') {
      Navigator.pushReplacementNamed(context, '/otp');
    } else {
      showDialog(
        context: context,
        builder: (BuildContext context) {
          return AlertDialog(
            content: Text(
              successMessage['message'],
            ),
            actions: <Widget>[
              Divider(),
              FlatButton(
                child: Text(successMessage['status'] == 'ALREADY_EXITS' ||
                        successMessage['status'] == 'NOT_FOUND'
                    ? 'NO'
                    : 'OKAY'),
                onPressed: () {
                  Navigator.pop(context);
                },
              ),
              successMessage['status'] == 'ALREADY_EXITS' ||
                      successMessage['status'] == 'NOT_FOUND'
                  ? FlatButton(
                      child: Text('YES'),
                      onPressed: () {
                        _changeMode();
                        Navigator.pop(context);
                      },
                    )
                  : Container()
            ],
          );
        },
      );
    }
  }

  void _setLocation(LocationData locationData) {
    _formData['location'] = locationData;
  }

  DecorationImage _buildBackgroundImage() {
    return DecorationImage(
      fit: BoxFit.cover,
      image: AssetImage('assets/background.jpg'),
      colorFilter:
          ColorFilter.mode(Colors.black.withOpacity(0.4), BlendMode.dstATop),
    );
  }

  @override
  Widget build(BuildContext context) {
    // final double deviceWidth = MediaQuery.of(context).size.width;
    // final double targetWidth = deviceWidth > 768.0 ? 500.0 : deviceWidth * 0.95;
    return ScopedModelDescendant<MainModel>(
      builder: (BuildContext context, Widget child, MainModel model) {
        return Scaffold(
          body: Container(
            decoration: BoxDecoration(image: _buildBackgroundImage()),
            height: MediaQuery.of(context).size.height,
            padding: EdgeInsets.all(5.0),
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.max,
                mainAxisAlignment: MainAxisAlignment.center,
                children: <Widget>[
                  Container(
                    padding: EdgeInsets.only(top: 100),
                    child: Image.asset(
                      'assets/logo-icon.png',
                      height: 100,
                      width: MediaQuery.of(context).size.width,
                    ),
                  ),
                  Container(
                    padding: EdgeInsets.only(top: 100.0),
                    child: Form(
                      key: _formKey,
                      child: Column(
                        children: <Widget>[
                          _buildPhoneField(),
                          SizedBox(
                            height: 8.0,
                          ),
                          _authMode == AuthMode.Login
                              ? Container()
                              : _buildNameField(),
                          SizedBox(
                            height: 8.0,
                          ),
                          _authMode == AuthMode.Login
                              ? Container()
                              : LocationInput(_setLocation, locationData),
                          _authMode == AuthMode.Login
                              ? Container()
                              : _buildCheckTermsTile(),
                          model.isUserLoading
                              ? CircularProgressIndicator()
                              : Material(
                                  elevation: 5.0,
                                  borderRadius: BorderRadius.circular(30.0),
                                  color: Theme.of(context).buttonColor,
                                  child: MaterialButton(
                                    minWidth: MediaQuery.of(context).size.width,
                                    padding: EdgeInsets.fromLTRB(
                                        10.0, 15.0, 20.0, 15.0),
                                    onPressed: () =>
                                        _submitForm(model.authenticate),
                                    child: Text(
                                      _authMode == AuthMode.Login
                                          ? 'Login'
                                          : 'Signup',
                                      style: TextStyle(
                                        fontSize: 20.0,
                                        color: Colors.white,
                                      ),
                                    ),
                                  ),
                                ),
                          FlatButton(
                            child: Text(
                              'Click Here To ${_authMode == AuthMode.Login ? 'Signup' : 'Login'}',
                              style: TextStyle(
                                fontSize: 16.0,
                                fontWeight: FontWeight.w500,
                                color: Colors.blue,
                              ),
                            ),
                            onPressed: _changeMode,
                          )
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
