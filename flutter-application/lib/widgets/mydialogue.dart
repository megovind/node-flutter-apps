import 'package:flutter/material.dart';
import 'package:scoped_model/scoped_model.dart';

import '../scoped_models/main.dart';

class MyAlertDialogue extends StatefulWidget {
  @override
  State<StatefulWidget> createState() {
    return _MyAlertDialogue();
  }
}

class _MyAlertDialogue extends State<MyAlertDialogue> {
  Map<String, dynamic> _formData = {
    'phone': null,
  };

  final GlobalKey<FormState> _formKey = GlobalKey<FormState>();

  void _submitForm(Function shareApp) async {
    if (!_formKey.currentState.validate()) {
      return;
    }
    _formKey.currentState.save();
    Map<String, dynamic> successResponse = await shareApp(
      _formData['phone'],
    );
    if (successResponse['success']) {
      Navigator.of(context).pop();
    } else {
      showDialog(
        context: context,
        builder: (BuildContext context) {
          return AlertDialog(
            content: Text(successResponse['message']),
            actions: <Widget>[
              FlatButton(
                child: Text('Okay'),
                onPressed: () {
                  Navigator.of(context).pop();
                },
              )
            ],
          );
        },
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return ScopedModelDescendant(
      builder: (BuildContext context, Widget child, MainModel model) {
        return AlertDialog(
          title: Text("User's Phone Number"),
          content: Form(
            key: _formKey,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: <Widget>[
                Padding(
                  padding: EdgeInsets.all(5.0),
                  child: TextFormField(
                    decoration: InputDecoration(
                      counterText: '',
                      labelText: 'Phone Number',
                    ),
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
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(5.0),
                  child: RaisedButton(
                    child: Text("Share App",
                        style: TextStyle(color: Colors.white)),
                    onPressed: () {
                      _submitForm(model.shareApp);
                    },
                  ),
                )
              ],
            ),
          ),
        );
      },
    );
  }
}
