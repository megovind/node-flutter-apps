import 'package:flutter/material.dart';

import 'package:scoped_model/scoped_model.dart';

import '../scoped_models/main.dart';
import './ui-elements/logout_list_tile.dart';

class NavigationDrawer extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ScopedModelDescendant<MainModel>(
      builder: (BuildContext context, Widget child, MainModel model) {
        return Drawer(
          child: Column(
            children: <Widget>[
              AppBar(
                automaticallyImplyLeading: false,
                title: Text(model.user.name),
              ),
              ListTile(
                leading: Icon(Icons.home),
                title: Text('Home'),
                onTap: () {
                  Navigator.pushReplacementNamed(context, '/home');
                },
              ),
              ListTile(
                leading: Icon(Icons.person),
                title: Text('Profile'),
                onTap: () {
                  Navigator.pushReplacementNamed(context, '/your-profile');
                },
              ),
              ListTile(
                leading: Icon(Icons.done),
                title: Text('Case Management'),
                onTap: () {
                  Navigator.pushReplacementNamed(context, '/incidents-summary');
                },
              ),
              ListTile(
                leading: Icon(Icons.list),
                title: Text('Your Trucks'),
                onTap: () {
                  Navigator.pushReplacementNamed(context, '/trucks');
                },
              ),
              Divider(),
              LogoutListTile(),
            ],
          ),
        );
      },
    );
  }
}
