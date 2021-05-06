/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

/**
 *  我的
 */

import React, { Component, Fragment } from 'react'
import {
  StyleSheet,
  Image,
  ImageBackground,
  Text,
  View,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native'
import DynamicTab from '../mine/index/dynamicTab'
import UserInfoDetail from '../mine/index/userInfoDetail'
import { GetRequest } from '../../utils/request'
import { scaleSize, scaleFont } from '../../utils/scaleUtil'
import { connect, bindActions, bindState } from './../../redux'
const imageUrl = {
  configIcon: require('../../assets/mine/download-icon.png'),
  avatarBg: require('../../assets/mine/avatar-bg.png'),
  avatar: require('../../assets/mine/avatar.jpeg'),
  sexIcon: require('../../assets/mine/QR-icon.png'),
  netIcon: require('../../assets/mine/QR-icon.png'),
  hobbyIcon: require('../../assets/mine/bulb.png'),
  locationIcon: require('../../assets/mine/local.png'),
  QRCodeIcon: require('../../assets/mine/QR-icon.png'),
  EditIcon: require('../../assets/mine/edit.png'),
  done: require('../../assets/mine/undone-icon.png'),
  wareHouse: require('../../assets/mine/warehouse-icon.png'),
  unDone: require('../../assets/mine/undone-icon.png'),
  relative: require('../../assets/stranger/guanxilian.png'),
  addFriend: require('../../assets/chat/addFriend.png'),
}
const SDK = require('../../../nim/NIM_Web_SDK_rn_v7.2.0')

class StrangerInfo extends Component {
  constructor(props) {
    super(props)
    console.log('props===============>>', props)
    this.state = {
      personalInfo: {},
      isFriend: true,
      uid: Number(this.props.route.params.uid),
      // uid: Number(this.props.navigation.state.params.uid),
    }
  }

  componentWillMount() {}
  componentDidMount() {
    // console.log('this.props.route.params.uid', this.props.route.params.uid)
    this.fetchPersonInfo()
    // this.initNotify()
  }

  handleChat = () => {
    this.props.navigation.navigate('Chatting', {
      uid: this.props.route.params.uid,
    })
  }

  fetchPersonInfo = () => {
    GetRequest('user/userInfo', {
      userId: Number(this.props.route.params.uid),
    }).then((res) => {
      // console.log('personalInfo', res) //true
      this.setState({
        personalInfo: res.data,
      })
    })
  }
  handleAddFtiend = () => {
    if (this.state.uid) {
      GetRequest(`/userRelation/addFriend/${this.state.uid}`).then((res) => {
        if (res.code === 0) {
          // 更新用户信息
          this.fetchPersonInfo()
          Toast.success(res.msg || '添加成功')
        } else {
          Toast.fail(res.msg || '添加失败，请稍后重试')
        }
      })
    }
  }
  handleRealtiveLine = () => {
    this.props.navigation.navigate('RelationChain', {
      uid: this.state.personalInfo.uid,
    })
  }
  // 关注
  handleConcer(follow) {
    // console.log('follow', follow)
    if (!follow) {
      GetRequest(`/userRelation/follow/${this.state.personalInfo.uid}`).then(
        (res) => {
          if (res.code === 0) {
            this.setState({})
            var content = {
              type: 1,
              value: '关注你了',
            }
            content = JSON.stringify(content)
            this.instance.sendCustomSysMsg({
              scene: 'p2p',
              to: this.state.personalInfo.uid,
              content: content,
              sendToOnlineUsersOnly: false,
              apnsText: content,
              antiSpamContent: true,
              done: (error, msg) => {
                console.log(
                  '发送' +
                    msg.scene +
                    '自定义系统通知' +
                    (!error ? '成功' : '失败') +
                    ', id=' +
                    msg.idClient
                )
                console.log(error)
                console.log(msg)
              },
            })
          }
        }
      )
    } else {
      Alert.alert('已关注')
    }
  }
  initNotify = () => {
    const { iminfo } = this.props.userInfo
    const { accid, token } = iminfo
    // utils.initIM(accid, token)
    this.instance = SDK.NIM.getInstance({
      debug: true,
      appKey: '67b35e65c41efd1097ef8504d5a88455',
      token,
      account: accid,
      db: false, // 不使用数据库
      onofflinecustomsysmsgs: this.onOfflineCustomSysMsgs,
      oncustomsysmsg: this.onCustomSysMsg,
    })
  }

  onOfflineCustomSysMsgs = (sysMsgs) => {
    console.log('收到离线自定义系统通知', sysMsgs)
  }
  onCustomSysMsg = (sysMsg) => {
    console.log('收到自定义系统通知', sysMsg)
  }

  render() {
    return (
      <Fragment>
        <SafeAreaView style={{ flex: 0, backgroundColor: 'white' }} />
        <SafeAreaView>
          <ScrollView>
            <View>
              <ImageBackground
                style={styles.persionalTab}
                source={{
                  uri: this.state.personalInfo?.headPicUrl?.replace(
                    'https',
                    'http'
                  ),
                }}
              >
                <View style={styles.bgaWrapper}>
                  <UserInfoDetail userInfo={this.state.personalInfo} />
                </View>
              </ImageBackground>
              {this.state.uid !== this.props.userInfo.uid && (
                <View style={styles.operateBox}>
                  {this.state.personalInfo.userType === 0 && (
                    <View>
                      {this.state.personalInfo.friend === true ||
                      this.props.userInfo.province ===
                        this.state.personalInfo.province ? (
                        // 1）普通用户 2）是好友或者同城
                        <View style={styles.relativeBox2}>
                          <TouchableOpacity
                            onPress={this.handleChat}
                            style={styles.chatFollowBox}
                          >
                            <View style={styles.centerStyle2}>
                              <Image
                                style={styles.operateIcon}
                                source={imageUrl.relative}
                              />
                              <Text style={styles.operateText}>聊天</Text>
                            </View>
                          </TouchableOpacity>
                        </View>
                      ) : (
                        // 1）普通用户 2）不是好友或者同城
                        <View style={styles.relativeBox2}>
                          <TouchableOpacity onPress={this.handleAddFtiend}>
                            <View style={styles.centerStyle2}>
                              <Image
                                style={styles.operateIcon}
                                source={imageUrl.addFriend}
                              />
                              <Text style={styles.operateText}>添加好友</Text>
                            </View>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={this.handleChat}>
                            <View style={styles.centerStyle2}>
                              <Image
                                style={styles.operateIcon}
                                source={imageUrl.relative}
                              />
                              <Text style={styles.operateText}>聊天</Text>
                            </View>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  )}
                  {/* {
									this.state.personalInfo.friend &&
									<View style={styles.relativeBox}>
										<TouchableOpacity  onPress={this.handleRealtiveLine}>
											<View style={styles.centerStyle}>
												<Image style={styles.operateIcon} source={imageUrl.relative}/>
												<Text style={styles.operateText}>关系链</Text>
											</View>
										</TouchableOpacity>
									</View>
								} */}
                  {
                    // 非好友，普通人进入商家
                    !this.state.personalInfo.friend &&
                      this.state.personalInfo.userType === 1 &&
                      this.props.userInfo.userType === 0 && (
                        <View style={styles.relativeBox2}>
                          <TouchableOpacity
                            onPress={() => {
                              this.handleConcer(
                                this.state.personalInfo.followed
                              )
                            }}
                            style={styles.chatFollowBox}
                          >
                            <View style={styles.centerStyle2}>
                              <Image
                                style={styles.operateIcon}
                                source={imageUrl.relative}
                              />
                              <Text style={styles.operateText}>
                                {this.state.personalInfo.followed
                                  ? '已关注'
                                  : '关注'}
                              </Text>
                            </View>
                          </TouchableOpacity>
                          <TouchableOpacity onPress={this.handleChat}>
                            <View style={styles.centerStyle2}>
                              <Image
                                style={styles.operateIcon}
                                source={imageUrl.relative}
                              />
                              <Text style={styles.operateText}>聊天</Text>
                            </View>
                          </TouchableOpacity>
                        </View>
                      )
                  }
                  {
                    // 入驻用户进入普通用户(入驻用户)首页
                    this.props.userInfo.userType === 1 && (
                      <View>
                        <TouchableOpacity onPress={this.handleChat}>
                          <View style={styles.centerStyle2}>
                            <Image
                              style={styles.operateIcon}
                              source={imageUrl.relative}
                            />
                            <Text style={styles.operateText}>聊天</Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    )
                  }
                </View>
              )}
              <View style={styles.lineSpace} />
              <DynamicTab
                uid={this.state.uid}
                personalInfo={this.state.personalInfo}
                {...this.props}
              />
            </View>
          </ScrollView>
        </SafeAreaView>
      </Fragment>
    )
  }
}
export default connect(bindState, bindActions)(StrangerInfo)
const styles = StyleSheet.create({
  persionalTab: {},
  bgaWrapper: {
    width: '100%',
    height: scaleSize(1157),
    padding: scaleSize(54),
    backgroundColor: 'rgba(0,0,0,.5)',
  },
  settingBox: {
    margin: scaleSize(56),
    height: scaleSize(48),
    width: scaleSize(140),
    position: 'absolute',
    right: 0,
    display: 'flex',
    flexDirection: 'row',
  },
  configIcon: {
    width: scaleSize(48),
    height: scaleSize(48),
    marginRight: scaleSize(12),
  },
  configFont: {
    fontSize: scaleFont(39),
    color: '#fff',
  },
  operationBox: {
    marginTop: scaleSize(54),
    height: scaleSize(76),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingLeft: scaleSize(40),
    paddingRight: scaleSize(40),
  },
  operationBtn: {
    width: scaleSize(243),
    height: scaleSize(76),
    backgroundColor: '#fff',
    fontSize: scaleFont(36),
    color: '#ccc',
    borderRadius: scaleSize(38),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnIcon: {
    width: scaleSize(32),
    height: scaleSize(32),
  },
  btnText: {
    fontSize: scaleFont(36),
    color: '#333',
  },
  leftBtn: {
    marginRight: scaleSize(85),
  },
  lineSpace: {
    height: scaleSize(24),
    backgroundColor: '#f2f2f2',
  },
  operateBox: {
    height: scaleSize(260),
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatBox: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f2f2f2',
    width: scaleSize(370),
    height: scaleSize(150),
    borderRadius: scaleSize(18),
    marginRight: scaleSize(112),
  },
  relativeBox: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f2f2f2',
    width: scaleSize(370),
    height: scaleSize(150),
    borderRadius: scaleSize(18),
  },
  relativeBox2: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '95%',
  },
  chatFollowBox: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    // justifyContent: 'center',
    alignItems: 'center',
  },
  centerStyle: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerStyle2: {
    display: 'flex',
    flexDirection: 'row',
    // justifyContent: 'space-between'
    justifyContent: 'center',
    alignItems: 'center',
    width: scaleSize(370),
    height: scaleSize(150),
    backgroundColor: '#f2f2f2',
    borderRadius: scaleSize(18),
    // marginRight: scaleSize(112),
  },
  operateIcon: {
    width: scaleSize(70),
    height: scaleSize(63),
    marginRight: scaleSize(33),
  },
  operateText: {
    fontSize: scaleFont(45),
    color: '#333',
  },
})
