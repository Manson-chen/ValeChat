<template>
  <div class="nav">
    <div>
      <img alt="Vale logo" class="logo" src="../assets/ValeLogo.png" width="80px" />
    </div>
    <div class="searchBox">
      <el-button type="primary" plain @click="showHistory" style="margin-top: 20px" icon="el-icon-search"><i
          style="color: rgb(123, 123, 123)">Search
          Workspace Files</i></el-button>
      <!-- 弹出搜索框 -->
      <el-dialog :visible.sync="fileHistory" width="50%" :before-close="handleClose">
        <el-input placeholder="Search" prefix-icon="el-icon-search" v-model="searchWord" @input="change">
        </el-input>
        <el-tabs v-model="activeName" @tab-click="handleClick">
          <!-- 私聊文件 -->
          <el-tab-pane label="Private Documents" name="first">
            <div v-infinite-scroll="loadMorePrivateFile" infinite-scroll-disabled="loadingPrivateFile"
              infinite-scroll-distance="10" style="height: 300px; overflow-y: auto;">
              <div v-for="(item, index) in privateFileVisible" :key="index">
                <div v-if="isImage(item)">
                  <div class="fileInfo" style="width: 100%; display: flex; align-items: center">
                    <img :src="item.fileUrl" width="60px" />
                    <div style="float: left; width: 50%; margin-left: 10px">
                      <p style="
                      font-weight: bold;
                      white-space: nowrap;
                      overflow: hidden;
                      text-overflow: ellipsis;
                      width: 100%;
                    ">
                        {{ item.fileName }}
                      </p>
                      <p style="color: darkgray">Sender: {{ item.senderName }}</p>
                    </div>
                    <div style="margin-left: 120px; margin-top: 20px">
                      <i class="el-icon-download" @click="download(item)"
                        style="font-size: 20px; margin-left: 100px; cursor: pointer" />
                      <p style="color: darkgray; font-size: 13px">
                        {{ item.createTime }}
                      </p>
                    </div>
                  </div>
                  <hr />
                </div>
                <div v-else>
                  <div class="fileInfo" style="width: 100%; display: flex; align-items: center">
                    <img :src="getPreviwFile(item.fileName)" width="60px" />
                    <div style="float: left; width: 50%; margin-left: 10px">
                      <p style="
                      font-weight: bold;
                      white-space: nowrap;
                      overflow: hidden;
                      text-overflow: ellipsis;
                      width: 100%;
                    ">
                        {{ item.fileName }}
                      </p>
                      <p style="color: darkgray">Sender: {{ item.senderName }}</p>
                    </div>
                    <div style="margin-left: 120px; margin-top: 20px">
                      <i class="el-icon-download" @click="download(item)"
                        style="font-size: 20px; margin-left: 100px; cursor: pointer" />
                      <p style="color: darkgray; font-size: 13px">
                        {{ item.createTime }}
                      </p>
                    </div>
                  </div>
                  <hr />
                </div>
              </div>
            </div>
            <div v-if="loadingPrivateFile" class="loadingPrivateFile">
              <i class="el-icon-loading" />
            </div>
          </el-tab-pane>
          <!-- 群聊文件 -->
          <el-tab-pane label="Channel Documents" name="second">
            <div v-infinite-scroll="loadMoreChannelFile" infinite-scroll-disabled="loadingChannelFile"
              infinite-scroll-distance="10" style="height: 300px; overflow-y: auto;">
              <div v-for="(item, index) in channelFileVisible" :key="index">
                <div v-if="isImage(item)">
                  <div class="fileInfo" style="width: 100%; display: flex; align-items: center">
                    <img :src="item.fileUrl" width="60px" />
                    <div style="float: left; width: 50%; margin-left: 10px">
                      <p style="
                      font-weight: bold;
                      white-space: nowrap;
                      overflow: hidden;
                      text-overflow: ellipsis;
                      width: 100%;
                    ">
                        {{ item.fileName }}
                      </p>
                      <p style="color: darkgray">Sender: {{ item.senderName }}</p>
                    </div>
                    <div style="margin-left: 120px; margin-top: 20px">
                      <i class="el-icon-download" @click="download(item)"
                        style="font-size: 20px; margin-left: 100px; cursor: pointer" />
                      <p style="color: darkgray; font-size: 13px">
                        {{ item.createTime }}
                      </p>
                    </div>
                  </div>
                  <hr />
                </div>
                <div v-else>
                  <div class="fileInfo" style="width: 100%; display: flex; align-items: center">
                    <img :src="getPreviwFile(item.fileName)" width="60px" />
                    <div style="float: left; width: 50%; margin-left: 10px">
                      <p style="
                      font-weight: bold;
                      white-space: nowrap;
                      overflow: hidden;
                      text-overflow: ellipsis;
                      width: 100%;
                    ">
                        {{ item.fileName }}
                      </p>
                      <p style="color: darkgray">Sender: {{ item.senderName }}</p>
                    </div>
                    <div style="margin-left: 120px; margin-top: 20px">
                      <i class="el-icon-download" @click="download(item)"
                        style="font-size: 20px; margin-left: 100px; cursor: pointer" />
                      <p style="color: darkgray; font-size: 13px">
                        {{ item.createTime }}
                      </p>
                    </div>
                  </div>
                  <hr />
                </div>
              </div>

            </div>
            <div v-if="loadingChannelFile" class="loadingChannelFile">
              <i class="el-icon-loading" />
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-dialog>
    </div>
    <!-- 用户头像 -->
    <div class="avatar">
      <el-upload class="upload-demo" :action="action" :data="uploadData" :on-success="uploadSuccess"
        :show-file-list="false" :before-upload="beforeAvatarUpload" accept="image/png, image/jpeg, image/jpg"
        ref="upload">
        <el-avatar :size="60" :src="circleUrl"></el-avatar>
      </el-upload>
    </div>
    <!-- 用户个人信息 -->
    <div class="name">
      <el-popover placement="top-start" title="" width="200" trigger="hover" content="">
        <div slot="reference">
          {{ userInfo.userName }}
          <!-- <p class="statusBox">
            <span :class="userInfo.status"></span>{{ userInfo.status }}
          </p> -->
        </div>
        <div class="userInfo">
          <p class="userName">
            <span v-if="userNameEdit">{{ userInfo.userName }}</span>
            <el-input style="width: 80%" v-else v-model="userInfo.userName"></el-input>
            <i v-if="userNameEdit" @click="userNameEdit = false" class="el-icon-edit"></i>
            <i v-else @click="nameEdit()" class="el-icon-check"></i>
          </p>
          <p class="EmailAddress">{{ userInfo.EmailAddress }}</p>

          <p class="Contactnumber">
            <span v-if="ContactnumberEdit">{{ userInfo.Contactnumber }}</span>
            <el-input style="width: 80%" v-else v-model="userInfo.Contactnumber"></el-input>
            <i v-if="ContactnumberEdit" @click="ContactnumberEdit = false" class="el-icon-edit"></i>
            <i v-else @click="phoneEdit()" class="el-icon-check"></i>
          </p>
          <p class="OrganizationName" v-if="mesObj.userRole == '1'">
            {{ organizationName }}
          </p>
          <!-- <el-collapse v-model="activeNames" @change="handleChange">
            <el-collapse-item title="Update Status" name="1">
              <p @click="handleCommand('online')">online</p>
              <p @click="handleCommand('busy')">busy</p>
            </el-collapse-item>
          </el-collapse> -->
          <p class="Contactnumber" @click="logout">log out</p>
        </div>
      </el-popover>
    </div>
  </div>
</template>

<script>
import { organization, update } from "@/api/signup.js";
import { getWorkSpaceFile, imageObject } from "@/api/getMes.js";
// import EventBus from '../api/EventBus';

export default {
  name: "NavBar",
  props: {
    workspaceId: {
      default: undefined,
    },  
  },
  data() {
    return {
      userNameEdit: true,
      ContactnumberEdit: true,
      mesObj: undefined,
      organizationName: "",
      userInfo: {
        userName: " ",
        EmailAddress: " ",
        Contactnumber: " ",
        status: "online",
      },
      circleUrl: "",
      action: "http://localhost:8080/api/user/avatar/upload",
      uploadData: {
        id: "",
      },

      // 搜索工作区历史文件
      fileHistory: false,
      chatFile: [],
      // private chat
      privateFile: [],
      privateFileVisible: [],
      // channel chat
      channleFile: [],
      channelFileVisible: [],
      linesToShow: 4,
      //
      loadingPrivateFile: false,
      loadingChannelFile: false,

      searchWord: "",
      activeName: "first",
      imageObject: imageObject,
    };
  },
  watch: {},
  created() {
    let obj = sessionStorage.getItem("CurUser");
    this.mesObj = JSON.parse(obj);

    console.log(this.mesObj, 69);
    this.infoFun();
    this.queryorganization();
    this.uploadData.id = this.mesObj.id;
    this.circleUrl = this.mesObj.userAvatar;

    // let chatListObj = sessionStorage.getItem("CurUserList");
    // this.chatList = JSON.parse(chatListObj);
    // console.log(this.chatList.userList, 70);
  },
  methods: {
    showHistory() {
      this.fileHistory = true;
    },

    async loadMorePrivateFile() {
      if (this.loadingPrivateFile) {
        return
      }
      this.loadingPrivateFile = true
      // 模拟异步加载数据
      await new Promise(resolve => setTimeout(resolve, 800))
      const startIndex = this.privateFileVisible.length
      const endIndex = startIndex + 2
      const newItems = this.privateFile.slice(startIndex, endIndex)
      this.privateFileVisible = [...this.privateFileVisible, ...newItems]
      this.loadingPrivateFile = false
    },

    async loadMoreChannelFile() {
      if (this.loadingChannelFile) {
        return
      }
      this.loadingChannelFile = true
      // 模拟异步加载数据
      await new Promise(resolve => setTimeout(resolve, 800))
      const startIndex = this.channelFileVisible.length
      const endIndex = startIndex + 2
      const newItems = this.channleFile.slice(startIndex, endIndex)
      this.channelFileVisible = [...this.channelFileVisible, ...newItems]
      this.loadingChannelFile = false
    },

    handleClose() {
      this.searchWord = "";
      this.chatFile = [];
      this.privateFile = [];
      this.privateFileVisible = [];
      this.channleFile = [];
      this.channelFileVisible = [];
      this.activeName = "first";
      this.fileHistory = false;
    },

    change() {
      this.getMesChange();
    },

    getMesChange() {
      getWorkSpaceFile({
        fileName: this.searchWord,
        workspaceId: this.workspaceId,
        current:1,
        pageSize:100000,
      })
        .then((res) => {
          console.log(this.workspaceId + ' 178')
          console.log(res.data.data);
          this.chatFile = res.data.data;
          this.privateFile = res.data.data.privateFileList;
          this.privateFileVisible = this.privateFile.slice(0, this.linesToShow);

          this.channleFile = res.data.data.channelFileList;
          this.channelFileVisible = this.channleFile.slice(0, this.linesToShow);
        })
        .catch((err) => {
          console.log(err);
        });

    },

    download(item) {
      const { fileName, fileUrl } = item;
      let downloadLink = document.createElement("a");
      downloadLink.href = fileUrl;
      downloadLink.download = fileName;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    },

    // Show file icon in the search box
    isImage(file) {
      const type = file.fileName.substring(file.fileName.lastIndexOf(".") + 1);
      return (
        type.toLowerCase() === "jpg" ||
        type.toLowerCase() === "png" ||
        type.toLowerCase() === "jpeg"
      );
    },

    getFileUrl(icon) {
      return require(`@/assets/fileIcon/${icon}`);
    },
    getPreviwFile(filename) {
      filename = filename
        .substring(filename.lastIndexOf("."))
        .toLowerCase()
        .split(".")[1];
      return this.getFileUrl(this.imageObject[filename]);
    },
    handleClick(tab, event) {
      // this.searchWord = "";
      // this.chatFile = [];
      // this.privateFile = [];
      // this.privateFileVisible = [];
      // this.channleFile = [];
      // this.channelFileVisible = [];
      console.log(tab, event);
    },

    //获取组织名称
    queryorganization() {
      organization()
        .then((res) => {
          console.log(res.data.data, 80);

          let aa = res.data.data.find(
            (item) => item.id == this.userInfo.organizationId
          );
          this.organizationName = aa.organizationName;
        })
        .catch((err) => {
          console.log(err);
        });
    },
    infoFun() {
      this.userInfo.userName = this.mesObj.userName;
      this.userInfo.EmailAddress = this.mesObj.email;

      this.userInfo.Contactnumber = this.mesObj.phone;
      this.userInfo.organizationId = this.mesObj.organizationId;
    },

    //登出接口
    logout() {
      // let obj={

      // }
      // logout().then(res=>{

      // })
      this.$http.post("http://localhost:8080/api/user/logout").then(res=>res.data).then(res=>{
        console.log(res.message)
      })
      this.$router.push("/Login");
      sessionStorage.removeItem("CurUser");
      sessionStorage.removeItem("userList");
      sessionStorage.removeItem("channelList");
      sessionStorage.removeItem("orgList");
      sessionStorage.removeItem("CurUserList");

    },
    handleCommand(val) {
      this.activeNames = 0;
      this.userInfo.status = val;
    },
    uploadSuccess(response, file) {
      let chatListObj = sessionStorage.getItem("CurUserList");
      this.chatList = JSON.parse(chatListObj);

      console.log(response, file, 136);
      this.mesObj.userAvatar = response.data;
      sessionStorage.setItem("CurUser", JSON.stringify(this.mesObj));
      this.$refs.upload.clearFiles();
      // 实时更新用户头像，且在上传不正确类型图像时不会报错
      // 在上传成功后，再次获取一次sessionStorage中存储的头像数据
      this.circleUrl = this.mesObj.userAvatar;
      // 修改CurUserList里的内容，目的是及时更改sessionStorage里的值
      this.chatList.userList.forEach((user) => {
        if (this.mesObj.id == user.id) {
          user.userAvatar = this.mesObj.userAvatar;
          console.log(user.userAvatar + "200")
        }
      });
      sessionStorage.setItem("CurUserList", JSON.stringify(this.chatList));
      // EventBus.$emit('call-function');
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg';
      const isPNG = file.type === 'image/png';
      const isLt3M = file.size / 1024 / 1024 < 3;

      if (!isJPG && !isPNG) {
        this.$message.error('Avatar can only be in JPG/PNG format!');
      }
      else if (!isLt3M) {
        this.$message.error('Avatar cannot exceed 3MB!');
      }
      return (isJPG || isPNG) && isLt3M;
    },

    //更新接口
    nameEdit() {
      this.userNameEdit = true;
      update({
        id: this.mesObj.id,
        userName: this.userInfo.userName,
        phone: this.mesObj.Contactnumber,
        gender: this.mesObj.gender,
        userStatus: this.mesObj.userStatus,
      }).then((res) => {
        console.log(res.data, 83);
        if (res.data.code == 200) {
          this.$message({
            message: res.data.message,
            type: "success",
          });
        }
        this.mesObj.userName = this.userInfo.userName,
          sessionStorage.setItem("CurUser", JSON.stringify(this.mesObj));
      });
    },

    phoneEdit() {
      this.ContactnumberEdit = true;
      update({
        id: this.mesObj.id,
        userName: this.mesObj.userName,
        phone: this.userInfo.Contactnumber,
        gender: this.mesObj.gender,
        userStatus: this.mesObj.userStatus,
      }).then((res) => {
        console.log(res.data, 162);
        if (res.data.code == 200) {
          this.$message({
            message: res.data.message,
            type: "success",
          });
        }
        this.mesObj.phone = this.userInfo.Contactnumber,
          sessionStorage.setItem("CurUser", JSON.stringify(this.mesObj));
      });
    },
  },
};
</script>

<style scoped lang="scss">
.nav {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-content: center;
  align-items: stretch;
}

.searchBox {
  width: 70%;
  margin-left: 15%;
}

::v-deep .el-button--primary {
  color: #000;
  background-color: #1fa0c117;
  border: none;
  width: 90%;
  text-align: left;
}

::v-deep .el-button--primary.is-plain:focus,
.el-button--primary.is-plain:hover {
  background: #34beed3b;
  border: none;
  color: #000;
}

::v-deep .el-collapse-item__header {
  padding-left: 20px;
}

::v-deep .el-collapse {
  border: 0px;
}

.statusBox {
  display: flex;
  align-items: center;
  justify-content: start;
  margin-top: 10px;
}

.online {
  color: green;
  display: inline-block;
  width: 10px;
  height: 10px;
  background: green;
  border-radius: 100%;
  margin-right: 7px;
}

.busy {
  color: rgb(206, 0, 0);
  display: inline-block;
  width: 10px;
  height: 10px;
  background: rgb(206, 0, 0);
  border-radius: 100%;
  margin-right: 7px;
}

.userInfo {
  p {
    border-bottom: 1px solid gainsboro;
    padding: 10px 20px;
  }

  p:hover {
    background-color: azure;
  }
}

.el-dropdown-link {
  padding: 10px 20px;
}

.avatar {
  margin-top: 10px;
}

.name {
  margin-top: 35px;
  margin-left: 10px;
}
</style>
