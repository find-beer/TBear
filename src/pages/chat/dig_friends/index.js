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
} from 'react-native'
import { Provider, Toast } from '@ant-design/react-native'
import { GetRequest } from '../../../utils/request'
import Header from '../../../components/header/index'
import { scaleSize, scaleFont } from '../../../utils/scaleUtil'
const defaultHeader = require('../../../assets/mine/avatar.jpeg')
const arrowIcon = require('../../../assets/mine/arrow_right.png')
import { connect, bindActions, bindState } from '../../../redux'
import { setStorage, getStorage, removeStorage } from '../../../utils/storage'
// import * as utils from '../../../utils/nimAddFriend'
const SDK = require('../../../../nim/NIM_Web_SDK_rn_v7.2.0')
var data = {}
class DigFriends extends React.Component {
  constructor(props) {
    super(props)
    console.log('DigFriends==============props', props)
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
    }
  }
  componentDidMount() {
    // console.log('addFriendInstance', utils)
    this.initNotify()
    this.fetchPersonInfo()
    // removeStorage('friendSysMsgsData')
  }

  fetchPersonInfo = () => {
    getStorage('friendSysMsgsData').then((applyString) => {
      if (applyString) {
        const applyList = eval(applyString)
        let applyFriendList = []

        // 申请好友列表
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
              console.log('applyFriendObj', applyFriendObj)
              applyFriendList.push(applyFriendObj)
            }
            this.setState(
              {
                friendSysMsgsList: applyFriendList,
              },
              () => {
                console.log('friendSysMsgsList', this.state.friendSysMsgsList)
              }
            )
          })
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

  handleAddFriend = () => {
    if (this.state.searchResult.uid) {
      this.instance.applyFriend({
        account: this.state.searchResult.uid,
        ps: 'ps',
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
        console.log('result', res)
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
      onfriends: this.onFriends,
      onsyncfriendaction: this.onSyncFriendAction,
      onofflinesysmsgs: this.onOfflineSysMsgs,
      onsysmsg: this.onSysMsg,
      onupdatesysmsg: this.onUpdateSysMsg,
      onsysmsgunread: this.onSysMsgUnread,
      onupdatesysmsgunread: this.onUpdateSysMsgUnread,
    })
  }

  onOfflineSysMsgs = (sysMsgs) => {
    console.log('收到离线系统通知', sysMsgs)
    this.pushSysMsgs(sysMsgs)
  }
  onSysMsg = (sysMsg) => {
    console.log('收到系统通知', sysMsg)
    this.pushSysMsgs(sysMsg)
  }
  onUpdateSysMsg = (sysMsg) => {
    this.pushSysMsgs(sysMsg)
  }
  pushSysMsgs = (sysMsgs) => {
    data.sysMsgs = this.instance.mergeSysMsgs(data.sysMsgs, sysMsgs)

    getStorage('friendSysMsgsData').then((applyString) => {
      if (applyString) {
        const applyList = eval(applyString)
        let applyNewList = [sysMsgs, ...applyList]
        let applyNewListString = JSON.stringify(applyNewList)
        setStorage('friendSysMsgsData', applyNewListString)
        this.refreshSysMsgsUI()
      } else {
        setStorage('friendSysMsgsData', JSON.stringify(data.sysMsgs))
      }
    })
  }
  onSysMsgUnread = (obj) => {
    console.log('收到系统通知未读数', obj)
    data.sysMsgUnread = obj
    this.refreshSysMsgsUI()
  }
  onUpdateSysMsgUnread = (obj) => {
    console.log('系统通知未读数更新了', obj)
    data.sysMsgUnread = obj
    this.refreshSysMsgsUI()
  }
  refreshSysMsgsUI = () => {
    // 刷新界面
  }
  onFriends = (friends) => {
    console.log('收到好友列表', friends)
    data.friends = this.instance.mergeFriends(data.friends, friends)
    data.friends = this.instance.cutFriends(data.friends, friends.invalid)
    this.refreshFriendsUI()
  }

  onSyncFriendAction = (obj) => {
    console.log(obj)
    switch (obj.type) {
      case 'addFriend':
        console.log(
          '你在其它端直接加了一个好友' + obj.account + ', 附言' + obj.ps
        )
        this.onAddFriend(obj.friend)
        break
      case 'applyFriend':
        console.log(
          '你在其它端申请加了一个好友' + obj.account + ', 附言' + obj.ps
        )
        break
      case 'passFriendApply':
        console.log(
          '你在其它端通过了一个好友申请' + obj.account + ', 附言' + obj.ps
        )
        this.onAddFriend(obj.friend)
        break
      case 'rejectFriendApply':
        console.log(
          '你在其它端拒绝了一个好友申请' + obj.account + ', 附言' + obj.ps
        )
        break
      case 'deleteFriend':
        console.log('你在其它端删了一个好友' + obj.account)
        this.onDeleteFriend(obj.account)
        break
      case 'updateFriend':
        console.log('你在其它端更新了一个好友', obj.friend)
        this.onUpdateFriend(obj.friend)
        break
    }
  }

  onAddFriend = (friend) => {
    data.friends = this.instance.mergeFriends(data.friends, friend)
    this.serverAddFriend()
    this.refreshFriendsUI()
  }

  onDeleteFriend = (account) => {
    data.friends = this.instance.cutFriendsByAccounts(data.friends, account)
    this.refreshFriendsUI()
  }

  onUpdateFriend = (friend) => {
    data.friends = this.instance.mergeFriends(data.friends, friend)
    this.refreshFriendsUI()
  }

  refreshFriendsUI = () => {
    // 刷新界面
  }

  // 拒绝
  handleRefuse(info) {
    console.log('handleRefuse', info)
    this.instance.rejectFriendApply({
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
    this.instance.passFriendApply({
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
            <Header {...this.props} title="挖好友" left={null} />
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
