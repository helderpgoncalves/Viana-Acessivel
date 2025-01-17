/* eslint-disable */
import React, {useEffect, useState} from 'react';
import {FlatList} from 'react-native-gesture-handler';
import {StyleSheet, Text, TouchableOpacity, View, Alert} from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faTaxi,
  faMapMarkerAlt,
  faParking,
} from '@fortawesome/free-solid-svg-icons';
import * as geolib from 'geolib';

//WebServices
let destinos =
  'https://geo.cm-viana-castelo.pt/arcgis/rest/services/Viana_acessivel/MapServer/1/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&queryByDistance=&returnExtentsOnly=false&datumTransformation=&parameterValues=&rangeValues=&f=pjson';
let Taxis =
  'https://geo.cm-viana-castelo.pt/arcgis/rest/services/Viana_acessivel/MapServer/2/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&queryByDistance=&returnExtentsOnly=false&datumTransformation=&parameterValues=&rangeValues=&f=pjson';
let Estacionamento =
  'https://geo.cm-viana-castelo.pt/arcgis/rest/services/Viana_acessivel/MapServer/3/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&queryByDistance=&returnExtentsOnly=false&datumTransformation=&parameterValues=&rangeValues=&f=pjson';

let trajetosS =
  'https://geo.cm-viana-castelo.pt/arcgis/rest/services/Viana_acessivel/MapServer/4/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=StartPoint&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&queryByDistance=&returnExtentsOnly=false&datumTransformation=&parameterValues=&rangeValues=&f=pjson';
let start =
  'https://geo.cm-viana-castelo.pt/arcgis/rest/services/Viana_acessivel/MapServer/4/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=StartPoint&returnGeometry=false&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=true&resultOffset=&resultRecordCount=&queryByDistance=&returnExtentsOnly=false&datumTransformation=&parameterValues=&rangeValues=&f=pjson';
let end =
  'https://geo.cm-viana-castelo.pt/arcgis/rest/services/Viana_acessivel/MapServer/4/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=EndPoint&returnGeometry=false&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=true&resultOffset=&resultRecordCount=&queryByDistance=&returnExtentsOnly=false&datumTransformation=&parameterValues=&rangeValues=&f=pjson';

let matriz;
let dataI = [];
let val;
let lat;
let lng;

function invisuais({navigation}) {
  const [data, setData] = useState([]); //Array para armazenar os valores do Json
  const [state, setState] = useState({colorId: 1});
  const [type, setType] = useState(1);
  const [haveUserLocation, setHaveUserLocation] = useState(false);
  const [distancia, setDistancia] = useState(false);
  const [startP, setStartP] = useState();
  const [endP, setEndP] = useState();
  // const [dataI, setDataI]= useState();
  const [numI, setNumI] = useState();
  let arrayEnd = [];
  let alertShow = 0;
  let valores = [];

  findCoordinates = () => {
    Geolocation.getCurrentPosition(
      position => {
        lat1 = JSON.stringify(position.coords.latitude);
        lng1 = JSON.stringify(position.coords.longitude);
        lat = lat1;
        lng = lng1;
        if (lat !== undefined) {
          setHaveUserLocation(true);
        }
      },
      error => findCoordinates(),
      {enableHighAccuracy: true, timeout: 1000, maximumAge: 1000},
    );
  };

  userLocationError = () => {
    Alert.alert(
      'Erro ao obter as suas coordenadas! Por favor ative a permissão das coordenadas para a aplicação Viana+Acessível nas definições do seu telemóvel!',
      null,
      [{text: 'Concordo'}],
      {cancelable: false},
    );
  };

  //Lista de destinos mal a pagina abra
  useEffect(() => {
    findCoordinates();
    if (alertShow == 0) {
      Alert.alert(
        'A informação presente na plataforma encontra-se sujeita a atualização constante, razão pela qual a Camara Municipal de Viana do Castelo não se responsabiliza por alguma anomalia na informação presente na plataforma!',
        null,
        [{text: 'Concordo'}],
        {cancelable: false},
      );
      alertShow++;
    }

    fetch(destinos)
      .then(response => response.json())
      .then(responseJson => {
        setData(responseJson.features);
        setType(1);
      })
      .catch(error => console.error(error))
      .finally(() => mudarCor());
  }, []);

  checkDistancia = () => {
    let bestDist = 4000;
    let dist;
    setDistancia(false);
    for (let x = 0; x < dataI.length; x++) {
      // Ver qual o StartPoint mais proximo do utilizador

      let tamanho = dataI[x].geometry.paths[0].length; // tamanho de array paths para chegar ao endpoint (length -1)

      dist = geolib.getDistance(
        {latitude: lat, longitude: lng},
        {
          latitude: dataI[x].geometry.paths[0][0][1],
          longitude: dataI[x].geometry.paths[0][0][0],
        },
      );
      dist_end = geolib.getDistance(
        {latitude: lat, longitude: lng},
        {
          latitude: dataI[x].geometry.paths[0][tamanho - 1][1],
          longitude: dataI[x].geometry.paths[0][tamanho - 1][0],
        },
      );

      if (dist < bestDist) {
        setDistancia(true);
      }
      if (dist_end < bestDist) {
        setDistancia(true);
      }
    }
  };

  mudarCor = () => {
    navigation.setOptions({headerStyle: {backgroundColor: '#DBDBDB'}});
  };

  //Mudar menu conforme os botoes clicados
  listarPontos = (link, i) => {
    fetch(link)
      .then(response => response.json())
      .then(responseJson => {
        setData(responseJson.features);
        setType(i);
      })
      .catch(error => console.error(error));
  };

  //Identifica o botao clicado
  botaoClicado = i => {
    setState({colorId: i});
  };

  //------------------------------------------------------------------Criação da matriz------------------------------------------------------------
  useEffect(() => {
    fetch(trajetosS)
      .then(response => response.json())
      .then(data => {
        dataI = data.features;
        setNumI(data.features.length);
      })
      .finally(() => getEndPoint());
  }, []);

  getEndPoint = () => {
    fetch(end)
      .then(response => response.json())
      .then(data => {
        setEndP(data.features); //Array que guarda todos os dados
      })
      .finally(() => getStartPoint());
  };

  getStartPoint = () => {
    fetch(start)
      .then(response => response.json())
      .then(data => {
        setStartP(data.features);
        //Array que guarda todos os dados
      })
      .finally(() => criarMatriz());
  };

  checkDistancia = () => {
    let bestDist = 4000;
    let dist;
    for (let x = 0; x < dataI.length; x++) {
      // Ver qual o StartPoint mais proximo do utilizador

      let tamanho = dataI[x].geometry.paths[0].length; // tamanho de array paths para chegar ao endpoint (length -1)

      dist = geolib.getDistance(
        {latitude: lat, longitude: lng},
        {
          latitude: dataI[x].geometry.paths[0][0][1],
          longitude: dataI[x].geometry.paths[0][0][0],
        },
      );
      dist_end = geolib.getDistance(
        {latitude: lat, longitude: lng},
        {
          latitude: dataI[x].geometry.paths[0][tamanho - 1][1],
          longitude: dataI[x].geometry.paths[0][tamanho - 1][0],
        },
      );

      if (dist < bestDist) {
        return true;
      }
      if (dist_end < bestDist) {
        return true;
      }
      return false;
    }
  };

  // Criar a matriz
  criarMatriz = () => {
    //StartPoints
    for (let i = 0; i < startP.length; i++) {
      valores.push(startP[i].attributes.StartPoint);
    }

    //Add endPoints
    for (let j = 0; j < endP.length; j++) {
      let existe = false;
      for (let x = 0; x < valores.length; x++) {
        if (endP[j].attributes.EndPoint == valores[x]) {
          existe = true;
        }
      }

      if (existe == false) {
        valores.push(endP[j].attributes.EndPoint);
        arrayEnd.push(endP[j].attributes.EndPoint); //Array com os endpoints que são StartPoints
      }
    }

    let num = valores.length;

    matriz = Array(num)
      .fill(null)
      .map(() => Array(num).fill(0));

    //preencherMatriz StartPoitns
    for (let a = 0; a < numI; a++) {
      var start = dataI[a].attributes.StartPoint;
      var end = dataI[a].attributes.EndPoint;
      var peso;
      var inc;

      //Incapacidade do utilizador
      inc = dataI[a].attributes.Invisual;

      //Definir peso
      if (inc == 0) {
        peso = 100000;
      } else if (inc == 1) {
        peso = 10000;
      } else if (inc == 2) {
        peso = 5000;
      } else if (inc == 3) {
        peso = 1000;
      } else if (inc == 4) {
        peso = 200;
      } else if (inc == 5) {
        peso = 1;
      }

      iStart = valores.indexOf(start);
      iEnd = valores.indexOf(end);

      for (let b = 0; b < arrayEnd.length; b++) {
        //
        if (end == arrayEnd[b]) {
          matriz[iEnd][iStart] = peso;
          matriz[iEnd][iStart] = peso;
        } else {
          matriz[iStart][iEnd] = peso;
          matriz[iEnd][iStart] = peso;
        }
      }
    }
    val = valores;
  };

  userLocationChanged = event => {
    const newRegion = event.nativeEvent.coordinate;

    if (!(newRegion.latitude == lat && newRegion.longitude == lng)) {
      lat = newRegion.latitude;
      lng = newRegion.longitude;
    }
  };

  return (
    <View style={styles.container}>
      {(() => {
        if (type == 1) {
          return (
            <FlatList
              data={data}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => {
                    haveUserLocation
                      ? checkDistancia()
                        ? navigation.navigate('teste', {
                            matriz: matriz,
                            valores: val,
                            incapacidade: 'Invisual',
                            allData: dataI,
                            end: item.attributes.Ponto,
                            lati: lat,
                            longi: lng,
                            latE: item.geometry.y,
                            lngE: item.geometry.x,
                          })
                        : Alert.alert(
                            'Encontra-se fora da rede de Viana do Castelo, por favor aproxime-se do centro.',
                            null,
                            [{text: 'Entendi'}],
                            {cancelable: false},
                          )
                      : console.log('Nao tenho localização!');
                  }}>
                  <Text style={styles.texto}>{item.attributes.DESIGNACAO}</Text>
                </TouchableOpacity>
              )}
              keyExtractor={item => item.attributes.OBJECTID.toString()}
            />
          );
        } else if (type == 2) {
          return (
            <FlatList
              data={data}
              renderItem={({item}) => (
                <TouchableOpacity
                  style={styles.item}
                  onPress={() => {
                    haveUserLocation
                      ? checkDistancia()
                        ? navigation.navigate('teste', {
                            matriz: matriz,
                            valores: val,
                            incapacidade: 'Invisual',
                            allData: dataI,
                            end: item.attributes.Ponto,
                            lati: lat,
                            longi: lng,
                            latE: item.geometry.y,
                            lngE: item.geometry.x,
                          })
                        : Alert.alert(
                            'Encontra-se fora da rede de Viana do Castelo, por favor aproxime-se do centro.',
                            null,
                            [{text: 'Entendi'}],
                            {cancelable: false},
                          )
                      : userLocationError();
                  }}>
                  <Text style={styles.texto}>{item.attributes.RUA}</Text>
                  <Text style={styles.lugares}>
                    Lugares disponíveis:{item.attributes.LUGARES}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={item => item.attributes.OBJECTID.toString()}
            />
          );
        }
      })()}
      <View style={styles.menu}>
        <TouchableOpacity
          style={styles.opcao}
          onPress={() => {
            this.listarPontos(destinos, 1);
            this.botaoClicado(1);
          }}>
          <FontAwesomeIcon
            icon={faMapMarkerAlt}
            size={30}
            color={'white'}
            style={state.colorId === 1 ? styles.clicado : styles.botaoC}
          />
          <Text style={styles.titulos}>Destinos</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.opcao}
          onPress={() => {
            this.listarPontos(Taxis, 2);
            this.botaoClicado(3);
          }}>
          <FontAwesomeIcon
            icon={faTaxi}
            color={'white'}
            size={30}
            style={state.colorId === 3 ? styles.clicado : styles.botaoC}
          />
          <Text style={styles.titulos}>Pontos de Táxi</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.opcao}
          onPress={() => {
            this.listarPontos(Estacionamento, 2);
            this.botaoClicado(4);
          }}>
          <FontAwesomeIcon
            icon={faParking}
            color={'white'}
            size={30}
            style={state.colorId === 4 ? styles.clicado : styles.botaoC}
          />
          <Text style={styles.titulos}>Estacionamento</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#DBDBDB',
    justifyContent: 'center',
  },

  item: {
    backgroundColor: 'white',
    padding: 20,
    borderColor: 'black',
    borderWidth: 0.5,
  },

  texto: {
    fontSize: 22,
    fontWeight: 'bold',
  },

  menu: {
    justifyContent: 'flex-start',
    alignItems: 'baseline',
    alignContent: 'flex-start',
    flexDirection: 'column',
    padding: wp('4%'),
    backgroundColor: 'black',
  },

  botaoC: {
    margin: 10,
  },

  clicado: {
    margin: 10,
    opacity: 0.7,
  },

  titulos: {
    alignContent: 'center',
    justifyContent: 'center',
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    paddingStart: hp('5%'),
  },

  opcao: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: 10,
  },

  lugares: {
    fontSize: 18,
  },
});

export default invisuais;
