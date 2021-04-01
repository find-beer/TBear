import React, { Component } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Alert,
  Image,
  TouchableOpacity,
} from 'react-native'
import { RNCamera } from 'react-native-camera'
import { BarcodeMask } from '@nartc/react-native-barcode-mask'
import ImagePicker from 'react-native-image-picker'
import LocalBarcodeRecognizer from 'react-native-local-barcode-recognizer'
import RNFS from 'react-native-fs'
const camera = require('../../../assets/mine/camera-icon.png')
import { scaleSize, scaleFont } from '../../../utils/scaleUtil'
export default class ScanQRCode extends Component {
  constructor(props) {
    super(props)
    this.state = {
      QRImgSource: '',
    }
  }
  onBarCodeRead = (result) => {
    const { navigate } = this.props.navigation
    const { data } = result //只要拿到data就可以了
    //扫码后的操作
    if (data) {
      this.props.navigation.navigate('StrangerInfo', { uid: data })
    } else {
      Alert.alert('无效二维码')
    }
  }
  // 从相册中导入图片
  fetchQR() {
    const options = {
      title: '拍照选择器',
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
      cancelButtonTitle: '取消',
      takePhotoButtonTitle: '点击拍照',
      chooseFromLibraryButtonTitle: '从本地库相册导入',
      // chooseWhichLibraryTitle: '从其他库打开',
      tintColor: '#CB0000',
    }

    ImagePicker.showImagePicker(options, (response) => {
      if (response.didCancel) {
      } else if (response.error) {
      } else if (response.customButton) {
      } else {
        // const source = { uri: response.uri }
        this.imagesURLTobase64(response.path)
      }
    })
  }
  // 解析二维码
  recoginze = async (source) => {
    let result = await LocalBarcodeRecognizer.decode(
      source.replace('data:image/jpeg;base64,', ''),
      { codeTypes: ['ean13', 'qr'] }
    )
    // console.log('result', result)
    if (result) {
      this.props.navigation.navigate('StrangerInfo', { uid: result })
    } else {
      Alert.alert('无效二维码')
    }
  }
  // 图片本地路径转换为base64
  imagesURLTobase64 = (url) => {
    RNFS.readFile(url, 'base64').then((content) => {
      this.recoginze(content)
    })
  }

  render() {
    return (
      <View style={styles.container}>
        <RNCamera
          ref={(ref) => {
            this.camera = ref
          }}
          autoFocus={RNCamera.Constants.AutoFocus.on} /*自动对焦*/
          style={styles.container}
          type={RNCamera.Constants.Type.back} /*切换前后摄像头 front前back后*/
          flashMode={RNCamera.Constants.FlashMode.off} /*相机闪光模式*/
          onBarCodeRead={this.onBarCodeRead}
        >
          <BarcodeMask
            width={380}
            height={350}
            animatedLineColor={'green'}
            edgeRadius={5}
          />
          {/* <Text >从相册中获取二维码</Text> */}
          <TouchableOpacity
            onPress={() => this.fetchQR()}
            style={styles.camera}
          >
            <Image
              source={camera}
              style={{ width: '100%', height: '100%' }}
            ></Image>
          </TouchableOpacity>
        </RNCamera>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flex: 1,
    flexDirection: 'row',
  },
  preview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    width: scaleSize(150),
    height: scaleSize(150),
    position: 'absolute',
    right: 30,
    top: 80,
  },
})
