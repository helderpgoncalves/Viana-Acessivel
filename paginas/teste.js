/* eslint-disable */
import Geolocation from '@react-native-community/geolocation';
import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MapView, {Marker, PROVIDER_GOOGLE, Polyline} from 'react-native-maps';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'; //Ecrã responsivo
import * as geolib from 'geolib';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {faStreetView} from '@fortawesome/free-solid-svg-icons';

let caminho = [];
let cores = [];

let lat1;
let lng1;
let lat;
let lng;

// A funcionar **********************
// ActivityIndicator
// Todas as funções funcionam

function teste({route, navigation}) {
  const {matriz} = route.params;
  const {valores} = route.params;
  const {incapacidade} = route.params;
  const {allData} = route.params;
  const {end} = route.params;
  const {lati} = route.params;
  const {longi} = route.params;
  const {latE} = route.params;
  const {lngE} = route.params;

  const [isLoad, setLoad] = useState(true);

  let caminhos; //Guarda todos os caminhos que o A* percorre
  let resultado; //Guarda o caminho mais curto
  let pontos = []; //Guarda os pontos do caminho
  let subarrayColor = []; //Guarda as cores dos caminhos
  let path = []; //Coordenadas de todos os pontos

  let dist;
  let dist_end;
  let bestDist = 40000; // guarda o numero em metro do StartpOINT MAIS PROXIMO DO UTILIZADOR
  let start; // guarda o startpoint mais proximo do utilizador

  let lat;
  let lng;

  findCoordinates = () => {
    Geolocation.getCurrentPosition(
      position => {
        lat1 = JSON.stringify(position.coords.latitude);
        lng1 = JSON.stringify(position.coords.longitude);
        lat = lat1;
        lng = lng1;
        setInitialPosition({
          latitude: Number(lat),
          longitude: Number(lng),
          latitudeDelta: 0.035,
          longitudeDelta: 0.035,
        });
      },
      error => Alert.alert(error.message),
      {enableHighAccuracy: true, timeout: 1000, maximumAge: 1000},
    );
  };

  useEffect(() => {
    calcularCaminho();
  }, []);

  const [initialPosition, setInitialPosition] = useState({
    latitude: 41.6946,
    longitude: -8.83016,
    latitudeDelta: 0.04,
    longitudeDelta: 0.04,
  });

  //------------------------------------------------------------------------Calcular o caminho-------------------------------------------------------

  calcularCaminho = () => {
    for (let x = 0; x < allData.length; x++) {
      // Ver qual o StartPoint mais proximo do utilizador

      let tamanho = allData[x].geometry.paths[0].length; // tamanho de array paths para chegar ao endpoint (length -1)

      dist = geolib.getDistance(
        {latitude: lati, longitude: longi},
        {
          latitude: allData[x].geometry.paths[0][0][1],
          longitude: allData[x].geometry.paths[0][0][0],
        },
      );
      dist_end = geolib.getDistance(
        {latitude: lati, longitude: longi},
        {
          latitude: allData[x].geometry.paths[0][tamanho - 1][1],
          longitude: allData[x].geometry.paths[0][tamanho - 1][0],
        },
      );

      if (dist < bestDist) {
        bestDist = dist;
        start = allData[x].attributes.StartPoint;
      }
      if (dist_end < bestDist) {
        bestDist = dist_end;
        start = allData[x].attributes.EndPoint;
      }
    }
    // console.log("bestDist: " + bestDist + " Start: " + start + "EndPoint:"+ end);

    // Calcular o index do StartPoint e EndPoint
    iStart = valores.indexOf(start);
    iEnd = valores.indexOf(end);

    setLoad(false);
    var distances = []; //Distancia de todos os nodes ao StarPoint
    var priorities = []; //Prioridade dos nodos
    var visited = []; //Diz se um no já foi visitado
    caminhos = Array(valores.length).fill(''); //Definir o array caminho como vazio

    for (var i = 0; i < matriz.length; i++) distances[i] = Number.MAX_VALUE; //Incializa as distancias como "Infinity"
    distances[iStart] = 0; //A distancia do ponto inicial a si mesmo é zero

    for (var i = 0; i < matriz.length; i++) priorities[i] = Number.MAX_VALUE; //Inicializa a prioridade como "Infinity"
    priorities[iStart] = 1; //Heuristica . Teste com um número pequeno

    //Enquanto houver nodos para visitar isto corre
    while (true) {
      // Encontrar o nodo com a prioridade mais baixo. No inicio será o StartPoint
      var lowestPriority = Number.MAX_VALUE;
      var lowestPriorityIndex = -1;

      for (var i = 0; i < priorities.length; i++) {
        //... by going through all nodes that haven't been visited yet
        if (priorities[i] < lowestPriority && !visited[i]) {
          // console.log("Num: "+ i+ "Entrei"+ valores[i])
          lowestPriority = priorities[i];
          lowestPriorityIndex = i;
        }
      }

      if (lowestPriorityIndex === -1) {
        // There was no node not yet visited --> Node not found
        return -1; //Passa a false, sai do while
      } else if (lowestPriorityIndex === iEnd) {
        // Goal node found
        // console.log("Goal node found!");
        resultado = caminhos[lowestPriorityIndex].split(',');

        for (var i = 0; i < resultado.length; i++) {
          pontos.push(valores[resultado[i]]);
        }

        criarPolyline(pontos);

        return distances[lowestPriorityIndex];
      }

      //...then, for all neighboring nodes that haven't been visited yet....
      for (var i = 0; i < matriz[lowestPriorityIndex].length; i++) {
        if (matriz[lowestPriorityIndex][i] !== 0 && !visited[i]) {
          // Se for igual a zero não existe caminho

          //console.log("peso: " +matriz[lowestPriorityIndex][i]+ "Start: "+lowestPriorityIndex+ "End: " + i);

          //...if the path over this edge is shorter...
          if (
            distances[lowestPriorityIndex] + matriz[lowestPriorityIndex][i] <
            distances[i]
          ) {
            // console.log( valores[lowestPriorityIndex]  + "----"+ valores[i] +"   i" + i);

            if (caminhos[lowestPriorityIndex] == '') {
              // console.log("Entrei pela primeira vez")
              caminhos[i] = lowestPriorityIndex + ',' + i;

              // console.log(caminhos[i]);
            } else {
              // console.log("Entrei pela segunda ou terceira vez")
              caminhos[i] = caminhos[lowestPriorityIndex] + ',' + i;
              // console.log(caminhos[i])
            }

            distances[i] =
              distances[lowestPriorityIndex] + matriz[lowestPriorityIndex][i]; //Caminho mais curto até ao momento

            //...and set the priority with which we should continue with this node
            priorities[i] = distances[i] + 1;
            //console.log("Updating distance of node " + i + " to " + distances[i] + " and priority to " + priorities[i]);
          }
        }
      }

      // Lastly, note that we are finished with this node.
      visited[lowestPriorityIndex] = true;
    }
  };

  criarPolyline = pontos => {
    for (var i = 0; i < allData.length; i++) {
      var inc;

      for (var j = 0; j < pontos.length - 1; j++) {
        let start = pontos[j];
        let end = pontos[j + 1];

        if (
          (allData[i].attributes.StartPoint == start &&
            allData[i].attributes.EndPoint == end) ||
          (allData[i].attributes.StartPoint == end &&
            allData[i].attributes.EndPoint == start)
        ) {
          var arrayPaths = allData[i].geometry.paths[0];
          var subarray = [];

          if (incapacidade == 'MobReduzida') {
            if (allData[i].attributes.MobReduzida == 3) {
              subarrayColor.push('#0000cc');
            }
            if (allData[i].attributes.MobReduzida == 4) {
              subarrayColor.push('#00cccc');
            }
            if (allData[i].attributes.MobReduzida == 5) {
              subarrayColor.push('#00cc00');
            }
          }

          //Incapacidade do utilizador
          if (incapacidade == 'MobReduzida') {
            inc = allData[i].attributes.MobReduzida;
          } else if (incapacidade == 'Invisual') {
            inc = allData[i].attributes.Invisual;
          } else {
            inc = allData[i].attributes.Autismo;
          }

          if (incapacidade == 'Autismo' || incapacidade == 'Invisual') {
            if (inc == 0) {
              subarrayColor.push('black');
            }
            if (inc == 1) {
              subarrayColor.push('#cc0000');
            }
            if (inc == 2) {
              subarrayColor.push('#cc00cc');
            }
            if (inc == 3) {
              subarrayColor.push('#0000cc');
            }
            if (inc == 4) {
              subarrayColor.push('#00cccc');
            }
            if (inc == 5) {
              subarrayColor.push('#00cc00');
            }
          }
          arrayPaths.map(item => {
            subarray.push({latitude: item[1], longitude: item[0]});
          });

          path.push(subarray);
        }
      }
    }

    caminho = path;
    cores = subarrayColor;

    if (bestDist > 750) {
      Alert.alert(
        'Aconselhamos a aproximar-se mais da rede de Viana do Castelo!',
        null,
        [{text: 'Continuar mesmo assim'}],
        {cancelable: false},
      );
    }
    setLoad(false);
  };

  userLocationChanged = event => {
    const newRegion = event.nativeEvent.coordinate;

    if (!(newRegion.latitude == lat && newRegion.longitude == lng)) {
      lat = newRegion.latitude;
      lng = newRegion.longitude;
    }
  };

  changeRegion = event => {
    latDelta = event.latitudeDelta * 0.77426815;
    lngDelta = event.longitudeDelta * 0.77426815;

    //console.log("LATD1: " + latDelta + " LNGD1: " + lngDelta)
  };

  centrarUtl = () => {
    var initialRegion = {
      latitude: lat,
      longitude: lng,
      longitudeDelta: 0.01,
      latitudeDelta: 0.01,
    };

    setInitialPosition(initialRegion);
  };

  return isLoad ? (
    <View>
      <ActivityIndicator size="large" color="yellow" />
      <Text>A calcular a sua Rota</Text>
    </View>
  ) : (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={initialPosition}
        showsUserLocation={true}
        onUserLocationChange={event => this.userLocationChanged(event)}
        onRegionChangeComplete={event => this.changeRegion(event)}>
        {caminho.map((seila, index) => {
          return (
            <Polyline
              key={index}
              coordinates={caminho[index]}
              strokeColor={cores[index]}
              strokeWidth={6}
            />
          );
        })}
        <Marker coordinate={{latitude: latE, longitude: lngE}}>
          <View>
            <Image
              source={require('../images/flag.png')}
              style={{height: 40, width: 40, marginLeft: hp('3%')}}
            />
          </View>
        </Marker>
      </MapView>

      {(() => {
        if (incapacidade == 'Autismo' || incapacidade == 'Invisual') {
          return (
            <View style={styles.legenda}>
              <Text style={{color: 'black', fontSize: 16}}>Excluir</Text>
              <Image
                source={require('../images/legenda_6.png')}
                style={{marginLeft: 15, marginRight: 15}}
              />
              <Text style={{color: 'black', fontSize: 16}}>Excelente</Text>
            </View>
          );
        } else if (incapacidade == 'MobReduzida') {
          return (
            <View style={styles.legenda}>
              <Text style={{color: 'black', fontSize: 15}}>
                Não Aconselhado
              </Text>
              <Image
                source={require('../images/legenda_1.png')}
                style={{marginLeft: 3, marginRight: 3}}
              />
              <Text style={{color: 'black', fontSize: 15}}>Aconselhado</Text>
            </View>
          );
        }
      })()}

      <View
        style={{
          position: 'absolute', //use absolute position to show button on top of the map
          alignSelf: 'flex-end', //for align to right
        }}>
        <FontAwesomeIcon
          icon={faStreetView}
          size={40}
          color={'black'}
          style={{margin: 20}}
          onPress={() => centrarUtl()}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 50,
    height: 50,
  },

  bubble: {
    flexDirection: 'column',
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderColor: '#ccc',
    borderWidth: 0.5,
    padding: wp('2%'),
    height: hp('15%'),
    width: wp('55%'),
    textAlign: 'center',
  },
  texto: {
    fontSize: 15,
    fontWeight: 'bold',
    margin: 5,
    alignSelf: 'center',
    color: 'white',
  },
  containerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  container: {
    ...StyleSheet.absoluteFillObject,
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },

  map: {
    position: 'absolute',
    ...StyleSheet.absoluteFillObject,
  },

  callout: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold',
  },
  arrow: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderTopColor: '#fff',
    borderWidth: 16,
    alignSelf: 'center',
    marginTop: -32,
  },

  arrowBorder: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    borderTopColor: '#007aB7',
    borderWidth: 16,
    alignSelf: 'center',
    marginTop: -0.5,
  },
  menuLateral: {
    height: hp('60%'),
    width: wp('20%'),
    marginTop: hp('9%'),
    alignSelf: 'center',
    backgroundColor: 'black',
    flexDirection: 'column',
    marginStart: wp('76%'),
    borderRadius: 20,
    borderColor: 'black',
    justifyContent: 'center',
  },

  botoes: {
    alignSelf: 'center', //Colocar os botões no centro do layout
    borderColor: '#D0EAF5',
    alignItems: 'center',
    width: 45,
    height: 45,
    backgroundColor: '#fff',
    borderRadius: 30,
  },

  botaoC: {
    alignSelf: 'center', //Colocar os botões no centro do layout
    borderColor: '#D0EAF5',
    alignItems: 'center',
    width: 45,
    height: 45,
    borderRadius: 50,
    backgroundColor: 'rgba(0,0,0,.6)',
  },

  imagens: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },

  clicado: {
    width: 40,
    height: 40,
    borderRadius: 20,
    opacity: 0.5,
  },

  espaco: {
    padding: 5,
  },

  legenda: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: hp('6.4%'),
    width: wp('100%'),
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    flexDirection: 'row',
    backgroundColor: 'white',
    borderColor: '#757575',
    borderWidth: 2,
  },
});

export default teste;
