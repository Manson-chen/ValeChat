<template>
  <div class="chatbox">
    <!-- Avatar and online status -->
    <div class="avatar-container">
      <div v-if="channelType != 0" class="user-avatar">
        <el-avatar :size="50" :src="chatAvatar"/>
      </div>

      <div v-else class="user-avatar"># </div>

      <div class="user-info">
        <div class="chatname">{{ chatName }}</div>
      </div>

      <!-- channel update -->
      <div class="update" v-if="channelType == 0">
        <el-popover placement="bottom" width="160" v-model="update">
          <el-input placeholder="Rename.." v-model="rename" size="mini" clearable>
          </el-input>
          <div style="text-align: right; margin: 0">
            <el-button size="mini" type="text" @click="update = false">Cancel</el-button>
            <el-button type="primary" size="mini" @click="updateChannel()">OK</el-button>
          </div>
          <el-button slot="reference">Update</el-button>
        </el-popover>
      </div>

      <!-- channel members -->
      <div class="channelMember" v-if="channelType == 0">
        <el-button @click="editChannelMember = true">Channel Members</el-button>

        <el-dialog title="Channel Members" :visible.sync="editChannelMember" :model="channelMember">
          <div style="text-align: right; margin-down: 10px">
            <el-input v-model="channelMember.searchMember" clearable size="mini" style="width: 25%"
              placeholder="Search members.." />

            <!-- add members -->
            <span class="addNew" @click="addMembersFunction()"
              style="cursor: pointer; margin-left: 10px; margin-right: 10px">
              <el-button type="primary" icon="el-icon-user" size="mini">Add
              </el-button>
            </span>
          </div>
          <el-dialog title="Add Members" :visible.sync="dialog" width="800px" :close-on-click-modal="false"
            :append-to-body="true" @close="closeDialog" custom-class="dialog" ref="dialog" destroy-on-close>
            <div class="dialog__content">
              <el-form :model="addMembers" ref="addMembers" :rules="rules">
                <el-form-item label="Select Members" prop="members">
                  <div class="select">
                    <div style="text-align: center">
                      <template>
                        <el-select v-model="addMembers.members" style="display: block; width: 100%" filterable multiple
                          :autosize="{ minRows: 2, maxRows: 4 }" placeholder="Search by name.." popper-class="eloption"
                          :popper-append-to-body="true" :no-data-text="'No more users'">
                          <div
                            v-if="this.remainingMembers != undefined && this.remainingMembers != null && this.remainingMembers.length > 0"
                            style="color:grey; margin: 10px 20px 10px">Users</div>
                          <el-option v-for="item in this.remainingMembers" :key="item.id" :label="item.userName"
                            :value="item.id">
                            <div class="block" style="float: left">
                              <el-avatar :size="30" :src="item.userAvatar"></el-avatar>
                            </div>
                            &nbsp;&nbsp;{{ item.userName }}
                            {{ " (" + item.email + ")" }}
                          </el-option>
                          <div
                            v-if="this.remainingOrgs != undefined && this.remainingOrgs != null && this.remainingOrgs.length > 0"
                            style="color:grey; margin: 20px 20px 10px">Organizations</div>
                          <el-option v-for="item in this.remainingOrgs" :key="item.id + 100000"
                            :label="item.organizationName" :value="item.id + 100000">
                            <div class="block" style="float: left">
                              <el-avatar :size="30" :src="item.organizationAvatar"></el-avatar>
                            </div>
                            &nbsp;&nbsp;{{ item.organizationName }}
                            {{ " (" + item.email + ")" }}
                          </el-option>
                        </el-select>
                      </template>
                    </div>
                  </div>
                </el-form-item>
              </el-form>
            </div>
            <div class="dialog__footer">
              <el-button size="small" @click="resetForm('addMembers')">Reset</el-button>
              <el-button size="small" type="primary" @click="submitForm('addMembers')">Submit</el-button>
            </div>
          </el-dialog>

          <!-- display members -->
          <el-table height="220"
            :data="this.members.filter((data) =>
              !channelMember.searchMember || data.userName.toLowerCase().includes(channelMember.searchMember.toLowerCase()))"
            :cell-style="{ 'vertical-align': 'middle' }" empty-text="No such member">
            <el-table-column prop="members" width="35" :key="id">
              <template slot-scope="scope">
                <div class="list-img">
                  <el-avatar :size="25" :src="scope.row.userAvatar"></el-avatar>
                </div>
              </template>
            </el-table-column>
            <el-table-column property="userName" label="Members" width="215" :key="id"></el-table-column>
            <el-table-column property="email" label="Email" width="250" :key="id"
              v-if="this.masterId == this.curUserId"></el-table-column>
            <el-table-column property="email" label="Email" :key="id" v-else></el-table-column>
            <el-table-column align="right" :key="id" v-if="this.masterId == this.curUserId">
              <template slot-scope="scope">
                <el-button size="mini" type="danger" :disabled="scope.row.id == curUserId"
                  @click="handleDelete(scope.$index, scope.row)">Remove</el-button>
              </template>
            </el-table-column>
          </el-table>
          <el-table height="220"
            :data="this.organizations.filter((data) =>
              !channelMember.searchMember || data.organizationName.toLowerCase().includes(channelMember.searchMember.toLowerCase()))"
            :cell-style="{ 'vertical-align': 'middle' }" empty-text="No such organization">
            <el-table-column prop="organizations" width="35" :key="id">
              <template slot-scope="scope">
                <div class="list-img">
                  <el-avatar :size="25" :src="scope.row.organizationAvatar"></el-avatar>
                </div>
              </template>
            </el-table-column>
            <el-table-column property="organizationName" label="Organizations" width="215" :key="id"></el-table-column>
            <el-table-column property="email" label="Email" width="250" :key="id"
              v-if="this.masterId == this.curUserId"></el-table-column>
            <el-table-column property="email" label="Email" :key="id" v-else></el-table-column>
            <el-table-column align="right" :key="id" v-if="this.masterId == this.curUserId">
              <template slot-scope="scope">
                <el-button size="mini" type="danger" @click="handleDelete(scope.$index, scope.row)">Remove</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-dialog>
      </div>
      <!-- end of channel members -->
    </div>

    <hr />

    <!-- Message area -->
    <div class="message-box" :style="{ backgroundColor: bgColor }">
      <message v-for="(item, id) in messages" :key="id" :mes="item.content" :time="item.createTime"
        :senderId="item.senderId" :userId="userId" :members="members" :organizationMembers="organizationMembers"
        :chatType="chatType" :mesFile="item.visibleFileList" />
    </div>

    <!-- buttons -->
    <div>

      <!--      <div>-->
      <!--        <div id="calendly-container"></div>-->
      <!--      </div>-->

      <!--      <button @click="openCalendly">Open Calendly1</button>-->


      <!-- Emoji picker with popover -->
      <el-popover placement="top-start" trigger="click">
        <Picker :data="emojiIndex" @select="selectEmoji" emoji="thumbsup" title="Choose a Emoji" v-show="true" />
        <el-button class="icon-button" type="text" slot="reference">
          <font-awesome-icon icon="fa-regular fa-face-smile" size="sm" />
        </el-button>
      </el-popover>


      <!-- Attachment icon -->
      <el-button class="icon-button" type="text" icon="el-icon-paperclip" @click="showUploader" />

      <!-- History Search -->
      <el-button class="icon-button" type="text" icon="el-icon-chat-line-round" @click="openHistoryDialog" />

      <el-button class="icon-button" type="text" icon="el-icon-date" @click="openCaledlyWidget" />

      <historySearch :dialogOpen.sync="showHistory" :chatType="this.chatType" :channelId="this.channelId"
        :chatId="this.chatId" :userId="this.userId" :workspaceId="this.workspaceId"></historySearch>

      <calendly-widget :dialogOpen.sync="isCalendlyVisible" :calendly-url="calendlyUrl">
      </calendly-widget>
    </div>
    <!-- end of buttons -->



    <div class="typebox">
      <!-- Input box -->
      <!-- 设置v-if，用来判断是否是群聊，从而选择是否显示@功能 -->
      <div style="width:100%;display: flex;">
        <at-ta :members="mentionMembers" style="width: 100%" name-key="userName" @insert="getValue"
          :filter-match="filterMatch" :deleteMatch="deleteMatch" v-if="!isNaN(this.channelId)">
          <el-input class="textarea" type="textarea" placeholder="Type a message" v-model="send_message"
            :autosize="{ minRows: 1, maxRows: 4 }" />
        </at-ta>

        <el-input v-else class="textarea" type="textarea" placeholder="Type a message" v-model="send_message"
          :autosize="{ minRows: 1, maxRows: 4 }" />

        <el-button class="icon-button" @click="sendMes" type="text" icon="el-icon-s-promotion" />
        <div style="position:relative;display: flex;">
          <img style="position: absolute;top: -70px; left: -70px ; width: 90px;"
            src="https://wimg.588ku.com/gif620/20/08/15/51550dae9db539c646a67ae75469c917.gif" v-show="DuringRecording"
            alt="">
          <el-button class="icon-button" type="text" v-if="isStart" @click="startRecorder" icon="el-icon-microphone" />
          <el-button class="icon-button" type="text" v-else @click="stopRecorder" icon="el-icon-microphone" />
        </div>
      </div>
      <div style="width: 100%;">
        <div style="display: flex;align-items:center;" v-show="tempAudio">
          <audio src="" ref="Myduaio" controls></audio>
          <i class="el-icon-delete" @click="canelRecorder"></i>
        </div>
      </div>

    </div>
    <!-- upload area -->
    <uploader @file-list-update="fileListUpdate" v-show="dialogFileUploader" />
  </div>
</template>

<script>
import data from "emoji-mart-vue-fast/data/all.json";
import "emoji-mart-vue-fast/css/emoji-mart.css";
import { Picker, EmojiIndex } from "emoji-mart-vue-fast";
import message from "../components/ChatBox/Messages.vue";
import AtTa from "vue-at/dist/vue-at-textarea";
import uploader from "./ChatBox/FileUpload.vue";
import util from "../util/util";
import historySearch from "./ChatBox/historySearch.vue";
import CalendlyWidget from "../components/CalendlyWidget.vue";
import { eventBus } from "../api/eventBus";

import {
  // connect,
  // stompSend,
  commonSend,
} from "../api/connection";

let emojiIndex = new EmojiIndex(data);
import Recorder from "js-audio-recorder";
var lamejs = require("lamejs");
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
    workspaceId: {
      default: undefined,
    },
  },

  data() {
    return {
      recorder: null,
      DuringRecording: false,
      tempAudio: false,
      isStart: true,
      // for search function
      showHistory: false,
      // user avatar
      circleUrl:
        "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png",

      // mes and emoji
      send_message: "",
      emojiIndex: emojiIndex,
      messages: [],
      chatName: "",
      chatAvatar: "",
      chatType: "",
      channelType: "",
      userList: [],
      channelList: [],
      fileList: [],

      // members
      members: [],
      mentionMembers: [],
      update: false,
      editChannelMember: false,
      rename: "",
      channelMember: {
        searchMember: "",
      },

      // file and upload
      dialogFileUploader: false,
      isCalendlyVisible: false,
      // add members
      dialog: false,
      addMembers: {
        members: [],
      },
      rules: {
        members: [
          {
            required: true,
            message: "Please select members!",
            trigger: "change",
          },
        ],
      },
      allUsers: [],
      allOrgs: [],
      remainingMembers: [],
      remainingOrgs: [],
      addUsers: [],
      addOrgs: [],
      masterId: "",
      curUserId: JSON.parse(sessionStorage.getItem("CurUser")).id,

      calendlyUrl: 'https://calendly.com/d/ytd-3ng-7vr/30min',

      // 传递在群聊中被@的用户id，id被存储在数组contactIdList[]中
      contactList: [],
      contactIdList: [],
    };
  },

  components: {
    Picker,
    message,
    AtTa,
    uploader,
    historySearch,
    CalendlyWidget,
  },

  // updated: function () {
  //   // console.log("chatId " + this.chatId)
  //   // console.log("channelId " + this.channelId)
  // },
  methods: {
    // 过滤联系人
    filterMatch(name, chunk) {
      return name.toLowerCase().indexOf(chunk.toLowerCase()) === 0;
    },
    // 删除联系人
    deleteMatch(name, chunk, suffix) {
      this.contactList = this.contactList.filter(
        item => item.userName !== chunk.trim()
      );
      this.contactIdList = this.contactList.map(
        item => item.id
      );
      console.log("contactIdListUpdate: ", this.contactIdList);
      return chunk === name + suffix;
    },
    getValue(val) {
      if (!this.contactList.includes(val)) {
        this.contactList.push(val);
        this.contactIdList.push(val.id);
      }
      console.log("contactIdList: ", this.contactIdList);
    },
    showUploader() {
      this.dialogFileUploader = !this.dialogFileUploader;
    },

    // openCalendly() {
    //   const containerElement = document.getElementById('calendly-container');
    //   if (containerElement && window.Calendly) {
    //     const options = {
    //       url: 'https://calendly.com/d/ytd-3ng-7vr/30min',
    //       prefill: {
    //         name: 'John Doe',
    //         email: 'johndoe@example.com',
    //       },
    //     };
    //   // Open Calendly widget
    //    window.Calendly.initInlineWidget(options);
    //   }
    // },

    // 搜索历史记录
    openHistoryDialog() {
      this.showHistory = true;
    },

    openCaledlyWidget() {
      this.isCalendlyVisible = !this.isCalendlyVisible;
      // console.log(this.showHistory);
    },

    // 这个函数是不是放在homepage里把name作为参数传过来好一点？ - do it later
    loadName() {
      const chatList = JSON.parse(sessionStorage.getItem("CurUserList"));
      if (!isNaN(this.chatId)) {
        console.log(chatList.userList);
        chatList.userList.forEach((user) => {
          if (this.chatId == user.id) {
            this.chatName = user.userName;
            this.chatAvatar = user.userAvatar;
            this.chatType = "private";
            this.channelType = null;
          }
        });
      }
      if (!isNaN(this.channelId)) {
        console.log(chatList.channelList, 158);
        chatList.channelList.forEach((channel) => {
          if (this.channelId == channel.id) {
            this.chatName = channel.channelName;
            this.chatType = "channel";
            this.channelType = channel.channelType;
          }
        });

        chatList.orgChannelList.forEach((chat) => {
          if (this.channelId == chat.channelId) {
            this.chatName = chat.chatName;
            this.chatAvatar = chat.chatAvatar;
            this.chatType = "channel";
            this.channelType = chat.channelType;
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
          workspaceId: this.workspaceId,
        })
        .then((res1) => {
          console.log(res1);
          this.update = false;
          this.chatName = this.rename;
          console.log(this.chatName);
          setTimeout(function () {
            util.$emit("loadWorkspaceMembers");
          }, 500);
          this.rename = "";
        });
    },

    // handle emoji selection
    selectEmoji(emoji) {
      this.send_message = this.send_message + emoji.native;
    },
    //load message function

    loadPrivateMes(page) {
      this.send_message = "";
      this.messages = [];
      this.fileList = [];
      let curPage = page;
      this.$http
        .post("http://localhost:8080/api/message/history/private", {
          current: curPage,
          pageSize: 50,
          receiverId: this.chatId,
          senderId: this.userId,
          workspaceId: this.workspaceId,
        })
        .then((res) => {
          console.log(this.workspaceId + " 666")
          const mes = res.data.data.records.reverse();
          if (res.data.code == 200) {
            for (var i in mes) {
              this.messages.push(mes[i]);
            }
          } else {
            alert("获取数据失败 + 私聊信息");
          }
        })
        .then(() => {
          console.log("private mes: ", this.messages);
          // this.sortMes();
        });
    },

    loadChannelMes(page) {
      this.send_message = "";
      this.messages = [];
      this.fileList = [];
      let curPage = page;
      this.$http
        .post("http://localhost:8080/api/message/history/channel", {
          channelId: this.channelId,
          current: curPage,
          pageSize: 50,
          senderId: this.userId,
          workspaceId: this.workspaceId,
        })
        .then((res) => {
          const mes = res.data.data.records.reverse();
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
      console.log("channel mes: ", this.messages);
    },

    loadMasterId() {
      this.masterId = "";
      this.$http
        .post("http://localhost:8080/api/channel/masterId", {
          channelId: this.channelId,
        })
        .then((res) => res.data.data)
        .then((res) => {
          this.masterId = res;
        })
    },

    loadChannelMembers() {
      this.send_message = "";
      this.members = [];
      this.mentionMembers = [];
      this.contactList = [];
      this.contactIdList = [];
      this.organizationMembers = [];
      this.organizations = [];
      this.$http
        .post("http://localhost:8080/api/userchannel/usersandorganizations", {
          channelId: this.channelId,
        })
        .then((res) => res.data.data)
        .then((res) => {
          for (let i = 0; i < res.userList.length; i++) {
            if (res.userList[i].userRole == 0) {
              this.members.push(res.userList[i]);
              this.mentionMembers.push(res.userList[i]);

            } else {
              this.organizationMembers.push(res.userList[i]);
            }
          }
          console.log("chatbox members: ", this.mentionMembers);
          for (let i = 0; i < res.organizationList.length; i++) {
            this.organizations.push(res.organizationList[i]);
          }
          this.sortUsers(this.members);
          this.sortOrgs(this.organizations);
        })
      // .then((res) => res.data)
      // .then((res) => {
      //   for (let i = 0; i < res.data.length; i++) {
      //     // this.members.push(res.data[i]);
      //     this.mentionMembers.push(res.data[i].userName);
      //   }
      //   console.log("chatbox members: ", this.members);
      //   // this.list = res.data;
      //   // console.log(this.list);
      // });
    },

    sortMes() { // legacy code mark
      console.log("in sort: ");
      console.log(this.messages);
      console.log("length: ", this.messages.length);
      if (this.messages.length > 1) {
        this.messages.sort(function (a, b) {
          console.log("sorting...");
          return a.id - b.id;
        });
      }
    },

    sendMes() {
      // 发送消息时，判断消息内是否含有@
      if (this.contactIdList.length !== 0) {
        console.log("contactIdList mention message")
      } else {
        console.log("contactIdList Not mention message")
      }

      // stompSend(this)
      commonSend(this);
      this.canelRecorder()
      this.send_message = "";
      this.fileList = [];
      this.dialogFileUploader = false;
      this.contactList = [];
      this.contactIdList = [];
    },

    // upload function event receiver
    fileListUpdate(newList) {
      console.log('fileListUpdate', newList);
      this.fileList = newList;
    },

    //To Do.. Fix the issue removing the last user
    handleDelete(index, row) {
      this.$confirm('Do you confirm to remove?')
        // eslint-disable-next-line
        .then(_ => {
          if ((index, row).organizationName != undefined) {
            this.$http.post("http://localhost:8080/api/userchannel/deleteorg", {
              channelId: this.channelId,
              organizationId: (index, row).id
            })
            console.log("11111111111111111111111111...", this.organizations.findIndex((item) => item.id === (index, row).id), 1);
            console.log("11111111111111111111111111...", this.organizations);

            console.log("11111111111111111111111111...", (index, row).id);
            this.organizations.splice(
              this.organizations.findIndex((item) => item.id === (index, row).id), 1);
          } else {
            this.$http.post("http://localhost:8080/api/userchannel/deletemember", {
              channelId: this.channelId,
              userId: (index, row).id
            })

            this.members.splice(
              this.members.findIndex((item) => item.id === (index, row).id), 1);
            console.log("22222222222222222222222222...", this.members.id);
            console.log("22222222222222222222222222...", (index, row).id);
          }
          //setTimeout(this.loadRemaining(),1000);
          //this.asyncLoadRemaining(index, row);
        })
        // eslint-disable-next-line
        .catch(_ => { });
    },

    //add members
    submitForm(formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          for (let i = 0; i < this.addMembers.members.length; i++) {
            if (this.addMembers.members[i] <= 100000) {
              this.addUsers.push(this.addMembers.members[i]);
              this.members.push(
                this.allUsers[
                this.allUsers.findIndex(
                  (item) => item.id === this.addMembers.members[i]
                )
                ]
              );
            } else {
              this.addOrgs.push(this.addMembers.members[i] - 100000);
              this.organizations.push(
                this.allOrgs[
                this.allOrgs.findIndex(
                  (item) => item.id === this.addMembers.members[i] - 100000
                )
                ]
              );
            }
          }
          this.$http.post("http://localhost:8080/api/userchannel/addmember", {
            channelId: this.channelId,
            memberIdList: this.addUsers,
            organizationIdList: this.addOrgs,
          });
          this.$message({
            message: "Add members successful!",
            type: "success",
            duration: 3000,
          });
          this.sortUsers(this.members);
          this.sortOrgs(this.organizations);
          console.log("this.members", this.members);
          console.log("this.organizations", this.organizations);
          this.closeDialog();
        } else {
          console.log("error submit!!");
          this.$message({
            message: "Add members fail, please check error messages!",
            type: "error",
            duration: 3000,
          });
          return false;
        }
      });
    },

    addMembersFunction() {
      this.dialog = true;
      this.loadRemaining();
    },

    closeDialog() {
      this.dialog = false;
      this.addMembers.members = [];
      this.addUsers = [];
      this.addOrgs = [];
    },

    resetForm(formName) {
      this.$refs[formName].resetFields();
    },

    sortUsers(array) {
      array.sort((a, b) => {
        var nameA = a.userName.toUpperCase(); // ignore upper and lowercase
        var nameB = b.userName.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        // names must be equal
        return 0;
      });
    },

    sortOrgs(array) {
      array.sort((a, b) => {
        var nameA = a.organizationName.toUpperCase(); // ignore upper and lowercase
        var nameB = b.organizationName.toUpperCase(); // ignore upper and lowercase
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        // names must be equal
        return 0;
      });
    },

    //for adding members only when click button
    loadRemaining() {
      this.members = [];
      this.organizations = [];
      this.remainingMembers = [];
      this.remainingOrgs = [];
      this.allUsers = JSON.parse(sessionStorage.getItem("userList"));
      this.allOrgs = JSON.parse(sessionStorage.getItem("orgList"));

      this.$http.post("http://localhost:8080/api/userchannel/usersandorganizations", {
        channelId: this.channelId,
      })
        .then((res) => res.data.data)
        .then((res) => {
          for (let i = 0; i < res.userList.length; i++) {
            if (res.userList[i].userRole == 0) {
              this.members.push(res.userList[i]);
            }
          }
          for (let i = 0; i < res.organizationList.length; i++) {
            this.organizations.push(res.organizationList[i]);
          }
          this.sortUsers(this.members);
          this.remainingMembers = this.allUsers.filter(
            (x) => !this.members.find((y) => y.id === x.id)
          );
          this.sortUsers(this.remainingMembers);
          console.log("remainingMembers", this.remainingMembers);

          this.sortUsers(this.organizations);
          this.remainingOrgs = this.allOrgs.filter(
            (x) => !this.organizations.find((y) => y.id === x.id)
          );
          this.sortOrgs(this.remainingOrgs);
          console.log("remainingOrgs", this.remainingOrgs);
        });
    },
    // 初始化录音配置
    initRecorder() {
      this.recorder = new Recorder({
        sampleBits: 16, // 采样位数，支持 8 或 16，默认是16
        sampleRate: 48000, // 采样率，支持 11025、16000、22050、24000、44100、48000，根据浏览器默认值，我的chrome是48000
        numChannels: 1, // 声道，支持 1 或 2， 默认是1
        // compiling: false,(0.x版本中生效,1.x增加中) // 是否边录边转换，默认是false
      });
    },
    // 开始录音
    startRecorder() {
      if (!this.isStart) this.stopRecorder()
      this.initRecorder();
      this.recorder.start().then(
        () => {
          this.canelRecorder() //先清空上次缓存
          this.$notify({
            message: 'Start Recording',
            type: 'success'
          });
          this.send_message = 'Recording'
          this.DuringRecording = true
          this.isStart = false
        },
        (error) => {
          // 出错了
          console.log(`${error.name} : ${error.message}`);
        }
      );
    },
    // 结束录音
    stopRecorder() {
      this.isStart = true
      this.$notify({
        message: 'Stop Recording',
        type: 'success'
      });
      console.log('结束录音', this.DuringRecording, this.tempAudio);
      this.send_message = '[Voice message]'
      this.DuringRecording = false
      this.tempAudio = true
      if (this.recorder) this.recorder.stop()
      this.getRecorder()
    },
    // 取消发送
    canelRecorder() {
      this.send_message = ''
      this.tempAudio = false
      this.fileList = []
      console.log('fileListUpdate', this.fileList);
    },
    // 销毁录音
    destroyRecorder() {
      let that = this;
      this.recorder.destroy().then(function () {
        that.recorder = null;
      });
    },
    // 获取录音文件
    getRecorder() {
      // let toltime = this.recorder.duration; //录音总时长
      // let fileSize = this.recorder.fileSize; //录音总大小
      //录音结束，获取取录音数据
      // let PCMBlob = this.recorder.getPCMBlob(); //获取 PCM 数据
      // let wav = this.recorder.getWAVBlob(); //获取 WAV 数据
      // let channel = this.recorder.getChannelData(); //获取左声道和右声道音频数据
      this.getMp3Data(); //转成mp3
      // 销毁音频实例
      this.destroyRecorder();
    },
    /**
     * 文件格式转换 wav-map3
     * */
    //发送Blob
    async getMp3Data() {
      const mp3Blob = this.convertToMp3(this.recorder.getWAV());
      console.log("mp3Blob", mp3Blob);
      const audioBlob = new Blob([mp3Blob], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);
      console.log('audioUrl', audioUrl);
      console.log(this.$refs.Myduaio);
      this.$refs.Myduaio.src = audioUrl
      console.log(this.$refs.Myduaio);
      let audioFile = new File([mp3Blob], Date.now() + ".mp3", {
        type: mp3Blob.type,
      });
      this.fileListUpdate([
        {
          name: 'filename',
          raw: audioFile
        }
      ])
      console.log('audioFile', audioFile);
      let fd = new FormData();
      fd.append("filename", audioFile);
      console.log('fd', fd);

      // 下载本地MP3文件
      // this.recorder.download(mp3Blob, "recorder", "mp3");
    },
    convertToMp3(wavDataView) {
      // 获取wav头信息
      console.log(lamejs);
      const wav = lamejs.WavHeader.readHeader(wavDataView); // 此处其实可以不用去读wav头信息，毕竟有对应的config配置
      const { channels, sampleRate } = wav;
      const mp3enc = new lamejs.Mp3Encoder(channels, sampleRate, 128);
      // 获取左右通道数据
      const result = this.recorder.getChannelData();
      const buffer = [];
      const leftData =
        result.left &&
        new Int16Array(
          result.left.buffer,
          0,
          result.left.byteLength / 2
        );
      const rightData =
        result.right &&
        new Int16Array(
          result.right.buffer,
          0,
          result.right.byteLength / 2
        );
      const remaining =
        leftData.length + (rightData ? rightData.length : 0);
      const maxSamples = 1152;
      for (let i = 0; i < remaining; i += maxSamples) {
        const left = leftData.subarray(i, i + maxSamples);
        let right = null;
        let mp3buf = null;
        if (channels === 2) {
          right = rightData.subarray(i, i + maxSamples);
          mp3buf = mp3enc.encodeBuffer(left, right);
        } else {
          mp3buf = mp3enc.encodeBuffer(left);
        }
        if (mp3buf.length > 0) {
          buffer.push(mp3buf);
        }
      }
      const enc = mp3enc.flush();
      if (enc.length > 0) {
        buffer.push(enc);
      }
      return new Blob(buffer, { type: "audio/mp3" }); //返回Blob
    },
    //获取录音权限
    microphoneHandel() {
      this.isVoice = !this.isVoice;
      Recorder.getPermission().then(
        () => {
          this.$message.success("获取录音权限成功");
        },
        (error) => {
          console.log(`${error.name} : ${error.message}`);
        }
      );
    },
    bgColor() {
      if (this.workspaceId == 1) {
        return 'red'
      } else if (this.workspaceId == 2) {
        return 'blue'
      }
    },
  },

  created: function () {
    // connect(this);
    eventBus.$on('new-mes-received', (mes) => {
      this.messages.push(mes);
    });
  },

  watch: {
    // 在路由从private变到channel的时候，chatId和channelId会同时变化，从而两个watch函数都会调用一次
    chatId() {
      if (!isNaN(this.chatId)) {
        this.loadName();
        //this.updateType();
        this.loadPrivateMes(0);
        this.$forceUpdate();
      }
    },

    channelId() {
      if (!isNaN(this.channelId)) {
        this.loadName();
        //this.updateType();
        this.loadChannelMes(0);
        this.loadChannelMembers();
        this.$forceUpdate();
        this.loadMasterId();
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
  /* background-color: gainsboro; */
  display: flex;
  flex-wrap: wrap;
  padding: 5px;
  text-align: left;
  /* border: 1px solid; */
  /* border-radius: 5px; */
  /* border-color: darkgray; */
}

.textarea {
  margin: 5px;
  padding: 5px;
  width: 100%;
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
  margin-left: 5px;
  padding: 0px;
}

.dialog__footer {
  text-align: right;
}
</style>