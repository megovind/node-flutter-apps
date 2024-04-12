import 'package:flutter/material.dart';
import 'package:root_app/scoped_models/main.dart';
import 'package:scoped_model/scoped_model.dart';

class PendingIncidentPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ScopedModelDescendant<MainModel>(
      builder: (BuildContext contect, Widget child, MainModel model) {
        return Container(
          child: model.getPendingIncidentList.length == 0
              ? model.isIncidentLoading
                  ? Center(child: CircularProgressIndicator())
                  : Center(
                      child: Text('Incident Not Found'),
                    )
              : ListView.builder(
                  itemBuilder: (BuildContext context, int index) {
                    return Dismissible(
                      key: Key(model.getPendingIncidentList[index].truckNo),
                      onDismissed: (DismissDirection direction) {
                        if (direction == DismissDirection.endToStart) {}
                      },
                      background: Container(
                        color: Colors.deepPurpleAccent,
                      ),
                      child: Column(
                        children: <Widget>[
                          ListTile(
                            leading: CircleAvatar(
                              backgroundImage: AssetImage('assets/truck.png'),
                            ),
                            title: Text(
                                model.getPendingIncidentList[index].truckNo),
                            subtitle: Text(model
                                .getPendingIncidentList[index].description),
                            onTap: () => Navigator.pushNamed<bool>(
                                context,
                                '/incident/' +
                                    model.getPendingIncidentList[index].id),
                          ),
                          Divider()
                        ],
                      ),
                    );
                  },
                  itemCount: model.getPendingIncidentList.length,
                ),
        );
      },
    );
  }
}
