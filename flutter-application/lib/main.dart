import 'package:flutter/material.dart';
import 'package:scoped_model/scoped_model.dart';

import './scoped_models/main.dart';
import './pages/add_truck.dart';
import './pages/otp.dart';
import './pages/home.dart';
import './pages/auth.dart';
import './pages/list_trucks.dart';
import './pages/register_incident.dart';
import './pages/incidents-summary.dart';
import './pages/incident.dart';
import './pages/truck.dart';
import './pages/profile.dart';
import './pages/subscription.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();
  runApp(MyApp());
}

class MyApp extends StatefulWidget {
  @override
  State<StatefulWidget> createState() => _MyApp();
}

class _MyApp extends State<MyApp> {
  final MainModel _model = MainModel();
  bool _isAuthenticated = false;

  @override
  void initState() {
    _model.autoAuthenticate();
    _model.userSubject.listen((bool isAuthenticated) {
      setState(() {
        _isAuthenticated = isAuthenticated;
      });
    });
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    return ScopedModel<MainModel>(
      model: _model,
      child: MaterialApp(
        debugShowCheckedModeBanner: false,
        title: 'root',
        theme: ThemeData(
          brightness: Brightness.light,
          primarySwatch: Colors.blue,
          accentColor: Colors.blue,
          buttonColor: Colors.blue,
        ),
        routes: {
          '/': (BuildContext context) => !_isAuthenticated ? AuthPage() : HomePage(_model),
          '/otp': (BuildContext context) => OtpPage(),
          '/home': (BuildContext context) => !_isAuthenticated ? AuthPage() : HomePage(_model),
          '/add-truck': (BuildContext context) => !_isAuthenticated ? AuthPage() : AddTruckPage(),
          '/trucks': (BuildContext context) => !_isAuthenticated ? AuthPage() : TruckListPage(_model),
          '/register-incident': (BuildContext context) => !_isAuthenticated ? AuthPage() : RegisterIncidentPage(_model),
          '/incidents-summary': (BuildContext context) => !_isAuthenticated ? AuthPage() : IncidentsSummary(_model),
          '/your-profile': (BuildContext context) => !_isAuthenticated ? AuthPage() : UserProfilePage(_model),
          '/subscription': (BuildContext context) => !_isAuthenticated ? AuthPage() : SubscriptionPage(_model)
        },
        onGenerateRoute: (RouteSettings settings) {
          if (!_isAuthenticated) {
            return MaterialPageRoute<bool>(
              builder: (BuildContext context) => AuthPage(),
            );
          }
          final List<String> pathElement = settings.name.split('/');
          if (pathElement[0] != '') {
            return null;
          }

          if (pathElement[1] == 'incident') {
            final String id = pathElement[2];
            _model.fetchIncidentById(id);
            return MaterialPageRoute<bool>(
              builder: (BuildContext context) => !_isAuthenticated ? AuthPage() : IncidentPage(_model, id),
            );
          }
          if (pathElement[1] == 'truck') {
            final String truckId = pathElement[2];
            return MaterialPageRoute<bool>(
              builder: (BuildContext context) => !_isAuthenticated ? AuthPage() : TruckPage(truckId, _model),
            );
          }
          return null;
        },
      ),
    );
  }
}
