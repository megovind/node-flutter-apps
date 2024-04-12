import 'dart:convert';
import 'dart:async';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'package:rxdart/subjects.dart';

import '../models/location-model.dart';
import './connected_model.dart';
import '../models/user.dart';
import '../models/auth.dart';
import '../helper/config.dart';

mixin UserModel on ConnectedModel {
  User _authenticatedUser = User();
  bool _userLoading = false;
  PublishSubject<bool> _userSubject = PublishSubject();

  PublishSubject<bool> get userSubject {
    return _userSubject;
  }

  Future<Map<String, dynamic>> authenticate(
      String phone, String name, LocationData location, bool acceptTerms,
      [AuthMode mode = AuthMode.Login]) async {
    _userLoading = true;
    notifyListeners();

    http.Response response;
    if (mode == AuthMode.Signup) {
      final Map<String, dynamic> _authSignUpData = {
        'phone': phone,
        'type': 'transporter',
        'name': name,
        'address': location.address,
        'lat': location.latitude,
        'lng': location.longitude,
        'acceptTerms': acceptTerms
      };
      response = await http.post(
        baseUrl + 'user/sign-up',
        body: json.encode(_authSignUpData),
        headers: {'Content-Type': 'application/json'},
      );
    } else {
      final Map<String, dynamic> _authData = {
        'phone': phone,
      };
      response = await http.post(
        baseUrl + 'user/log-in?type=transporter',
        body: json.encode(_authData),
        headers: {'Content-Type': 'application/json'},
      );
    }
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    final Map<String, dynamic> responseData = json.decode(response.body);
    print(responseData);
    String status = responseData['status'];
    String message = 'Something went wrong';
    if (status == 'SUCCESS') {
      final newUser = User(
        id: responseData['response']['_id'],
        phone: responseData['response']['phone'].toString(),
        name: responseData['response']['name'],
        type: responseData['response']['type'],
        inTrial: responseData['response']['inTrial'],
        isTrialDone: responseData['response']['isTrialDone'],
        trialStartDate: responseData['response']['trialStartDate'],
        trialEndDate: responseData['response']['trialEndDate'],
        location: LocationData(
          address: responseData['response']['location']['address'],
          latitude: double.parse(responseData['response']['location']['lat']),
          longitude: double.parse(responseData['response']['location']['lng']),
        ),
      );
      _authenticatedUser = newUser;
      _userSubject.add(true);
      notifyListeners();
      prefs.setString('phone', phone);
      prefs.setString('userId', responseData['response']['_id']);
      prefs.setString('regId', responseData['response']['regId']);
      prefs.setString('name', responseData['response']['name']);
      prefs.setBool('inTrial', responseData['response']['inTrial']);
      prefs.setBool('isTrialDone', responseData['response']['isTrialDone']);
      message = responseData['message'];
    } else {
      message = responseData['message'];
    }
    _userLoading = false;
    notifyListeners();
    return {'status': status, 'message': message};
  }

  Future<Map<String, dynamic>> verifyOtp(String otpCode) async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    _userLoading = true;
    notifyListeners();
    final Map<String, dynamic> _otpAuthData = {
      '_id': prefs.getString('regId'),
      'phone': prefs.getString('phone'),
      'userId': prefs.getString('userId'),
      'code': otpCode
    };
    final http.Response response = await http.post(
      baseUrl + 'user/verify-otp',
      body: json.encode(_otpAuthData),
      headers: {'Content-Type': 'application/json'},
    );
    final Map<String, dynamic> responseData = json.decode(response.body);
    print(responseData);
    bool hasError = true;
    String message = 'Something went wrong';
    if (responseData['status'] == 'SUCCESS') {
      _authenticatedUser = User(type: responseData["response"]['type']);
      hasError = false;
      _userSubject.add(true);
      prefs.setString('token', responseData["response"]['access_token']);
      message = responseData['message'];
    } else if (responseData['status'] == 'ERROR') {
      message = responseData['message'];
    } else if (responseData['status'] == 'WRONGOTP') {
      message = responseData['message'];
    }
    _userLoading = false;
    notifyListeners();
    return {'success': !hasError, 'message': message};
  }

  void autoAuthenticate() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    final String token = prefs.getString('token');
    if (token != null) {
      prefs.setBool('keyIsFirstLoaded', false);
      final String userPhone = prefs.getString('phone');
      final String userId = prefs.getString('userId');
      final String userType = prefs.getString('type');
      final String name = prefs.getString('name');
      final bool inTrial = prefs.getBool('inTrial');
      final bool isTrialDone = prefs.getBool('isTrialDone');
      _authenticatedUser = User(
          id: userId,
          phone: userPhone,
          token: token,
          type: userType,
          name: name,
          inTrial: inTrial,
          isTrialDone: isTrialDone);

      _userSubject.add(true);
      notifyListeners();
    }
  }

  void logout() async {
    _authenticatedUser = null;
    _userSubject.add(false);
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    prefs.remove('token');
    prefs.remove('phone');
    prefs.remove('userId');
    prefs.remove('type');
    prefs.remove('name');
    notifyListeners();
  }

  bool get isUserLoading {
    return _userLoading;
  }

  User get user {
    return _authenticatedUser;
  }
}
