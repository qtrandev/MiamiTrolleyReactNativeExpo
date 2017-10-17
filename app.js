import React, { Component } from 'react';
import {
  StyleSheet,
  ScrollView,
  PropTypes,
  Text,
  TouchableHighlight,
  View,
  TabBarIOS,
  ListView,
} from 'react-native';
import '@expo/vector-icons'; // 5.2.0
import 'prop-types'; // 15.6.0
import { MapView } from 'expo';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      markers: props.markers,
      routes: props.routes,
      tempMarkers: [],
      selectedTab: 'one',
    };
    this.processCallback = this.processCallback.bind(this);
    this.processRoutesCallback = this.processRoutesCallback.bind(this);
  }
  componentDidMount() {
    //this.refresh();
    /* Not quite working?
    setTimeout(
      () => { this.refresh(); },
      5000
    );
    */
  }
  render() {
    return (
      <View style={styles.container}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 25.8011413,
            longitude: -80.2044014,
            latitudeDelta: 0.18,
            longitudeDelta: 0.18,
          }}>
          {this.state.tempMarkers.map(this.renderPart)}

        </MapView>
        <TouchableHighlight
          style={styles.button}
          onPress={() => this.refresh()}
          underlayColor="#bbbbbb">
          <Text style={styles.buttonText}>
            Refresh
          </Text>
        </TouchableHighlight>
      </View>
    );
  }
  renderPart(tempMarker, i) {
    var lat = tempMarker.coordinate.latitude;
    var lon = tempMarker.coordinate.longitude;
    return (
      /* Sample MapView.Marker format accepted
      [  
      {  
        "coordinate":{  
          "latitude":25.77553,
          "longitude":-80.140643
        },
        "title":"MB621",
        "description":"ID: 1029047 Direction: N"
      },
      ]
      */
      (
        <MapView.Marker
          coordinate={{ latitude: lat, longitude: lon }}
          title={tempMarker.title}
          description={tempMarker.description}
        />
      )
    );
  }
  refresh() {
    //this.displayTrolleys();
    //this.displayRoutes();
    //this.displayRoutesAsMarkers();
    this.setState({ tempMarkers: [] });
    //this.requestMiamiBeachTrolleys(this.processCallback);
    //this.requestMiamiTrolleys(this.processCallback);
    this.requestMiamiTrolleyRoutes(this.processRoutesCallback);
  }
  processCallback(newMarkers) {
    //console.log('newMarkers: ' + JSON.stringify(newMarkers));
    this.setState({ tempMarkers: this.state.tempMarkers.concat(newMarkers) });
  }
  processRoutesCallback(routesJSON) {
    //console.log('routesJSON: ' + JSON.stringify(routesJSON.routes));
    var stops = routesJSON.stops;
    var stopMarkers = [];
    var i = 0;
    for (i = 0; i < stops.length; i++) {
      stopMarkers.push({
        coordinate: {
          latitude: parseFloat(stops[i].Latitude),
          longitude: parseFloat(stops[i].Longitude),
        },
        title: 'Route '+stops[i].RouteId+' Stop '+stops[i].StopNumber,
        description: 'Sequence: ' +
          stops[i].Sequence +
          ' Description: ' +
          stops[i].Description,
      });
    }
    this.setState({ tempMarkers: this.state.tempMarkers.concat(stopMarkers) });
  }
  requestMiamiBeachTrolleys(callback) {
    console.log('requestMiamiBeachTrolleys() called');
    var url =
      'http://app.tsomobile.com/rest/MappingController/GetUnitFromRouteAntibunching';
    var tkn = '825894C5-2B5F-402D-A055-88F2297AF99A';

    this.sendTSOTrolleyRequest(url, tkn, '38836', callback);
    this.sendTSOTrolleyRequest(url, tkn, '40756', callback);
    this.sendTSOTrolleyRequest(url, tkn, '72486', callback);
    this.sendTSOTrolleyRequest(url, tkn, '73772', callback);
  }
  requestMiamiTrolleys(callback) {
    console.log('requestMiamiTrolleys() called');
    var url =
      'http://app.tsomobile.com/rest/MappingController/GetUnitFromRouteAntibunching';
    var tkn = '81E39EC9-D773-447E-BE29-D7F30AB177BC';

    this.sendTSOTrolleyRequest(url, tkn, '71269', callback);
    this.sendTSOTrolleyRequest(url, tkn, '71276', callback);
    this.sendTSOTrolleyRequest(url, tkn, '71304', callback);
    this.sendTSOTrolleyRequest(url, tkn, '71322', callback);
    this.sendTSOTrolleyRequest(url, tkn, '71342', callback);
    this.sendTSOTrolleyRequest(url, tkn, '73803', callback);
    this.sendTSOTrolleyRequest(url, tkn, '73789', callback);
    this.sendTSOTrolleyRequest(url, tkn, '71345', callback);
    this.sendTSOTrolleyRequest(url, tkn, '75187', callback);
    this.sendTSOTrolleyRequest(url, tkn, '81209', callback);
    this.sendTSOTrolleyRequest(url, tkn, '71344', callback);
  }
  /* Process the JSON data from TSO. Data to process looks like this:
  {  
  "Units":[  
    {  
      "MarkerID":"1029047",
      "MarkerName":"MB621",
      "Latitude":"25.777326",
      "Longitude":"-80.140849",
      "Direction":"S",
      "Heading":"181"
    },
  ],
  }
  */
  sendTSOTrolleyRequest(url, tkn, geofencesid, callback) {
    console.log(
      'sendTSOTrolleyRequest() called with geofencesid: ' + geofencesid
    );
    fetch(url + '?tkn=' + tkn + '&geofencesid=' + geofencesid + '&lan=en')
      .then(function(res) {
        console.log('TSO call result returned');
        return res.json();
      })
      .then(function(resJson) {
        console.log('TSO call end');
        var routeMarkers = [];
        var resultJson = JSON.parse(resJson);
        //console.log(JSON.stringify(resultJson));
        var trolleys = resultJson.Units;
        var i = 0;
        for (i = 0; i < trolleys.length; i++) {
          routeMarkers.push({
            coordinate: {
              latitude: parseFloat(trolleys[i].Latitude),
              longitude: parseFloat(trolleys[i].Longitude),
            },
            title: trolleys[i].MarkerName,
            description: 'ID: ' +
              trolleys[i].MarkerID +
              ' Direction: ' +
              trolleys[i].Direction,
          });
        }
        callback(routeMarkers);
      })
      .catch(error => {
        console.log('ERROR requesting TSO trolley data');
        console.warn(error);
      });
  }
  requestMiamiTrolleyRoutes(callback) {
    console.log('requestMiamiTrolleyRoutes() called');
    fetch(
      'http://app.tsomobile.com/rest/Routes/GetRouteFromToken?tkn=81E39EC9-D773-447E-BE29-D7F30AB177BC&routeId=-1'
    )
      .then(function(res) {
        console.log('TSO route result returned');
        return res.json();
      })
      .then(function(resJson) {
        console.log('TSO route call end');
        var resultJson = JSON.parse(resJson);
        //console.log(JSON.stringify(resultJson.routes));
        callback(resultJson);
      })
      .catch(error => {
        console.log('ERROR requesting TSO trolley routes data');
        console.warn(error);
      });
  }
  displayTrolleys() {
    fetch('https://miami-transit-api.herokuapp.com/api/trolley/vehicles.json')
      .then(response => response.json())
      .then(responseJson => {
        var newMarkers = [];
        var trolleys = responseJson.get_vehicles;
        var count = trolleys.length;
        for (var i = 0; i < count; i++) {
          trolleys[i].receiveTime = new Date(
            trolleys[i].receiveTime
          ).toLocaleString();
          newMarkers.push({
            latitude: trolleys[i].lat,
            longitude: trolleys[i].lng,
            title: 'Vehicle ID: ' + trolleys[i].equipmentID,
            subtitle: 'Route: ' +
              trolleys[i].routeID +
              ', Time: ' +
              trolleys[i].receiveTime,
          });
        }
        this.setState({ markers: newMarkers });
      })
      .catch(error => {
        console.error(error);
      });
  }
  displayRoutes() {
    console.log('displayRoutes() called');
    fetch(
      'https://raw.githubusercontent.com/qtrandev/OneBusAway/master/GTFS/Miami/shapes.txt'
    )
      .then(response => response.text())
      .then(responseText => {
        console.log('ResponseText: ' + responseText);
        var routeOverlays = processShapeData(responseText);
        console.log('routeOverlays size = ' + routeOverlays.length);
        this.setState({ routes: routeOverlays });
      })
      .catch(error => {
        console.warn(error);
      });
  }
  displayRoutesAsMarkers() {
    console.log('displayRoutesAsMarkers() called');
    fetch(
      'https://raw.githubusercontent.com/qtrandev/OneBusAway/master/GTFS/Miami/shapes.txt'
    )
      .then(response => response.text())
      .then(responseText => {
        var routeMarkers = processTemporaryMarkers(responseText);
        this.setState({ tempMarkers: routeMarkers });
      })
      .catch(error => {
        console.warn(error);
      });
  }
}

function processTemporaryMarkers(allText) {
  console.log('processTemporaryMarkers() called');
  var allTextLines = allText.split(/\r\n|\n/);
  var headers = allTextLines[0].split(',');
  var routes = [];
  for (var i = 1; i < allTextLines.length; i++) {
    var data = allTextLines[i].split(',');
    if (data.length >= 4) {
      if (routes[data[0]] === undefined) {
        routes[data[0]] = [];
      }
      routes[data[0]].push(data);
    }
  }

  var routeMarkers = [];
  for (var index in routes) {
    var route = routes[index];
    for (var j = 0; j < route.length; j++) {
      routeMarkers.push({
        coordinate: {
          latitude: parseFloat(route[j][1]),
          longitude: parseFloat(route[j][2]),
        },
        title: 'Route ' + route[j][0],
        description: 'Stop sequence: ' + route[j][3],
      });
    }
  }
  return routeMarkers;
}

function processShapeData(allText) {
  console.log('processShapeData() called');
  var allTextLines = allText.split(/\r\n|\n/);
  console.log('headers: ' + allTextLines[0]);
  console.log('line last: ' + allTextLines[allTextLines.length - 2]);
  var headers = allTextLines[0].split(',');
  var routes = [];
  for (var i = 1; i < allTextLines.length; i++) {
    var data = allTextLines[i].split(',');
    if (data.length >= 4) {
      if (routes[data[0]] === undefined) {
        routes[data[0]] = [];
      }
      routes[data[0]].push(data);
    }
  }
  var routeOverlays = [];
  for (var index in routes) {
    var route = routes[index];
    var coordinates = [];
    for (var j = 0; j < route.length; j++) {
      coordinates[j] = {
        latitude: parseFloat(route[j][1]),
        longitude: parseFloat(route[j][2]),
      };
    }
    routeOverlays.push({
      coordinates: coordinates,
      strokeColor: routeColors[route[0][0]],
      lineWidth: 6,
    });
  }
  return routeOverlays;
}

var routeColors = {
  '1': '#a64598',
  '2': '#679844',
  '3': '#0faed2',
  '4': '#3e5ba6',
  '5': '#f59640',
  '6': '#c73136',
  '7': '#f39690',
  '11': '#FFAB5F',
  '12': '#A07D5C',
  '13': '#2BAA33',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabcontainer: {
    flex: 1,
    marginBottom: 50,
  },
  map: {
    flex: 1,
  },
  button: {
    height: 36,
    backgroundColor: '#123456',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    margin: 2,
    borderRadius: 5,
  },
  buttonText: {
    fontSize: 18,
    color: '#fff',
  },
  rowText1: {
    padding: 10,
    fontSize: 36,
    color: 'blue',
  },
  rowText2: {
    padding: 10,
    fontSize: 24,
    color: 'green',
  },
});

App.defaultProps = {
  // not working?
  markers: [],
  routes: [],
  tempMarkers: [],
};

class RoutesView extends Component {
  constructor(props) {
    super(props);
    var ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = {
      dataSource: ds.cloneWithRows([
        'Allapattah',
        'Biscayne',
        'Coral Way',
        'Health District',
        'Overtown',
        'Stadium',
        'Coconut Grove',
        'Little Havana',
        'Wynwood',
      ]),
    };
  }

  render() {
    return (
      <ListView
        dataSource={this.state.dataSource}
        renderRow={rowData => <Text style={styles.rowText1}>{rowData}</Text>}
      />
    );
  }
}

class FavoritesView extends Component {
  constructor(props) {
    super(props);
    var ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
    this.state = {
      dataSource: ds.cloneWithRows(['Allapattah', 'Biscayne']),
    };
  }

  render() {
    return (
      <ListView
        dataSource={this.state.dataSource}
        renderRow={rowData => <Text style={styles.rowText2}>{rowData}</Text>}
      />
    );
  }
}
