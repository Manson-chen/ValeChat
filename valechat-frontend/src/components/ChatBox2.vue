<template>
  <div>
    <!-- Avatar and online status -->
    <div class="avatar-container">
      <el-badge is-dot type="success">
        <el-avatar :size="50" :src="circleUrl" />
      </el-badge>

      <div class="user-info">
        <div class="chatname">{{ chatName }}</div>
        <div class="status">Online</div>
      </div>

      <div class="update" v-if="chatType == 'channel'">
        <el-popover placement="bottom" width="160" v-model="update">
          <el-input
            placeholder="Rename.."
            v-model="rename"
            size="mini"
            clearable
          >
          </el-input>
          <div style="text-align: right; margin: 0">
            <el-button size="mini" type="text" @click="update = false"
              >Cancel</el-button
            >
            <el-button type="primary" size="mini" @click="updateChannel()"
              >OK</el-button
            >
          </div>
          <el-button slot="reference">Update</el-button>
        </el-popover>
      </div>

      <el-button v-if="chatType == 'channel'" class="channelMember">
        Channel Members
      </el-button>
    </div>

    <hr />

    <!-- Message area -->
    <div class="message-box">
      <message
        v-for="(item, id) in messages"
        :key="id"
        :mes="item.content"
        :time="item.createTime"
        :senderId="item.senderId"
        :userId="userId"
        :members="members"
        :chatType="chatType"
      />
    </div>

    <!-- Type area -->
    <div
      class="typebox"
      style="
        border: 1px solid;
        border-radius: 5px;
        border-color: darkgray;
        padding: 5px;
        text-align: left;
        width: 99%;
      "
    >
      <at-ta :members="mentionMembers" style="width: 100%">
        <el-input
          v-model="send_message"
          type="textarea"
          :autosize="{ minRows: 1, maxRows: 4 }"
          placeholder="please input text messages ..."
          style="width: 100%"
        ></el-input>
      </at-ta>

      <!-- 其他的输入框上的图标和功能键 -->
      <div class="toolbar" style="margin-bottom: 0px; margin-top: 10px">
        <img
          src="../assets/emoji_icon.png"
          width="22px"
          style="margin-right: 5px"
        />
        <i
          class="el-icon-paperclip"
          @click="showUploader"
          style="font-size: 25px; margin-right: 5px"
        ></i>
        <!-- History Search -->
        <i
          class="el-icon-chat-line-round"
          @click="historyDialog"
          style="font-size: 25px; margin-right: 5px"
        ></i>
        <i
          class="el-icon-s-promotion"
          @click="sendMes"
          style="font-size: 24px; float: right"
        ></i>
        <!-- <el-button
          class="icon-button"
          type="text"
          icon="el-icon-chat-line-round"
          @click="historyDialog"
        /> -->
      </div>

      <div v-show="dialogFileUploader" style="margin-top: 10px">
        <el-upload
          class="upload"
          action="http://localhost:8080/api/message/send"
          list-type="picture-card"
          accept=".png,.jpg,.jpeg,.doc,.docx,.pdf,.ppt,.pptx,.xls,.xlsx,.mp3,.wav,.flac,.aac,.mp4,.avi,.mov,.wmv,.mkv,.zip,.rar,.7z,.txt"
          :on-preview="handlePictureCardPreview"
          :on-remove="handleRemove"
          :on-change="handleChange"
          :auto-upload="false"
          :file-list="fileList"
          multiple
          :limit="10"
          :on-exceed="handleExceed"
          ref="upload"
        >
          <i class="el-icon-plus uploader-icon"></i>
          <div slot="file" slot-scope="{ file }">
            <!-- Image type file 
              need to add a preview button -->
            <div v-if="isImage(file)" class="image-upload">
              <img
                :src="file.url"
                class="el-upload-list__item-thumbnail"
                width="50%"
                height="50%"
              />
              <el-tooltip
                :content="file.name"
                placement="bottom"
                popper-class="tool-tip"
              >
                <span class="el-upload-list__item-actions">
                  <span
                    class="el-upload-list__item-preview"
                    @click="handlePictureCardPreview(file)"
                  >
                    <i class="el-icon-zoom-in"></i>
                  </span>
                  <span
                    class="el-upload-list__item-delete"
                    @click="handleDownload(file)"
                  >
                    <i class="el-icon-download"></i>
                  </span>
                  <span
                    class="el-upload-list__item-delete"
                    @click="handleRemove(file)"
                  >
                    <i class="el-icon-delete"></i>
                  </span>
                </span>
              </el-tooltip>
            </div>
            <!-- For other types of files, 
              there is no need to zoom in, 
              just display the name -->
            <div v-else style="padding-top: 10px">
              <div style="text-align: center">
                <img :src="getPreviwFile(file.name)" width="50%" />
              </div>
              <div
                style="
                  display: inline-block;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  width: 90%;
                  text-align: center;
                  margin-left: 5px;
                "
              >
                <strong> {{ file.name }}</strong>
              </div>
              <el-tooltip
                :content="file.name"
                placement="bottom"
                popper-class="tool-tip"
              >
                <span class="el-upload-list__item-actions">
                  <span
                    class="el-upload-list__item-delete"
                    @click="handleDownload(file)"
                  >
                    <i class="el-icon-download"></i>
                  </span>
                  <span
                    class="el-upload-list__item-delete"
                    @click="handleRemove(file)"
                  >
                    <i class="el-icon-delete"></i>
                  </span>
                </span>
              </el-tooltip>
            </div>
            <!-- unknow文档 -->
            <!-- 等待填写 -->
          </div>
        </el-upload>
      </div>
      <el-dialog :visible.sync="dialogImgVisible">
        <img width="100%" :src="dialogImageUrl" alt="" />
      </el-dialog>
    </div>


    <el-dialog
      :visible.sync="dialogVisible"
      width="30%"
      :before-close="handleClose"
    >
      <el-input
        placeholder="Search"
        prefix-icon="el-icon-search"
        v-model="input2"
        @change="change"
      >
      </el-input>
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="History" name="first">
          <li v-for="(item, index) in mesArr" :key="index">
            {{ item.content }}--{{ item.createTime }}
          </li>
        </el-tab-pane>
        <el-tab-pane label="Documents" name="second">Documents</el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>

<script>
// import data from "emoji-mart-vue-fast/data/all.json";
import "emoji-mart-vue-fast/css/emoji-mart.css";
// import { Picker, EmojiIndex } from "emoji-mart-vue-fast";
import message from "../components/Messages.vue";
import AtTa from "vue-at/dist/vue-at-textarea";

import { getMes } from "@/api/getMes.js";

import {
  connect,
  // stompSend,
  commonSend,
} from "../api/connection";

// let emojiIndex = new EmojiIndex(data);

export default {
  name: "ChatBox",
  props: {
    chatId: {
      // type: Number,
      default: undefined,
    },
    channelId: {
      // type: Number,
      default: undefined,
    },
    userId: {
      // type: Number,
      default: undefined,
    },
  },

  data() {
    return {
      mesArr: [],
      input2: "",
      dialogVisible: false,
      activeName: "first",
      circleUrl:
        "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",
      send_message: "",
      // emojiIndex: emojiIndex,
      emojisOutput: "",
      messages: [],
      chatName: "",
      chatType: "",
      members: [],
      mentionMembers: [],
      update: false,
      rename: "",

      // 模拟数据
      userList: [{ id: 1 }, { id: 2 }],
      channelList: [{ id: 1 }],
      //

      list: [],

      // FileUpload.vue内的data
      fileList: [],
      dialogImageUrl: "",
      dialogImgVisible: false,
      content: "",
      dialogFileUploader: false,
    };
  },

  components: {
    // Picker,
    message,
    AtTa,
  },

  // updated: function () {
  //   // console.log("chatId " + this.chatId)
  //   // console.log("channelId " + this.channelId)
  // },
  methods: {
    // FileUpload.vue内的methods
    showUploader() {
      this.dialogFileUploader = !this.dialogFileUploader;
      // if(this.fileList == undefined || this.fileList.length <= 0) {
      //   console.log("文件列表为空")
      // } else {
      //   console.log("文件列表不为空")
      //   this.dialogFileUploader = true
      // }
    },
    handleExceed() {
      this.$message.warning("One-time limit of 10 files uploaded. Exceed now!");
    },
    // 判断上传的文件是否是image，从而分开image文件和其他文档类型文件的显示样式
    isImage(file) {
      const type = file.name.substring(file.name.lastIndexOf(".") + 1);
      return type === "jpg" || type === "png" || type === "jpeg";
    },
    handleChange(file, fileList) {
      // 将文件传入数组fileList
      this.fileList = fileList;
      // 设置文件上传限制条件
      // 首先获取文件的信息，包括uid,name和size
      const { uid, name, size } = file;
      //   单个文件大小限制
      if (size > 1024 * 1024 * 50) {
        this.$message.warning("The file size cannot exceed 50 MB");
        const selectFileList = this.fileList.filter((item) => {
          return item.uid != uid;
        });
        this.fileList = selectFileList;
        return;
      }
      // 文件重名限制
      // 获取findCommonNameIndex时获取到的值不正确
      // 应该是没有相同名字的文件findCommonNameIndex = -1，有则为0
      // 换用和findLastIndex进行判断
      const findCommonNameIndex = this.fileList.findIndex(
        (item) => item.name == name
      );
      if (
        findCommonNameIndex !==
        this.fileList.findLastIndex((f) => f.name === name)
      ) {
        this.$message.warning("Cannot upload a file with the same name");
        const selectFileList = this.fileList.filter((item) => {
          return item.uid != uid;
        });
        this.fileList = selectFileList;
        return;
      }
      // 文件类型限制
      const fileTypeFlag =
        /^.png|.jpg|.jpeg|.doc|.docx|.pdf|.ppt|.pptx|.xls|.xlsx|.mp3|.wav|.flac|.aac|.mp4|.avi|.mov|.wmv|.mkv|.zip|.rar|.7z|.txt$/.test(
          name.substring(name.lastIndexOf(".")).toLowerCase()
        );
      if (!fileTypeFlag) {
        this.$message.warning("Wrong file type");
        const selectFileList = this.fileList.filter((item) => {
          return item.uid != uid;
        });
        this.fileList = selectFileList;
        return;
      }
      // 测试不符合要求的文件是否被添加到fileList中
      console.log(fileList);
    },
    handleRemove(file) {
      const fileList = this.$refs.upload.fileList;
      for (let i in fileList) {
        if (file.url === fileList[i].url) {
          fileList.splice(i, 1);
        }
      }
      console.log("Current file list", this.fileList);
    },
    // 下载文件
    handleDownload(file) {
      const { url, name } = file;
      let downloadLink = document.createElement("a");
      downloadLink.href = url;
      downloadLink.download = name;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    },
    handlePictureCardPreview(file) {
      //判断如果文件是图片，显示预览图
      this.dialogImageUrl = file.url;
      this.dialogImgVisible = true;
    },
    getFileUrl(icon) {
      return require(`../assets/fileIcon/${icon}`);
    },
    getPreviwFile(filename) {
      filename = filename
        .substring(filename.lastIndexOf("."))
        .toLowerCase()
        .split(".")[1];
      const imageObject = {
        // 图片文件
        png: "image-icon.png",
        jpg: "image-icon.png",
        jpeg: "image-icon.png",
        // word文件
        doc: "word-icon.png",
        docx: "word-icon.png",
        // pdf文件
        pdf: "pdf-icon.png",
        // ppt文件
        ppt: "ppt-icon.png",
        pptx: "ppt-icon.png",
        // excel文件
        xls: "excel-icon.png",
        xlsx: "excel-icon.png",
        // 音频文件
        mp3: "audio-icon.png",
        wav: "audio-icon.png",
        flac: "audio-icon.png",
        aac: "audio-icon.png",
        // 视频文件
        mp4: "video-icon.png",
        avi: "video-icon.png",
        mov: "video-icon.png",
        wmv: "video-icon.png",
        mkv: "video-icon.png",
        // 压缩文件
        zip: "zip-icon.png",
        "7z": "zip-icon.png",
        rar: "zip-icon.png",
        // txt文件
        txt: "txt-icon.png",
      };
      return this.getFileUrl(imageObject[filename]);
    },

    change() {
      this.getMesChange();
    },
    getMesChange() {
      let chatType = null;
      // let channelId = null
      if (this.chatType == "channel") {
        chatType = 1;
      } else {
        chatType = 0;
      }
      getMes({
        chatId: this.chatType == "channel" ? this.channelId : this.chatId,
        currentUserId: this.userId,
        chatType: chatType,
        workspaceId: 1,
        searchWord: this.input2,
      })
        .then((res) => {
          console.log(res.data.data, 158);
          this.mesArr = res.data.data;

          // localStorage.setItem('infoMes', JSON.stringify(this.ruleForm))
        })
        .catch((err) => {
          console.log(err);
        });
    },
    historyDialog() {
      this.dialogVisible = true;
    },
    handleClose() {
      this.dialogVisible = false;
      this.input2 = "";
      this.mesArr = [];
    },
    handleClick(tab, event) {
      console.log(tab, event);
    },
    // 这个函数是不是放在homepage里把name作为参数传过来好一点？ - do it later
    loadName() {
      const chatList = JSON.parse(sessionStorage.getItem("CurUserList"));
      if (!isNaN(this.chatId)) {
        console.log(chatList.userList);
        chatList.userList.forEach((user) => {
          if (this.chatId == user.id) {
            this.chatName = user.userName;
          }
        });
      }
      if (!isNaN(this.channelId)) {
        console.log(chatList.channelList, 158);
        chatList.channelList.forEach((channel) => {
          if (this.channelId == channel.id) {
            this.chatName = channel.channelName;
          }
        });
      }
      console.log("chatName");
      console.log(this.chatName);
      console.log(this.chatId, this.channelId, this.userId, 167);
    },

    updateType() {
      if (isNaN(this.chatId)) {
        this.chatType = "channel";
      } else {
        this.chatType = "private";
        console.log(this.chatType, 175);
      }
    },

    updateChannel() {
      this.$http
        .post("http://localhost:8080/api/channel/UpdateChannel", {
          channelName: this.rename,
          id: this.channelId,
          workspaceId: "1",
        })
        .then((res1) => {
          console.log(res1);
          this.update = false;
        });
    },

    //load message function

    loadPrivateMes() {
      this.send_message = "";
      this.fileList = [];
      this.messages = [];
      const params = [this.chatId, this.userId];
      let resId, sendId;
      for (var i in params) {
        resId = i == 0 ? params[i] : params[1];
        sendId = i == 0 ? params[1] : params[0];
        this.$http
          .post("http://localhost:8080/api/private/history", {
            receiverId: resId,
            senderId: sendId,
            workspaceId: 1,
          })
          .then((res) => {
            const mes = res.data.data;
            if (res.data.code == 200) {
              for (var i in mes) {
                this.messages.push(mes[i]);
              }
            } else {
              alert("获取数据失败");
            }
          })
          .then(() => {
            this.sortMes();
          });
      }
      console.log(this.messages);
    },

    loadChannelMes() {
      // 切换频道和不同的私聊后，输入框内的内容清空
      this.send_message = "";
      this.fileList = [];
      // ---------------------------------------
      this.messages = [];
      this.$http
        .post("http://localhost:8080/api/history/channel", {
          channelId: this.channelId,
          senderId: this.userId,
          workspaceId: 1,
        })
        .then((res) => {
          const mes = res.data.data;
          if (res.data.code == 200) {
            for (var i in mes) {
              this.messages.push(mes[i]);
            }
          } else {
            console.log("error");
            console.log(res.data);
          }
        })
        .then(() => {
          this.sortMes();
        })
        .then(() => {
          console.log("after sorting ");
          console.log(this.messages);
        });
      console.log(this.messages);
    },

    loadChannelMembers() {
      // 后续可能会删除这一行
      this.send_message = "";
      this.fileList = [];
      // ------------------
      this.members = [];
      this.mentionMembers = [];
      this.$http
        .post("http://localhost:8080/api/userchannel/commonuser", {
          channelId: this.channelId,
        })
        .then((res) => res.data)
        .then((res) => {
          for (let i = 0; i < res.data.length; i++) {
            this.members.push(res.data[i]);
            this.mentionMembers.push(res.data[i].userName);
          }
          console.log("chatbox members: ", this.members);
          // this.list = res.data;
          // console.log(this.list);
        });
    },

    sortMes() {
      console.log("in sort: ");
      console.log(this.messages[0]);
      this.messages.sort(function (a, b) {
        console.log("sorting...");
        return a.id - b.id;
      });
    },

    sendMes() {
      // stompSend(this)
      commonSend(this);
      this.send_message = "";
      this.fileList = [];
    },
  },

  created: function () {
    connect(this);
  },

  watch: {
    // 在路由从private变到channel的时候，chatId和channelId会同时变化，从而两个watch函数都会调用一次
    chatId() {
      if (!isNaN(this.chatId)) {
        this.loadName();
        this.updateType();
        this.loadPrivateMes();
        this.$forceUpdate();
      }
    },

    channelId() {
      if (!isNaN(this.channelId)) {
        this.loadName();
        this.updateType();
        this.loadChannelMes();
        this.$forceUpdate();
        this.loadChannelMembers();
      }
    },
  },
};
</script>

<style scoped>
.avatar-container {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  flex-direction: column;
  margin-left: 10px;
}

.chatname {
  font-size: 20px;
}

.status {
  font-size: 12px;
}

.message-box {
  /* width: 100px; */
  /* min-height: 600px;
  max-height: 680px; */
  height: 680px;
  margin: 10px;
  padding: 5px;
  overflow: auto;
}

.typebox {
  background-color: gainsboro;
  /* display: flex; */
}

.textarea {
  margin: 5px;
  padding: 5px;
  max-width: 1200px;
}

.update {
  position: absolute;
  right: 220px;
}

.channelMember {
  position: absolute;
  right: 50px;
}

.icon-button {
  font-size: 20px;
  margin: 5px;
}

/* FileUpload.vue内的style */
.upload {
  margin-top: 10px;
  width: 100%;
  /* width: 1180px; */
  height: 100%;
  /* border: 1px dashed #ff0000; */
  /* border-radius: 4px; */
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
}

::v-deep .el-upload-list--picture-card {
  /* margin: 0; */
  display: flex;
  float: left;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: flex-start;
  /* vertical-align: top;
    flex-wrap:wrap;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start; */
}

::v-deep .el-upload-list--picture-card .el-upload-list__item {
  width: 100px;
  height: 100px;
  font-size: 8px;
}

::v-deep .el-upload--picture-card {
  width: 100px;
  height: 100px;
  line-height: 100px;
  /* border: none; */
  float: left;
}

::v-deep .uploader-icon {
  color: black;
  /* float: left; */
}

::v-deep .el-upload-list__item-thumbnail {
  object-fit: cover;
}

::v-deep .image-upload {
  height: 100px;
}
</style>

<style>
.tool-tip {
  max-width: 150px;
  text-align: center;
}
</style>
