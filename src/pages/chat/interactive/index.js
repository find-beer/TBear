/*
 * @Descripttion :
 * @Autor        : 刘振利
 * @Date         : 2021-01-17 10:54:57
 * @LastEditTime : 2021-03-06 20:22:29
 * @FilePath     : /src/pages/chat/interactive/index.js
 */
import React, { Fragment } from 'react'
import {
  FlatList,
  StyleSheet,
  View,
  SafeAreaView,
  Text,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native'
import { GetRequest } from '../../../utils/request'
import Header from '../../../components/header/index'
import { scaleSize, scaleFont } from '../../../utils/scaleUtil'
const likeIcon = require('../../../assets/home/like.png')
import { setStorage, getStorage, removeStorage } from '../../../utils/storage'
import * as realm from '../../../utils/realm'
import * as nim from '../../../utils/nim'
const defaultHeader = require('../../../assets/mine/avatar.jpeg')

export default class InteractiveList extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      interactiveList: [
        {
          headPic: '',
          name: '王二狗',
          type: 'comment',
          comment: '憨憨一个',
        },
        {
          headPic: '',
          name: '王二狗',
          type: 'like',
        },
      ],
      TeamList: [],
    }
  }
  componentDidMount() {
    // GetRequest('',).then(res => {
    // })
    this.fetchTeamInvite()
  }

  fetchTeamInvite = () => {
    let TeamInvites = realm.TeamInviteRealm.objects('TeamInvite2')
    let TeamInviteList = []
    TeamInvites.forEach((element, index) => {
      TeamInviteList.push({
        id: element.id,
        TeamInviteNotify: JSON.parse(element.TeamInviteNotify),
      })
    })
    console.log('TeamInviteList=================>', TeamInviteList)
    this.setState({
      TeamList: TeamInviteList,
    })
  }

  renderItem(data) {
    const item = data.item
    return (
      <View style={styles.list_item}>
        <Image style={styles.head_pic} source={item.headPic || defaultHeader} />
        <Text style={styles.item_txt}>
          {item.type === 'comment'
            ? `${item.name}评论了你：${item.comment}`
            : `${item.name}点赞了你的动态`}
        </Text>
        {item.type !== 'comment' ? (
          <Image style={styles.like_icon} source={likeIcon} />
        ) : (
          <></>
        )}
      </View>
    )
  }
  renderTeamItem() {
    const { TeamList } = this.state
    return (
      <View>
        {TeamList.map((team, index) => {
          return (
            <View style={styles.list_item} key={index}>
              <View style={styles.info_box}>
                <Text>
                  {team.TeamInviteNotify.attach.team.name.split('_')[0]}群邀请
                </Text>
              </View>
              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity
                  onPress={() => {
                    this.handleRefuse(team)
                  }}
                >
                  <View style={styles.view_btn}>
                    <Text style={styles.btn_txt}>拒绝</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    this.handlePass(team)
                  }}
                >
                  <View style={styles.view_btn}>
                    <Text style={styles.btn_txt}>同意</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )
        })}
      </View>
    )
  }
  // 拒绝邀请入群
  handleRefuse(TeamItem) {
    console.log('handleRefuse======================', TeamItem)
    const { idServer, to, from } = TeamItem.TeamInviteNotify
    nim.instance.rejectTeamInvite({
      idServer: idServer,
      teamId: to,
      from: from,
      done: (error, obj) => {
        console.log(error)
        console.log(obj)
        console.log('拒绝入群邀请' + (!error ? '成功' : '失败'))

        if (!error0) {
          Alert.alert('拒绝入群邀请成功')
        } else {
          Alert.alert('拒绝入群邀请失败')
        }

        // 操作成功后删除这一项
        realm.TeamInviteRealm.write(() => {
          realm.TeamInviteRealm.create('TeamInvite2', { id: TeamItem.id }, true)
          realm.TeamInviteRealm.delete(team)
        })
      },
    })
  }
  // 同意邀请入群
  handlePass(TeamItem) {
    console.log('handlePass======================', TeamItem)
    const { idServer, to, from } = TeamItem.TeamInviteNotify
    nim.instance.acceptTeamInvite({
      idServer: 3858486957,
      teamId: to,
      from: from,
      done: (error, obj) => {
        console.log(error)
        console.log(obj)
        console.log('接受入群邀请' + (!error ? '成功' : '失败'))
        if (!error0) {
          Alert.alert('接受入群邀请成功')
        } else {
          Alert.alert('接受入群邀请失败')
        }

        // 操作成功后删除这一项
        realm.TeamInviteRealm.write(() => {
          console.log(111111111111111111)
          realm.TeamInviteRealm.create('TeamInvite2', { id: TeamItem.id }, true)
          realm.TeamInviteRealm.delete(team)
        })
      },
    })
  }
  render() {
    const { TeamList } = this.state
    return (
      <Fragment>
        <SafeAreaView style={{ flex: 0, backgroundColor: 'white' }} />
        <SafeAreaView style={styles.container}>
          {/* <FlatList
            data={this.state.interactiveList}
            renderItem={this.renderItem}
            keyExtractor={(item, index) => item + index}
          /> */}
          {/* <FlatList
            data={this.state.TeamList}
            renderItem={this.renderTeamItem}
            keyExtractor={(item, index) => item + index}
          /> */}
          {this.renderTeamItem()}
        </SafeAreaView>
      </Fragment>
    )
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  list_item: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: scaleSize(50),
    paddingHorizontal: scaleSize(50),
    borderBottomColor: '#f2f2f2',
    borderStyle: 'solid',
    borderBottomWidth: scaleSize(1),
  },
  head_pic: {
    borderRadius: scaleSize(75),
    width: scaleSize(150),
    height: scaleSize(150),
    marginRight: scaleSize(30),
  },
  item_txt: {
    fontSize: scaleFont(42),
    color: '#333',
  },
  like_icon: {
    width: scaleSize(60),
    height: scaleSize(60),
  },
  info_box: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
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
})
