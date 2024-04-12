import 'package:flutter/material.dart';
import 'package:root_app/scoped_models/main.dart';
import 'package:scoped_model/scoped_model.dart';

class CompletedIncidentsPage extends StatefulWidget {
  @override
  State<StatefulWidget> createState() {
    return _CompletedIncidentsPage();
  }
}

class _CompletedIncidentsPage extends State<CompletedIncidentsPage> {
  @override
  Widget build(BuildContext context) {
    return ScopedModelDescendant<MainModel>(
      builder: (BuildContext contect, Widget child, MainModel model) {
        return Container(
          child: model.isIncidentLoading
              ? Center(child: CircularProgressIndicator())
              : model.getCompletedIncidentList.length == 0
                  ? Center(
                      child: Text('Incident Not Found'),
                    )
                  : ListView.builder(
                      itemBuilder: (BuildContext context, int index) {
                        return Dismissible(
                          key: Key(
                              model.getCompletedIncidentList[index].truckNo),
                          onDismissed: (DismissDirection direction) {
                            if (direction == DismissDirection.endToStart) {
                              // model.selectProduct(model.allProducts[index].id);
                              // model.deleteProduct();
                            }
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
                                  title: Text(
                                    model.getCompletedIncidentList[index]
                                        .truckNo,
                                  ),
                                  subtitle: Text(
                                    model.getCompletedIncidentList[index]
                                        .description,
                                  ),
                                  onTap: () => Navigator.pushNamed<bool>(
                                      context,
                                      '/incident/' +
                                          model.getCompletedIncidentList[index]
                                              .id)),
                              Divider()
                            ],
                          ),
                        );
                      },
                      itemCount: model.getCompletedIncidentList.length,
                    ),
        );
      },
    );
  }
}
