import 'dart:io';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:shared_preferences/shared_preferences.dart';

class FirebaseNotifications {
  FirebaseMessaging _firebaseMessaging;

  void setUpFirebase() {
    _firebaseMessaging = FirebaseMessaging();
    firebaseCloudMessagingListeners();
  }

  void firebaseCloudMessagingListeners() {
    if (Platform.isIOS) iOSPermission();
    _firebaseMessaging.getToken().then((token) async {
      final SharedPreferences prefs = await SharedPreferences.getInstance();
      if (token != null) {
        if (prefs.getString('registrationToken') != token) {
          prefs.setString('registrationToken', token);
          final data = {"token": token};
          try {
            await http.post(
              'https://dev.root.in/utility/save-notification-token/root_app/${prefs.getString('userId')}',
              body: json.encode(data),
              headers: {
                'Content-Type': 'application/json',
                'authorization': 'JWT ' + prefs.getString('token')
              },
            ).then((response) {
              final responseData = json.decode(response.body);
              print('token' +
                  responseData['updateToken']['agentFcmToken'].toString());
            });
          } catch (e) {
            print('error' + e.toString());
          }
        } else {
          print('Token is already saved');
        }
      } else {
        print('Token not found');
      }
    });

    _firebaseMessaging.configure(
      onMessage: (Map<String, dynamic> message) async {
        print('on message $message');
      },
      onResume: (Map<String, dynamic> message) async {
        print('on resume $message');
      },
      onLaunch: (Map<String, dynamic> message) async {
        print('on launch $message');
      },
    );
  }

  void iOSPermission() {
    _firebaseMessaging.requestNotificationPermissions(
        IosNotificationSettings(sound: true, badge: true, alert: true));
    _firebaseMessaging.onIosSettingsRegistered
        .listen((IosNotificationSettings settings) {
      print("Settings registered: $settings");
    });
  }
}
