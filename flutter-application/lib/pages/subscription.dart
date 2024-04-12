import 'package:flutter/material.dart';
import 'package:scoped_model/scoped_model.dart';
import 'package:intl/intl.dart';
import 'package:flutter_money_formatter/flutter_money_formatter.dart';

import '../widgets/navigation_drawer.dart';
import '../scoped_models/main.dart';

class SubscriptionPage extends StatefulWidget {
  final MainModel model;
  SubscriptionPage(this.model);
  @override
  State<StatefulWidget> createState() {
    return _SubscriptionPage();
  }
}

class _SubscriptionPage extends State<SubscriptionPage> {
  static final _startDate = new DateTime.now();
  static final formatter = new DateFormat.yMMMMd("en_US");
  static final _endDate = _startDate.add(new Duration(days: 90));
  String endDate = formatter.format(_endDate);
  String startDate = formatter.format(_startDate);
  static double chargePerTruckPerMonth = 500;
  static double months = 3;
  static double numberOfTrucks = 0.0;

  @override
  void initState() {
    setState(() {
      numberOfTrucks = widget.model.allTrucks.length.toDouble();
    });
    super.initState();
  }

  void _getSubscription(MainModel model) async {
    double subscriptionCharge = model.allTrucks.length * months * chargePerTruckPerMonth;
    final successMessage = await model.addSubscription(
      numberOfTrucks,
      months,
      chargePerTruckPerMonth,
      subscriptionCharge,
      _startDate,
      _endDate,
    );
    if (successMessage['success']) {
      showDialog(
        context: context,
        builder: (BuildContext context) {
          return AlertDialog(
            content: Text('Congratulation!, Your Trial Has Started'),
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

  _currenyFormatter(double amount) {
    MoneyFormatterOutput fo = FlutterMoneyFormatter(
      amount: amount,
      settings: MoneyFormatterSettings(
          symbol: '₹',
          thousandSeparator: ',',
          decimalSeparator: '.',
          symbolAndNumberSeparator: ' ',
          fractionDigits: 2,
          compactFormatType: CompactFormatType.short),
    ).output;
    return fo.symbolOnLeft;
  }

  @override
  Widget build(BuildContext context) {
    return ScopedModelDescendant<MainModel>(
      builder: (BuildContext context, Widget child, MainModel model) {
        return Scaffold(
          drawer: NavigationDrawer(),
          appBar: AppBar(
            title: Text('Subscription'),
            automaticallyImplyLeading: true,
            leading: IconButton(
              icon: Icon(Icons.arrow_back),
              onPressed: () => Navigator.pushReplacementNamed(context, '/home'),
            ),
          ),
          bottomNavigationBar: model.user.inTrial
              ? BottomAppBar()
              : BottomAppBar(
                  notchMargin: 0,
                  color: Colors.blue,
                  child: FlatButton(
                    child: Text(
                      !model.user.isTrialDone ? "START FREE TRIAL" : 'GET SUBSCRIPTION',
                      style: TextStyle(color: Colors.white),
                    ),
                    onPressed: () => _getSubscription(model),
                  ),
                ),
          body: WillPopScope(
            onWillPop: () => Navigator.pushReplacementNamed(context, '/home'),
            child: SingleChildScrollView(
              child: Container(
                height: MediaQuery.of(context).size.height * 0.80,
                width: MediaQuery.of(context).size.width,
                child: Card(
                  child: Column(
                    children: <Widget>[
                      Row(
                        children: <Widget>[
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: <Widget>[
                              Container(
                                padding: EdgeInsets.all(10),
                                child: Text(
                                  'Number of Trucks',
                                  style: TextStyle(fontWeight: FontWeight.bold),
                                ),
                              ),
                              Container(
                                padding: EdgeInsets.all(10),
                                child: model.user.isTrialDone
                                    ? Text('Subscription Duration')
                                    : Text('Trial Duration ', style: TextStyle(fontWeight: FontWeight.bold)),
                              ),
                              Container(
                                padding: EdgeInsets.all(10),
                                child: Text('Total Subscription Charge', style: TextStyle(fontWeight: FontWeight.bold)),
                              ),
                              Container(
                                padding: EdgeInsets.all(10),
                                child: Text('Start Date ', style: TextStyle(fontWeight: FontWeight.bold)),
                              ),
                              Container(
                                padding: EdgeInsets.all(10),
                                child: Text('End Date ', style: TextStyle(fontWeight: FontWeight.bold)),
                              ),
                            ],
                          ),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: <Widget>[
                              Container(
                                padding: EdgeInsets.all(10),
                                child: Text(model.allTrucks.length.toString()),
                              ),
                              Container(
                                padding: EdgeInsets.all(10),
                                child: Text('3 Months'),
                              ),
                              Container(
                                padding: EdgeInsets.all(10),
                                child: Text(
                                    _currenyFormatter(numberOfTrucks * months * chargePerTruckPerMonth).toString()),
                              ),
                              Container(
                                padding: EdgeInsets.all(10),
                                child: Text(startDate),
                              ),
                              Container(
                                padding: EdgeInsets.all(10),
                                child: Text(endDate),
                              )
                            ],
                          ),
                        ],
                      ),
                      Container(
                        padding: EdgeInsets.only(top: 230),
                        alignment: Alignment.bottomCenter,
                        child: Text(
                          'After 3 Month Trial You Will be Charged Rs 500 Per Month For One Truck',
                          textAlign: TextAlign.center,
                          style: TextStyle(fontWeight: FontWeight.bold, color: Colors.blue),
                        ),
                      )
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
