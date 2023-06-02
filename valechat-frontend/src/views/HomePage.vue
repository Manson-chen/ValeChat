<template>
  <el-container>
    <el-header height="80px">
      <NavBar :workspaceId="Number(workspaceId)" />
    </el-header>
    <el-container>
      <el-aside width="60px" style="margin-top: 25px;">
        <el-radio-group v-model="selectedWorkspaceId" @change="changeWorkspace" style="border-radius: 0px;">
          <el-radio-button v-for="workspace in workspaces" :key="workspace.id" :label="workspace.id">
            {{ workspace.workspaceName }}
          </el-radio-button>
        </el-radio-group>
      </el-aside>
      <el-aside width="200px">
        <SearchBar v-if="workspaceId" :workspaceId="Number(workspaceId)" :key="workspaceId" />
        <UserList v-if="workspaceId" :workspaceId="Number(workspaceId)" ref="userlist" :key="workspaceId"></UserList>
      </el-aside>
      <el-main>
        <!-- <ChatBox v-show="showChatbox" :chatId="Number(chatId)" :channelId="Number(channelId)" :userId="Number(userId)"/> -->
        <ChatBox :key="workspaceId" v-show="showChatbox" :chatId="Number(chatId)" :channelId="Number(channelId)"
          :userId="Number(userId)" :workspaceId="Number(workspaceId)" />
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
import NavBar from "../components/NavBar.vue";
import SearchBar from "../components/SearchBar.vue";
import ChatBox from "../components/ChatBox.vue";
// import ChatBox2 from "@/components/ChatBox2.vue";
import UserList from "../components/UserList.vue";

export default {
  name: "home",
  data() {
    return {
      // 工作区切换
      workspaces: [],
      selectedWorkspaceId: '',
      // 这里待定
      workspaceId: '',
      // isCollapse: true,
      circleUrl:
        "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
      showChatbox: true,
    };
  },
  components: {
    NavBar,
    SearchBar,
    ChatBox,
    // ChatBox2,
    UserList,
  },
  methods: {
    // 工作区切换------
    changeWorkspace(value) {
      // disconnect stomp?
      const length = this.workspaces.length
      for (let i = 0; i < length; i++) {
        if (value == this.workspaces[i].id) {
          console.log("Workspace: " + this.workspaces[i].id);
          this.workspaceId = this.workspaces[i].id;
        }
      }
      console.log("Workspace Change: " + this.workspaceId)
    },
    async initWorkspaceId() {
      // console.log(this.userId + " workspace + Homepage.vue")
      await this.$http.post("http://localhost:8080/api/user/workspace/list", {
        userId: this.userId
      }).then(res => res.data).then(res => {
        console.log(res.data.workSpaceList , "workspacelist")
        this.workspaces = res.data.workSpaceList
        this.$set(this, "workspaceId", this.workspaces[0].id)
        this.$set(this, "selectedWorkspaceId", this.workspaces[0].id)
        console.log("ForIni workspace" + this.workspaceId)
        console.log("ForIni workspace" + this.selectedWorkspaceId)
      })
    },
  },
  // ----------------

  // handleOpen(key, keyPath) {
  //   console.log(key, keyPath);
  // },
  // handleClose(key, keyPath) {
  //   console.log(key, keyPath);
  // },

  created: function () {
    console.log(this.userId, this.chatId, this.channelId + ' 66');
    if (this.userId == null) {
      this.$message.error("Your didn't login yet!");
      this.$router.push("/login");
    }

    if (this.chatId == null && this.channelId == null) {
      this.showChatbox = false;
    } else this.showChatbox = true;

    this.initWorkspaceId();

    // ToDo handle wrong url 判断当前channelid/chatid是不是在userlist里，不在的话返回没有chatbox组件的home页面
  },

  computed: {
    userId() {
      // console.log("workspace get userId", this.$route.params.userId)
      return this.$route.params.userId;
    },

    chatId() {
      return this.$route.params.chatId;
    },

    channelId() {
      return this.$route.params.channelId;
    },
  },

  watch: {
    userId: function (newId, oldId) {
      console.log(newId, oldId);
      if (!this.userId) {
        this.$message.error("Your didn't login yet!");
        this.$router.push("/login");
      }
    },

    chatId: function (newId, oldId) {
      console.log(newId, oldId);
      if (this.chatId == null && this.channelId == null) {
        this.showChatbox = false;
      } else this.showChatbox = true;
    },

    channelId: function (newId, oldId) {
      console.log(newId, oldId);
      if (this.chatId == null && this.channelId == null) {
        this.showChatbox = false;
      } else this.showChatbox = true;
    },
  },
};
</script>

<style scoped>
.el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 200px;
  min-height: 400px;
}

.el-avatar {
  margin-right: 10px;
}

/* ::v-deep .el-radio-button__inner, .el-radio-group {
  display: grid;
} */



::v-deep .el-radio-button .el-radio-button__inner {
  width: 60px;
  height: 36px;
  border-radius: 4px;
  border: 1px solid rgba(17,20,24,.15);
  margin-bottom: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
}

::v-deep .el-radio-button__orig-radio:checked+.el-radio-button__inner {
  color: #FFF;
  background-color: #1fa0c1;
}
</style>