import 'dart:convert';
import 'dart:async';
import 'dart:io';
import 'package:path/path.dart';
import 'package:async/async.dart';
import 'package:scoped_model/scoped_model.dart';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import '../helper/config.dart';

mixin ConnectedModel on Model {
  bool _isLoading = false;
  int selectedTruckIndex;
  int selectedDocIndex;

  Future<Map<String, dynamic>> uploadImage(File image,
      {String imagePath}) async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    final imageUploadRequest = http.MultipartRequest(
      'POST',
      Uri.parse(baseUrl + 'utility/uploadFileToAws'),
    );
    var stream = new http.ByteStream(DelegatingStream.typed(image.openRead()));
    var length = await image.length();
    final file = new http.MultipartFile('file', stream, length,
        filename: basename(image.path));
    imageUploadRequest.files.add(file);
    if (imagePath != null) {
      imageUploadRequest.fields['imagePath'] = Uri.encodeComponent(imagePath);
    }
    imageUploadRequest.headers['Authorization'] =
        'JWT ${prefs.getString('token')}';

    try {
      final streamResponse = await imageUploadRequest.send();
      final response = await http.Response.fromStream(streamResponse);
      if (response.statusCode != 200 && response.statusCode != 201) {
        print('Something went wrong');
        return null;
      }
      final responseData = json.decode(response.body);
      return responseData['response'];
    } catch (error) {
      print(error);
      return null;
    }
  }
}

mixin UtilityModel on ConnectedModel {
  bool get isLoading {
    return _isLoading;
  }

  Future<Map<String, dynamic>> shareLocation(
      String truckNum, double lat, double lng) async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    final Map<String, dynamic> _locData = {
      'phone': prefs.getString('phone'),
      'truckNum': truckNum,
      'latitude': lat,
      'langitude': lng
    };
    final http.Response response = await http.post(
      baseUrl + 'utility/sendsms',
      headers: {
        'Authorization': 'JWT ' + prefs.getString('token'),
        'Content-Type': 'application/json'
      },
      body: json.encode(_locData),
    );
    bool hasError = true;
    if (response.statusCode == 401) {
      return {'success': !hasError, 'message': 'Unauthorized'};
    }
    final Map<String, dynamic> responseData = json.decode(response.body);
    String message = 'Something went wrong';
    if (responseData['status'] == 'SUCCESS') {
      hasError = false;
      message = responseData['message'];
    } else if (responseData['status'] == "ERROR") {
      message = responseData['message'];
    }
    return {'success': !hasError, 'message': message};
  }

  Future<Map<String, dynamic>> addSubscription(
      double numberOfTruck,
      double numberOfMonth,
      double chargePerTruckPerMonth,
      double totalAmount,
      DateTime startDate,
      DateTime endDate) async {
    _isLoading = true;
    notifyListeners();
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    final Map<String, dynamic> _subscriptionData = {
      'chargePerTruckPerMonth': chargePerTruckPerMonth,
      'numberOfTruck': numberOfTruck,
      'numberOfMonth': numberOfMonth,
      'totalAmount': totalAmount,
      'startDate': startDate.toIso8601String(),
      'endDate': endDate.toIso8601String(),
    };
    final http.Response response = await http.post(
      baseUrl + 'subscription/a.dd-subscription/${prefs.getString('userId')}',
      body: json.encode(_subscriptionData),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'JWT ' + prefs.getString('token')
      },
    );
    bool hasError = true;
    if (response.statusCode == 401) {
      _isLoading = false;
      notifyListeners();
      return {'success': !hasError, 'message': 'Unauthorized'};
    }
    final Map<String, dynamic> responseData = json.decode(response.body);

    String message = 'Something Went Wrong';
    return {'success': !hasError, 'message': message};
  }

  Future<Map<String, dynamic>> shareApp(String phone) async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    final String type = 'transporter';
    final String transporter = 'Yes';
    final Map<String, dynamic> _data = {
      'phone': phone,
    };
    final http.Response response = await http.post(
      baseUrl +
          'representative/invite-people/$type/$transporter/${prefs.getString('name')}',
      body: json.encode(_data),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'JWT ' + prefs.getString('token')
      },
    );
    bool hasError = true;
    if (response.statusCode == 401) {
      return {'success': !hasError, 'message': 'You are not authorized'};
    }
    final Map<String, dynamic> responseData = json.decode(response.body);
    String message = 'Something went wrong';
    if (responseData['status'] == "SUCCESS") {
      hasError = false;
      message = responseData['message'];
    }
    return {'success': !hasError, 'message': message};
  }
}
