import 'package:flutter/material.dart';
import 'package:scoped_model/scoped_model.dart';
import '../scoped_models/main.dart';

class MultiSelectChip extends StatefulWidget {
  final Function(List<String>) onSelectionChanged;
  final MainModel model;

  MultiSelectChip(this.model, {this.onSelectionChanged});

  @override
  _MultiSelectChipState createState() => _MultiSelectChipState();
}

class _MultiSelectChipState extends State<MultiSelectChip> {
  // String selectedChoice = "";
  List<String> selectedChoices = [];

  _buildChoiceList(MainModel model) {
    List<Widget> choices = List();

    model.incidentTypesList.forEach((item) {
      choices.add(
        Container(
          padding: EdgeInsets.all(2.0),
          child: ChoiceChip(
            materialTapTargetSize: MaterialTapTargetSize.padded,
            backgroundColor: Colors.white,
            label: Text(
              item.type,
              style: TextStyle(
                  color: Colors.black,
                  fontSize: 15.0,
                  fontWeight: FontWeight.w400),
            ),
            selectedColor: Colors.grey,
            shadowColor: Colors.blue,
            selected: selectedChoices.contains(item.id),
            onSelected: (selected) {
              setState(() {
                selectedChoices.contains(item.id)
                    ? selectedChoices.remove(item.id)
                    : selectedChoices.add(item.id);
                widget.onSelectionChanged(selectedChoices);
              });
            },
          ),
        ),
      );
    });
    return choices;
  }

  @override
  Widget build(BuildContext context) {
    return ScopedModelDescendant<MainModel>(
      builder: (BuildContext context, Widget child, MainModel model) {
        return Wrap(
          children: _buildChoiceList(model),
        );
      },
    );
  }
}
