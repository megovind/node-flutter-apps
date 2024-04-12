import 'package:flutter/material.dart';
import 'package:scoped_model/scoped_model.dart';
import 'package:pinput/pin_put/pin_put.dart';

import 'package:root_app/scoped_models/main.dart';

class OtpPage extends StatelessWidget {
  DecorationImage _buildBackgroundImage() {
    return DecorationImage(
      fit: BoxFit.cover,
      image: AssetImage('assets/background.jpg'),
      colorFilter:
          ColorFilter.mode(Colors.black.withOpacity(0.8), BlendMode.dstATop),
    );
  }

  void _submitForm(
      Function verifyOtp, String code, BuildContext context) async {
    Map<String, dynamic> successMessage;
    successMessage = await verifyOtp(code);
    if (successMessage['success']) {
      Navigator.pushReplacementNamed(context, '/home');
    } else {
      showDialog(
        context: context,
        builder: (BuildContext context) {
          return AlertDialog(
            title: Text('An Error Occured'),
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
        },
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return ScopedModelDescendant<MainModel>(
      builder: (BuildContext context, Widget child, MainModel model) {
        return Scaffold(
          resizeToAvoidBottomPadding: true,
          body: Container(
            height: MediaQuery.of(context).size.height,
            padding: EdgeInsets.all(5.0),
            decoration: BoxDecoration(
              image: _buildBackgroundImage(),
            ),
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
                    padding: EdgeInsets.only(top: 90),
                    child: Column(
                      children: <Widget>[
                        Card(
                            child: Column(
                          children: <Widget>[
                            Container(
                              padding: EdgeInsets.all(10),
                              child: Text(
                                'Please Enter 4 Digit OTP',
                                style: TextStyle(
                                    color: Colors.black, fontSize: 20),
                              ),
                            ),
                            Divider(),
                            Container(
                              padding: EdgeInsets.all(5),
                              child: PinPut(
                                clearInput: true,
                                inputDecoration: InputDecoration(
                                  counterText: '',
                                  fillColor: Colors.white,
                                ),
                                fieldsCount: 4,
                                actionButtonsEnabled: false,
                                onSubmit: (String pin) =>
                                    _submitForm(model.verifyOtp, pin, context),
                              ),
                            ),
                          ],
                        )),
                        SizedBox(
                          height: 10.0,
                        ),
                        Padding(
                          padding: EdgeInsets.all(10.0),
                          child: Material(
                            elevation: 5.0,
                            borderRadius: BorderRadius.circular(30.0),
                            color: Theme.of(context).buttonColor,
                            child: MaterialButton(
                              minWidth: MediaQuery.of(context).size.width,
                              padding:
                                  EdgeInsets.fromLTRB(10.0, 15.0, 10.0, 10.0),
                              onPressed: () {},
                              child: Text(
                                'Resend OTP',
                                textAlign: TextAlign.center,
                                style: TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ),
                        )
                      ],
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
