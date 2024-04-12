import 'package:scoped_model/scoped_model.dart';
import 'package:root_app/scoped_models/connected_model.dart';
import 'user-model.dart';
import 'truck-model.dart';
import 'incident-model.dart';

class MainModel extends Model
    with ConnectedModel, UserModel, UtilityModel, TruckModel, IncidentModel {}
