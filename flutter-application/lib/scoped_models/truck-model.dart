import 'dart:convert';
import 'dart:async';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';
import 'connected_model.dart';

import '../models/truck.dart';
import '../models/driver.dart';
import '../helper/config.dart';

mixin TruckModel on ConnectedModel {
  bool _trucksLoading = false;
  bool _isDocUploading = false;
  List<Truck> _trucks = [];
  List<DocumentTypes> _documentTypes = [];
  Truck _selectTruckToEdit = Truck();
  Truck _selectedTruck = Truck();
  String _selTruckId;
  String _selDocId;

  Future<Map<String, dynamic>> updateTruck(
    String truckModel,
    String regNo,
    String manufacturer,
    DateTime manufacturingDate,
    File image,
    String rcImageUrl,
    String truckId,
  ) async {
    _trucksLoading = true;
    notifyListeners();
    final SharedPreferences prefs = await SharedPreferences.getInstance();

    Map<String, dynamic> uploadData;
    if (image != null) {
      uploadData = await uploadImage(image);
      if (uploadData == null) {
        print('upload failed!');
      }
    }
    final Map<String, dynamic> _truckData = {
      'truckModel': truckModel,
      'regNo': regNo,
      'manufacturer': manufacturer,
      'rcImage': image != null ? uploadData['Location'] : rcImageUrl,
      'manufacturingDate': manufacturingDate == null
          ? manufacturingDate
          : manufacturingDate.toIso8601String(),
    };
    final http.Response response = await http.patch(
      baseUrl + 'trucks/update-truck-details/$truckId',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'JWT ' + prefs.getString('token'),
      },
      body: json.encode(_truckData),
    );
    bool hasError = true;
    if (response.statusCode == 401) {
      _trucksLoading = false;
      notifyListeners();
      return {'success': !hasError, 'message': 'Unauthorized'};
    }
    final Map<String, dynamic> responseData = json.decode(response.body);
    String message = 'Something Went Wrong';
    if (responseData['status'] == 'SUCCESS') {
      Truck _truck = _trucks.firstWhere((truck) {
        return truck.id == truckId;
      });
      _truck = Truck(
        modelNo: responseData['response']['truckModel'],
        rcImageUrl: responseData['response']['rcImage'],
        manufacturer: responseData['response']['manufacturer'],
        manufacturingDate: responseData['response']['manufacturingDate'] == null
            ? null
            : DateTime.parse(responseData['response']['manufacturingDate']),
      );
      hasError = false;
      notifyListeners();
    } else {
      message = responseData['message'];
    }
    _trucksLoading = false;
    notifyListeners();
    return {'success': !hasError, 'message': message};
  }

  Future<Map<String, dynamic>> addTruck(String truckModel, String regNo,
      String manufacturer, DateTime manufacturingDate, File image) async {
    _trucksLoading = true;
    notifyListeners();
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    Map<String, dynamic> uploadData;
    if (image != null) {
      uploadData = await uploadImage(image);
      if (uploadData == null) {
        print('upload failed!');
      }
    }
    final Map<String, dynamic> _truckData = {
      'truckModel': truckModel,
      'regNo': regNo,
      'manufacturer': manufacturer,
      'manufacturingDate': manufacturingDate == null
          ? manufacturingDate
          : manufacturingDate.toIso8601String(),
      'rcImage': image != null ? uploadData['Location'] : null,
      'owner': prefs.getString('userId'),
      'phone': prefs.getString('phone')
    };
    final http.Response response = await http.post(
      baseUrl + 'trucks/add-truck',
      headers: {
        'Authorization': 'JWT ' + prefs.getString('token'),
        'Content-Type': 'application/json'
      },
      body: json.encode(_truckData),
    );
    bool hasError = true;
    if (response.statusCode == 401) {
      _trucksLoading = false;
      notifyListeners();
      return {'success': !hasError, 'message': 'Unauthorized'};
    }
    final Map<String, dynamic> responseData = json.decode(response.body);
    String message = 'Something Went Wrong';
    if (responseData['status'] == 'SUCCESS') {
      final Truck newTruck = Truck(
          id: responseData['response']['_id'],
          modelNo: responseData['response']['truckModel'],
          regNo: responseData['response']['regNo'],
          phone: prefs.getString('phone'),
          rcImageUrl: responseData['response']['rcImage'],
          manufacturer: responseData['response']['manufacturer'],
          manufacturingDate: responseData['response']['manufacturingDate'] ==
                  null
              ? null
              : DateTime.parse(responseData['response']['manufacturingDate']),
          documets: [],
          driver: null);
      _trucks.insert(_trucks.length, newTruck);
      hasError = false;
      message = responseData['message'];
      notifyListeners();
    } else if (responseData['status'] == 'ERROR') {
      message = responseData['message'];
    } else if (responseData['status'] == 'AUTHERROR') {
      message = responseData['message'];
    }
    _trucksLoading = false;
    notifyListeners();
    return {'success': !hasError, 'message': message};
  }

  Future<Map<String, dynamic>> updateTruckDoc(File image, String imageUrl,
      DateTime expiryDate, String truckId, String docId) async {
    _isDocUploading = true;
    notifyListeners();
    Map<String, dynamic> uploadData;
    if (image != null) {
      uploadData = await uploadImage(image);
      if (uploadData == null) {
        print('upload failed!');
      }
    }
    final Map<String, dynamic> _doc = {
      'url': image != null ? uploadData['Location'] : imageUrl,
      'expiryDate': expiryDate.toIso8601String()
    };
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    final http.Response response = await http.patch(
      baseUrl + 'trucks/update-truck-docs/$truckId/$docId',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'JWT ' + prefs.getString('token'),
      },
      body: json.encode(_doc),
    );
    bool hasError = true;
    if (response.statusCode == 401) {
      _isDocUploading = false;
      notifyListeners();
      return {'success': !hasError, 'message': 'Unauthorized'};
    }
    final Map<String, dynamic> responseData = json.decode(response.body);

    String message = 'Something Went Wrong';
    if (responseData['status'] == 'SUCCESS') {
      hasError = false;
    } else if (responseData['status'] == 'NOT_FOUND') {
      message = responseData['message'];
    } else if (responseData['status'] == 'ERROR') {
      message = responseData['message'];
    }
    _isDocUploading = false;
    notifyListeners();
    return {'success': !hasError, 'message': message};
  }

  Future<Null> fetchTruckById(String truckId) async {
    _trucksLoading = true;
    notifyListeners();
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    final http.Response response =
        await http.get(baseUrl + 'trucks/get-truck-by-id/$truckId', headers: {
      'Content-Type': 'application/json',
      'Authorization': 'JWT ' + prefs.getString('token')
    });
    if (response.statusCode == 401) {
      _trucksLoading = false;
      notifyListeners();
      return;
    }
    final Map<String, dynamic> responseData = json.decode(response.body);
    Truck truck = Truck();
    if (responseData['status'] == 'SUCCESS') {
      List<Documents> documentList = [];
      if (responseData['response']["data"]['driver'] != null) {
        if (responseData['response']["data"]['documents'].length != 0) {
          responseData['response']["data"]['documents'].forEach((docs) {
            Documents document = Documents(
              id: docs['_id'],
              imageUrl: docs['url'],
              type: docs['type'],
              expireyDate: docs['expiryDate'] == null
                  ? null
                  : DateTime.parse(docs['expiryDate'].toString()),
            );
            documentList.add(document);
          });
        }
        truck = Truck(
          id: responseData['response']["data"]['_id'],
          modelNo: responseData['response']["data"]['truckModel'],
          regNo: responseData['response']["data"]['regNo'],
          phone: prefs.getString('phone'),
          documets: documentList,
          rcImageUrl: responseData['response']["data"]['rcImage'] != null
              ? responseData['response']["data"]['rcImage']
              : null,
          manufacturer: responseData['response']["data"]['manufacturer'],
          manufacturingDate:
              responseData['response']["data"]['manufacturingDate'] == null
                  ? null
                  : DateTime.parse(
                      responseData['response']["data"]['manufacturingDate']),
          driver: Driver(
            id: responseData['response']["data"]['driver']['_id'],
            name: responseData['response']["data"]['driver']['name'],
            phone:
                responseData['response']["data"]['driver']['phone'].toString(),
          ),
        );
      } else {
        if (responseData['response']["data"]['documents'].length != 0) {
          responseData['response']["data"]['documents'].forEach((docs) {
            Documents document = Documents(
              id: docs['_id'],
              imageUrl: docs['url'],
              type: docs['type'],
              expireyDate: docs['expiryDate'] != null
                  ? DateTime.parse(docs['expiryDate'])
                  : null,
            );
            documentList.add(document);
          });
        }
        truck = Truck(
          id: responseData['response']["data"]['_id'],
          modelNo: responseData['response']["data"]['truckModel'],
          regNo: responseData['response']["data"]['regNo'],
          phone: prefs.getString('phone'),
          rcImageUrl: responseData['response']["data"]['rcImage'] != null
              ? responseData['response']["data"]['rcImage']
              : null,
          documets: documentList,
          manufacturer: responseData['response']["data"]['manufacturer'],
          manufacturingDate:
              responseData['response']["data"]['manufacturingDate'] == null
                  ? null
                  : DateTime.parse(
                      responseData['response']["data"]['manufacturingDate']),
        );
      }
    }
    _selectedTruck = truck;
    _trucksLoading = false;
    notifyListeners();
    return;
  }

  Future<Null> fetchTrucks() async {
    _trucksLoading = true;
    notifyListeners();
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    http.Response response = await http.get(
        baseUrl + 'trucks/get-trucks-by-owner/' + prefs.getString('userId'),
        headers: {
          'Authorization': 'JWT ' + prefs.getString('token'),
          'Content-Type': 'application/json'
        });
    if (response.statusCode == 401) {
      _trucksLoading = false;
      notifyListeners();
      return;
    }
    final List<Truck> fetchedTruckList = [];
    final Map<String, dynamic> truckListData = json.decode(response.body);
    if (truckListData['status'] == 'SUCCESS') {
      if (truckListData['count'] == 0) {
        return;
      } else {
        truckListData['response'].forEach((truckData) {
          Truck truck = Truck();
          truck = Truck(
            id: truckData['_id'],
            modelNo: truckData['truckModel'],
            regNo: truckData['regNo'],
            phone: prefs.getString('phone'),
            rcImageUrl: truckData['rcImage'],
            manufacturer: truckData['manufacturer'],
            manufacturingDate: truckData['manufacturingDate'] == null
                ? null
                : DateTime.parse(truckData['manufacturingDate']),
            documets: null,
          );

          fetchedTruckList.add(truck);
        });
      }
    }
    _trucks = fetchedTruckList;
    _trucksLoading = false;
    notifyListeners();
    return;
  }

  Future<Map<String, dynamic>> addDocument(
      File image, String type, DateTime expiryDate, String truckId) async {
    _isDocUploading = true;
    notifyListeners();
    final uploadData = await uploadImage(image);
    if (uploadData == null) {
      print('upload failed!');
    }
    Map<String, dynamic> docData = {
      'type': type,
      'url': uploadData['Location'],
      'expiryDate': expiryDate.toIso8601String()
    };
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    final http.Response response = await http.post(
      baseUrl + 'trucks/add-truck-documents/$truckId',
      body: json.encode(docData),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'JWT ' + prefs.getString('token'),
      },
    );
    bool hasError = true;
    if (response.statusCode == 401) {
      _isDocUploading = false;
      notifyListeners();
      return {'success': !hasError, 'message': 'Unauthorized'};
    }
    final Map<String, dynamic> responseData = json.decode(response.body);
    String message = 'Something went wrong!';
    if (responseData['status'] == 'SUCCESS') {
      Documents doc = Documents(
        id: responseData['response']['_id'],
        imageUrl: responseData['response']['url'],
        type: responseData['response']['type'],
        expireyDate: DateTime.parse(responseData['response']['expiryDate']),
      );
      _selectedTruck.documets.add(doc);
      hasError = false;
      message = responseData['message'];
      notifyListeners();
    } else {
      hasError = true;
      message = responseData['message'];
    }
    _isDocUploading = false;
    notifyListeners();
    return {'success': !hasError, 'message': message};
  }

  Future<Null> fetchTruckDocuments() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    final http.Response response = await http
        .get(baseUrl + 'document-types/get-all-document-types', headers: {
      'Content-Type': 'application/json',
      'Authorization': 'JWT ' + prefs.getString('token')
    });
    if (response.statusCode == 401) {
      return;
    }
    final Map<String, dynamic> responseData = json.decode(response.body);
    List<DocumentTypes> _docTypes = [];
    if (responseData['status'] == 'SUCCESS') {
      responseData['response'].forEach((docTypes) {
        final _dTypes = DocumentTypes(
          id: docTypes['_id'],
          type: docTypes['type'],
        );
        _docTypes.add(_dTypes);
      });
    }
    _documentTypes = _docTypes;
    return;
  }

  Future<Map<String, dynamic>> addDriver(
    String phone,
    String name,
    String truckId,
  ) async {
    _trucksLoading = true;
    notifyListeners();
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    final Map<String, dynamic> _truckData = {
      'phone': phone,
      'name': name,
      'type': 'driver',
      'truckId': truckId,
      'transpoterId': prefs.getString('userId'),
    };
    final http.Response response = await http.post(
      baseUrl + 'user/add-driver',
      body: json.encode(_truckData),
      headers: {
        'Authorization': 'JWT ' + prefs.getString('token'),
        'Content-Type': 'application/json'
      },
    );
    bool hasError = true;
    if (response.statusCode == 401) {
      _trucksLoading = false;
      notifyListeners();
      return {'success': !hasError, 'message': 'Unauthorized'};
    }
    final Map<String, dynamic> responseData = json.decode(response.body);
    String message = 'Something Went Wrong';
    if (responseData['status'] == 'SUCCESS') {
      _selectedTruck.driver = Driver(
        id: responseData['response']['_id'],
        name: responseData['response']['name'],
        phone: responseData['response']['phone'].toString(),
      );
      notifyListeners();
      hasError = false;
      message = responseData['message'];
    } else if (responseData['status'] == 'ALREADY_EXISTS') {
      message = responseData['message'];
    } else if (responseData['status'] == 'ERROR') {
      message = responseData['message'];
    } else if (responseData['status'] == 'AUTHERROR') {
      message = responseData['message'];
    }
    _trucksLoading = false;
    notifyListeners();
    return {'success': !hasError, 'message': message};
  }

  Future<Map<String, dynamic>> deleteDriver(
      String truckId, String driverId) async {
    _trucksLoading = true;
    bool hasError = false;
    String message = 'somthing is wrong';
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    try {
      final http.Response response = await http.delete(
          baseUrl + 'trucks/remove-driver/$truckId/$driverId',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'JWT ' + prefs.getString('token')
          });
      final Map<String, dynamic> responseData = json.decode(response.body);
      if (responseData['status'] == 'SUCCESS') {
        _selectedTruck.driver = null;
        message = 'Driver is deleted successfully';
        hasError = true;
        notifyListeners();
      } else if (responseData['status'] == 'NOT_FOUND') {
        message = responseData['message'];
        hasError = true;
      }
      _trucksLoading = false;
      notifyListeners();
      return {'success': !hasError, 'message': message};
    } catch (e) {
      _trucksLoading = false;
      return {'success': !hasError, 'message': message};
    }
  }

  List<DocumentTypes> get docTypes {
    return List.from(_documentTypes);
  }

  List<Truck> get allTrucks {
    return List.from(_trucks.reversed);
  }

  void selectTruck(String truckId) {
    _selTruckId = truckId;
    if (truckId != null) {
      notifyListeners();
    }
  }

  String get selectedTruckId {
    return _selTruckId;
  }

  Truck get selectedTruckToEdit {
    if (selectedTruckId == null) {
      return null;
    }
    _selectTruckToEdit =
        _trucks.firstWhere((Truck item) => item.id == _selTruckId);
    return _selectTruckToEdit;
  }

  Truck get selectedTruck {
    return _selectedTruck;
  }

  void setTruck() {
    _selTruckId = null;
    _selectedTruck = null;
  }

  void selectDoc(String docId) {
    _selDocId = docId;
    if (docId != null) {
      notifyListeners();
    }
  }

  String get selectedDocId {
    return _selDocId;
  }

  void setDoc(String docId) {
    selectedDocIndex = null;
    _selDocId = null;
  }

  int get selectedTruckIndex {
    return _trucks.indexWhere((Truck truck) {
      return truck.id == _selTruckId;
    });
  }

  int get selectedDocIndex {
    return _selectedTruck.documets.indexWhere((document) {
      return document.id == _selDocId;
    });
  }

  Documents get selectedDoc {
    if (selectedDocId == null) {
      return null;
    }
    return selectedTruck.documets
        .firstWhere((Documents doc) => doc.id == _selDocId);
  }

  bool get isTrucksLoading {
    return _trucksLoading;
  }

  bool get idDocLoading {
    return _isDocUploading;
  }
}
