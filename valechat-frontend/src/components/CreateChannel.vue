<template>
  <div>
    <el-dropdown trigger="click" size="small" style="margin-left:10px">
      <span class="el-dropdown-link" style="cursor: pointer;">
        <i
          class="el-icon-plus"
          style="font-size:20px; vertical-align: middle; font-weight:bold"
        ></i>
      </span>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item divided>
          <span @click="createChannel()" style="display: block">Create Channel</span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
    <el-dialog
      title="Create a channel"
      :visible.sync="dialog"
      width="800px"
      :close-on-click-modal="false"
      :append-to-body="true"
      @close="closeDialog"
      custom-class="dialog"
      ref="dialog"
      destroy-on-close>
      <div class="dialog__content">
        <el-form :model="createChannelForm" ref="createChannelForm" :rules="rules">
          <el-form-item label="Channel Name" :label-width="180" prop="name">
            <el-input v-model="createChannelForm.name" autocomplete="off"></el-input>
          </el-form-item>
          <el-form-item label="Select Members" prop="members">
            <div class="select">
             <div style="text-align: center">
              <template>
                <el-select
                  v-model="createChannelForm.members"
                  style="display: block; width: 100%;"
                  filterable
                  multiple
                  :autosize="{ minRows: 2, maxRows: 4}"
                  placeholder="Please select.."
                  popper-class="eloption"
                  :popper-append-to-body="true"
                >
                  <div v-if="this.userList != undefined && this.userList != null  && this.userList.length > 0"
                    style="color:grey; margin: 10px 20px 10px">Users</div>
                  <el-option
                    v-for="item in this.userList"
                    :key="item.id"
                    :label="item.userName"
                    :value="item.id">
                    <div class="block" style="float: left"><el-avatar :size="30" :src="item.userAvatar"></el-avatar></div>
                    &nbsp;&nbsp;{{item.userName}}
                    {{" (" + item.email + ")"}} 
                  </el-option>
                  <div v-if="this.organizations != undefined && this.organizations != null  && this.organizations.length > 0"
                    style="color:grey; margin: 20px 20px 10px">Organizations</div>
                  <el-option
                    v-for="item in this.organizations"
                    :key="item.id + 100000"
                    :label="item.organizationName"
                    :value="item.id + 100000">
                    <div class="block" style="float: left"><el-avatar :size="30" :src="item.organizationAvatar"></el-avatar></div>
                    &nbsp;&nbsp;{{item.organizationName}}
                    {{" (" + item.email + ")"}} 
                  </el-option>
                </el-select>
              </template>      
             </div>
           </div>
          </el-form-item>
        </el-form>
      </div>
      <div class="dialog__footer">
        <el-button size="small" @click="resetForm('createChannelForm')">Reset</el-button>
        <el-button size="small" type="primary" @click="submitForm('createChannelForm')">Submit</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import util from '../util/util';
  export default {
    props: {
      workspaceId: {
        default: undefined,
      },  
    },
    data() {
      return {
        value: [],
        list: [],
        userList: [],
        channelList: [],
        organizations: [],
        currentUser: [],
        addMembers: [],
        addOrganizations: [],
        createChannelForm: {
          name: '',
          members: [],
        },
        rules: {
          name: [
            { required: true, message: 'Please set the channel name!', trigger: 'blur' },
          ],
          members: [
            { required: true, message: 'Please select members!', trigger: 'change' },
          ],
        },
        dialog: false,
        errors: [],
        filterMethod(query, item) {
          return item.search.toLowerCase().indexOf(query) > -1;
        }
      };
    },
    methods: {
      submitForm(formName) {
        this.$refs[formName].validate((valid) => {
          if (valid) {
            this.$http.post("http://localhost:8080/api/channel/newChannel", {
              channelName: this.createChannelForm.name,      
              masterId: this.currentUser.id,
              workspaceId: this.workspaceId,
            }).then((res1)=>{
              for (let i = 0; i < this.createChannelForm.members.length; i++) {
                if (this.createChannelForm.members[i] <= 100000) {
                  this.addMembers.push(this.createChannelForm.members[i]);
                } else {
                  this.addOrganizations.push(this.createChannelForm.members[i] - 100000);
                }
              }

              console.log(this.addOrganizations);
              this.$http.post("http://localhost:8080/api/userchannel/addmember", {
                channelId: res1.data.data.id,
                memberIdList: this.addMembers,
                organizationIdList: this.addOrganizations,
              }).then((res2)=>{
                console.log(res2.data);
              });
              
              this.$message({
                message: 'Create channel successful!',
                type: 'success',
                duration: 3000,
              });
              setTimeout(function () {util.$emit('loadWorkspaceMembers');},500);
              this.closeDialog();
            })
          } else {
            console.log('error submit!!');
            this.$message({
              message: 'Create channel fail, please check error messages!',
              type: 'error',
              duration: 3000,
            });
            return false;
          }
        });
      },

      resetForm(formName) {
        this.$refs[formName].resetFields();
        this.createChannelForm.members = [];
        this.createChannelForm.members.push(this.currentUser.id);
      },

      createChannel() {
        this.createChannelForm.members.push(this.currentUser.id);
        this.dialog = true;
        console.log("current user "+this.currentUser);
        this.load();
      },

      closeDialog() {
        this.dialog = false;
        this.createChannelForm.name = '';
        this.createChannelForm.members = [];
        this.addMembers = [];
        this.addOrganizations = [];
      },

      load() {
        this.list = JSON.parse(sessionStorage.getItem("CurUserList"));
        this.currentUser = JSON.parse(sessionStorage.getItem("CurUser"));
        this.organizations = JSON.parse(sessionStorage.getItem("orgList")).sort((a, b) => {
          var nameA = a.organizationName.toUpperCase(); // ignore upper and lowercase
          var nameB = b.organizationName.toUpperCase(); // ignore upper and lowercase
          if (nameA < nameB) {return -1;}
          if (nameA > nameB) {return 1;}
          return 0;}); // names must be equal

        this.userList = JSON.parse(sessionStorage.getItem("userList")).sort((a, b) => {
          var nameA = a.userName.toUpperCase(); // ignore upper and lowercase
          var nameB = b.userName.toUpperCase(); // ignore upper and lowercase
          if (nameA < nameB) {return -1;}
          if (nameA > nameB) {return 1;}
          return 0;}); // names must be equal

        // this.userAmount = this.userList.length;
        console.log('this.userList', this.userList);
        this.channelList = this.list.channelList;
      },
    },

    created() {
      this.load();
    },
    mounted() {}
  }
</script>

<style>
/* .select1 {
  max-height: 100px;
  overflow-y: auto;
} */

.select .el-select{
  grid-auto-rows: minmax(2,3);
  overflow-y: auto;
/*   width: 150px !important; */
}
    
.eloption .el-select-dropdown__wrap {
  max-height: 275px !important;
}

.dialog__footer {
  text-align: right;
}
/* .select{
    display: inline-block;
    margin-right: -5px;
    .el-input{
      width:300px !important;
      :autosize="{ minRows: 2, maxRows: 4}";
    }
    .el-input__inner{
      width:300px !important;
      :autosize="{ minRows: 2, maxRows: 4}";
    }
    .el-input--suffix .el-input__inner{
      width:300px !important;
    }
    .el-input__icon{
      height:100%;
    }
} */
</style>
  
