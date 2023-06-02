<template>
    <div>
        <!-- <el-radio-group v-model="isCollapse" style="margin-bottom: 20px">
            <el-radio-button :label="false">Open</el-radio-button>
            <el-radio-button :label="true">Close</el-radio-button>
        </el-radio-group>
         -->
        <el-menu 
        style="height: 100vh;"
        default-active="/home"
        router> 
            <!-- <el-menu-item index="/home">
                <i class="el-icon-s-home"></i>
                <span slot="title">首页</span>
            </el-menu-item>   -->
            
            <!-- star list -->
            <el-submenu index="0">
                <template slot="title">
                    <i class="el-icon-s-custom"></i>
                    <span>Starred Chat</span>
                </template>
                <!-- users -->
                <el-menu-item :index="'/home/' + user.id + '/' + item.id" v-for="item in starredUserList" :key="item.id" @click="changeUnread(item.id, 0, 'normal')">
                    <div>
                        <template>
                            <el-avatar :size="30" :src="item.userAvatar" style="margin-right:10px"></el-avatar>
                            <el-popover trigger="hover" placement="top" :disabled="item.userName.length <= 7">
                                <p style="text-align: center">{{ item.userName }}</p>
                                <span slot="reference"
                                style="display:inline-block; width:65%; overflow:hidden; white-space:nowrap; text-overflow:ellipsis;"
                                :id="'starredPri-' + item.id">
                                {{ item.userName }}</span>
                            </el-popover>
                        </template>
                        <i slot="reference" @click="starContact(item, 0)" style="text-align: right" class="el-icon-star-on"></i>
                    </div>
                </el-menu-item>
                <!-- orgs -->
                <el-menu-item :index="'/home/' + user.id + '/c/' + item.channelId" v-for="item in starredOrgChannelList" :key="item.id" @click="changeUnread(item.channelId, 1, 'normal')">
                    <div>
                        <template>
                            <el-avatar :size="30" :src="item.chatAvatar" style="margin-right:10px"></el-avatar>
                            <el-popover trigger="hover" placement="top" :disabled="item.chatName.length <= 7">
                                <p style="text-align: center">{{ item.chatName }}</p>
                                <span slot="reference"
                                style="display:inline-block; width:65%; overflow:hidden; white-space:nowrap; text-overflow:ellipsis;"
                                :id="'starredChan-' + item.channelId">
                                {{ item.chatName }}</span>
                            </el-popover>
                        </template>
                        <i slot="reference" @click="starContact(item, 2)" style="text-align: right" class="el-icon-star-on"></i>
                    </div>
                </el-menu-item>
                <!-- channels -->
                <el-menu-item :index="'/home/' + user.id + '/c/' + item.id" v-for="item in starredChannelList" :key="item.id" @click="changeUnread(item.id, 1, 'normal')">
                    <div>
                        <template>
                            <el-popover trigger="hover" placement="top" :disabled="item.channelName.length <= 11">
                                <p style="text-align: center">{{ item.channelName }}</p>
                                <span slot="reference"
                                style="display:inline-block; width:100%; overflow:hidden; white-space:nowrap; text-overflow:ellipsis;"
                                :id="'starredChan-' + item.id">
                                {{'# ' + item.channelName }}</span>
                            </el-popover>
                        </template>
                        <i slot="reference" @click="starContact(item, 1)" style="text-align: right" class="el-icon-star-on"></i>
                    </div>
                </el-menu-item>
            </el-submenu>

            <!-- 用户列表 -->
            <el-submenu index="1"  v-if="user.userRole == 0">
                <template slot="title">
                    <i class="el-icon-s-custom"></i>
                    <span>Private Chat</span>
                </template>
                <el-menu-item :index="'/home/' + user.id + '/' + item.id" v-for="item in userList" :key="item.id" @click="changeUnread(item.id, 0, 'normal')">
                    <div>
                        <el-avatar :size="30" :src="item.userAvatar" style="margin-right:10px"></el-avatar>
                        <template>
                            <el-popover trigger="hover" placement="top" :disabled="item.userName.length <= 7">
                                <p style="text-align: center">{{ item.userName }}</p>
                                <span slot="reference"
                                style="display:inline-block; width:65%; overflow:hidden; white-space:nowrap; text-overflow:ellipsis"
                                :id="'private-' + item.id">
                                {{ item.userName }}</span>
                            </el-popover>
                        </template>
                        <i slot="reference" @click="starContact(item, 0)" style="text-align: right"
                        :class="userStar[item.id] ? 'el-icon-star-on' : 'el-icon-star-off'"></i>
                    </div>
                </el-menu-item>
            </el-submenu>

            <!-- orgChannelList -->
            <el-submenu index="2">
                <template slot="title">
                    <i class="el-icon-s-custom"></i>
                    <span  v-if="user.userRole == 0">Organizations</span>
                    <span  v-else>Clients</span>
                </template>

                <el-menu-item :index="'/home/' + user.id + '/c/' + item.channelId" v-for="item in orgChannelList" :key="item.id" @click="changeUnread(item.channelId, 1, 'normal')">
                    <div>
                        <el-avatar :size="30" :src="item.chatAvatar" style="margin-right:10px"></el-avatar>
                        <template>
                            <el-popover trigger="hover" placement="top" :disabled="item.chatName.length <= 7">
                                <p style="text-align: center">{{ item.chatName }}</p>
                                <span slot="reference"
                                style="display:inline-block; width:65%; overflow:hidden; white-space:nowrap; text-overflow:ellipsis;"
                                :id="'channel-' + item.channelId">
                                {{ item.chatName }}</span>
                            </el-popover>
                        </template>
                        <i slot="reference" @click="starContact(item, 2)" style="text-align: right"
                        :class="orgStar[item.id] ? 'el-icon-star-on' : 'el-icon-star-off'"></i>
                    </div>
                </el-menu-item>
            </el-submenu>

            <!-- 群聊列表 -->
            <el-submenu index="3">
                <template slot="title">
                    <i class="el-icon-s-custom"></i>
                    <span>Channels</span>
                </template>
                <el-menu-item :index="'/home/' + user.id + '/c/' + item.id" v-for="item in channelList" :key="item.id" @click="changeUnread(item.id, 1, 'normal')">
                    <div>
                        <template>
                            <el-popover trigger="hover" placement="top" :disabled="item.channelName.length <= 11">
                                <p style="text-align: center">{{ item.channelName }}</p>
                                <span slot="reference"
                                style="display:inline-block; width:100%; overflow:hidden; white-space:nowrap; text-overflow:ellipsis;"
                                :id="'channel-' + item.id">
                                {{'# ' + item.channelName }}</span>
                            </el-popover>
                        </template>
                        <i slot="reference" @click="starContact(item, 1)" style="text-align: right"
                        :class="channelStar[item.id] ? 'el-icon-star-on' : 'el-icon-star-off'"></i>
                    </div>
                </el-menu-item>
            </el-submenu>
        </el-menu>           
    </div>
</template>

<script>
import {connect} from "../api/connection";
import util from '../util/util';
import axios from 'axios';
    export default {
        data() {
            return {
                // isCollapse: false,
                userList:[],
                channelList:[],
                orgChannelList:[],
                organizationMembers:[],
                organizations:[],
                // 获取在login时存储到sessionstorage页面的登录用户的信息，用来向后端请求对应的用户列表的数据
                user: JSON.parse(sessionStorage.getItem("CurUser")),
                userStar: [],
                orgStar: [],
                channelStar: [],
                starredUserList: [],
                starredOrgChannelList: [],
                starredChannelList: [],
                userId: this.$route.params.userId,
            }
        },
        props: {
            workspaceId: {
                default: undefined,
            },  
        },
        methods: {

            loadUnread(){
                console.log("loading unread: ", {'workspaceId': this.workspaceId, 'userId': this.userId})
                axios.post("http://localhost:8080/api/user/unreadchat/list", {
                    userId: this.userId,
                    workspaceId: this.workspaceId
                }
                ).then((res) => res.data
                ).then((res) => {
                    console.log("unread chat: ", res.data)
                    // const { unreadChat, unreadChannel, unreadOrgChan } = res.data //don't know why this doesn't work
                    const unreadChat = res.data.userList
                    const unreadChannel = res.data.channelList
                    const unreadOrgChan = res.data.orgChannelList

                    const unreadChan = [...unreadChannel, ...unreadOrgChan]
                    unreadChat.forEach((element) => {
                        this.changeUnread(element.id, 0, 'bolder')
                    })
                    unreadChan.forEach((element) => {
                        this.changeUnread(element.id, 1, 'bolder')
                    })
                }).catch((err) => {
                    console.log("load unread failed: ", err)
                })
            },

            changeUnread(id, mesType, style) {
                
                function updateBackend(userId) {
                    if (style == 'normal') {
                        console.log("updating unread: ", {'mesType': mesType, 'readChatId': id, 'userId': userId})
                        axios.post("http://localhost:8080/api/message/read", {
                            msgType: mesType,
                            readChatId: id,
                            userId: userId
                        }).then((res) => {
                            console.log("updated unread: ", res.data)
                        })
                        .catch((err) => {
                            console.log("Update unread failed: ", err)
                        })
                    }
                }
                
                function changeStarred(starredList, prefix) {
                    starredList.forEach((element) => {
                        if (element.id == id) {
                            const starSpan = document.getElementById(prefix + id)
                            starSpan.style.fontWeight = style;
                        }
                    })
                }

                if (mesType == 0) {
                    updateBackend(this.userId)
                    const nameSpan = document.getElementById('private-' + id)
                    nameSpan.style.fontWeight = style;
                    changeStarred(this.starredUserList, 'starredPri-')
                }
                else if (mesType == 1) {
                    updateBackend(this.userId)
                    const nameSpan = document.getElementById('channel-' + id)
                    const starredChan = [...this.starredChannelList, ...this.starredOrgChannelList]
                    nameSpan.style.fontWeight = style;
                    changeStarred(starredChan, 'starredChan-')
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


            loadWorkspaceMembers() {
                this.userList = [],
                this.channelList = [],
                this.orgChannelList = [],
                this.organizationMembers = [],
                this.organizations = [],
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
                            this.orgChannelList.push(res.data.orgChannelList[i]);
                        }
                        //this.channelList = res.data.channelList
                        this.sortUsers(this.userList);
                        this.sortChannels(this.channelList);
                        this.sortOrgList(this.orgChannelList);
                        sessionStorage.setItem("CurUserList",JSON.stringify(res.data))
                        sessionStorage.setItem("userList",JSON.stringify(this.userList))
                        sessionStorage.setItem("channelList",JSON.stringify(this.channelList))
                        //sessionStorage.setItem("orgList",JSON.stringify(this.organizations))
                    } 
                    else {
                        alert('获取数据失败 + 工作区用户')
                    }
                }).then(() => {
                    this.$http.post("http://localhost:8080/api/userworkspace/organization", {
                        workspaceId: this.workspaceId
                    })
                    .then((res) => res.data.data)
                    .then((res) => {
                        for (let i = 0; i < res.length; i++) {
                            this.organizations.push(res[i]);
                        }
                        sessionStorage.setItem("orgList",JSON.stringify(this.organizations))
                    })})
            },

            getStarList() {
                this.starredUserList = [];
                this.starredOrgChannelList = [];
                this.starredChannelList = [];
                this.$http.post("http://localhost:8080/api/user/star/list", {
                    userId: this.user.id,
                    workspaceId: this.workspaceId,
                })
                .then((res) => res.data.data)
                .then((res)=>{
                    for (let i = 0; i < res.userList.length; i++) {
                        this.starredUserList.push(res.userList[i]);
                        this.userStar[res.userList[i].id] = true;
                    }
                    for (let i = 0; i < res.orgChannelList.length; i++) {
                        this.starredOrgChannelList.push(res.orgChannelList[i]);
                        this.orgStar[res.orgChannelList[i].id] = true;
                    }
                    for (let i = 0; i < res.channelList.length; i++) {
                        this.starredChannelList.push(res.channelList[i]);
                        this.channelStar[res.channelList[i].id] = true;
                    }
                    this.sortUsers(this.starredUserList);
                    this.sortChannels(this.starredChannelList);
                    this.sortOrgList(this.starredOrgChannelList);
                    console.log("11111111111111 ", this.starredUserList);
                })
            },

            starContact(starredItem, starType) {
                //star users
                if(starType == 0){
                    if(!this.userStar[starredItem.id]) {
                        this.userStar[starredItem.id] = !this.userStar[starredItem.id];
                        this.$http.post("http://localhost:8080/api/user/star", {
                            starType: starType,
                            starredId: starredItem.id,
                            userId: this.user.id,
                            workspaceId: this.workspaceId
                        }).then(()=>{this.starredUserList.push(starredItem);
                        this.sortUsers(this.starredUserList);})
                    } else {
                        this.userStar[starredItem.id] = !this.userStar[starredItem.id];
                        this.$http.post("http://localhost:8080/api/user/star/delete", {
                            starType: starType,
                            starredId: starredItem.id,
                            userId: this.user.id,
                            workspaceId: this.workspaceId
                        }).then(()=>{this.starredUserList.splice(
                        this.starredUserList.findIndex((item) => item.id === starredItem.id),1);
                        })
                    }
                }
                //star channels
                if(starType == 1){
                    if(!this.channelStar[starredItem.id]) {
                        this.channelStar[starredItem.id] = !this.channelStar[starredItem.id];
                        this.$http.post("http://localhost:8080/api/user/star", {
                            starType: starType,
                            starredId: starredItem.id,
                            userId: this.user.id,
                            workspaceId: this.workspaceId
                        }).then(()=>{this.starredChannelList.push(starredItem);
                        this.sortChannels(this.starredChannelList);})
                    } else {
                        this.channelStar[starredItem.id] = !this.channelStar[starredItem.id];
                        this.$http.post("http://localhost:8080/api/user/star/delete", {
                            starType: starType,
                            starredId: starredItem.id,
                            userId: this.user.id,
                            workspaceId: this.workspaceId
                        }).then(()=>{this.starredChannelList.splice(
                            this.starredChannelList.findIndex((item) => item.id === starredItem.id),1);
                        })
                    }
                }
                //star orgs
                if(starType == 2){
                    if(!this.orgStar[starredItem.id]) {
                        this.orgStar[starredItem.id] = !this.orgStar[starredItem.id];
                        this.$http.post("http://localhost:8080/api/user/star", {
                            starType: starType,
                            starredId: starredItem.channelId,
                            userId: this.user.id,
                            workspaceId: this.workspaceId
                        }).then(()=>{this.starredOrgChannelList.push(starredItem);
                        this.sortOrgList(this.starredOrgChannelList);})
                    } else {
                        this.orgStar[starredItem.id] = !this.orgStar[starredItem.id];
                        this.$http.post("http://localhost:8080/api/user/star/delete", {
                            starType: starType,
                            starredId: starredItem.channelId,
                            userId: this.user.id,
                            workspaceId: this.workspaceId
                        }).then(()=>{this.starredOrgChannelList.splice(
                            this.starredOrgChannelList.findIndex((item) => item.id === starredItem.id),1);
                        })
                    }
                }
            },
        },
        created(){
            connect(this);
            this.loadWorkspaceMembers();
            this.getStarList();
            util.$on('loadWorkspaceMembers',()=> {
				this.loadWorkspaceMembers();
			});
            console.log("Userlist shows the content in Workspace " + this.workspaceId)
        },
        mounted(){
            this.loadUnread()
        }	
    }
</script>

<style>

</style>