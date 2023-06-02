<template>
  <!-- 其他的输入框上的图标和功能键 -->
  <div style="margin-top: 10px">
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
        <!-- 图片类型文件，需要添加预览按钮 -->
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
        <!-- 其他类型文件，无需放大，显示名字即可 -->
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
    <el-dialog :visible.sync="dialogImgVisible">
      <img width="100%" :src="dialogImageUrl" alt="" />
    </el-dialog>
  </div>
</template>
  
<script>
import { imageObject } from "@/api/getMes";
import {eventBus} from "../../api/eventBus";

export default {
  props: {
    files: {
      type: Array,
      default: () => [],
    },
  },

  mounted: function () {
    this.fileList = [...this.files];
  },

  data() {
    return {
      fileList: [],
      dialogImageUrl: "",
      dialogImgVisible: false,
      content: "",
      imageObject: imageObject,
    };
  },
  methods: {
    handleExceed() {
      this.$message.warning("One-time limit of 10 files uploaded. Exceed now!");
    },
    // 判断上传的文件是否是image，从而分开image文件和其他文档类型文件的显示样式
    isImage(file) {
      const type = file.name.substring(file.name.lastIndexOf(".") + 1).toLowerCase();
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
      return require(`../../assets/fileIcon/${icon}`);
    },
    getPreviwFile(filename) {
      filename = filename
        .substring(filename.lastIndexOf("."))
        .toLowerCase()
        .split(".")[1];
      return this.getFileUrl(this.imageObject[filename]);
    },
  },

  created: function () {
  // connect(this);
  eventBus.$on('clear-fileUpload', () => {
    this.fileList = []
  });
  },

  watch: {
    fileList() {
      this.$emit("file-list-update", this.fileList);
    },
  },
};
</script>
  
  <style scoped>
.upload {
  margin-top: 10px;
  width: 100%;
  height: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
}

::v-deep .el-upload-list--picture-card {
  display: flex;
  float: left;
  flex-direction: row;
  flex-wrap: nowrap;
  justify-content: flex-start;
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