import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:intl/intl.dart';
import 'package:scoped_model/scoped_model.dart';
// import 'package:razorpay_flutter/razorpay_flutter.dart';
import '../scoped_models/main.dart';

class IncidentPage extends StatefulWidget {
  final MainModel model;
  final String incidentId;
  IncidentPage(this.model, this.incidentId);

  @override
  State<StatefulWidget> createState() {
    return _IncidentPage();
  }
}

class _IncidentPage extends State<IncidentPage> {
  @override
  void initState() {
    widget.model.fetchIncidentById(widget.incidentId);

    super.initState();
  }
  // final _razorPay = Razorpay();

  // var options = {
  //   'key': 'rzp_test_AHZOjOI9vF2vo5',
  //   'amount': 100,
  //   'name': 'Acme Corp.',
  //   'description': 'Fine T-Shirt',
  //   'prefill': {'contact': '8888888888', 'email': 'test@razorpay.com'}
  // };

  _buildImagePreview(String imageLink) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          content: Image.network(
            imageLink,
            fit: BoxFit.contain,
          ),
        );
      },
    );
  }

  Widget build(BuildContext context) {
    return ScopedModelDescendant<MainModel>(
      builder: (BuildContext context, Widget child, MainModel model) {
        return Scaffold(
          appBar: AppBar(
            title: Text('Incident'),
            leading: IconButton(
              icon: Icon(Icons.arrow_back),
              onPressed: () =>
                  Navigator.popAndPushNamed(context, '/incidents-summary'),
            ),
          ),
          body: WillPopScope(
            onWillPop: () =>
                Navigator.pushReplacementNamed(context, '/incidents-summary'),
            child: model.isIncidentLoading
                ? Center(
                    child: CircularProgressIndicator(),
                  )
                : SingleChildScrollView(
                    child: Card(
                      child: Container(
                        padding: EdgeInsets.all(10),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: <Widget>[
                            Container(
                              child: ListTile(
                                leading: CircleAvatar(
                                  backgroundImage:
                                      AssetImage('assets/truck.png'),
                                ),
                                title: Text(model.selectedIncident.truckNo),
                                subtitle: Text(
                                    model.selectedIncident.truckModel != null
                                        ? model.selectedIncident.truckModel
                                        : "Truck Model"),
                                trailing: Text(
                                  model.selectedIncident.status,
                                  style: TextStyle(
                                      color: Colors.green,
                                      fontWeight: FontWeight.bold),
                                ),
                              ),
                            ),
                            Divider(),
                            Container(
                              child: ListTile(
                                selected: true,
                                leading: Icon(Icons.place),
                                title: Text(
                                    model.selectedIncident.location.address),
                              ),
                            ),
                            Divider(),
                            Container(
                              child: ListTile(
                                leading: Icon(Icons.list),
                                title: Text(
                                    model.selectedIncident.types.join(', ')),
                              ),
                            ),
                            Divider(),
                            model.selectedIncident.driver != null
                                ? Container(
                                    child: ListTile(
                                      leading: Image.asset('assets/driver.png'),
                                      title: Text(
                                          model.selectedIncident.driver.name),
                                      subtitle: Text(
                                          model.selectedIncident.driver.phone),
                                      trailing: IconButton(
                                        icon: Icon(Icons.phone),
                                        onPressed: () => launch(
                                            'tel://${model.selectedIncident.driver.phone}'),
                                      ),
                                    ),
                                  )
                                : Container(),
                            Divider(),
                            Container(
                              padding: EdgeInsets.all(10),
                              decoration: BoxDecoration(color: Colors.blue),
                              alignment: Alignment.topLeft,
                              child: Text('AGENT DETAILS'),
                            ),
                            model.selectedIncident.representative.length == 0
                                ? Container(
                                    child: Center(
                                      child:
                                          Text('Representative Not Assigned'),
                                    ),
                                  )
                                : Padding(
                                    padding: EdgeInsets.all(10),
                                    child: ListView.builder(
                                      primary: false,
                                      shrinkWrap: true,
                                      itemCount: model.selectedIncident
                                          .representative.length,
                                      itemBuilder:
                                          (BuildContext context, int index) {
                                        return Container(
                                          child: Column(
                                            children: <Widget>[
                                              ListTile(
                                                leading:
                                                    Icon(Icons.person_outline),
                                                title: Text(model
                                                            .selectedIncident
                                                            .representative[
                                                                index]
                                                            .name !=
                                                        null
                                                    ? model
                                                        .selectedIncident
                                                        .representative[index]
                                                        .name
                                                    : 'UNKNOWN'),
                                                subtitle: Text(model
                                                    .selectedIncident
                                                    .representative[index]
                                                    .phone),
                                                trailing: IconButton(
                                                  icon: Icon(Icons.phone),
                                                  onPressed: () => launch(
                                                      'tel://${model.selectedIncident.representative[index].phone}'),
                                                ),
                                              ),
                                            ],
                                          ),
                                        );
                                      },
                                    ),
                                  ),
                            Divider(),
                            model.selectedIncident.incidentLogs.length == 0
                                ? Center(
                                    child: Text('No Updates'),
                                  )
                                : Container(
                                    child: Column(
                                      mainAxisSize: MainAxisSize.min,
                                      children: <Widget>[
                                        Container(
                                          padding: EdgeInsets.all(10),
                                          decoration:
                                              BoxDecoration(color: Colors.blue),
                                          alignment: Alignment.topLeft,
                                          child: Center(
                                            child: Text('Incident Updates'),
                                          ),
                                        ),
                                        ListView.builder(
                                          primary: false,
                                          shrinkWrap: true,
                                          itemCount: model.selectedIncident
                                              .incidentLogs.length,
                                          itemBuilder: (BuildContext context,
                                              int index) {
                                            return Container(
                                              child: Column(
                                                mainAxisAlignment:
                                                    MainAxisAlignment.start,
                                                children: <Widget>[
                                                  Row(
                                                    mainAxisAlignment:
                                                        MainAxisAlignment
                                                            .spaceBetween,
                                                    children: <Widget>[
                                                      Container(
                                                        alignment:
                                                            Alignment.topRight,
                                                        padding:
                                                            EdgeInsets.all(5),
                                                        child: Text(
                                                          model
                                                              .selectedIncident
                                                              .incidentLogs[
                                                                  index]
                                                              .commentBy,
                                                          style: TextStyle(
                                                            fontWeight:
                                                                FontWeight.bold,
                                                            color: Colors.blue,
                                                          ),
                                                        ),
                                                      ),
                                                      Container(
                                                        alignment:
                                                            Alignment.topLeft,
                                                        child: Text(
                                                          DateFormat.E()
                                                              .add_jm()
                                                              .format(model
                                                                  .selectedIncident
                                                                  .incidentLogs[
                                                                      index]
                                                                  .dateTime),
                                                          style: TextStyle(
                                                              fontSize: 8,
                                                              color:
                                                                  Colors.grey),
                                                        ),
                                                      ),
                                                    ],
                                                  ),
                                                  model
                                                              .selectedIncident
                                                              .incidentLogs[
                                                                  index]
                                                              .image !=
                                                          null
                                                      ? GestureDetector(
                                                          onTap: () =>
                                                              _buildImagePreview(model
                                                                  .selectedIncident
                                                                  .incidentLogs[
                                                                      index]
                                                                  .image),
                                                          child: Container(
                                                            padding:
                                                                EdgeInsets.all(
                                                                    5),
                                                            alignment: Alignment
                                                                .topLeft,
                                                            child:
                                                                Image.network(
                                                              model
                                                                  .selectedIncident
                                                                  .incidentLogs[
                                                                      index]
                                                                  .image,
                                                              fit: BoxFit.cover,
                                                              height: 50.0,
                                                              width: 50.0,
                                                              alignment:
                                                                  Alignment
                                                                      .topCenter,
                                                              loadingBuilder:
                                                                  (BuildContext
                                                                          context,
                                                                      Widget
                                                                          child,
                                                                      ImageChunkEvent
                                                                          loadingProgress) {
                                                                if (loadingProgress ==
                                                                    null)
                                                                  return child;
                                                                return Center(
                                                                  child:
                                                                      CircularProgressIndicator(
                                                                    value: loadingProgress.expectedTotalBytes !=
                                                                            null
                                                                        ? loadingProgress.cumulativeBytesLoaded /
                                                                            loadingProgress.expectedTotalBytes
                                                                        : null,
                                                                  ),
                                                                );
                                                              },
                                                            ),
                                                          ),
                                                        )
                                                      : Container(),
                                                  Container(
                                                    padding: EdgeInsets.all(5),
                                                    alignment:
                                                        Alignment.bottomLeft,
                                                    child: Text(
                                                      model
                                                                  .selectedIncident
                                                                  .incidentLogs[
                                                                      index]
                                                                  .comment !=
                                                              null
                                                          ? model
                                                              .selectedIncident
                                                              .incidentLogs[
                                                                  index]
                                                              .comment
                                                          : 'No Message',
                                                      softWrap: true,
                                                      maxLines: 10,
                                                      overflow:
                                                          TextOverflow.clip,
                                                      style: TextStyle(
                                                          color:
                                                              Colors.blueGrey),
                                                    ),
                                                  ),
                                                  Divider()
                                                ],
                                              ),
                                            );
                                          },
                                        )
                                      ],
                                    ),
                                  ),
                          ],
                        ),
                      ),
                    ),
                  ),
          ),
        );
      },
    );
  }
}
