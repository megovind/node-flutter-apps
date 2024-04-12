import 'package:flutter/material.dart';
import 'package:root_app/scoped_models/main.dart';
import 'package:scoped_model/scoped_model.dart';

import '../pages/open-incidents.dart';
import '../pages/completed-incidents.dart';
import '../widgets/navigation_drawer.dart';

class IncidentsSummary extends StatefulWidget {
  final MainModel model;

  IncidentsSummary(this.model);
  @override
  State<StatefulWidget> createState() {
    return _IncidentsSummary();
  }
}

class _IncidentsSummary extends State<IncidentsSummary> {
  @override
  void initState() {
    widget.model.fetchAllIncidents();
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return DefaultTabController(
        length: 2,
        child: ScopedModelDescendant<MainModel>(
          builder: (BuildContext contect, Widget child, MainModel model) {
            return Scaffold(
              drawer: NavigationDrawer(),
              appBar: AppBar(
                title: Text('Case Management'),
                leading: IconButton(
                  icon: Icon(Icons.arrow_back),
                  onPressed: () =>
                      Navigator.pushReplacementNamed(context, '/home'),
                ),
                bottom: TabBar(
                  tabs: <Widget>[
                    Tab(
                      text: 'Open',
                    ),
                    // Tab(
                    //   text: 'Pending',
                    // ),
                    Tab(
                      text: 'Completed',
                    )
                  ],
                ),
              ),
              body: WillPopScope(
                onWillPop: () =>
                    Navigator.pushReplacementNamed(context, '/home'),
                child: TabBarView(
                  children: <Widget>[
                    OpenIncidentsPage(),
                    // PendingIssuePage(),
                    CompletedIncidentsPage()
                  ],
                ),
              ),
            );
          },
        ));
  }
}
