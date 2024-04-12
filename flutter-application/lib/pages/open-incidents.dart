import 'package:flutter/material.dart';
import 'package:root_app/scoped_models/main.dart';
import 'package:scoped_model/scoped_model.dart';

class OpenIncidentsPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return ScopedModelDescendant<MainModel>(
      builder: (BuildContext contect, Widget child, MainModel model) {
        return Container(
          child: model.isIncidentLoading
              ? Center(child: CircularProgressIndicator())
              : model.getInProgeressIncidentList.length == 0
                  ? Center(
                      child: Text('Incident Not Found'),
                    )
                  : ListView.builder(
                      itemBuilder: (BuildContext context, int index) {
                        return Dismissible(
                          key: Key(
                              model.getInProgeressIncidentList[index].truckNo),
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
                                  backgroundImage:
                                      AssetImage('assets/truck.png'),
                                ),
                                title: Text(model
                                    .getInProgeressIncidentList[index].truckNo),
                                subtitle: Text(model
                                    .getInProgeressIncidentList[index]
                                    .description),
                                trailing: Text(
                                  model
                                      .getInProgeressIncidentList[index].status,
                                  style: TextStyle(
                                      color: Colors.green,
                                      fontWeight: FontWeight.bold),
                                ),
                                onTap: () => Navigator.pushNamed<bool>(
                                    context,
                                    '/incident/' +
                                        model.getInProgeressIncidentList[index]
                                            .id),
                              ),
                              Divider()
                            ],
                          ),
                        );
                      },
                      itemCount: model.getInProgeressIncidentList.length,
                    ),
        );
      },
    );
  }
}
