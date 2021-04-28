import { identity } from 'lodash'
import React from 'react'
import {
  Text,
  View,
  StyleSheet,
  Image,
  Fragment,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Alert,
  Dimensions,
} from 'react-native'
import { GetRequest } from '../../../utils/request'
import { scaleSize, scaleFont } from '../../../utils/scaleUtil'
import Item from '../friend_list/Item'
import * as nim from '../../../utils/nim'
const { width, height } = Dimensions.get('window')
export default class CheckedFriends extends React.Component {
  constructor(props) {
    super(props)
    console.log('CheckedFriends', props)
    this.state = {
      friendList: [],
      friendsLength: 0,
      teamId: props.route.params.teamId,
      uids: null,
    }
  }

  componentDidMount() {
    // 好友列表
    GetRequest('userRelation/listDirect').then((res) => {
      res.data.map((item) => {
        return (item.select = false)
      })
      this.setState(
        {
          friendList: res.data,
        },
        () => {
          console.log('friendList', this.state.friendList)
        }
      )
    })
  }

  changeSelect(selectIndex, select) {
    // 改变状态
    const { friendList } = this.state
    friendList.forEach((item, index) => {
      if (selectIndex === index) {
        return (friendList[selectIndex].select = !select)
      }
    })
    this.setState(
      {
        friendList: friendList,
      },
      () => {
        console.log('friendList==================>', friendList)
      }
    )
    // 拉好友的人数
    const newFriendList = []
    const uids = []
    friendList.forEach((item) => {
      if (item.select === true) {
        newFriendList.push(item)
        uids.push(item.uid)
      }
    })
    this.setState({
      friendsLength: newFriendList.length,
      uids: uids,
    })
  }

  addFriends() {
    const { friendList, teamId, uids } = this.state
    console.log('addFriends')
    if (friendList.findIndex((target) => target.select === true) == -1) {
      Alert.alert('请勾选要邀请的好友')
      return
    }

    // 拉好友进群
    nim.instance.addTeamMembers({
      teamId: teamId,
      accounts: uids,
      ps: '加入我们的群吧',
      custom: '',
      done: (error, obj) => {
        console.log(error)
        console.log(obj)
        console.log('入群邀请发送' + (!error ? '成功' : '失败'))
        if (!error) {
          Alert.alert('入群邀请发送成功')
        } else {
          Alert.alert('入群邀请发送失败')
        }
      },
    })
  }

  render() {
    // console.log('this.state.part2Value', this.state.part2Value)
    const { friendList, friendsLength } = this.state
    return (
      <View style={styles.container}>
        <View style={styles.main}>
          <FlatList
            style={styles.flatList}
            data={friendList}
            // 这是一种数据源没有唯一id的时候自己手动生成的方式 +"1" 是为了把int类型转string 因为key是需要string类型
            keyExtractor={(item, index) => index + '1'}
            // keyExtractor={(item) => item.uid}
            renderItem={({ item, index }) => (
              <Item
                item={item}
                select={item.select}
                onPress={() => this.changeSelect(index, item.select)}
              />
            )}
          />
        </View>
        <TouchableOpacity
          onPress={() => {
            this.addFriends()
          }}
          style={styles.footer}
        >
          <Text style={styles.footerText}>确认（{friendsLength}）</Text>
        </TouchableOpacity>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    height: height,
    width: '100%',
    flex: 1,
  },
  main: {
    paddingHorizontal: scaleSize(54),
    backgroundColor: '#fff',
    height: height - scaleSize(150),
  },
  footer: {
    height: scaleSize(150),
    position: 'absolute',
    backgroundColor: '#cccc',
    bottom: 0,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: scaleSize(50),
  },
})
