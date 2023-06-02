<template>
  <div>
    <div class="sendername" v-if="showSender">
      <el-avatar :src="senderAvatar" size="medium"> </el-avatar>
      <span>{{ senderName }}</span>
    </div>
    <div :class="messageStyle">
      <div class="message">
        <!-- files -->
        <div
          v-for="file in this.files"
          :key="file.id"
          style="background-color: transparent"
        >
          <!-- doc and unknow files -->
          <div
            class="file-item"
            v-if="file.numFileType == 0 || file.numFileType == 4"
            style="background-color: white"
          >
            <img :src="getIconUrl(file)" class="file-icon" />
            <p class="file-name">{{ file.fileName }}</p>
            <el-button
              class="file-download-btn"
              type="text"
              icon="el-icon-download"
              @click="downloadFile(file)"
            />
          </div>

          <img
            class="imgFile"
            v-if="file.numFileType == 1"
            width="100%"
            height="100%"
            :src="file.fileUrl"
            @click="handlePictureCardPreview(file.fileUrl)"
          />

          <audio v-if="file.numFileType == 2" controls :src="file.fileUrl" />

          <video
            v-if="file.numFileType == 3"
            width="320"
            height="240"
            controls
            :src="file.fileUrl"
          />
        </div>

        <!-- text -->
        <p class="message-text">{{ mes }}</p>
        <!-- send time -->
        <span class="message-time">{{ time.slice(11, 16) }}</span>
      </div>
    </div>

    <!-- show image dialog -->
    <el-dialog :visible.sync="dialogImgVisible">
      <img width="100%" :src="dialogImageUrl" alt="" />
    </el-dialog>
  </div>
</template>

<script>
import { imageObject } from "../../api/getMes";

const docTypes = ["pdf", "ppt", "pptx", "txt", "doc", "docx", "xls", "xlsx"];
const zipTypes = ["zip", "7z", "rar"];
const imageTypes = ["png", "jpg", "jpeg"];
const audioTypes = ["mp3", "wav", "flac", "aac", "mpeg"];
const videoTypes = ["mp4", "avi", "mov", "wmv", "mkv"];
export default {
  name: "message",

  data() {
    return {
      files: [],
      dialogImgVisible: false,
      imageObject: imageObject,
      allOrgs: JSON.parse(sessionStorage.getItem("orgList")),
    };
  },

  props: {
    mes: {
      type: String,
      default: "",
    },
    mesFile: {
      type: Array,
    },
    time: {
      type: String,
      default: "0:00 AM",
    },
    userId: {
      type: Number,
      default: null,
    },
    senderId: {
      type: Number,
      default: null,
    },
    members: {
      type: Array,
    },
    organizationMembers: {
      type: Array,
    },
    chatType: {
      type: String,
      default: "private",
    },
  },

  methods: {
    handlePictureCardPreview(url) {
      this.dialogImageUrl = url;
      this.dialogImgVisible = true;
    },

    getIconUrl(file) {
      const type = file.fileType.split("/")[1].toLowerCase();
      let iconUrl = "";

      if (file.numFileType == 4) {
        iconUrl = require("../../assets/fileIcon/unknow-icon.png");
      } else {
        const iconName = imageObject[type];
        iconUrl = require("../../assets/fileIcon/" + iconName);
      }

      return iconUrl;
    },

    downloadFile(file) {
      window.open(file.fileUrl, "_blank");
    },
  },

  computed: {
    messageStyle() {
      return this.senderId === this.userId
        ? "message-from-me"
        : "message-from-others";
    },

    showSender() {
      return this.userId != this.senderId && this.chatType == "channel";
    },

    senderName() {
      for (let i = 0; i < this.members.length; i++) {
        if (this.members[i].id == this.senderId) {
          return this.members[i].userName;
        }
      }
      for (let i = 0; i < this.organizationMembers.length; i++) {
        if (this.organizationMembers[i].id == this.senderId) {
          for (let k = 0; k < this.allOrgs.length; k++) {
            if (this.organizationMembers[i].organizationId == this.allOrgs[k].id) {
              return this.allOrgs[k].organizationName + " (" + this.organizationMembers[i].userName + ")";
            }
          }
        }
      }
      return "";
    },

    senderAvatar() {
      for (let i = 0; i < this.members.length; i++) {
        if (this.members[i].id == this.senderId) {
          return this.members[i].userAvatar;
        }
      }
      for (let i = 0; i < this.organizationMembers.length; i++) {
        if (this.organizationMembers[i].id == this.senderId) {
          for (let k = 0; k < this.allOrgs.length; k++) {
            if (this.organizationMembers[i].organizationId == this.allOrgs[k].id) {
              return this.organizationMembers[i].userAvatar;
            }
          }
        }
      }
      return "";
    },
  },

  mounted() {
    // File type 0-doc 1-image 2-audio 3-video 4-unknow
    if (this.mesFile != []) {
      this.files = this.mesFile.map((file) => {
        const type = file.fileType.split("/")[1].toLowerCase();
        console.log("in mapping file: ");
        console.log("type: ", type);
        if (docTypes.includes(type) || zipTypes.includes(type)) {
          return { ...file, numFileType: 0 };
        } else if (imageTypes.includes(type)) {
          return { ...file, numFileType: 1 };
        } else if (audioTypes.includes(type)) {
          return { ...file, numFileType: 2 };
        } else if (videoTypes.includes(type)) {
          return { ...file, numFileType: 3 };
        } else {
          return { ...file, numFileType: 4 };
        }
      });
      console.log("after mapping: ");
      console.log("Files: ", this.files);
    }
  },
};
</script>

<style scoped>
.sendername {
  display: flex;
  align-items: center;
  margin-top: 5px;
}
.sendername span {
  margin-left: 5px;
}

.message-from-me {
  text-align: left;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  margin-top: 10px;
}

.message-from-me div {
  /* background-color:palegreen; */
  background-color: #83e86476;
}

.message-from-others {
  text-align: left;
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  margin-top: 10px;
}

.message-from-others div {
  background-color: #ddd;
}

.message {
  padding: 10px;
  border-radius: 10px; /* make Rounded Rectangle */
  max-width: 70%;
  word-wrap: break-word;
}

.message-text {
  margin: 0;
  font-size: 16px;
  white-space: pre-wrap;
}

.message-time {
  font-size: 12px;
  color: #999;
  /* margin-left: 10px; */
}

/* file items */

.imgFile {
  cursor: pointer;
  height: auto;
  max-width: 500px;
  max-height: 300px;
}

.file-item {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 5px;
  margin-bottom: 10px;
}

.file-icon {
  width: 40px;
  height: 40px;
  margin-right: 10px;
}

.file-name {
  flex: 1;
  margin-right: 10px;
}

.file-download-btn {
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
}
</style>
