import 'dart:convert';
import 'dart:async';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

//main model
import 'connected_model.dart';

//models
import '../models/location-model.dart';
import '../models/incident-model.dart';
import '../models/driver.dart';
import '../helper/config.dart';

//incident model connecting with main model
mixin IncidentModel on ConnectedModel {
  bool _incidentLoading = false;
  List<IncidentField> _incidentList = [];
  List<Incident> _incident = [];
  Incident _selectedIncidnet;
  String _selIncidentId;

// register incident
  Future<Map<String, dynamic>> registerIncident(
    String truckNum,
    List<String> types,
    String description,
    LocationData location,
  ) async {
    _incidentLoading = true;
    notifyListeners(); // to notify state of the app
    final SharedPreferences prefs =
        await SharedPreferences.getInstance(); //get app's local storage

    final Map<String, dynamic> _incidentData = {
      'truckRegNo': truckNum,
      'ownerNum': prefs.getString('phone'),
      'ownerName': prefs.getString("name"),
      'specialization': types,
      'description': description,
      'address': location.address,
      'lat': location.latitude,
      'lng': location.longitude,
      'cityName': location.cityName,
      'stateName': location.stateName,
    };
    http.Response response = await http.post(
      baseUrl + 'incidents/register-incident',
      headers: {
        'Authorization': 'JWT ' + prefs.getString('token'),
        'Content-Type': 'application/json'
      },
      body: json.encode(_incidentData),
    );
    //check authentication falied
    if (response.statusCode == 401) {
      _incidentLoading = false;
      notifyListeners();
      return {'success': 'UnAuthorized', 'message': 'Unauthorized'};
    }
    //decode response
    final Map<String, dynamic> responseData = json.decode(response.body);
    String message = 'Something went wrong';
    String hasError = 'ERROR';
    if (responseData['status'] == 'SUCCESS') {
      List<IncidentField> incidentField = [];
      responseData['response']['specialization'].forEach((type) {
        IncidentField types = IncidentField(
          id: type['_id'],
          type: type['type'],
        );
        incidentField.add(types);
      });
      // map incident data with model
      final Incident incident = Incident(
        id: responseData['response']['_id'],
        status: responseData['response']['status'],
        description: responseData['response']['description'],
        truckNo: responseData['response']['truckRegNo'],
        truckModel: responseData['response']['truckModel'],
        types: incidentField,
        location: LocationData(
          address: responseData['response']['location']['address'],
          latitude: double.parse(responseData['response']['location']['lat']),
          longitude: double.parse(responseData['response']['location']['lng']),
          cityName: responseData['response']['location']['cityName'],
          stateName: responseData['response']['location']['stateName'],
        ),
      );
      //add single incident with the list of incidents
      _incident.add(incident);
      hasError = 'SUCCESS';
      message = responseData['message'];
    } else if (responseData['status'] == "NOT_FOUND") {
      hasError = 'NOT_FOUND';
      message = responseData['message'];
    } else {
      message = responseData['message'];
    }
    _incidentLoading = false;
    notifyListeners();
    return {'success': hasError, 'message': message};
  }

//to fetch all the specilization types
  Future<Null> fetchSpecilizationTypes() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    return http.get(baseUrl + '', headers: {
      'Authorization': 'JWT ' + prefs.getString('token'),
      'Content-Type': 'application/json'
    }).then<Null>((http.Response response) {
      //check authentication falied
      if (response.statusCode == 401) {
        return;
      }
      final List<IncidentField> fetchedIncidents = [];
      //decode response
      final Map<String, dynamic> incidentList = json.decode(response.body);
      incidentList['response'].forEach((data) {
        final IncidentField incident = IncidentField(
            id: data['_id'], type: data['type'], image: data['image']);
        fetchedIncidents.add(incident);
      });
      _incidentList = fetchedIncidents;
    });
  }

//fetch all the incicents
  Future<Null> fetchAllIncidents() async {
    //local storage
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    _incidentLoading = true;
    notifyListeners();
    final http.Response response = await http.get(
      baseUrl + '' + prefs.getString('userId'),
      headers: {
        'Authorization': 'JWT ' + prefs.getString('token'),
        'Content-Type': 'application/json'
      },
    );
    //check authentication falied
    if (response.statusCode == 401) {
      _incidentLoading = false;
      notifyListeners();
      return;
    }
    final List<Incident> incidentsList = [];
    //decode response
    final Map<String, dynamic> responseData = json.decode(response.body);
    if (responseData['status'] == 'SUCCESS') {
      responseData['response'].forEach(
        (data) {
          final Incident incident = Incident(
            id: data['_id'],
            status: data['status'],
            description: data['description'],
            truckNo: data["truck"]['regNo'],
            truckModel: data["truck"]['truckModel'],
          );
          incidentsList.add(incident);
        },
      );
    }
    _incident = incidentsList;
    _incidentLoading = false;
    notifyListeners();
    return;
  }

// make in progress incidents availble to the apps state
  List<Incident> get getInProgeressIncidentList {
    if (_incident == null) {
      return [];
    }
    final incident = _incident.reversed.where((Incident incident) =>
        incident.status == 'open' || incident.status == 'in-progress');
    return List.from(incident);
  }

// makepending incidents availble to the apps state
  List<Incident> get getPendingIncidentList {
    if (_incident == null) {
      return [];
    }
    final pendingIncidents = _incident.reversed
        .where((Incident incident) => incident.status == 'completed');
    return List.from(pendingIncidents);
  }

// make completed incidents availble to the apps state
  List<Incident> get getCompletedIncidentList {
    if (_incident == null) {
      return [];
    }
    final completedIncidents = _incident.where((Incident incident) =>
        incident.status == 'completed' || incident.paymentStatus == 'paid');
    return List.from(completedIncidents);
  }

//make all the incidents available to the app state
  List<Incident> get incidents {
    return List.from(_incident);
  }

//get selected incident id
  String get selectedIncidentId {
    return _selIncidentId;
  }

//get selected incident
  Incident get selectedIncident {
    if (selectedIncidentId == null) {
      return null;
    }
    return _incident.firstWhere((Incident incident) {
      return incident.id == selectedIncidentId;
    });
  }

  int get selectedIssueIndex {
    return _incident.indexWhere((Incident incident) {
      return incident.id == _selIncidentId;
    });
  }

//fetch incident by id
  Future<Null> fetchIncidentById(String incidentId) async {
    _incidentLoading = true;
    notifyListeners();
    final SharedPreferences prefs = await SharedPreferences.getInstance();

    final http.Response response = await http.get(
      baseUrl + '',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'JWT ' + prefs.getString('token'),
      },
    );
    //check authentication falied
    if (response.statusCode == 401) {
      _incidentLoading = false;
      notifyListeners();
      return;
    }
    //decode response
    final Map<String, dynamic> responseData = json.decode(response.body);
    if (responseData['status'] == 'SUCCESS') {
      List<String> types = [];
      List<Representative> repList = [];
      if (responseData['response']['representative'].length != 0) {
        responseData['response']['representative'].forEach((repData) {
          Representative representative = Representative(
            id: repData['_id'],
            name: repData['name'],
            phone: repData['phone'].toString(),
          );
          repList.add(representative);
        });
      }
      responseData['response']['specialization'].forEach((type) {
        types.add(type['type']);
      });
      List<IncidentLogs> incidentLogs = [];
      if (responseData['response']["updates"] != null &&
          responseData['response']["updates"]['incidentLogs'].length != 0) {
        responseData['response']["updates"]['incidentLogs']
            .forEach((incidentLog) {
          IncidentLogs log = IncidentLogs(
            id: incidentLog['_id'],
            comment: incidentLog['comment'],
            commentBy: incidentLog['commentBy'],
            image: incidentLog['images'],
            dateTime: DateTime.parse(incidentLog['dateTime']),
          );
          incidentLogs.add(log);
        });
      }

      final Incident incident = Incident(
        id: responseData['response']['_id'],
        status: responseData['response']['status'],
        description: responseData['response']['description'],
        truckNo: responseData['response']["truck"]['regNo'],
        truckModel: responseData['response']["truck"]['truckModel'],
        types: types,
        incidentLogs: incidentLogs,
        paymentStatus: responseData['response']['paymentStatus'],
        driver: responseData['response']['driver'] == null
            ? null
            : Driver(
                id: responseData['response']['driver']['_id'],
                phone: responseData['response']['driver']['phone'].toString(),
                name: responseData['response']['driver']['name']),
        representative: repList,
        location: LocationData(
          address: responseData["response"]["location"]["address"],
          cityName: responseData["response"]["location"]["cityName"],
          stateName: responseData["response"]["location"]["stateName"],
          latitude: double.parse(responseData["response"]["location"]["lat"]),
          longitude: double.parse(responseData["response"]["location"]["lng"]),
        ),
      );

      _selectedIncidnet = incident;
    }
    _incidentLoading = false;
    notifyListeners();
    return;
  }

  //incident types available to the state
  List<IncidentField> get incidentTypesList {
    return List.from(_incidentList);
  }

// incident request loading
  bool get isIncidentLoading {
    return _incidentLoading;
  }
}
