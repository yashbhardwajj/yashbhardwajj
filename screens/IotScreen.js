import { StyleSheet, Text, View,Image } from 'react-native'
import React from 'react'


const IotScreen = () => {
  return (
    <View style={styles.container}>
    <View style={styles.rect2StackStack}>
    
        <Image
          source={require('../assets/pngwing.png')}
          resizeMode='cover'
          style={styles.rect2}
        ></Image>
        <Image
          source={require('../assets/logoiot.png')}
          resizeMode='contain'
          style={styles.image10}
        ></Image>
        
        </View>
        
        </View>
  )
}

export default IotScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white'
  },
  rect2: {
    
    
    height: 600,
    position: 'absolute',
    opacity:.7
  },
  rect2StackStack: {
    width: 459,
    height: 692,
    marginLeft: -50
  },
  image10: {
    top: 20,
    bottom: 20,
    left: 40,
    width: 120,
    height: 50,
    position: 'absolute'
  },

})