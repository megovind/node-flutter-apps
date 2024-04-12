import 'dart:io';
import 'package:flutter/material.dart';
import 'package:scoped_model/scoped_model.dart';
import 'package:intl/intl.dart';
import 'package:datetime_picker_formfield/datetime_picker_formfield.dart';

import '../pages/add_truck.dart';
import '../scoped_models/main.dart';
import '../models/truck.dart';
import '../widgets/image_input.dart';
import '../helper/ensure-visible.dart';

class TruckPage extends StatefulWidget {
  final String truckId;
  final MainModel model;
  TruckPage(this.truckId, this.model);
  @override
  State<StatefulWidget> createState() {
    return _TruckPage();
  }
}

class _TruckPage extends State<TruckPage> {
  Map<String, dynamic> _formData = {
    'phone': null,
    'name': null,
  };
  Map<String, dynamic> _docForm = {'type': null, 'image': null, 'expiryDate': null};

  List<DropdownMenuItem<DocumentTypes>> _dropdownMenuItems;
  List<String> sTypes = [];
  DocumentTypes _selectedDocType;

  bool _addDoc = false;
  final format = DateFormat("dd-MM-yyyy");
  final GlobalKey<FormState> _formKey = GlobalKey();
  final GlobalKey<FormState> _docKey = GlobalKey();

  final _expiryDateFocus = FocusNode();
  final _expiryDateTextController = TextEditingController();

  @override
  void initState() {
    widget.model.fetchTruckById(widget.truckId);
    _dropdownMenuItems = widget.model.isTrucksLoading
        ? buildDropDownMenuItems(widget.model.docTypes)
        : buildDropDownMenuItems(_removeItems(widget.model.docTypes, widget.model.selectedTruck.documets));
    super.initState();
  }

  void _editDoc(MainModel model, String truckId, String docId) {
    model.selectTruck(truckId);
    model.selectDoc(docId);
    setState(() {
      _addDoc = true;
    });
  }

  List<DocumentTypes> _removeItems(List<DocumentTypes> docTypes, List<Documents> documents) {
    if (documents != null) {
      documents.forEach((item) {
        docTypes.removeWhere((items) => items.type == item.type);
      });
    }
    return docTypes;
  }

  void _submitForm(Function addDriver) async {
    if (!_formKey.currentState.validate()) {
      return;
    }
    _formKey.currentState.save();
    Map<String, dynamic> successMessage;
    successMessage = await addDriver(
      _formData['phone'],
      _formData['name'],
      widget.model.selectedTruck.id,
    );
    if (successMessage['success']) {
      Navigator.of(context).pop();
    } else {
      _showAlertDialogue(context, successMessage['message']);
    }
  }

  void _setImage(File image) {
    _docForm['image'] = image;
  }

  Widget _buildDatePickerField(Documents doc) {
    if (doc == null && _expiryDateTextController.text.trim() == '') {
      _expiryDateTextController.text = '';
    } else if (doc != null && _expiryDateTextController.text.trim() == '') {
      _expiryDateTextController.text =
          doc.expireyDate == null ? doc.expireyDate : DateFormat('dd-MM-yyy').format(doc.expireyDate);
    } else if (doc != null && _expiryDateTextController.text.trim() != '') {
      _expiryDateTextController.text = _expiryDateTextController.text;
    } else if (doc == null && _expiryDateTextController.text.trim() != '') {
      _expiryDateTextController.text = _expiryDateTextController.text;
    }
    return EnsureVisibleWhenFocused(
      focusNode: _expiryDateFocus,
      child: DateTimeField(
        focusNode: _expiryDateFocus,
        decoration: InputDecoration(
          labelText: 'Expiry Date',
        ),
        controller: _expiryDateTextController,
        format: format,
        readOnly: true,
        validator: (value) {
          if (value == null) {
            return 'Expiry Date is Required';
          }
          return null;
        },
        onShowPicker: (context, currentValue) {
          return showDatePicker(
              context: context,
              firstDate: DateTime.now(),
              initialDate: currentValue ?? DateTime.now(),
              lastDate: DateTime(2100));
        },
        onSaved: (value) {
          _docForm['expiryDate'] = value;
        },
      ),
    );
  }

  List<DropdownMenuItem<DocumentTypes>> buildDropDownMenuItems(List docTypes) {
    List<DropdownMenuItem<DocumentTypes>> items = List();
    for (DocumentTypes docType in docTypes) {
      items.add(
        DropdownMenuItem(value: docType, child: Text(docType.type)),
      );
    }
    return items;
  }

  onChangeDropDownItem(DocumentTypes selectedDocType) {
    setState(() {
      _selectedDocType = selectedDocType;
    });
  }

  Widget _buildDocTypeField(Documents doc) {
    _dropdownMenuItems = doc != null
        ? buildDropDownMenuItems(widget.model.docTypes)
        : buildDropDownMenuItems(_removeItems(widget.model.docTypes, widget.model.selectedTruck.documets));

    return DropdownButtonFormField(
      decoration: InputDecoration(labelText: 'Select Doc Type', enabled: doc != null ? false : true),
      value: _selectedDocType,
      onChanged: (newValue) => onChangeDropDownItem(newValue),
      validator: (value) {
        if (value == null) {
          return 'Doc Type is Required';
        }
        return null;
      },
      items: _dropdownMenuItems,
      onSaved: (value) {
        _selectedDocType = value;
      },
    );
  }

  Widget _buildDocForm(MainModel model) {
    return Container(
      padding: EdgeInsets.all(10.0),
      child: Form(
        key: _docKey,
        child: Column(
          children: <Widget>[
            model.selectedDoc != null
                ? Column(
                    children: <Widget>[
                      Container(
                        alignment: Alignment.topLeft,
                        child: Text(
                          "Update " + model.selectedDoc.type + " Document",
                          style: TextStyle(fontSize: 16, fontWeight: FontWeight.w300),
                        ),
                      ),
                      Divider(),
                    ],
                  )
                : _buildDocTypeField(model.selectedDoc),
            _buildDatePickerField(model.selectedDoc),
            ImageInput(_setImage, 'Upload Document', model.selectedDoc != null ? model.selectedDoc.imageUrl : null),
            Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: <Widget>[
                model.idDocLoading
                    ? CircularProgressIndicator()
                    : RaisedButton(
                        child: Text(
                          "Save",
                          style: TextStyle(color: Colors.white),
                        ),
                        onPressed: () {
                          _submitDoc(
                              model.addDocument, model.updateTruckDoc, model.selectedTruck.id, model.selectedDoc);
                        },
                      ),
                SizedBox(
                  width: 20.0,
                ),
                RaisedButton(
                  child: Text(
                    "Cancel",
                    style: TextStyle(color: Colors.white),
                  ),
                  onPressed: () {
                    model.setDoc(null);
                    setState(() {
                      _addDoc = false;
                    });
                  },
                ),
              ],
            )
          ],
        ),
      ),
    );
  }

  void _showAlertDialogue(BuildContext context, String message) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          contentPadding: EdgeInsets.fromLTRB(10, 24, 10, 20),
          content: Text(message),
          actions: <Widget>[
            FlatButton(
              child: Text('OKAY'),
              onPressed: () {
                Navigator.of(context).pop();
              },
            )
          ],
        );
      },
    );
  }

  void _submitDoc(Function addDoc, Function updateDoc, String truckId, Documents selectedDoc) async {
    if (selectedDoc == null) {
      if (!_docKey.currentState.validate()) {
        return;
      } else if (!_docKey.currentState.validate() || _docForm['image'] == null || _selectedDocType == null) {
        return;
      }
      _docKey.currentState.save();
      Map<String, dynamic> successMessage;
      successMessage = await addDoc(
        _docForm['image'],
        _selectedDocType.type,
        _docForm['expiryDate'],
        truckId,
      );
      if (successMessage['success']) {
        _selectedDocType = null;
        setState(() {
          _addDoc = false;
          _dropdownMenuItems =
              buildDropDownMenuItems(_removeItems(widget.model.docTypes, widget.model.selectedTruck.documets));
        });
      } else {
        _showAlertDialogue(context, successMessage['message']);
      }
    } else {
      _docKey.currentState.save();
      updateDoc(
        _docForm['image'],
        selectedDoc.imageUrl,
        _docForm['expiryDate'] != null ? _docForm['expiryDate'] : selectedDoc.expireyDate,
        truckId,
        selectedDoc.id,
      ).then((_) {
        widget.model.setDoc(null);
        selectedDoc = null;
        setState(() {
          _addDoc = false;
        });
      });
    }
  }

  _buildImagePreview(String imageLink) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          content: Image.network(
            imageLink,
            fit: BoxFit.contain,
          ),
        );
      },
    );
  }

  Widget _buildDriverNameField() {
    return TextFormField(
      decoration: InputDecoration(
        labelText: 'Name',
      ),
      textCapitalization: TextCapitalization.words,
      validator: (String value) {
        if (value.isEmpty) {
          return 'Name is Required';
        }
        return null;
      },
      onSaved: (String value) {
        _formData['name'] = value;
      },
    );
  }

  Widget _buildDriverPhoneField() {
    return TextFormField(
      decoration: InputDecoration(
        labelText: 'Phone Number',
        counterText: '',
      ),
      keyboardType: TextInputType.phone,
      maxLength: 10,
      validator: (String value) {
        String patttern = r'^[6-9]\d{9}$';
        RegExp regExp = new RegExp(patttern);
        if (value.isEmpty) {
          return 'Phone Number Is Required';
        } else if (!regExp.hasMatch(value)) {
          return 'Phone Number Should Be Valid';
        }
        return null;
      },
      onSaved: (String value) {
        _formData['phone'] = value;
      },
    );
  }

  Widget _buildAddDriverDialogue(MainModel model) {
    return AlertDialog(
      title: Text('Add Driver'),
      content: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: <Widget>[
            Padding(
              padding: EdgeInsets.all(2.0),
              child: _buildDriverPhoneField(),
            ),
            Padding(padding: EdgeInsets.all(2.0), child: _buildDriverNameField()),
            Container(
              width: MediaQuery.of(context).size.width,
              decoration: BoxDecoration(borderRadius: BorderRadius.circular(30.0)),
              child: RaisedButton(
                child: Text(
                  "Save",
                  style: TextStyle(color: Colors.white),
                ),
                onPressed: () {
                  _submitForm(model.addDriver);
                },
              ),
            )
          ],
        ),
      ),
    );
  }

  void _deleteDriver(String truckId, String driverId, Function deleteDriver) async {
    var successResponse = await deleteDriver(truckId, driverId);
    if (successResponse['success']) {
      print(successResponse['message']);
    }
  }

  @override
  Widget build(BuildContext context) {
    return ScopedModelDescendant<MainModel>(
      builder: (BuildContext context, Widget child, MainModel model) {
        return WillPopScope(
          onWillPop: () => Future.value(false),
          child: Scaffold(
            appBar: AppBar(
              title: model.isTrucksLoading ? Text('root') : Text('Truck #' + model.selectedTruck.regNo),
              automaticallyImplyLeading: true,
              leading: IconButton(
                icon: Icon(Icons.arrow_back),
                onPressed: () => Navigator.pushReplacementNamed(context, '/trucks'),
              ),
            ),
            body: model.isTrucksLoading
                ? Center(
                    child: CircularProgressIndicator(),
                  )
                : SingleChildScrollView(
                    child: Card(
                      child: Column(
                        children: <Widget>[
                          Container(
                            alignment: Alignment.topCenter,
                            child: Card(
                              child: Container(
                                margin: EdgeInsets.all(10.0),
                                child: ListTile(
                                  leading: CircleAvatar(
                                    backgroundImage: AssetImage('assets/truck.png'),
                                  ),
                                  title: Text(
                                    model.selectedTruck.modelNo != null
                                        ? model.selectedTruck.modelNo
                                        : "Model required",
                                    style: TextStyle(fontSize: 16.0, fontWeight: FontWeight.w400),
                                  ),
                                  subtitle: Text(
                                    model.selectedTruck.regNo != null ? model.selectedTruck.regNo : "RegNo",
                                    style: TextStyle(fontSize: 10.0, fontWeight: FontWeight.w300),
                                  ),
                                  trailing: model.selectedTruck.rcImageUrl == null
                                      ? Container(
                                          padding: EdgeInsets.all(0),
                                          height: 0,
                                          width: 0,
                                        )
                                      : FlatButton(
                                          child: Text(
                                            'RC',
                                            style: TextStyle(color: Colors.grey),
                                          ),
                                          onPressed: () => _buildImagePreview(
                                            model.selectedTruck.rcImageUrl,
                                          ),
                                        ),
                                ),
                              ),
                            ),
                          ),
                          model.selectedTruck.rcImageUrl != null
                              ? Container(
                                  padding: EdgeInsets.all(0),
                                  height: 0,
                                  width: 0,
                                )
                              : GestureDetector(
                                  child: Text(
                                    'Please Update RC.',
                                    style: TextStyle(color: Colors.blueAccent),
                                  ),
                                  onTap: () {
                                    model.selectTruck(model.selectedTruck.id);
                                    Navigator.of(context).push(
                                      MaterialPageRoute(
                                        builder: (BuildContext context) {
                                          return AddTruckPage();
                                        },
                                      ),
                                    );
                                  },
                                ),
                          Divider(),
                          Card(
                            child: Container(
                              child: model.selectedTruck.driver != null
                                  ? ListTile(
                                      leading: CircleAvatar(
                                        backgroundImage: AssetImage('assets/driver.png'),
                                      ),
                                      title: Text(model.selectedTruck.driver.name),
                                      subtitle: Text(
                                        model.selectedTruck.driver.phone,
                                        style: TextStyle(fontSize: 10.0, fontWeight: FontWeight.w300),
                                      ),
                                      trailing: IconButton(
                                        icon: Icon(
                                          Icons.delete_outline,
                                          color: Colors.redAccent,
                                        ),
                                        onPressed: () => _deleteDriver(
                                            model.selectedTruck.id, model.selectedTruck.driver.id, model.deleteDriver),
                                      ),
                                    )
                                  : Container(
                                      width: MediaQuery.of(context).size.width,
                                      child: FlatButton.icon(
                                        icon: Icon(Icons.add),
                                        label: Text(
                                          'Driver',
                                          style: TextStyle(fontSize: 20.0),
                                        ),
                                        onPressed: () {
                                          showDialog(
                                            context: context,
                                            builder: (BuildContext context) {
                                              return _buildAddDriverDialogue(model);
                                            },
                                          );
                                        },
                                      ),
                                    ),
                            ),
                          ),
                          Divider(),
                          Card(
                            child: model.selectedTruck.documets.length != 0
                                ? model.idDocLoading
                                    ? Center(
                                        child: CircularProgressIndicator(),
                                      )
                                    : ListView.builder(
                                        primary: false,
                                        shrinkWrap: true,
                                        addSemanticIndexes: false,
                                        itemBuilder: (BuildContext context, int index) {
                                          return Column(
                                            children: <Widget>[
                                              ListTile(
                                                key: Key(model.selectedTruck.documets[index].id),
                                                leading: FadeInImage(
                                                  placeholder: AssetImage('assets/truck.png'),
                                                  image: NetworkImage(model.selectedTruck.documets[index].imageUrl),
                                                ),
                                                title: Text(model.selectedTruck.documets[index].type != null
                                                    ? model.selectedTruck.documets[index].type
                                                    : 'NOT FOUND'),
                                                subtitle: Text(
                                                  model.selectedTruck.documets[index].expireyDate == null
                                                      ? 'No Expiry Date'
                                                      : 'Expiry Date: ' +
                                                          DateFormat("dd-MM-yyyy")
                                                              .format(model.selectedTruck.documets[index].expireyDate),
                                                  style: TextStyle(fontSize: 12.0, fontWeight: FontWeight.w300),
                                                ),
                                                onTap: () =>
                                                    _buildImagePreview(model.selectedTruck.documets[index].imageUrl),
                                                trailing: _addDoc
                                                    ? Container(
                                                        padding: EdgeInsets.all(0),
                                                        height: 0,
                                                        width: 0,
                                                      )
                                                    : IconButton(
                                                        icon: Icon(Icons.edit),
                                                        onPressed: () => _editDoc(
                                                          model,
                                                          model.selectedTruck.id,
                                                          model.selectedTruck.documets[index].id,
                                                        ),
                                                      ),
                                              ),
                                              Divider()
                                            ],
                                          );
                                        },
                                        itemCount: model.selectedTruck.documets.length,
                                      )
                                : Container(),
                          ),
                          Container(
                            child: _addDoc
                                ? _buildDocForm(model)
                                : model.selectedTruck.documets.length == 5
                                    ? Container()
                                    : Container(
                                        width: MediaQuery.of(context).size.width,
                                        child: FlatButton.icon(
                                          icon: Icon(Icons.add),
                                          label: Text(
                                            'Document',
                                            style: TextStyle(fontSize: 20),
                                          ),
                                          onPressed: () {
                                            model.setDoc(null);
                                            setState(() {
                                              _addDoc = true;
                                            });
                                          },
                                        ),
                                      ),
                          )
                        ],
                      ),
                    ),
                  ),
          ),
        );
      },
    );
  }
}
