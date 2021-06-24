/* eslint-disable */
import React, {useEffect, useState} from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import Geolocation from '@react-native-community/geolocation';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {FlatList} from 'react-native-gesture-handler';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen'; //Ecrã responsivo
import * as geolib from 'geolib';

let trajetosS =
  'https://geo.cm-viana-castelo.pt/arcgis/rest/services/Viana_acessivel/MapServer/4/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=StartPoint&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&queryByDistance=&returnExtentsOnly=false&datumTransformation=&parameterValues=&rangeValues=&f=pjson';
let start =
  'https://geo.cm-viana-castelo.pt/arcgis/rest/services/Viana_acessivel/MapServer/4/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=StartPoint&returnGeometry=false&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=true&resultOffset=&resultRecordCount=&queryByDistance=&returnExtentsOnly=false&datumTransformation=&parameterValues=&rangeValues=&f=pjson';
let end =
  'https://geo.cm-viana-castelo.pt/arcgis/rest/services/Viana_acessivel/MapServer/4/query?where=1%3D1&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=EndPoint&returnGeometry=false&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=true&resultOffset=&resultRecordCount=&queryByDistance=&returnExtentsOnly=false&datumTransformation=&parameterValues=&rangeValues=&f=pjson';

let matriz;

let dataI = [];
let ponto;
let val;
let latE;
let lngE;

let lat = 0;
let lng = 0;

function Info({route, navigation}) {
  const {param1} = route.params; //categoria escolhida anteriormente
  const [data, setData] = useState([]); //Array para armazenar os valores do Json
  const [color, setColor] = useState('');
  const [incapacidade, setIncapacidade] = useState('');
  const [isLoad, setLoad] = useState(true);
  const [haveUserLocation, setHaveUserLocation] = useState(false);
  const [startP, setStartP] = useState();
  const [endP, setEndP] = useState();
  const [numI, setNumI] = useState();
  const [distancia, setDistancia] = useState(false);

  let valores = [];

  let arrayEnd = [];

  //VERIFICAR SE EXITEM DADOS GUARDADOS NA STORAGE
  const readData = async () => {
    try {
      const inc = await AsyncStorage.getItem('TIPO_UTL');
      const cl = await AsyncStorage.getItem('COLOR');
      if (cl !== null) {
        setColor(cl);
        setIncapacidade(inc);
      }
    } catch (e) {
      alert('Failed to fetch the data from storage');
      console.log(e + 'erro em categoria');
    }
  };

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
      [{text: 'Concordo'}],
      {cancelable: false},
    );
  };

  /*
  <TouchableOpacity
          style={{marginTop: 35, marginStart: 140, marginEnd: 150}}
          onPress={() => {
            haveUserLocation
              ? checkDistancia()
                ? navigation.navigate('teste', {
                    matriz: matriz,
                    valores: val,
                    incapacidade: incapacidade,
                    allData: dataI,
                    end: ponto,
                    lati: lat,
                    longi: lng,
                    latE: latE,
                    lngE: lngE,
                  })
                : Alert.alert(
                    'Encontra-se fora da rede de Viana do Castelo, por favor aproxime-se do centro.',
                    [{text: 'Entendi'}],
                    {cancelable: false},
                  )
              : console.log("Erro ao obter coordenadas");
          }}>
  */
  useEffect(() => {
    findCoordinates();
    readData();

    fetch(
      'https://geo.cm-viana-castelo.pt/arcgis/rest/services/Viana_acessivel/MapServer/1/query?where=1%3D1+and+OBJECTID%3D' +
        param1 +
        '&text=&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=OBJECTID+%2CCATEGORIA%2C+FOTO%2C+DESCRICAO%2C+DESIGNACAO%2C+TELEFONE+%2CPonto&returnGeometry=true&returnTrueCurves=false&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&resultOffset=&resultRecordCount=&queryByDistance=&returnExtentsOnly=false&datumTransformation=&parameterValues=&rangeValues=&f=pjson',
    )
      .then(response => response.json())
      .then(responseJson => {
        setData(responseJson.features);
      })
      .catch(error => console.error(error));
  }, []);

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
    setLoad(false);
  };

  userLocationChanged = event => {
    const newRegion = event.nativeEvent.coordinate;

    if (!(newRegion.latitude == lat && newRegion.longitude == lng)) {
      lat = newRegion.latitude;
      lng = newRegion.longitude;
    }
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

  if (isLoad) {
    return (
      <View style={styles.containerLoading}>
        <ActivityIndicator size="large" color="yellow" />
        <Text>Carregando</Text>
      </View>
    );
  } else {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: color,
          justifyContent: 'center',
        }}>
        <FlatList
          data={data}
          renderItem={({item}) => (
            <View style={styles.cartoes}>
              {(() => {
                ponto = item.attributes.Ponto;
                latE = item.geometry.y;
                lngE = item.geometry.x;
                if (item.attributes.FOTO === null) {
                  return (
                    <Image
                      style={styles.image}
                      source={require('../images/default.png')}
                    />
                  );
                } else {
                  return (
                    <Image
                      style={styles.image}
                      source={{uri: item.attributes.FOTO}}
                    />
                  );
                }
              })()}
              <Text style={styles.title}>{item.attributes.DESIGNACAO}</Text>
              <Text style={{marginStart: wp('7%'), marginBottom: 15}}>
                <Text style={styles.texto}>Tipo: </Text>
                <Text style={{fontSize: 18}}>{item.attributes.CATEGORIA}</Text>
              </Text>

              <Text style={{marginStart: wp('7%'), marginBottom: 15}}>
                <Text style={styles.texto}>Telefone: </Text>
                {(() => {
                  if (item.attributes.TELEFONE === null) {
                    return <Text style={{fontSize: 18}}>Sem informação</Text>;
                  } else {
                    return (
                      <Text style={{fontSize: 18}}>
                        {item.attributes.TELEFONE}
                      </Text>
                    );
                  }
                })()}
              </Text>

              <Text
                style={{
                  marginStart: wp('7%'),
                  color: 'black',
                  fontSize: 18,
                  fontWeight: 'bold',
                }}>
                Descrição:{' '}
              </Text>
              {(() => {
                if (item.attributes.DESCRICAO === null) {
                  return (
                    <Text
                      style={{
                        fontSize: 18,
                        width: 395,
                        height: 150,
                        paddingStart: 30,
                        paddingEnd: 30,
                      }}>
                      Sem informação
                    </Text>
                  );
                } else {
                  return (
                    // <ScrollView  style={{width:wp('100%'), height:115, paddingStart:wp('7%'), paddingEnd:wp('7%')}} pagingEnabled={true}>

                    <Text
                      style={{
                        paddingStart: wp('7%'),
                        paddingEnd: wp('7%'),
                        marginBottom: 15,
                        fontSize: 18,
                        justifyContent: 'center',
                        textAlign: 'justify',
                        lineHeight: 30,
                      }}>
                      {item.attributes.DESCRICAO}
                    </Text>

                    // </ScrollView>
                  );
                }
              })()}
            </View>
          )}
          keyExtractor={item => item.attributes.OBJECTID.toString()}
        />
        <TouchableOpacity
          style={{marginTop: 35, marginStart: 140, marginEnd: 150}}
          onPress={() => {
            haveUserLocation
              ? checkDistancia()
                ? navigation.navigate('teste', {
                    matriz: matriz,
                    valores: val,
                    incapacidade: incapacidade,
                    allData: dataI,
                    end: ponto,
                    lati: lat,
                    longi: lng,
                    latE: latE,
                    lngE: lngE,
                  })
                : Alert.alert(
                    'Encontra-se fora da rede de Viana do Castelo, por favor aproxime-se do centro.',
                    null,
                    [{text: 'Entendi'}],
                    {cancelable: false},
                  )
              : console.log('Erro ao obter coordenadas');
          }}>
          <Image source={require('../images/ir.png')} style={styles.ir} />
        </TouchableOpacity>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  containerLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  ir: {
    bottom: 25,
    width: 110,
    height: 100,
  },

  cartoes: {
    flex: 1,
    flexDirection: 'column',
  },

  image: {
    marginBottom: 15,
    width: hp('60%'),
    height: wp('60%'),
    alignSelf: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },

  texto: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
    margin: 10,
  },

  title: {
    textAlign: 'center',
    marginStart: 30,
    marginEnd: 30,
    marginBottom: 10,
    alignSelf: 'center',
    color: 'black',
    fontSize: 26,
    fontWeight: 'bold',
    justifyContent: 'center',
    margin: 10,
  },

  container: {
    ...StyleSheet.absoluteFillObject,
    height: '100%',
  },
});

export default Info;
