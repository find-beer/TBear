/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { Fragment } from 'react'
import Video from 'react-native-video'
import {
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
  PermissionsAndroid,
  Alert,
} from 'react-native'
// import Toast from './../../utils/toast'
// import * as Toast from './../../utils/toast'
import Header from '../../components/header/index'
// import Toast from 'react-native-root-toast';
import { Provider, Toast } from '@ant-design/react-native'
import { screenW } from '../../constants'
import ImagePicker from 'react-native-image-picker'
import { scaleFont, scaleSize } from '../../utils/scaleUtil'
import { PostRequest } from '../../utils/request'
import EventBus from '../../utils/EventBus'
import { apiProd } from '../../config'
import AsyncStorage from '@react-native-community/async-storage'
import { bindActions, bindState, connect } from './../../redux'
import ImageViewer from 'react-native-image-viewing'
import {
  addLocationListener,
  Geolocation,
  init,
  setNeedAddress,
  setAllowsBackgroundLocationUpdates,
  setOnceLocation,
  start,
  stop,
  setGpsFirst,
  setLocatingWithReGeocode,
} from 'react-native-amap-geolocation'
import { State } from 'react-native-gesture-handler'
let imagesArr = []
let videoSArr = []
class PublishTrend extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      content: '',
      images: [],
      videos: [],
      isPunchCard: false, // 打卡
      clockinTag: '',
      isPermit: true, //同城
      address: '',
      location: '',
      token: null,
      currentIndex: null,
      visible: false,
    }
  }

  componentWillUnmount() {
    imagesArr = []
    videoSArr = []
    this.setState({
      images: imagesArr,
    })
    this.setState({
      videos: videoSArr,
    })
    this.gettingGrades = false
    clearTimeout(this.timerId)
  }

  componentDidMount() {
    AsyncStorage.getItem('session', (error, result) => {
      this.setState({ token: result })
    })
    this.loadLocation()
    this.gettingGrades = true
  }

  choosePicture = () => {
    const { images, token } = this.state
    const options = {
      title: '选择',
      cancelButtonTitle: '取消',
      takePhotoButtonTitle: '拍照',
      chooseFromLibraryButtonTitle: '媒体库',
      cameraType: 'back',
      mediaType: 'mixed',
      videoQuality: 'low',
      durationLimit: 10,
      maxWidth: 600,
      maxHeight: 600,
      aspectX: 2,
      aspectY: 1,
      quality: 0.5,
      angle: 0,
      allowsEditing: false,
      noData: false,
      storageOptions: {
        skipBackup: true,
        path: 'images',
      },
    }

    let currentHeader
    if (Platform.OS === 'ios') {
      currentHeader = {
        'Content-Type': 'multipart/form-data;charset=utf-8',
        token,
      }
    } else {
      currentHeader = {
        Accept: 'application/json',
        token,
      }
    }

    ImagePicker.showImagePicker(options, (response) => {
      // console.log('Response', response)
      if (response) {
        // 上传视频
        if (response.type === 'video/mp4') {
          this.props.setModalLoading(true, '上传中')
          let formData = new FormData()
          formData.append('videoFile', {
            uri:
              Platform.OS === 'ios'
                ? 'data:image/jpeg;base64,' + response.data
                : response.uri,
            // uri: response.uri,
            type: 'multipart/form-data',
            name: 'trend' + new Date().getTime() + '.mp4',
          })

          fetch(apiProd.host + 'common/uploadVideo', {
            method: 'POST',
            headers: currentHeader,
            body: formData,
          })
            .then((response) => {
              return response.json()
            })
            .then((res) => {
              if (res.success) {
                videoSArr.push(res.data.url)
                this.setState(
                  {
                    videos: videoSArr,
                  },
                  () => {
                    // console.log('获取到视频地址')
                    this.timerId = setTimeout(() => {
                      this.props.setModalLoading(false)
                    }, 3000)
                  }
                )
              } else {
                Toast.toast('上传失败，请重试')
              }
            })
            .catch((e) => {
              this.props.setModalLoading(false)
              Toast.toast('上传失败，请重试')
            })
          // 上传图片
        } else if (response.type === 'image/jpeg') {
          this.props.setModalLoading(true, '上传中')
          let formData = new FormData()
          formData.append('imgFile', {
            uri:
              Platform.OS === 'ios'
                ? 'data:image/jpeg;base64,' + response.data
                : response.uri,
            type: 'multipart/form-data',
            name: 'trend' + new Date().getTime() + '.jpg',
          })
          fetch(apiProd.host + 'common/uploadImage', {
            method: 'POST',
            headers: currentHeader,
            body: formData,
          })
            .then((response) => {
              return response.json()
            })
            .then((res) => {
              imagesArr.push(res.data.url)
              this.setState(
                {
                  images: imagesArr,
                },
                () => {
                  this.props.setModalLoading(false)
                  // console.log('images', this.state.images)
                }
              )
            })
            .catch((e) => {
              this.props.setModalLoading(false)
              Toast.toast('上传失败，请重试')
            })
        }
      }
    })
  }

  // 打卡
  onValueChange = () => {
    this.setState({
      isPunchCard: !this.state.isPunchCard,
    })
  }

  // 同城
  onPermitChange = () => {
    this.setState((state, props) => {
      return {
        isPermit: !this.state.isPermit,
      }
    })
  }

  loadLocation = async () => {
    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
      ])
    }
    await init({
      ios: '5774b9a23bfef933c1a1f24cb81e8311',
      android: '2ed1655dedfd9f3453a54f2ab51a55bd',
    })

    // 什么时候stop 1）获取到地理位置  2）卸载阶段
    addLocationListener((location) => {
      const { province, city, district, longitude, latitude } = location

      // 需要连续监听才能获取到城市，获取到后停止连续定位监听 获取到地理位置后stop
      if (province) {
        stop()
      }

      //  gettingGrades为标识符，生命周期钩子函数：DidUnMount卸载阶段stop
      if (!this.gettingGrades) {
        stop()
        return
      }

      // 没有获取地理位置就return
      if (!province) {
        return
      }

      const locationCode = longitude + ',' + latitude
      const addressCode = province + city + district + ''
      this.setState({
        location: locationCode,
        address: addressCode,
      })
    })
    start() // 开始连续定位
  }

  immePublish = async () => {
    const {
      content,
      images,
      videos,
      isPunchCard,
      clockinTag,
      isPermit,
      address,
      location,
    } = this.state

    const { navigation } = this.props
    if (!content) {
      Toast.info('请编辑文字内容', 2)
      return
    }
    if (content.length > 500) {
      Toast.info('字数不能超过500', 2)
      return
    }

    if (address === '' || location === '') {
      Alert.alert('定位服务没有开启，请在设置中打开定位服务开关GPS')
      return
    }
    PostRequest('feed/publish', {
      address: address,
      clockIn: isPunchCard ? 1 : 0,
      clockInTag: clockinTag,
      content: content,
      displayCity: isPermit ? 1 : 0,
      location: location,
      picUrl: images.join(','),
      videoUrl: videos.join(','),
    }).then((response) => {
      if (response.code === 0) {
        navigation.goBack()
        // navigation.navigate('Mine')
        EventBus.post('REFRESH_TREND', {})
      }
    })
  }

  render() {
    const {
      visible,
      currentIndex,
      images,
      videos,
      isPunchCard,
      clockinTag,
      isPermit,
    } = this.state
    const viewImages = []
    images.map((item, index) => {
      let imagesUrl = { uri: item }
      viewImages.push(imagesUrl)
    })
    return (
      <Provider>
        <Fragment>
          <SafeAreaView style={{ backgroundColor: 'white' }} />
          <Header {...this.props} title={'发布动态'} />
          <ScrollView style={styles.scrollView}>
            <View style={{ flex: 1 }}>
              <TextInput
                textAlign="left"
                underlineColorAndroid="transparent"
                onChangeText={(text) => {
                  this.setState({
                    content: text,
                  })
                }}
                textAlignVertical="top"
                multiline
                style={styles.up}
                placeholder={'编辑文字内容...'}
                placeholderTextColor="#999"
              />
              <View style={styles.pictures}>
                {images.map((img, index) => (
                  <TouchableOpacity
                    onPress={() => {
                      this.setState({
                        currentIndex: index,
                        visible: true,
                      })
                    }}
                    key={index + 'info'}
                  >
                    <Image
                      style={[
                        styles.picture,
                        (index + 1) % 3 && styles.picMargin,
                      ]}
                      source={{ uri: img }}
                    />
                  </TouchableOpacity>
                ))}
                {videos.map((video, index) => (
                  <Video
                    style={[
                      styles.picture,
                      (index + 1) % 3 && styles.picMargin,
                    ]}
                    source={{ uri: video }}
                    key={index + 'info2'}
                  />
                ))}
                {images.length < 6 && videos.length < 1 && (
                  <TouchableOpacity
                    onPress={this.choosePicture}
                    style={styles.addButton}
                  >
                    <Image
                      style={styles.addIcon}
                      source={require('../../assets/publish/add-image.png')}
                    />
                    <Text style={styles.grayFont}>添加图片/视频</Text>
                  </TouchableOpacity>
                )}
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 16,
                  marginLeft: 16,
                }}
              >
                <Switch
                  value={isPunchCard}
                  onValueChange={this.onValueChange}
                />
                <Text style={{ marginLeft: 8 }}>标记为打卡</Text>
              </View>
              {isPunchCard && (
                <View style={styles.dakaTag}>
                  <Text style={styles.tagText}>输入打卡标签:</Text>
                  <TextInput
                    value={clockinTag}
                    onChangeText={(text) => {
                      this.setState({
                        clockinTag: text,
                      })
                    }}
                    style={styles.tagInput}
                  />
                </View>
              )}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  marginTop: 16,
                  marginLeft: 16,
                }}
              >
                <Switch value={isPermit} onValueChange={this.onPermitChange} />
                <Text style={{ marginLeft: 8 }}>是否允许发布到同城</Text>
              </View>
            </View>
          </ScrollView>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity onPress={this.immePublish}>
              <View style={styles.bottom}>
                <Text style={styles.txt}>发布</Text>
              </View>
            </TouchableOpacity>
          </View>
          <ImageViewer
            images={viewImages}
            imageIndex={currentIndex}
            visible={visible}
            onRequestClose={() => {
              this.setState({ visible: false })
            }}
          />
        </Fragment>
      </Provider>
    )
  }
}
export default connect(bindState, bindActions)(PublishTrend)
const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    marginBottom: 30,
  },
  container: {
    flex: 1,
  },
  bottom: {
    height: 60,
    width: screenW,
    backgroundColor: '#564F5F',
    alignItems: 'center',
    justifyContent: 'center',
  },
  txt: { color: 'white', fontSize: 16 },
  up: {
    height: 180,
    fontSize: 16,
    backgroundColor: 'white',
    marginLeft: 16,
    marginRight: 16,
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: 16,
    paddingBottom: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  pictures: {
    marginTop: scaleSize(54),
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: 16,
    marginRight: 16,
  },
  picture: {
    height: scaleSize(379),
    width: scaleSize(289),
    borderRadius: scaleSize(24),
    marginBottom: scaleSize(54),
  },
  picMargin: {
    marginRight: scaleSize((screenW - 289 - 54) / 2),
  },
  addIcon: {
    width: scaleSize(72),
    height: scaleSize(72),
    marginBottom: scaleSize(30),
  },
  addButton: {
    height: scaleSize(379),
    width: scaleSize(289),
    backgroundColor: '#FBFBFB',
    borderRadius: scaleSize(24),
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  grayFont: {
    color: '#999999',
    fontSize: scaleFont(36),
  },
  dakaTag: {
    width: screenW - 32,
    height: scaleSize(111),
    backgroundColor: 'rgba(135,120,247,0.08)',
    borderRadius: scaleSize(57),
    // opacity: 0.08,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scaleSize(42),
    marginTop: scaleSize(60),
    marginLeft: 16,
    marginRight: 16,
  },
  tagText: {
    color: '#8778F7',
    fontSize: scaleFont(42),
    marginRight: scaleSize(10),
  },
  tagInput: {
    flex: 1,
    color: '#8778F7',
  },
})
