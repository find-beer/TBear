/*
 * @Descripttion :
 * @Autor        : 刘振利
 * @Date         : 2021-01-17 10:57:04
 * @LastEditTime : 2021-02-28 14:41:27
 * @FilePath     : /src/pages/home/relations/index.js
 */
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react'
import {
  FlatList,
  Text,
  RefreshControl,
  StyleSheet,
  View,
  Dimensions,
} from 'react-native'
import ActivityItem from '../../../components/activity_item/activityItem'
import DynamicItem from '../../../components/dynamic_item/dynamicItem'
import { bindActions, bindState, connect } from '../../../redux'
import EventBus from '../../../utils/EventBus'
const { width, height } = Dimensions.get('window')
import { GetRequest } from '../../../utils/request'
const emptyHeight = height - 200
class Relations extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      relationDetailList: [],
      isRefreshing: false,
      userInfo: props.userInfo,
      offset: 0,
      limit: 10,
      hasMore: true,
    }
  }

  static getDerivedStateFromProps(nextProps) {
    const { userInfo } = nextProps
    return {
      userInfo,
    }
  }

  componentDidMount() {
    this.getData()
    // EventBus.on('REFRESH_TREND', () => {
    //   console.log('出发EventBus111=============》')
    //   this.getData()
    // })
  }

  componentDidUpdate(prevProps, prevState) {
    const { userInfo } = prevProps
    if (userInfo !== this.props.userInfo && this.props.userInfo.uid) {
      this.getData()
    }
    // const { relationDetailList } = prevState
    // if (relationDetailList !== this.state.relationDetailList) {
    //   this.getData()
    // }
  }
  onBtnClick = (activity) => {
    const { navigation } = this.props
    navigation.navigate('ActivityDetail', {
      id: activity.id,
      refresh: () => this.getData(),
    })
  }

  renderItem = (rowData) => {
    const activity = rowData.item.activityDetailVO
    const feed = rowData.item.feedDetailVO
    if (activity) {
      return (
        <ActivityItem
          {...this.props}
          activity={activity}
          userId={this.state.userInfo.userId}
          onBtnClick={() => this.onBtnClick(activity)}
        />
      )
    }
    if (feed) {
      return (
        <DynamicItem
          {...this.props}
          feed={feed}
          userId={this.state.userInfo.uid}
        />
      )
    }
  }

  getData = async (offeset) => {
    try {
      const payload = {
        limit: 500,
        feedOffsetId: 0,
        activityOffsetId: 0,
      }
      const { success, data, msg } = await this.props.get(
        '/user/relationfeed',
        payload
      )
      if (success) {
        this.setState(
          {
            relationDetailList: data.relationDetailList,
          },
          () => {
            console.log(
              'relationDetailList============',
              this.state.relationDetailList
            )
          }
        )
      }
    } catch (e) {
      console.log('error', e)
    }
  }
  
  // getData = () => {
  //   const payload = {
  //     limit: 500,
  //     feedOffsetId: 0,
  //     activityOffsetId: 0,
  //   }
  //   GetRequest('user/relationfeed', payload).then((res) => {
  //     console.log('res',res)
  //     if (res.success) {
  //       this.setState(
  //         {
  //           relationDetailList: res.data.relationDetailList,
  //         },
  //         () => {
  //           console.log(
  //             'relationDetailList============',
  //             this.state.relationDetailList
  //           )
  //         }
  //       )
  //     }
  //   })
  // }

  renderEmpty = () => {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.noDataText}>暂无数据</Text>
      </View>
    )
  }

  render() {
    const { relationDetailList, isRefreshing, userInfo } = this.state
    return (
      <View style={styles.container}>
        <FlatList
          style={styles.list}
          data={relationDetailList}
          renderItem={this.renderItem}
          ListEmptyComponent={this.renderEmpty}
          keyExtractor={(item, index) => item + index}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={this.getData}
            />
          }
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    width,
    height: height - 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    color: '#888889',
  },
})

export default connect(bindState, bindActions)(Relations)
