<template>
  <el-row style="margin:25px 10px 10px;" >
    <el-col :span="18">
      <i class="el-input__icon el-icon-search" slot="prefix"></i>
      <el-select 
        filterable 
        placeholder="Search.." 
        size="small" 
        class="inline-input" 
        clearable
        v-model="Search"
        @change="handleSelect">
        <!-- display users -->
        <div v-if="this.userList != undefined && this.userList != null && this.userList.length > 0 && user.userRole == 0">
          <div style="color:grey; margin: 10px 20px 10px">Users</div>
          <el-option v-for="item in userList" :key="item.id" :label="item.userName" :value="item.id">
            <div class="block" style="float: left">
              <el-avatar :size="30" :src="item.userAvatar"></el-avatar>
            </div>
            &nbsp;&nbsp;{{ item.userName }}
            {{ " (" + item.email + ")" }}
          </el-option>
        </div>
        <!-- display organizations -->
        <div
          v-if="this.orgList != undefined && this.orgList != null && this.orgList.length > 0 && user.userRole == 0"
          style="color:grey; margin: 20px 20px 10px">Organizations</div>
        <div
          v-else-if="this.orgList != undefined && this.orgList != null && this.orgList.length > 0 && user.userRole == 1"
          style="color:grey; margin: 20px 20px 10px">Clients</div>
        <el-option v-for="item in orgList" :key="item.channelId" :label="item.chatName" :value="item.channelId + 1000000">
          <div class="block" style="float: left">
            <el-avatar :size="30" :src="item.chatAvatar"></el-avatar>
          </div>
          &nbsp;&nbsp;{{ item.chatName }}
          {{ " (" + item.chatEmail + ")" }}
        </el-option>
        <!-- display channels -->
        <div
          v-if="this.channelList != undefined && this.channelList != null && this.channelList.length > 0"
          style="color:grey; margin: 20px 20px 10px">Channels</div>
        <el-option v-for="item in channelList" :key="item.id" :label="item.channelName" :value="item.id + 1000000">
          {{ "# " + item.channelName }}
        </el-option>
      </el-select>
    </el-col>
    <CreateChannel :workspaceId="Number(workspaceId)" />
  </el-row>
</template>

<script>
import CreateChannel from "../components/CreateChannel.vue";

export default {
  components: {
    CreateChannel
  },
  props: {
    workspaceId: {
      default: undefined,
    },
  },
  data() {
    return {
      user: JSON.parse(sessionStorage.getItem("CurUser")),
      userList: [],
      orgList: [],
      channelList: [],
      organizationMembers: [],
      Search: '',
    };
  },
  methods: {
    handleSelect(item) {
      if (item < 1000000) {
        this.$router.push('/home/' + this.$route.params.userId + '/' + item);//users
      } else {
        this.$router.push('/home/' + this.$route.params.userId + '/c/' + (item - 1000000));//orgs&channels
      }
    },
    sortUsers(array) {array.sort((a, b) => {
      var nameA = a.userName.toUpperCase(); // ignore upper and lowercase
      var nameB = b.userName.toUpperCase(); // ignore upper and lowercase
      if (nameA < nameB) {return -1;}
      if (nameA > nameB) {return 1;}     
      return 0;}); // names must be equal
    },
    sortOrgList(array) {array.sort((a, b) => {
      var nameA = a.chatName.toUpperCase(); // ignore upper and lowercase
      var nameB = b.chatName.toUpperCase(); // ignore upper and lowercase
      if (nameA < nameB) {return -1;}
      if (nameA > nameB) {return 1;}     
      return 0;}); // names must be equal
    },
    sortChannels(array) {array.sort((a, b) => {
      var nameA = a.channelName.toUpperCase(); // ignore upper and lowercase
      var nameB = b.channelName.toUpperCase(); // ignore upper and lowercase
      if (nameA < nameB) {return -1;}
      if (nameA > nameB) {return 1;}     
      return 0;}); // names must be equal
    },
    loadName() {
      //const chatList = JSON.parse(sessionStorage.getItem("CurUserList"));
      this.userList = [],
      this.channelList = [],
      this.orgList = [],
      this.organizationMembers = [],

      this.$http.post("http://localhost:8080/api/user/chat/list", {
          userId:this.user.id,
          workspaceId:this.workspaceId
      })
      .then((res) => res.data)
      .then((res) => {
        if(res.code == 200){
          for (let i = 0; i < res.data.userList.length; i++) {
            if (res.data.userList[i].userRole == 0) {
              console.log(res.data.userList[i]);
              this.userList.push(res.data.userList[i]);
            } else {
              this.organizationMembers.push(res.data.userList[i]);
            }
          }
          for (let i = 0; i < res.data.channelList.length; i++) {
            this.channelList.push(res.data.channelList[i]);
          }
          for (let i = 0; i < res.data.orgChannelList.length; i++) {
            this.orgList.push(res.data.orgChannelList[i]);
          }
          //this.channelList = res.data.channelList
          this.sortUsers(this.userList);
          this.sortChannels(this.channelList);
          this.sortOrgList(this.orgList);
        } 
        else {
          alert('获取数据失败 + 工作区用户')
        }
      })
    },
  },
  mounted() {
    this.loadName();
  }
}
</script>

<style></style>