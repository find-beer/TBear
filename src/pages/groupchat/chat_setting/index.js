import React, { Component, Fragment } from 'react'
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native'
const arrow = require('../../../assets/mine/arrow_right.png')
import { Switch } from '@ant-design/react-native'
import { removeStorage } from '../../../utils/storage'
import { scaleSize, scaleFont } from '../../../utils/scaleUtil'
import { connect, bindActions, bindState } from '../../../redux'

class ChatSetting extends Component {
  constructor(props) {
    super(props)
    console.log('ChatSetting', props)
    this.state = {
      text: '',
      openTopChat: false,
      openNotDisturb: false,
      teamId:props.route.params.teamId
    }
  }
  
  handleAddFriends() {
    console.log('添加好友')
    const { navigation } = this.props
    navigation.navigate('CheckedFriends',{teamId:this.state.teamId})
  }

  handleLookChatContent() {
    console.log('查看聊天内容')
  }

  onSwitchTopChat(value) {
    this.setState({
      openTopChat: value,
    })
  }
  onSwitchNotDisturb(value) {
    this.setState({
      openNotDisturb: value,
    })
  }

  handleClearChats() {
    console.log('清除聊天记录')
  }

  handleComplaints() {
    console.log('投诉')
  }
  render() {
    return (
      <Fragment>
        <SafeAreaView style={{ flex: 0, backgroundColor: 'white' }} />
        <SafeAreaView style={styles.configWrap}>
          <View style={styles.configInner}>
            <TouchableOpacity
              style={styles.configItem}
              onPress={() => this.handleAddFriends()}
            >
              <Text style={styles.configItemText}>添加好友</Text>
              <Image source={arrow} style={styles.configItemArrow} />
            </TouchableOpacity>
            <View style={styles.line}></View>
            <TouchableOpacity
              style={styles.configItem}
              onPress={() => this.handleLookChatContent()}
            >
              <Text style={styles.configItemText}>查看聊天内容</Text>
              <Image source={arrow} style={styles.configItemArrow} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.configItem}>
              <Text style={styles.configItemText}>置顶聊天</Text>
              <Switch
                checked={this.state.openTopChat}
                onChange={(val) => this.onSwitchTopChat(val)}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.configItem}>
              <Text style={styles.configItemText}>信息免打扰</Text>
              <Switch
                checked={this.state.openNotDisturb}
                onChange={(val) => this.onSwitchNotDisturb(val)}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.configItem}
              onPress={() => this.handleClearChats()}
            >
              <Text style={styles.configItemText}>清空聊天记录</Text>
              <Image source={arrow} style={styles.configItemArrow} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.configItem}
              onPress={() => this.handleComplaints()}
            >
              <Text style={styles.configItemText}>投诉</Text>
              <Image source={arrow} style={styles.configItemArrow} />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Fragment>
    )
  }
}

const styles = StyleSheet.create({
  configWrap: {
    height: '100%',
  },
  configInner: {
    borderTopWidth: 1,
    borderColor: '#ccc',
    height: '100%',
  },
  configItem: {
    height: scaleSize(170),
    paddingLeft: scaleSize(54),
    paddingRight: scaleSize(54),
    backgroundColor: '#fff',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: scaleSize(1),
    borderColor: '#f2f2f2',
    alignItems: 'center',
  },
  configItemText: {
    fontSize: scaleFont(42),
    color: '#333',
    lineHeight: scaleSize(170),
  },
  configItemDes: {
    fontSize: scaleFont(39),
    color: '#999',
    lineHeight: scaleSize(170),
  },
  configItemArrow: {
    width: scaleSize(60),
    height: scaleSize(60),
  },
  logoutBtn: {
    fontSize: scaleFont(42),
    textAlign: 'center',
    color: 'rgba(194,61,77,0.82)',
    paddingTop: scaleSize(54),
  },
  text: {
    paddingLeft: scaleSize(54),
    paddingRight: scaleSize(54),
    color: '#888',
    fontSize: scaleFont(32),
    height: scaleSize(130),
    lineHeight: scaleSize(130),
  },
  line: {
    width: '100%',
    height: scaleSize(50),
    backgroundColor: '#f2f2f2',
  },
})

export default connect(bindState, bindActions)(ChatSetting)
