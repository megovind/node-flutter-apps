import 'package:flutter/material.dart';
import 'package:flutter/painting.dart';
import 'package:flutter/rendering.dart';
import 'package:scoped_model/scoped_model.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:firebase_remote_config/firebase_remote_config.dart';
import 'package:package_info/package_info.dart';

import '../helper/firebase_notification_handler.dart';
import '../scoped_models/main.dart';
import '../widgets/mydialogue.dart';
import '../widgets/navigation_drawer.dart';

class HomePage extends StatefulWidget {
  final MainModel model;
  HomePage(this.model);
  @override
  State<StatefulWidget> createState() {
    return _HomePage();
  }
}

class _HomePage extends State<HomePage> {
// final APP_STORE_URL =
// 'https://phobos.apple.com/WebObjects/MZStore.woa/wa/viewSoftwareUpdate?id=YOUR-APP-ID&mt=8';
  final playStoreUrl =
      'https://play.google.com/store/apps/details?id=in.root.root_app';

  @override
  void initState() {
    try {
      versionCheck(context);
    } catch (e) {
      print(e);
    }
    super.initState();
    widget.model.fetchTruckDocuments();
    widget.model.fetchTrucks();
    widget.model.autoAuthenticate();
    widget.model.fetchSpecilizationTypes();
    new FirebaseNotifications().setUpFirebase();
  }

  // _buildAlertDialogue() {
  //   showDialog(
  //       context: context,
  //       builder: (BuildContext context) {
  //         return AlertDialog(
  //           contentPadding: EdgeInsets.fromLTRB(10, 20, 10, 10),
  //           content: Text(
  //               'Please Take a Moment To Provide Feedback On Google Play Store...'),
  //           actions: <Widget>[
  //             FlatButton(
  //               child: Text('CANCEL'),
  //               onPressed: () => Navigator.of(context).pop(),
  //             ),
  //             FlatButton(
  //               child: Text('OKAY'),
  //               onPressed: () => launch(
  //                   'https://play.google.com/store/apps/details?id=in.root.root_app&hl=en'),
  //             ),
  //             FlatButton(
  //               child: Text('MAYBE LATER'),
  //               onPressed: () =>
  //                   Navigator.pushReplacementNamed(context, '/add-truck'),
  //             )
  //           ],
  //         );
  //       });
  // }

  versionCheck(context) async {
    //Get Current installed version of app
    final PackageInfo info = await PackageInfo.fromPlatform();
    double currentVersion =
        double.parse(info.version.trim().replaceAll(".", ""));

    //Get Latest version info from firebase config

    final RemoteConfig remoteConfig = await RemoteConfig.instance;

    try {
      // Using default duration to force fetching from remote server.
      await remoteConfig.fetch(expiration: const Duration(seconds: 0));
      await remoteConfig.activateFetched();
      remoteConfig.getString('force_update_current_version');
      double newVersion = double.parse(remoteConfig
          .getString('force_update_current_version')
          .trim()
          .replaceAll(".", ""));

      if (newVersion > currentVersion) {
        _showVersionDialog(context);
      }
    } on FetchThrottledException catch (exception) {
      // Fetch throttled.
      print(exception);
    } catch (exception) {
      print('Unable to fetch remote config. Cached or default values will be '
          'used');
    }
  }

  _showVersionDialog(context) async {
    await showDialog<String>(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        String title = "New Update Available";
        String message =
            "There is a newer version of app available please update it now.";
        String btnLabel = "UPDATE NOW";
        String btnLabelCancel = "LATER";
        // return Platform.isIOS
        //     ? new CupertinoAlertDialog(
        //         title: Text(title),
        //         content: Text(message),
        //         actions: <Widget>[
        //           FlatButton(
        //             child: Text(btnLabel),
        //             onPressed: () => _launchURL(APP_STORE_URL),
        //           ),
        //           FlatButton(
        //             child: Text(btnLabelCancel),
        //             onPressed: () => Navigator.pop(context),
        //           ),
        //         ],
        //       )
        return new AlertDialog(
          title: Text(title),
          content: Text(message),
          actions: <Widget>[
            FlatButton(
              child: Text(btnLabel),
              onPressed: () => _launchURL(playStoreUrl),
            ),
            FlatButton(
              child: Text(btnLabelCancel),
              onPressed: () => Navigator.pop(context),
            ),
          ],
        );
      },
    );
  }

  _launchURL(String url) async {
    if (await canLaunch(url)) {
      await launch(url);
    } else {
      throw 'Could not launch $url';
    }
  }

  Future<bool> _onBackPressed() {
    return showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: Text('Are you sure?'),
          content: Text('You Are Going To Exit The Application!'),
          actions: <Widget>[
            FlatButton(
              child: Text('NO'),
              onPressed: () {
                Navigator.of(context).pop(false);
              },
            ),
            FlatButton(
              child: Text('YES'),
              onPressed: () {
                Navigator.of(context).pop(true);
              },
            ),
          ],
        );
      },
    );
  }

  DecorationImage _buildBackgroundImage() {
    return DecorationImage(
      fit: BoxFit.cover,
      image: AssetImage('assets/background.jpg'),
      colorFilter:
          ColorFilter.mode(Colors.black.withOpacity(0.8), BlendMode.dstATop),
    );
  }

  @override
  Widget build(BuildContext context) {
    return ScopedModelDescendant<MainModel>(
      builder: (BuildContext context, Widget child, MainModel model) {
        return WillPopScope(
          onWillPop: () => _onBackPressed(),
          child: Scaffold(
            drawer: NavigationDrawer(),
            appBar: AppBar(
              title: model.isLoading ? Text('root') : Text(model.user.name),
            ),
            body: Container(
              decoration: BoxDecoration(image: _buildBackgroundImage()),
              child: Center(
                child: SingleChildScrollView(
                    child: Padding(
                  padding: EdgeInsets.all(10.0),
                  child: Column(
                    children: <Widget>[
                      // !model.isLoading ? _buildAlertDialogue() : Container(),
                      Padding(
                        padding: EdgeInsets.only(top: 10),
                        child: SizedBox(
                          width: double.infinity,
                          child: FlatButton.icon(
                            color: Theme.of(context).buttonColor,
                            icon: Icon(
                              Icons.phone,
                              color: Colors.white,
                              size: 30.0,
                            ),
                            label: Text(
                              '+91-88778 80011',
                              maxLines: 1,
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 31.0,
                              ),
                            ),
                            padding: EdgeInsets.symmetric(
                              vertical: 15.0,
                            ),
                            onPressed: () => launch("tel://+91-88778 80011"),
                          ),
                        ),
                      ),
                      Padding(
                        padding: EdgeInsets.only(top: 10),
                        child: SizedBox(
                          width: double.infinity,
                          child: FlatButton.icon(
                            color: Theme.of(context).buttonColor,
                            icon: Icon(
                              Icons.add,
                              color: Colors.white,
                              size: 30.0,
                            ),
                            label: Text(
                              'Truck',
                              maxLines: 1,
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 31.0,
                              ),
                            ),
                            padding: EdgeInsets.symmetric(
                              vertical: 15.0,
                            ),
                            onPressed: () => Navigator.pushReplacementNamed(
                                context, '/add-truck'),
                          ),
                        ),
                      ),
                      Padding(
                        padding: EdgeInsets.only(top: 10),
                        child: SizedBox(
                          width: double.infinity,
                          child: FlatButton(
                            color: Theme.of(context).buttonColor,
                            padding: EdgeInsets.symmetric(
                              vertical: 15.0,
                            ),
                            // icon: Icon(
                            //   Icons.add,
                            //   color: Colors.white,
                            //   size: 30.0,
                            // ),
                            child: Text(
                              'Register Incident',
                              maxLines: 1,
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 28.0,
                              ),
                            ),
                            onPressed: () {
                              Navigator.pushReplacementNamed(
                                  context, '/register-incident');
                            },
                          ),
                        ),
                      ),
                      Padding(
                        padding: EdgeInsets.only(top: 10),
                        child: new SizedBox(
                          width: double.infinity,
                          child: FlatButton.icon(
                            color: Theme.of(context).buttonColor,
                            icon: Icon(
                              Icons.share,
                              color: Colors.white,
                              size: 30.0,
                            ), //`Icon` to display
                            label: Text(
                              'Share App',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 30.0,
                              ),
                            ),
                            padding: EdgeInsets.symmetric(
                              vertical: 15.0,
                            ), //`Text` to display
                            onPressed: () {
                              showDialog(
                                context: context,
                                builder: (BuildContext context) {
                                  return MyAlertDialogue();
                                },
                              );
                            },
                          ),
                        ),
                      ),
                    ],
                  ),
                )),
              ),
            ),
          ),
        );
      },
    );
  }
}
