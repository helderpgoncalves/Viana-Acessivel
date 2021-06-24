import * as React from 'react';
import {createDrawerNavigator} from '@react-navigation/drawer';

import stackP from './stackP';
import sobre from '../paginas/sobre';
import menuIncapacidade from '../paginas/menuIncapacidade';

const Drawer = createDrawerNavigator();

export default function Drawble({navigation}) {
  return (
    <Drawer.Navigator>
      <Drawer.Screen name="Stack" component={stackP} />
      <Drawer.Screen name="Menu Incapacidade" component={menuIncapacidade} />
      <Drawer.Screen name="Sobre" component={sobre} />
    </Drawer.Navigator>
  );
}
