import 'package:flutter/material.dart';
import 'package:share/share.dart';

import '../scoped_models/main.dart';

class UserProfilePage extends StatelessWidget {
  final MainModel model;
  UserProfilePage(this.model);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Your Profile'),
        automaticallyImplyLeading: true,
        leading: IconButton(
          icon: Icon(Icons.arrow_back),
          onPressed: () => Navigator.pushReplacementNamed(context, '/home'),
        ),
      ),
      bottomNavigationBar: BottomAppBar(
        notchMargin: 0,
        color: Colors.blue,
        child: FlatButton(
          child: Text(
            'SHARE APP',
            style: TextStyle(color: Colors.white),
          ),
          onPressed: () => Share.share(
              'You Have Been Invited To root By ${model.user.name}. Download here: https://play.google.com/store/apps/details?id=in.root.root_app&hl=en'),
        ),
      ),
      body: WillPopScope(
        onWillPop: () => Navigator.pushReplacementNamed(context, '/home'),
        child: Container(
          color: Colors.white,
          padding: EdgeInsets.all(10),
          child: ListView(
            children: <Widget>[
              Padding(
                padding: EdgeInsets.only(top: 20.0),
                child: new Stack(
                  fit: StackFit.loose,
                  children: <Widget>[
                    new Row(
                      crossAxisAlignment: CrossAxisAlignment.center,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: <Widget>[
                        new Container(
                          width: 140.0,
                          height: 140.0,
                          decoration: new BoxDecoration(
                            shape: BoxShape.circle,
                            image: new DecorationImage(
                              image: new ExactAssetImage('assets/user.png'),
                              fit: BoxFit.cover,
                            ),
                          ),
                        ),
                      ],
                    ),
                    Padding(
                      padding: EdgeInsets.only(top: 90.0, right: 100.0),
                      child: new Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: <Widget>[
                          new CircleAvatar(
                            backgroundColor: Colors.red,
                            radius: 25.0,
                            child: new Icon(
                              Icons.camera_alt,
                              color: Colors.white,
                            ),
                          )
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                margin: EdgeInsets.only(left: 50.0, right: 50.0),
                child: OutlineButton(
                  borderSide: BorderSide(color: Colors.blue),
                  hoverColor: Colors.blueAccent,
                  highlightElevation: 2.0,
                  child: Text('START FREE TRIAL'),
                  onPressed: () =>
                      Navigator.pushReplacementNamed(context, '/subscription'),
                ),
              ),
              Divider(),
              Container(
                padding: EdgeInsets.only(left: 10),
                child: Text(
                  'Personal Information',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 20),
                ),
              ),
              Divider(),
              Container(
                padding: EdgeInsets.only(left: 10),
                child: TextFormField(
                  decoration: InputDecoration(
                    labelText: 'Name',
                    labelStyle: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 20,
                      color: Colors.black,
                    ),
                  ),
                  initialValue: model.user.name,
                  readOnly: true,
                ),
              ),
              Container(
                padding: EdgeInsets.only(left: 10),
                child: TextFormField(
                  decoration: InputDecoration(
                    labelText: 'Mobile',
                    labelStyle: TextStyle(
                      fontWeight: FontWeight.bold,
                      fontSize: 20,
                      color: Colors.black,
                    ),
                  ),
                  initialValue: model.user.phone,
                  readOnly: true,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
