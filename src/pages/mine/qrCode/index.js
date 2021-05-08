import React, { Fragment, Component } from 'react'
import {
  StyleSheet,
  View,
  Image,
  Text,
  ImageBackground,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  Alert,
} from 'react-native'
import Header from '../../../components/header'
import { scaleSize, scaleFont } from '../../../utils/scaleUtil'
// import QRCode from "react-native-qrcode-generator";
import QRCode from 'react-native-qrcode-svg'
import CameraRoll from '@react-native-community/cameraroll'
import RNFS from 'react-native-fs'
import { connect, bindActions, bindState } from './../../../redux'

const imgUrl = {
  scanIcon: require('../../../assets/mine/QR-icon.png'),
  arrowIcon: require('../../../assets/mine/arrow_right.png'),
  qrCodeBg: require('../../../assets/mine/QR-code-bg.png'),
  avatar: require('../../../assets/mine/avatar.jpeg'),
  downloadIcon: require('../../../assets/mine/download-icon.png'),
  shareIcon: require('../../../assets/mine/share-icon.png'),
}
class QrCode extends Component {
  constructor(props) {
    super(props)
    this.state = {
      QrCodeImageURL: '',
    }
  }

  callback = (dataURL) => {
    this.setState({
      QrCodeImageURL: dataURL,
    })
  }

  getDataURL = (c) => {
    if (c != null && c.toDataURL != undefined) {
      c.toDataURL(this.callback)
    }
  }
  saveQrcode = (success, fail) => {
    const dirs =
      Platform.OS === 'ios'
        ? RNFS.LibraryDirectoryPath
        : RNFS.ExternalDirectoryPath // 外部文件，共享目录的绝对路径（仅限android）
    const downloadDest = `${dirs}/${(Math.random() * 10000000) | 0}.png`

    RNFS.writeFile(downloadDest, this.state.QrCodeImageURL, 'base64').then(
      (rst) => {
        const path2 = `file://${downloadDest}`
        try {
          CameraRoll.save(path2, { type: 'photo' })
            .then((e1) => {
              // console.log('suc',e1)
              Alert.alert('下载成功，请在相册中查看')
              success && success()
            })
            .catch((e2) => {
              // console.log('fai',e2)
              Alert.alert('没有读写权限。请在[设置]-[应用权限]-[实验助手]开启')
            })
        } catch (e3) {
          Alert.alert(JSON.stringify(e3))
          // console.log('catch',e3)
          fail && fail()
        }
      }
    )
  }

  // 二维码下载
  handleDownload() {
    this.saveQrcode()
  }
  // 扫一扫
  handleScanQRCode() {
    console.log('扫一扫')
    this.props.navigation.navigate('ScanQRCode')
  }
  componentDidMount() {}
  render() {
    const { userInfo } = this.props
    return (
      <Fragment>
        <SafeAreaView style={{ flex: 0, backgroundColor: 'white' }} />
        <SafeAreaView style={styles.pages}>
          <View style={styles.container}>
            <TouchableOpacity onPress={() => this.handleScanQRCode()}>
              <View style={styles.qrItemBox}>
                <View style={styles.qrItem}>
                  <Image
                    source={imgUrl.scanIcon}
                    style={styles.scanIcon}
                  ></Image>
                  <Text style={styles.scanText}>扫一扫</Text>
                </View>
                <View style={styles.qrItem}>
                  <Image
                    source={imgUrl.arrowIcon}
                    style={styles.arrowIcon}
                  ></Image>
                </View>
              </View>
            </TouchableOpacity>
            <View style={styles.qrCodeWrapper}>
              <ImageBackground source={imgUrl.qrCodeBg} style={styles.qrBg}>
                {/* <Image source={imgUrl.avatar} style={styles.avatar}></Image> */}
                <Image
                  source={{
                    uri: userInfo.headPicUrl?.replace('https', 'http'),
                  }}
                  style={styles.avatar}
                ></Image>
                <Text style={styles.userName}>{userInfo.name}</Text>
                <View style={styles.codeContainer}>
                  {/* <QRCode
                    value={'123123123123123'}
                    size={scaleSize(520)}
                    bgColor='black'
                    fgColor='white'/> */}
                  <QRCode
                    value={'' + userInfo.uid}
                    size={scaleSize(520)}
                    color="black"
                    backgroundColor="white"
                    getRef={(c) => {
                      this.getDataURL(c)
                    }}
                  />
                </View>
              </ImageBackground>
            </View>
            <View style={styles.operationBox}>
              <TouchableOpacity onPress={() => this.handleDownload()}>
                <View style={styles.operationItem}>
                  <Image
                    source={imgUrl.downloadIcon}
                    style={styles.btnIcon}
                  ></Image>
                  <Text style={styles.btnText}>下载</Text>
                </View>
              </TouchableOpacity>
              <View style={styles.operationItem}>
                <Image source={imgUrl.shareIcon} style={styles.btnIcon}></Image>
                <Text style={styles.btnText}>分享</Text>
              </View>
            </View>
            <Text style={styles.slogan}>[走，带你去看花花世界]</Text>
          </View>
        </SafeAreaView>
      </Fragment>
    )
  }
}
export default connect(bindState, bindActions)(QrCode)
const styles = StyleSheet.create({
  pages: {
    paddingBottom: scaleSize(200),
    height: '100%',
  },
  container: {
    backgroundColor: '#fff',
    height: '100%',
  },
  qrItemBox: {
    borderTopWidth: scaleSize(2),
    borderColor: '#f2f2f2',
    height: scaleSize(150),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: scaleSize(54),
    paddingRight: scaleSize(54),
  },
  qrItem: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  scanIcon: {
    width: scaleSize(50),
    height: scaleSize(50),
    marginRight: scaleSize(24),
  },
  scanText: {
    fontSize: scaleFont(48),
    color: '#333',
    lineHeight: scaleSize(150),
  },
  arrowText: {
    fontSize: scaleFont(36),
    color: '#999',
    lineHeight: scaleSize(150),
  },
  arrowIcon: {
    width: scaleSize(50),
    height: scaleSize(50),
    marginLeft: scaleSize(6),
  },
  qrCodeWrapper: {
    borderTopWidth: scaleSize(24),
    borderColor: '#f2f2f2',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrBg: {
    width: scaleSize(800),
    height: scaleSize(1000),
    marginTop: scaleSize(220),
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  avatar: {
    position: 'absolute',
    top: scaleSize(-100),
    left: scaleSize(280),
    width: scaleSize(240),
    height: scaleSize(240),
    borderRadius: scaleSize(120),
  },
  userName: {
    fontSize: scaleFont(48),
    color: '#564f5f',
    textAlign: 'center',
    marginTop: scaleSize(32),
    marginBottom: scaleSize(32),
  },
  qrCode: {
    width: scaleSize(520),
    height: scaleSize(520),
    backgroundColor: 'red',
    marginTop: scaleSize(62),
    marginLeft: scaleSize(142),
  },
  operationBox: {
    marginTop: scaleSize(100),
    paddingLeft: scaleSize(327),
    paddingRight: scaleSize(327),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  operationItem: {
    display: 'flex',
    flexDirection: 'column',
  },
  btnIcon: {
    width: scaleSize(66),
    height: scaleSize(66),
    marginBottom: scaleSize(12),
  },
  btnText: {
    fontSize: scaleFont(32),
    color: '#333',
  },
  slogan: {
    marginTop: scaleSize(66),
    textAlign: 'center',
    color: '#333',
    fontSize: scaleFont(52),
  },
  codeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
})
