import 'dart:convert';
import 'dart:async';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'package:location/location.dart' as geoloc;

import '../helper/ensure-visible.dart';
import '../models/location-model.dart';
import '../helper/config.dart';

class LocationInput extends StatefulWidget {
  final Function setLocation;
  final LocationData locationData;
  LocationInput(this.setLocation, this.locationData);

  @override
  State<StatefulWidget> createState() {
    return _LocationInput();
  }
}

class _LocationInput extends State<LocationInput> {
  Uri _staticUri;
  LocationData _locationData;
  final FocusNode _locationInputFocusNode = FocusNode();
  final TextEditingController _locationInputController = TextEditingController();

  @override
  void initState() {
    _locationInputFocusNode.addListener(_updateLocation);
    if (widget.locationData != null) {
      _getStaticMap(widget.locationData.address, geocode: false);
    }
    super.initState();
  }

  void _getStaticMap(String address, {bool geocode = true, double lat, double lng}) async {
    Map<String, dynamic> addressData = {
      "stateName": "",
      "cityName": "",
    };

    if (address?.isEmpty ?? true) {
      setState(() {
        _staticUri = null;
      });
      widget.setLocation(_locationData);
      return;
    }
    if (geocode) {
      final Uri uri = Uri.https('maps.googleapis.com', '/maps/api/geocode/json', {'address': address, 'key': apiKey});
      final http.Response response = await http.get(uri);
      final decodedResponse = json.decode(response.body);
      final addressComponent = decodedResponse["results"][0]["address_components"];

      final componentLength = addressComponent.length;
      for (var i = 0; i < componentLength; i++) {
        final component = addressComponent[i];
        if (isState(component)) {
          addressData['stateName'] = component['long_name'];
        }

        if (isCity(component)) {
          addressData['cityName'] = component['long_name'];
        }
      }

      final formattedAddress = decodedResponse['results'][0]['formatted_address'];
      final coords = decodedResponse['results'][0]['geometry']['location'];

      _locationData = LocationData(
        address: formattedAddress,
        latitude: coords['lat'],
        longitude: coords['lng'],
        cityName: addressData['cityName'],
        stateName: addressData['stateName'],
      );
    } else if (lat == null && lng == null) {
      _locationData = widget.locationData;
    } else {
      _locationData = LocationData(
          address: address,
          latitude: lat,
          longitude: lng,
          cityName: addressData['cityName'],
          stateName: addressData['stateName']);
    }
    if (mounted) {
      // final StaticMapProvider staticMapProvider =
      //     StaticMapProvider('AIzaSyCkW3dRvniHDCJPEfAliU9O9GuauZBkkj0');
      // final Uri staticMapUri = staticMapProvider.getStaticUriWithMarkers(
      //   [
      //     Marker('position', 'Position', _locationData.latitude,
      //         _locationData.longitude)
      //   ],
      //   center: Location(_locationData.latitude, _locationData.longitude),
      //   width: 500,
      //   height: 200,
      //   maptype: StaticMapViewType.roadmap,
      // );
      // widget.setLocation(_locationData);
      setState(() {
        _locationInputController.text = _locationData.address;
        // _staticUri = staticMapUri;
      });
    }
  }

  bool isState(component) {
    return component['types'].contains('administrative_area_level_1');
  }

  bool isCity(component) {
    return component['types'].contains('locality');
  }

  Future<String> _getAddress(double lat, double lng) async {
    final Uri uri = Uri.https('maps.googleapis.com', '/maps/api/geocode/json',
        {'latlng': '${lat.toString()}, ${lng.toString()}', 'key': apiKey});
    final http.Response response = await http.get(uri);
    final decodedResponse = json.decode(response.body);
    final formattedAddress = decodedResponse['results'][0]['formatted_address'];
    return formattedAddress;
  }

  void _getUserLocation() async {
    final location = geoloc.Location();
    final currentLocation = await location.getLocation();
    final address = await _getAddress(currentLocation.latitude, currentLocation.longitude);
    _getStaticMap(address, lat: currentLocation.latitude, lng: currentLocation.longitude);
  }

  void _updateLocation() async {
    if (!_locationInputFocusNode.hasFocus) {
      _getStaticMap(_locationInputController.text);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: <Widget>[
        EnsureVisibleWhenFocused(
          focusNode: _locationInputFocusNode,
          child: TextFormField(
            decoration: InputDecoration(
              focusColor: Theme.of(context).buttonColor,
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(30.0),
              ),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(30.0)),
              prefixIcon: Icon(Icons.location_city),
              labelText: 'Location of availability',
              fillColor: Colors.white,
              filled: true,
              suffixIcon: IconButton(
                icon: Icon(Icons.gps_fixed),
                onPressed: _getUserLocation,
              ),
            ),
            focusNode: _locationInputFocusNode,
            controller: _locationInputController,
            validator: (String value) {
              if (_locationData == null) {
                return 'No Valid Location Found';
              }
              return null;
            },
          ),
        ),
        SizedBox(
          height: 8.0,
        ),
        _staticUri != null ? Image.network(_staticUri.toString()) : Container(),
      ],
    );
  }
}
