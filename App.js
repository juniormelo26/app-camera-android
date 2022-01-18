import React, { useState } from 'react';
import { View, Text, StatusBar, StyleSheet, TouchableOpacity, Modal, Image, 
  PermissionsAndroid, 
  Platform} from 'react-native';
import { RNCamera } from 'react-native-camera';
import CameraRoll from '@react-native-community/cameraroll';
import ImagePicker from 'react-native-image-picker';

export default function App() {
  const [type, setType] = useState(RNCamera.Constants.Type.back);
  const [open, setOpen] = useState(false);
  const [capturedPhoto, setCapturedPhtoto] = useState(null);
  const [ text, setText ] = useState('Frontal');

  async function takePicture(camera) {
    const options = { quality: 0.5, base64: true };
    const data = await camera.takePictureAsync(options);

    setCapturedPhtoto(data.uri);
    setOpen(true);
    console.log(data);

    //chamando função salvar foto
    savePicture(data.uri);
  }

  async function hasAndroidPermission(){
    const permission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

    const hasPermission = await PermissionsAndroid.check(permission);
    if(hasPermission){
      return true;
    }

    const status = await PermissionsAndroid.request(permission);
    return status === 'granted';
  }

  async function savePicture(data){
    if(Platform.OS === 'android' && !(await hasAndroidPermission())){
      return;
    }

    CameraRoll.save(data, 'photo')
    .then((res) => {
      console.log('Salvo com sucesso: ' + res);
    })
    .catch((err) => {
      console.log('Erro: ' + err);
    })

  }


  function toggleCam(){
    setType( type === RNCamera.Constants.Type.back ? RNCamera.Constants.Type.front : RNCamera.Constants.Type.back);
  }

  function openAlbum(){
    const options = {
      title: 'Selecione uma foto',
      chooseFromLibraryButtonTitle: 'Buscar foto do album',
      noData: true,
      mediaType: 'photo'

    };
    ImagePicker.launchImageLibrary(options, (response) => {
      if(response.didCancel){
        console.log('Buscar foto cancelado');
      }else if(response.error){
        console.log('Erro: ' + response.error)
      }else{
          setCapturedPhtoto(response.uri);
          setOpen(true);

      }
    })
  }


  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />

      <RNCamera
        style={styles.preview}
        type={type}
        flashMode={RNCamera.Constants.FlashMode.auto}
        androidCameraPermissionOptions={{
          title: 'Permissão para usar a câmera',
          message: 'Para o correto funcionamento, o App percisa usar sua câmera!',
          buttonPositive: 'Permitir',
          buttonNegative: 'Cancelar'
        }}
      >
        {({ camera, status, recordAndroidPermissionStatus }) => {
          if (status !== 'READY') return <View />;
          return (
            <View
              style={{ marginBottom: 35, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}
            >
              <TouchableOpacity
                onPress={() => takePicture(camera)}
                style={styles.capture}
              >
                <Text>Tirar foto</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={openAlbum}
                style={styles.capture}
              >
                <Text>Album</Text>
              </TouchableOpacity>

            </View>
          );
        }}

      </RNCamera>

      <View style={styles.camPosition}>
        <TouchableOpacity onPress={toggleCam}>
          <Text>Trocar</Text>
        </TouchableOpacity>
      </View>

      {
        capturedPhoto &&
        <Modal animationType='slide' transparent={false} visible={open} >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', margin: 20 }}>
            <TouchableOpacity
              style={{ margin: 10 }}
              onPress={() => setOpen(false)}
            >

              <Text style={{ fontSize: 24 }}>Fechar</Text>
            </TouchableOpacity>
            
            <Image 
              resizeMode='contain'
              style={{width: 350, height: 450, borderRadius: 15}}
              source={{ uri: capturedPhoto}}
            />

          </View>

        </Modal>
      }


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center'
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center'
  },
  capture: {
    flex: 0,
    backgroundColor: '#FFF',
    borderRadius: 5,
    padding: 15,
    paddingHorizontal: 20,
    alignSelf: 'center',
    margin: 20
  },
  camPosition: {
    backgroundColor: '#FFF',
    borderRadius: 5,
    padding: 10,
    height: 40,
    position: 'absolute',
    right: 25,
    top: 60,

  }

});