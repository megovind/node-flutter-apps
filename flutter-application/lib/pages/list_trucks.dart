import 'package:flutter/material.dart';
import 'package:scoped_model/scoped_model.dart';

import '../scoped_models/main.dart';
import '../pages/add_truck.dart';

class TruckListPage extends StatefulWidget {
  final MainModel model;
  TruckListPage(this.model);

  @override
  State<StatefulWidget> createState() {
    return _TruckListPage();
  }
}

class _TruckListPage extends State<TruckListPage> {
  @override
  void initState() {
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return ScopedModelDescendant<MainModel>(
      builder: (BuildContext context, Widget child, MainModel model) {
        return Scaffold(
          appBar: AppBar(
            title: Text('Trucks'),
            automaticallyImplyLeading: true,
            leading: IconButton(
              icon: Icon(Icons.arrow_back),
              onPressed: () => Navigator.pushReplacementNamed(context, '/home'),
            ),
          ),
          floatingActionButtonLocation:
              FloatingActionButtonLocation.centerFloat,
          floatingActionButton: FloatingActionButton.extended(
              elevation: 2.0,
              icon: Icon(Icons.add),
              label: Text('Add Truck'),
              backgroundColor: Theme.of(context).buttonColor,
              onPressed: () {
                Navigator.pushReplacementNamed(context, '/add-truck');
              }),
          body: WillPopScope(
            onWillPop: () => Navigator.pushReplacementNamed(context, '/home'),
            child: Container(
              child: model.allTrucks.length == 0
                  ? model.isTrucksLoading
                      ? Center(child: CircularProgressIndicator())
                      : Center(
                          child: Text('Truck Not Found'),
                        )
                  : ListView.builder(
                      itemBuilder: (BuildContext context, int index) {
                        return Dismissible(
                          key: Key(model.allTrucks[index].id),
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
                                title: Text(
                                    model.allTrucks[index].modelNo != null
                                        ? model.allTrucks[index].modelNo
                                        : "Model is required"),
                                subtitle: Text(model.allTrucks[index].regNo),
                                trailing: IconButton(
                                  icon: Icon(Icons.edit),
                                  onPressed: () {
                                    model
                                        .selectTruck(model.allTrucks[index].id);
                                    Navigator.of(context).push(
                                      MaterialPageRoute(
                                        builder: (BuildContext context) {
                                          return AddTruckPage();
                                        },
                                      ),
                                    );
                                  },
                                ),
                                onTap: () => Navigator.pushNamed<bool>(context,
                                    '/truck/' + model.allTrucks[index].id),
                              ),
                              Divider()
                            ],
                          ),
                        );
                      },
                      itemCount: model.allTrucks.length,
                    ),
            ),
          ),
        );
      },
    );
  }
}
