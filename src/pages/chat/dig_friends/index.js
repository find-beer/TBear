import React, { Children, Fragment } from 'react'
import {
  StyleSheet,
  View,
  SafeAreaView,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Alert,
  DeviceEventEmitter,
} from 'react-native'
import { Provider, Toast } from '@ant-design/react-native'
import { GetRequest } from '../../../utils/request'
import Header from '../../../components/header/index'
import { scaleSize, scaleFont } from '../../../utils/scaleUtil'
const defaultHeader = require('../../../assets/mine/avatar.jpeg')
const arrowIcon = require('../../../assets/mine/arrow_right.png')
import { connect, bindActions, bindState } from '../../../redux'
import { setStorage, getStorage, removeStorage } from '../../../utils/storage'
import * as nim from '../../../utils/nim'
const SDK = require('../../../../nim/NIM_Web_SDK_rn_v7.2.0')
import * as realm from '../../../utils/realm'
var data = {}
class DigFriends extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      searchString: '',
      searchResult: {},
      // requestList: [
      //   {
      //     headPic: '',
      //     requestName: '李二狗',
      //     requestInfo: '我是你同事',
      //     addStatus: 1,
      //   },
      //   {
      //     headPic: '',
      //     requestName: '王老三',
      //     requestInfo: '我是你老大',
      //     addStatus: 0,
      //   },
      // ],
      friendSysMsgsList: [],
      applyFriendLists: [],
      applyList: [],
    }
  }
  componentDidMount() {
    this.fetchPersonInfo()
    this.event = DeviceEventEmitter.addListener('fetchSysMsg', (sysMsg) => {
      this.setState({
        applyList: [...this.state.applyList, sysMsg],
      })
      this.handleFix(this.state.applyList)
    })
  }
  componentWillUnmount() {
    this.event.remove()
  }

  handleFix = (applyList) => {
    let applyFriendList = []
    applyList.forEach((applyItem) => {
      let applyFriendObj = {}
      GetRequest('user/userInfo', {
        userId: Number(applyItem.from),
      }).then((res) => {
        if (res.code === 0) {
          applyFriendObj.name = res.data.name
          applyFriendObj.headPicUrl = res.data.headPicUrl
          applyFriendObj.ps = applyItem.ps
          applyFriendObj.idServer = applyItem.idServer
          applyFriendObj.account = Number(applyItem.from)
          applyFriendObj.state = applyItem.state
          applyFriendList.push(applyFriendObj)
        }
        this.setState(
          {
            friendSysMsgsList: applyFriendList,
          },
        )
      })
    })
  }
  fetchPersonInfo = () => {
    getStorage('friendSysMsgsData').then((applyString) => {
      if (applyString) {
        const applyList = eval(applyString)
        // 申请好友列表
        this.handleFix(applyList)
        this.setState({
          applyList: applyList,
        })
      }
    })
  }

  handleSearchFriend = (val) => {
    this.setState({
      searchString: val,
    })
    this.setState({ searchResult: {} })
    if (val.length === 11) {
      GetRequest(`/user/getUserByPhoneNumber/${val}`).then((res) => {
        this.setState({
          searchResult: res.data,
        })
      })
      return
    }
  }
  // nim申请加好友
  handleAddFriend = () => {
    if (this.state.searchResult.uid) {
      nim.instance.applyFriend({
        account: this.state.searchResult.uid,
        ps: '申请加为好友',
        done: (error, obj) => {
          console.log(error)
          console.log(obj)
          console.log('申请加为好友' + (!error ? '成功' : '失败'))
          if (!error) {
            Alert.alert('申请成功，待通过')
          } else {
            Alert.alert('添加失败，请稍后重试')
          }
        },
      })
    }
  }
  // 调接口添加好友
  serverAddFriend = () => {
    GetRequest(`/userRelation/addFriend/${this.state.searchString}`).then(
      (res) => {
        if (res.code === 0) {
          Toast.success(res.msg || '添加成功')
          Alert.alert('添加成功')
        } else {
          Toast.fail(res.msg || '添加失败，请稍后重试')
          Alert.alert('添加失败，请稍后重试')
        }
      }
    )
  }

  // 拒绝
  handleRefuse(info) {
    console.log('handleRefuse', info)
    nim.instance.rejectFriendApply({
      idServer: info.idServer,
      account: info.account,
      ps: 'ps',
      done: (error, obj) => {
        console.log(error)
        console.log(obj)
        console.log('拒绝好友申请' + (!error ? '成功' : '失败'))
        if (!error) {
          Alert.alert('拒绝好友申请成功')
        } else {
          Alert.alert('拒绝好友申请失败')
        }
      },
    })
  }
  // 通过
  handlePass(info) {
    // console.log('handlePass', info)
    nim.instance.passFriendApply({
      idServer: info.idServer,
      account: info.account,
      ps: 'ps',
      done: (error, obj) => {
        console.log(error)
        console.log(obj)
        console.log('通过好友申请' + (!error ? '成功' : '失败'))
        if (!error) {
          this.onAddFriend(obj.friend)
          Alert.alert('通过好友申请成功')
        } else {
          Alert.alert('通过好友申请失败')
        }
      },
    })
  }
  render() {
    return (
      <Provider>
        <Fragment>
          <SafeAreaView style={{ flex: 0, backgroundColor: 'white' }} />
          <SafeAreaView style={styles.container}>
            <View style={styles.operate_box}>
              <View style={styles.search_wrapper}>
                <View style={styles.search_box}>
                  <TextInput
                    style={styles.search_input}
                    placeholder="输入手机号/探熊号"
                    value={this.state.searchString}
                    onChangeText={(val) => this.handleSearchFriend(val)}
                  />
                </View>
              </View>
            </View>
            {this.state.searchResult?.name && (
              <View style={styles.searchList}>
                <View style={styles.list_item}>
                  <Image
                    style={styles.head_pic}
                    source={
                      this.state.searchResult.headPicUrl
                        ? {
                            uri: this.state.searchResult.headPicUrl.replace(
                              'https',
                              'http'
                            ),
                          }
                        : defaultHeader
                    }
                  />
                  <View style={styles.info_box}>
                    <Text style={styles.request_name}>
                      {this.state.searchResult.name}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={this.handleAddFriend}>
                    <View style={styles.add_btn}>
                      <Text style={styles.btn_txt}>添加好友</Text>
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={styles.line}></View>
              </View>
            )}
            <View style={styles.operate_item}>
              <Text style={styles.label}>扫一扫</Text>
              <Image style={styles.arrow} source={arrowIcon} />
            </View>
            <View style={styles.operate_item}>
              <Text style={styles.label}>手机联系人</Text>
              <Image style={styles.arrow} source={arrowIcon} />
            </View>
            <View style={styles.line}></View>
            <View style={styles.main_list}>
              {this.state.friendSysMsgsList.map((item, index) => {
                return (
                  <View style={styles.list_item} key={index + 'info'}>
                    <Image
                      style={styles.head_pic}
                      source={
                        item.headPicUrl
                          ? { uri: item.headPicUrl }
                          : defaultHeader
                      }
                    />
                    <View style={styles.info_box}>
                      <Text style={styles.request_name}>{item.name}</Text>
                      <Text style={styles.request_info}>{item.ps}</Text>
                    </View>
                    <View style={{ flexDirection: 'row' }}>
                      <TouchableOpacity
                        onPress={() => {
                          this.handleRefuse(item)
                        }}
                      >
                        <View style={styles.view_btn}>
                          <Text style={styles.btn_txt}>拒绝</Text>
                        </View>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          this.handlePass(item)
                        }}
                      >
                        <View style={styles.view_btn}>
                          <Text style={styles.btn_txt}>通过</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                    {/* <Text style={styles.status_txt}>
                      {item.addStatus ? '已添加' : ''}
                    </Text>
                    {!item.addStatus ? (
                      <View style={{ flexDirection: 'row' }}>
                        <TouchableOpacity onPress={this.handleRefuse}>
                          <View style={styles.view_btn}>
                            <Text style={styles.btn_txt}>拒绝</Text>
                          </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={this.handlePass}>
                          <View style={styles.view_btn}>
                            <Text style={styles.btn_txt}>通过</Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <></>
                    )} */}
                  </View>
                )
              })}
            </View>
          </SafeAreaView>
        </Fragment>
      </Provider>
    )
  }
}

export default connect(bindState, bindActions)(DigFriends)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  search_wrapper: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  search_input: {
    width: '100%',
    height: '100%',
  },
  search_box: {
    width: scaleSize(970),
    height: scaleSize(125),
    borderRadius: scaleSize(12),
    backgroundColor: '#f2f2f2',
    paddingHorizontal: scaleSize(50),
  },
  operate_item: {
    paddingHorizontal: scaleSize(50),
    paddingVertical: scaleSize(70),
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: scaleSize(1),
    borderBottomColor: '#f2f2f2',
    borderStyle: 'solid',
  },
  label: {
    fontSize: scaleFont(44),
    color: '#333',
  },
  arrow: {
    width: scaleSize(60),
    height: scaleSize(60),
  },
  line: {
    width: '100%',
    height: scaleSize(50),
    backgroundColor: '#f2f2f2',
  },
  main_list: {},
  list_item: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: scaleSize(50),
    paddingVertical: scaleSize(50),
    borderBottomWidth: scaleSize(2),
    borderStyle: 'solid',
    borderBottomColor: '#f2f2f2',
  },
  head_pic: {
    width: scaleSize(150),
    height: scaleSize(150),
    borderRadius: scaleSize(75),
    marginRight: scaleSize(20),
  },
  info_box: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  status_txt: {
    fontSize: scaleFont(40),
    color: '#999',
  },
  add_btn: {
    width: scaleSize(230),
    height: scaleSize(70),
    borderRadius: scaleSize(8),
    backgroundColor: '#e2e1e8',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  view_btn: {
    width: scaleSize(130),
    height: scaleSize(70),
    borderRadius: scaleSize(8),
    backgroundColor: '#e2e1e8',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: scaleSize(40),
  },
  btn_txt: {
    color: '#897FDD',
    fontSize: scaleFont(40),
  },
  request_name: {
    fontSize: scaleFont(48),
    color: '#333',
    marginBottom: scaleSize(15),
  },
  request_info: {
    fontSize: scaleFont(40),
    color: '#999',
  },
  searchList: {
    marginTop: scaleSize(20),
  },
})
