<template>
  <div>
    <!-- eslint-disable-next-line -->
    <el-dialog :visible.sync="dialogOpen" width="50%" :before-close="handleClose">
      <el-input placeholder="Search" prefix-icon="el-icon-search" v-model="searchWord" @input="change">
      </el-input>
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="History" name="first">
          <div v-infinite-scroll="loadMoreMes" infinite-scroll-disabled="loadingMes" infinite-scroll-distance="10"
            style="height: 300px; overflow-y: auto;">
            <div v-for="(item, index) in mesArr" :key="index">
              <div class="messInfo" style="width: 100%; display: flex; align-items: center">
                <div style="float: left; width: 50%; margin-left: 10px">
                  <p style="font-weight: bold">Sender: {{ item.senderName }}</p>
                  <p style="width: 100%">Message: {{ item.content }}</p>
                </div>
                <div style="
                  margin-left: 150px;
                  margin-top: 35px;
                  color: darkgray;
                  font-size: 13px;
                ">
                  {{ item.createTime }}
                </div>
              </div>
              <hr />
            </div>
          </div>
          <div v-if="loadingMes" class="loadingMes">
            <i class="el-icon-loading" />
          </div>
        </el-tab-pane>
        <el-tab-pane label="Documents" name="second">
          <div v-infinite-scroll="loadMoreFile" infinite-scroll-disabled="loadingFile" infinite-scroll-distance="10"
            style="height: 300px; overflow-y: auto;">
            <div v-for="(item, index) in chatFileVisible" :key="index">
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
          <div v-if="loadingFile" class="loadingFile">
            <i class="el-icon-loading" />
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-dialog>
  </div>
</template>

<script>
import { getMes, getChatFileHis, imageObject } from "@/api/getMes.js";

export default {
  names: "historySearch",
  props: {
    dialogOpen: {
      type: Boolean,
      default: false,
    },
    chatType: {
      type: String,
      default: "",
    },
    channelId: {
      default: undefined,
    },
    chatId: {
      default: undefined,
    },
    userId: {
      default: undefined,
    },
    workspaceId: {
      default: undefined,
    }, 
  },
  data() {
    return {
      mesArr: [],
      chatFile: [],

      messArrVisible: [],
      chatFileVisible: [],
      linesToShow: 4,
      loadingMes: false,
      loadingFile: false,

      searchWord: "",
      activeName: "first",
      imageObject: imageObject,
    };
  },
  // mounted() {
  //   this.loadMore()
  // },
  methods: {
    async loadMoreMes() {
      if (this.loadingMes) {
        return
      }
      this.loadingMes = true
      // 模拟异步加载数据
      await new Promise(resolve => setTimeout(resolve, 800))
      const startIndex = this.messArrVisible.length
      const endIndex = startIndex + 2
      const newItems = this.mesArr.slice(startIndex, endIndex)
      this.messArrVisible = [...this.messArrVisible, ...newItems]
      this.loadingMes = false
    },

    async loadMoreFile() {
      if (this.loadingFile) {
        return
      }
      this.loadingFile = true
      // 模拟异步加载数据
      await new Promise(resolve => setTimeout(resolve, 800))
      const startIndex = this.chatFileVisible.length
      const endIndex = startIndex + 2
      const newItems = this.chatFile.slice(startIndex, endIndex)
      this.chatFileVisible = [...this.chatFileVisible, ...newItems]
      this.loadingFile = false
    },

    handleClose() {
      //   this.dialogOpen = false;
      this.searchWord = "";
      this.mesArr = [];
      this.chatFile = [];
      this.chatFileVisible = [];
      this.activeName = "first";
      this.$emit("update:dialogOpen", false);
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
      // Search message history
      if (this.activeName == "first") {
        getMes({
          chatId: this.chatType == "channel" ? this.channelId : this.chatId,
          currentUserId: this.userId,
          chatType: chatType,
          workspaceId: this.workspaceId,
          searchWord: this.searchWord,
          current:1,
          pageSize:100000,
        })
          .then((res) => {
            console.log("text message history " + res.data.data);
            this.mesArr = res.data.data;
            this.messArrVisible = this.mesArr.slice(0, this.linesToShow)
            // localStorage.setItem('infoMes', JSON.stringify(this.ruleForm))
          })
          .catch((err) => {
            console.log(err);
          });
      }
      // Search file history
      if (this.activeName == "second") {
        getChatFileHis({
          current: 1,
          pageSize: 10000,
          chatType: chatType,
          fileName: this.searchWord,
          receiverId: this.chatType == "channel" ? this.channelId : this.chatId,
          senderId: this.userId,
          workspaceId: this.workspaceId,
        })
          .then((res) => {
            console.log(res.data.data);
            this.chatFile = res.data.data.records;
            this.chatFileVisible = this.chatFile.slice(0, this.linesToShow)
          })
          .catch((err) => {
            console.log(err);
          });
      }
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
      this.searchWord = "";
      this.mesArr = [];
      this.chatFile = [];
      this.chatFileVisible = [];
      console.log(tab, event);
    },
  },
};
</script>

<style lang="scss" scoped></style>