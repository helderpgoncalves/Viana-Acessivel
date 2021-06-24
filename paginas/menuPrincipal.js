/* eslint-disable */
import AsyncStorage from '@react-native-community/async-storage';
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
import MapView, {
  Callout,
  Marker,
  PROVIDER_GOOGLE,
  Polyline,
} from 'react-native-maps';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'; //Ecrã responsivo
import {FontAwesomeIcon} from '@fortawesome/react-native-fontawesome';
import {
  faTaxi,
  faMapMarkerAlt,
  faRoute,
  faParking,
  faChevronRight,
  faCompass,
  faStreetView,
} from '@fortawesome/free-solid-svg-icons';
import {ScrollView} from 'react-native-gesture-handler';
import * as geolib from 'geolib';

let markerURL =
  'https://geo.cm-viana-castelo.pt/arcgis/rest/services/Viana_acessivel/MapServer/1/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&queryByDistance=&returnExtentsOnly=false&datumTransformation=&parameterValues=&rangeValues=&f=pjson';
let markerTaxi =
  'https://geo.cm-viana-castelo.pt/arcgis/rest/services/Viana_acessivel/MapServer/2/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&queryByDistance=&returnExtentsOnly=false&datumTransformation=&parameterValues=&rangeValues=&f=pjson';
let markerEstacionamento =
  'https://geo.cm-viana-castelo.pt/arcgis/rest/services/Viana_acessivel/MapServer/3/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&queryByDistance=&returnExtentsOnly=false&datumTransformation=&parameterValues=&rangeValues=&f=pjson';
let trajetosS =
  'https://geo.cm-viana-castelo.pt/arcgis/rest/services/Viana_acessivel/MapServer/4/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=StartPoint&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&queryByDistance=&returnExtentsOnly=false&datumTransformation=&parameterValues=&rangeValues=&f=pjson';
let start =
  'https://geo.cm-viana-castelo.pt/arcgis/rest/services/Viana_acessivel/MapServer/4/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=StartPoint&returnGeometry=false&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=true&resultOffset=&resultRecordCount=&queryByDistance=&returnExtentsOnly=false&datumTransformation=&parameterValues=&rangeValues=&f=pjson';
let end =
  'https://geo.cm-viana-castelo.pt/arcgis/rest/services/Viana_acessivel/MapServer/4/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=EndPoint&returnGeometry=false&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=true&resultOffset=&resultRecordCount=&queryByDistance=&returnExtentsOnly=false&datumTransformation=&parameterValues=&rangeValues=&f=pjson';

let caminho = [];
let cores = [];
let matriz;
let dataI = [];
let val;
let latDelta = 0.01;
let lngDelta = 0.01;
let lat;
let lng;

function menuPrincipal({navigation}) {
  const [state, setState] = useState({colorId: 1});
  const [color, setColor] = useState('');
  const [localizacao, setLocalizacao] = useState(true);
  const [incapacidade, setIncapacidade] = useState('');
  const [loadP, setLoadP] = useState(false);
  const [isLoad, setLoad] = useState(true);
  const [type, setType] = useState(1);
  const [haveUserLocation, setHaveUserLocation] = useState(false);

  const [initialPosition, setInitialPosition] = useState({
    latitude: 41.6946,
    longitude: -8.83016,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [data, setData] = useState([]);
  const [startP, setStartP] = useState();
  const [endP, setEndP] = useState();
  const [numI, setNumI] = useState();

  let alertShow = 0;
  let arrayEnd = [];
  let valores = [];
  let path = [];
  let subcor = [];
  let subarrayPaths = [];

  findCoordinates = () => {
    Geolocation.getCurrentPosition(
      position => {
        lat1 = JSON.stringify(position.coords.latitude);
        lng1 = JSON.stringify(position.coords.longitude);
        lat = lat1;
        lng = lng1;
        if (lat !== undefined) {
          setInitialPosition({
            latitude: Number(lat),
            longitude: Number(lng),
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          });
          setHaveUserLocation(true);
        }
      },
      error => findCoordinates(),
      {enableHighAccuracy: true, timeout: 1000, maximumAge: 1000},
    );
  };

  startLoading = () => {
    setLoadP(true);
    setTimeout(() => {
      setLoadP(false);
    }, 500);
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

  userLocationError = () => {
    Alert.alert(
      'Erro',
      'Erro ao obter as suas coordenadas! Por favor ative a permissão das coordenadas para a aplicação Viana+Acessível nas definições do seu telemóvel!',
      [{text: 'Concordo'}],
      {cancelable: false},
    );
  };

  getStartPoint = () => {
    fetch(start)
      .then(response => response.json())
      .then(data => {
        setStartP(data.features);
        pesquisarEstradas();

        //Array que guarda todos os dados
      })
      .finally(() => criarMatriz());
  };

  // Criar a matriz
  criarMatriz = () => {
    // console.log('Inicio Matriz ' + Date.now());
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
      if (incapacidade == 'Invisual') {
        inc = dataI[a].attributes.Invisual;
      } else {
        inc = dataI[a].attributes.Autismo;
      }

      if (incapacidade == 'MobReduzida') {
        peso = dataI[a].attributes.MobReduzida;
        if (peso == 3) {
          peso = 10000;
        }
        if (peso == 4) {
          peso = 200;
        }
        if (peso == 5) {
          peso = 1;
        }
      }

      //Definir peso
      if (incapacidade == 'Autismo' || incapacidade == 'Invisual') {
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
    //console.log('Valores', valores.length);
    //console.log('Matriz', matriz.length);
    setLoad(false);
  };

  //---------------------------------------------------------------------Criação da Página-------------------------------------------------------------
  useEffect(() => {
    findCoordinates();
    readData();
    if (alertShow == 0) {
      Alert.alert(
        'A informação presente na plataforma encontra-se sujeita a atualização constante, razão pela qual a Camara Municipal de Viana do Castelo não se responsabiliza por alguma anomalia na informação presente na plataforma!',
        null,
        [{text: 'Concordo'}],
        {cancelable: false},
      );
      alertShow++;
    }
  }, []);

  const readData = async () => {
    try {
      const inc = await AsyncStorage.getItem('TIPO_UTL');
      const c = await AsyncStorage.getItem('COLOR');

      if (inc !== null) {
        setColor(c);
        setIncapacidade(inc);
      } else {
        console.log('não existe');
      }
    } catch (e) {
      alert('Failed to fetch the data from storage');
      console.log(e + 'erro no menu principal');
    }
    mudarCor();
  };

  mudarCor = () => {
    navigation.setOptions({headerStyle: {backgroundColor: color}});
  };

  //Mostar os pontos de interesse sempre que é aberta a app
  useEffect(() => {
    fetch(markerURL)
      .then(response => response.json())
      .then(responseJson => {
        setData(responseJson.features);
        setType(1); //Locais de interesse
        setLoad(false); //Carregamento da página
      })
      .catch(error => console.error(error));
  }, []);

  //Mudar marker conforme o botão selecionado
  listarPontos = (url, valor) => {
    fetch(url)
      .then(response => response.json())
      .then(responseJson => {
        setLoad(true);
        setData(responseJson.features); // mudar a cor do pin
        setType(valor);
        setLoad(false);
      })
      .catch(error => console.error(error));
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

  pesquisarEstradas = () => {
    for (let i = 0; i < numI; i++) {
      var peso;
      subarrayPaths = [];
      var subarray = dataI[i].geometry.paths[0];

      if (incapacidade == 'MobReduzida') {
        peso = dataI[i].attributes.MobReduzida;
      } else if (incapacidade == 'Invisual') {
        peso = dataI[i].attributes.Invisual;
      } else if (incapacidade == 'Autismo') {
        peso = dataI[i].attributes.Autismo;
      }

      if (peso == 0) {
        subcor.push('black');
      } else if (peso == 1) {
        subcor.push('#cc0000');
      } else if (peso == 2) {
        subcor.push('#cc00cc');
      } else if (peso == 3) {
        subcor.push('#0000cc');
      } else if (peso == 4) {
        subcor.push('#00cccc');
      } else if (peso == 5) {
        subcor.push('#00cc00');
      }

      subarray.map(item => {
        subarrayPaths.push({latitude: item[1], longitude: item[0]});
      });

      path.push(subarrayPaths);
    }

    caminho = path;
    cores = subcor;
  };

  botaoClicado = i => {
    setState({colorId: i});
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
  };

  centrarUtl = () => {
    var initialRegion = {
      latitude: Number(lat),
      longitude: Number(lng),
      longitudeDelta: 0.01,
      latitudeDelta: 0.01,
    };

    setInitialPosition(initialRegion);
  };

  if (isLoad) {
    return (
      <View style={styles.containerLoading}>
        <ActivityIndicator size="large" color="yellow" />
        <Text>Carregando</Text>
      </View>
    );
  } else {
    return (
      <View style={styles.container}>
        {(() => {
          if (type == 1) {
            return (
              <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                region={initialPosition}
                showsUserLocation
                onUserLocationChange={event => this.userLocationChanged(event)}
                onRegionChangeComplete={event => this.changeRegion(event)}>
                {data.map(marker => (
                  <Marker
                    key={marker.attributes.Ponto}
                    coordinate={{
                      latitude: marker.geometry.y,
                      longitude: marker.geometry.x,
                    }}>
                    <Callout
                      tooltip
                      onPress={() => {
                        haveUserLocation
                          ? checkDistancia()
                            ? navigation.navigate('teste', {
                                matriz: matriz,
                                valores: val,
                                incapacidade: incapacidade,
                                allData: dataI,
                                end: marker.attributes.Ponto,
                                lati: lat,
                                longi: lng,
                                latE: marker.geometry.y,
                                lngE: marker.geometry.x,
                              })
                            : Alert.alert(
                                'Encontra-se fora da rede de Viana do Castelo, por favor aproxime-se do centro.',
                                null,
                                [{text: 'Entendi'}],
                                {cancelable: false},
                              )
                          : console.log('Nao tenho localização!');
                      }}>
                      <View>
                        <View style={styles.bubble}>
                          <FontAwesomeIcon
                            icon={faCompass}
                            color={color}
                            size={45}
                            style={styles.callImage_1}
                          />

                          {(() => {
                            if (marker.attributes.DESIGNACAO.length <= 20) {
                              return (
                                <ScrollView>
                                  <Text style={styles.callout_1}>
                                    {marker.attributes.DESIGNACAO}
                                  </Text>
                                </ScrollView>
                              );
                            } else if (
                              marker.attributes.DESIGNACAO.length > 20 &&
                              marker.attributes.DESIGNACAO.length < 50
                            ) {
                              return (
                                <ScrollView>
                                  <Text style={styles.callout_2}>
                                    {marker.attributes.DESIGNACAO}
                                  </Text>
                                </ScrollView>
                              );
                            } else {
                              return (
                                <ScrollView>
                                  <Text style={styles.callout_3}>
                                    {marker.attributes.DESIGNACAO}
                                  </Text>
                                </ScrollView>
                              );
                            }
                          })()}

                          <FontAwesomeIcon
                            icon={faChevronRight}
                            color={'grey'}
                            size={30}
                            style={styles.callImage}
                          />
                        </View>

                        <View style={styles.arrowBorder} />
                        <View style={styles.arrow} />
                      </View>
                    </Callout>
                  </Marker>
                ))}
              </MapView>
            );
          } else if (type == 2) {
            return (
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
                      strokeColor={cores[index]} // fallback for when strokeColors is not supported by the map-provider
                      strokeWidth={4}
                    />
                  );
                })}
              </MapView>
            );
          } else if (type == 3) {
            return (
              <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                region={initialPosition}
                showsUserLocation={true}
                onUserLocationChange={event => this.userLocationChanged(event)}
                onRegionChangeComplete={event => this.changeRegion(event)}>
                {data.map(taxi => (
                  <Marker
                    key={taxi.attributes.Ponto}
                    coordinate={{
                      latitude: taxi.geometry.y,
                      longitude: taxi.geometry.x,
                    }}
                    pinColor="#FFFF00">
                    <Callout
                      tooltip
                      onPress={() => {
                        haveUserLocation
                          ? checkDistancia()
                            ? navigation.navigate('teste', {
                                matriz: matriz,
                                valores: val,
                                incapacidade: incapacidade,
                                allData: dataI,
                                end: taxi.attributes.Ponto,
                                lati: lat,
                                longi: lng,
                                latE: taxi.geometry.y,
                                lngE: taxi.geometry.x,
                              })
                            : Alert.alert(
                                'Encontra-se fora da rede de Viana do Castelo, por favor aproxime-se do centro.',
                                null,
                                [{text: 'Entendi'}],
                                {cancelable: false},
                              )
                          : console.log('Nao tenho localização!');
                      }}>
                      <View>
                        <View style={styles.bubble}>
                          <FontAwesomeIcon
                            icon={faCompass}
                            color={color}
                            size={45}
                            style={styles.callImage_1}
                          />

                          {(() => {
                            if (taxi.attributes.RUA.length < 24) {
                              return (
                                <ScrollView>
                                  <Text
                                    style={{
                                      marginTop: 10,
                                      paddingStart: 25,
                                      marginEnd: 10,
                                      fontWeight: 'bold',
                                    }}>
                                    {taxi.attributes.RUA}
                                  </Text>
                                  <Text style={{paddingStart: 25}}>
                                    <Text style={{fontSize: 16}}>
                                      Lugares:{' '}
                                    </Text>
                                    <Text style={{fontSize: 16}}>
                                      {taxi.attributes.LUGARES}
                                    </Text>
                                  </Text>
                                </ScrollView>
                              );
                            } else {
                              return (
                                <ScrollView>
                                  <Text
                                    style={{
                                      paddingStart: 25,
                                      marginEnd: 10,
                                      fontWeight: 'bold',
                                    }}>
                                    {taxi.attributes.RUA}
                                  </Text>
                                  <Text style={{paddingStart: 25}}>
                                    <Text style={{fontSize: 16}}>
                                      Lugares:{' '}
                                    </Text>
                                    <Text style={{fontSize: 16}}>
                                      {taxi.attributes.LUGARES}
                                    </Text>
                                  </Text>
                                </ScrollView>
                              );
                            }
                          })()}

                          <FontAwesomeIcon
                            icon={faChevronRight}
                            color={'grey'}
                            size={30}
                            style={styles.callImage}
                          />
                        </View>
                        <View style={styles.arrowBorder} />
                        <View style={styles.arrow} />
                      </View>
                    </Callout>
                  </Marker>
                ))}
              </MapView>
            );
          } else if (type == 4) {
            return (
              <MapView
                provider={PROVIDER_GOOGLE}
                style={styles.map}
                region={initialPosition}
                showsUserLocation={true}
                onUserLocationChange={event => this.userLocationChanged(event)}
                onRegionChangeComplete={event => this.changeRegion(event)}>
                {data.map(est => (
                  <Marker
                    key={est.attributes.OBJECTID}
                    coordinate={{
                      latitude: est.geometry.y,
                      longitude: est.geometry.x,
                    }}
                    pinColor="blue">
                    <Callout
                      tooltip
                      onPress={() => {
                        haveUserLocation
                          ? est.attributes.Ponto === null
                            ? Alert.alert(
                                'Navegação para este ponto não se encontra disponível.',
                                null,
                                [{text: 'Entendi'}],
                                {cancelable: false},
                              )
                            : checkDistancia()
                            ? navigation.navigate('teste', {
                                matriz: matriz,
                                valores: val,
                                incapacidade: incapacidade,
                                allData: dataI,
                                end: est.attributes.Ponto,
                                lati: lat,
                                longi: lng,
                                latE: est.geometry.y,
                                lngE: est.geometry.x,
                              })
                            : Alert.alert(
                                'Encontra-se fora da rede de Viana do Castelo, por favor aproxime-se do centro.',
                                null,
                                [{text: 'Entendi'}],
                                {cancelable: false},
                              )
                          : console.log('Nao ha localizacao');
                      }}>
                      <View>
                        <View style={styles.bubble}>
                          <FontAwesomeIcon
                            icon={faCompass}
                            color={color}
                            size={45}
                            style={styles.callImage_1}
                          />

                          {(() => {
                            if (est.attributes.RUA.length < 24) {
                              return (
                                <ScrollView>
                                  <Text
                                    style={{
                                      marginTop: 10,
                                      paddingStart: 25,
                                      marginEnd: 10,
                                      fontWeight: 'bold',
                                    }}>
                                    {est.attributes.RUA}
                                  </Text>
                                  <Text style={{paddingStart: 25}}>
                                    <Text style={{fontSize: 16}}>
                                      Lugares:{' '}
                                    </Text>
                                    <Text style={{fontSize: 16}}>
                                      {est.attributes.LUGARES}
                                    </Text>
                                  </Text>
                                </ScrollView>
                              );
                            } else {
                              return (
                                <ScrollView>
                                  <Text
                                    style={{
                                      paddingStart: 25,
                                      marginEnd: 10,
                                      fontWeight: 'bold',
                                    }}>
                                    {est.attributes.RUA}
                                  </Text>
                                  <Text style={{paddingStart: 25}}>
                                    <Text style={{fontSize: 16}}>
                                      Lugares:{' '}
                                    </Text>
                                    <Text style={{fontSize: 16}}>
                                      {est.attributes.LUGARES}
                                    </Text>
                                  </Text>
                                </ScrollView>
                              );
                            }
                          })()}

                          <FontAwesomeIcon
                            icon={faChevronRight}
                            color={'grey'}
                            size={30}
                            style={styles.callImage}
                          />
                        </View>
                        <View style={styles.arrowBorder} />
                        <View style={styles.arrow} />
                      </View>
                    </Callout>
                  </Marker>
                ))}
              </MapView>
            );
          }
        })()}

        <View
          style={{
            backgroundColor: color,
            height: hp('8%'),
            width: wp('100%'),
            flexDirection: 'row',
            position: 'absolute',
            bottom: 0,
            alignItems: 'center',
            alignSelf: 'center',
            justifyContent: 'center',
          }}>
          <FontAwesomeIcon
            icon={faMapMarkerAlt}
            size={30}
            color={'#d91a20'}
            style={state.colorId === 1 ? styles.clicado : styles.botaoC}
            onPress={() => {
              this.listarPontos(markerURL, 1);
              this.botaoClicado(1);
            }}
          />
          <FontAwesomeIcon
            icon={faRoute}
            size={30}
            color={'purple'}
            style={state.colorId === 2 ? styles.clicado : styles.botaoC}
            onPress={() => {
              this.startLoading();
              setType(2);
              this.botaoClicado(2);
            }}
          />
          <FontAwesomeIcon
            icon={faTaxi}
            color={'#ebb134'}
            size={30}
            style={state.colorId === 3 ? styles.clicado : styles.botaoC}
            onPress={() => {
              this.listarPontos(markerTaxi, 3);
              this.botaoClicado(3);
            }}
          />
          <FontAwesomeIcon
            icon={faParking}
            color={'blue'}
            size={30}
            style={state.colorId === 4 ? styles.clicado : styles.parking}
            onPress={() => {
              this.listarPontos(markerEstacionamento, 4);
              this.botaoClicado(4);
            }}
          />
        </View>

        {(() => {
          if (
            (type == 2 && incapacidade == 'Autismo') ||
            (type == 2 && incapacidade == 'Invisual')
          ) {
            return (
              <View style={styles.legenda}>
                <Text style={{color: 'black', fontSize: 13}}>Excluir</Text>
                <Image
                  source={require('../images/legenda_6.png')}
                  style={{marginLeft: hp('0.5%'), marginRight: hp('0.5%')}}
                />
                <Text style={{color: 'black', fontSize: 13}}>Excelente</Text>
              </View>
            );
          } else if (type == 2 && incapacidade == 'MobReduzida') {
            return (
              <View style={styles.legenda}>
                <Text style={{color: 'black', fontSize: 13}}>
                  Não Aconselhado
                </Text>
                <Image
                  source={require('../images/legenda_1.png')}
                  style={{
                    width: 120,
                    height: 30,
                    marginLeft: hp('0.5%'),
                    marginRight: hp('0.5%'),
                  }}
                />
                <Text style={{color: 'black', fontSize: 13}}>Aconselhado</Text>
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
            onPress={() => {
              localizacao === false ? changeRegion() : centrarUtl();
            }}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  // ------------

  image: {
    width: 50,
    height: 50,
  },

  call: {
    flexDirection: 'column',
    marginTop: 20,
  },

  callImage: {
    alignSelf: 'center',
    alignContent: 'flex-end',
  },

  callImage_1: {
    alignSelf: 'center',
    alignContent: 'flex-start',
  },

  bubble: {
    flexDirection: 'row',
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderColor: '#ccc',
    borderTopWidth: 0.5,
    borderLeftWidth: 0.5,
    borderRightWidth: 0.5,
    padding: wp('2%'),
    height: hp('12%'),
    width: wp('75%'),
    textAlign: 'center',
    alignContent: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  texto: {
    fontSize: 15,
    fontWeight: 'bold',
    alignSelf: 'center',
    color: 'black',
    marginBottom: 9,
  },
  containerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  container: {
    ...StyleSheet.absoluteFillObject,
    height: '100%',
  },

  map: {
    position: 'absolute',
    ...StyleSheet.absoluteFillObject,
  },

  callout_1: {
    alignSelf: 'center',
    paddingStart: 10,
    paddingEnd: 20,
    marginTop: 20,
    marginLeft: 20,
    fontSize: 16,
    marginBottom: 5,
    fontWeight: 'bold',
  },

  callout_2: {
    alignSelf: 'center',
    paddingStart: 5,
    paddingEnd: 2,
    marginTop: 10,
    marginLeft: 18,
    fontSize: 15,
    marginBottom: 5,
    fontWeight: 'bold',
    //alignContent: 'center',
    //justifyContent: 'center'
  },

  callout_3: {
    alignSelf: 'center',
    paddingStart: 10,
    paddingEnd: 3,
    marginLeft: 20,
    marginTop: 5,
    fontSize: 14,
    marginBottom: 5,
    fontWeight: 'bold',
    textAlign: 'justify',
    //alignContent: 'center',
    //justifyContent: 'center'
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

  botoes: {
    alignSelf: 'center', //Colocar os botões no centro do layout
    borderColor: '#D0EAF5',
    alignItems: 'center',
    marginRight: 15,
    marginLeft: 15,
    marginTop: 3,
  },

  botaoC: {
    bottom: 12,
    margin: 35,
  },

  parking: {
    margin: 35,
    bottom: 12,
    borderRadius: 2,
    backgroundColor: 'white',
  },

  clicado: {
    margin: 35,
    bottom: 12,
    opacity: 0.7,
  },

  legenda: {
    height: hp('5.5%'),
    width: wp('100%'),
    position: 'absolute',
    bottom: hp('8%'),
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
    flexDirection: 'row',
    backgroundColor: 'white',
    borderColor: '#757575',
    borderWidth: 2,
  },

  spinnerTextStyle: {
    color: '#FFF',
  },
});

export default menuPrincipal;
