<template>
  <div id="post" style="height: 100%;">
    <el-container>
      <el-header style="height: fit-content;"><img class="logo" src="../assets/vale_logo_2.png" width="70px"></el-header>

      <el-container>
        <!-- Left side -->
        <el-aside width="50%" style="margin-left: 40px">
          <div id="intro" style="float: left;">
            <h1>Sign up to</h1>
            <h2 class="desc">Vale <br />
              Best Personal Lawyer <br /> Team For You</h2>
            <p style="line-height: 30px; font-size: 20px;">if you already have an account
              <br />You can <el-link style="color:#21a0c1; font-size: 20px;" :underline="false" @click="toLogin()">Login
                here !</el-link>
            </p>
          </div>
        </el-aside>

        <!-- Right side -->
        <el-main width="40%" style="margin-left: 40px">
          <!-- <div class="content_right"> -->
          <div class="tab">
            <span @click="activeIndex = 1" :class="activeIndex != 1 ? 'activeIndex' : ''" style="cursor: pointer">Individual</span> /
            <span @click="change2()" :class="activeIndex != 2 ? 'activeIndex' : ''" style="cursor: pointer">Organization</span>

            <div class="individual">
              <el-form :model="ruleForm" :rules="rules" ref="ruleForm" class="demo-ruleForm">

                <el-form-item label="" prop="email">
                  <el-input v-model="ruleForm.email" placeholder="Email Address"></el-input>
                </el-form-item>

                <el-form-item label="" prop="userAccount">
                  <el-input v-model="ruleForm.userAccount" placeholder="Create User Account"></el-input>
                </el-form-item>

                <el-form-item label="" prop="userName">
                  <el-input v-model="ruleForm.userName" placeholder="Create User Name"></el-input>
                </el-form-item>

                <el-form-item label="" prop="organization" v-if="activeIndex == 2">
                  <el-select v-model="ruleForm.organization" placeholder="Choose User Organization" style="width:100%">
                    <el-option v-for="item in options" :key="item.id" :label="item.organizationName" :value="item.id">
                    </el-option>
                  </el-select>
                </el-form-item>

                <el-form-item label="" prop="userPassword">
                  <el-input type="password" show-password v-model="ruleForm.userPassword"
                    placeholder="Password"></el-input>
                </el-form-item>

                <el-form-item label="" prop="checkPassword">
                  <el-input type="password" show-password v-model="ruleForm.checkPassword"
                    placeholder="Confrim Password"></el-input>
                </el-form-item>

                <el-form-item>
                  <el-button type="primary" @click="submitForm('ruleForm')">Register</el-button>
                </el-form-item>

              </el-form>
            </div>

          </div>
          <!-- </div> -->

        </el-main>
      </el-container>

    </el-container>
  </div>
</template>

<script>
import { signup, organization } from '@/api/signup.js';
export default {
  data() {
    var validatePass = (rule, value, callback) => {
      const myRegex = /^(?=.*[A-Z])(?=.*[\W_]).*$/;
      if (value === '') {
        callback(new Error('*Please enter password'));
      } else if (value.length < 8) {
        callback(new Error('*Be at least 8 characters'));
      } else if (!myRegex.test(value)) {
        callback(new Error('*Include at least one uppercase letter & one symbol'));
      }
      else {
        if (this.ruleForm.checkPassword !== '') {
          this.$refs.ruleForm.validateField('checkPassword');
        }
        callback();
      }
    };
    var validatePass2 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('*Please enter password again'));
      } else if (value !== this.ruleForm.userPassword) {
        callback(new Error('*Check password error'));
      } else {
        callback();
      }
    };
    var validatePass3 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('*Cannot be empty'));
      } else if (value.length < 4) {
        callback(new Error('*The user account is too short (< 4)'));
      } else {
        callback();
      }
    };
    var validatePass4 = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('*Cannot be empty'));
      } else if (value.length < 4) {
        callback(new Error('*The user name is too short (< 4)'));
      } else {
        callback();
      }
    };
    return {
      activeIndex: 1, //1-个人 2-组织,
      titleName: ['Individual', 'Organization'],
      currentIndex: 0,
      options: [],
      ruleForm: {
        email: '',
        userAccount: '',
        userName: '',
        userPassword: '',
        checkPassword: '',
        userRole: '',
        organizationId: '',
        organization: ''
      },
      rules: {
        email: [
          { required: true, message: '*Invalid email address', trigger: 'blur' },
          { type: 'email', message: '*Invalid email address', trigger: ['blur', 'change'] }
        ],
        organization: [
          { required: true, message: '*Invalid email organization', trigger: 'change' },
        ],
        userAccount: [
          { validator: validatePass3, trigger: 'blur' }
        ],
        userName: [
          { validator: validatePass4, trigger: 'blur' }
        ],
        userPassword: [
          { validator: validatePass, trigger: 'blur' }
        ],
        checkPassword: [
          { validator: validatePass2, trigger: 'blur' }
        ],
      }
    }
  },
  watch: {
    activeIndex() {
      this.resetForm('ruleForm')
    }
  },
  methods: {
    // Jump to login page
    toLogin() {
      this.$router.push('./Login')
    },
    //切换导航栏
    toggleTabs(index) {
      this.currentIndex = index;
    },
    change2() {
      this.activeIndex = 2
      organization().then(res => {
        console.log(res.data.data, 205);
        this.options = res.data.data
      }).catch(err => {
        console.log(err)
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
    submitForm(formName) {
      // Register as organization user
      if (this.activeIndex == 2) {
        this.ruleForm.userRole = '1'
        this.ruleForm.organizationId = this.ruleForm.organization
        signup(this.ruleForm).then(res => {
          console.log(res.data.data)
          if (res.data.code == 200) {
            this.$message({
              message: 'Registration Successfully!',
              type: 'success',
              duration: 1000
            })
            this.$router.push('./Login')
          } else if (res.data.description == 'Duplicate email') {
            this.$message({
              message: 'The email has existed',
              type: 'warning'
            });
          }
          else if (res.data.description == 'Duplicate account') {
            this.$message({
              message: 'The account has existed',
              type: 'warning'
            });
          }
        }).catch(err => {
          console.log(err)
          this.$message.success('Registration successful!')
        });
      }
      // Register as individual user
      if (this.activeIndex == 1) {
        this.ruleForm.userRole = '0'
        this.ruleForm.organizationId = '0'
        this.$refs[formName].validate((valid) => {
          if (valid) {
            signup(this.ruleForm).then(res => {
              console.log(res)
              if (res.data.code == 200) {
                this.$message({
                  message: 'Registration Successfully!',
                  type: 'success',
                  duration: 1000
                });
                // CreateNewUserOrgChannel for all workspaces
                let userId = res.data.data;
                for (let i = 1; i < 4; i++) {
                  this.$http.post('http://localhost:8080/api/channel/userorgchannel', {
                    userId: userId,
                    workspaceId: i,
                  }).then(res => res.data).then(res => {
                    console.log(res + " workspace: " + i)
                  });
                }
                // ------------------------------------------
                this.$router.push('./Login')
              } else if (res.data.description == 'Duplicate email') {
                this.$message({
                  message: 'The email has existed',
                  type: 'warning'
                });
              }
              else if (res.data.description == 'Duplicate account') {
                this.$message({
                  message: 'The account has existed',
                  type: 'warning'
                });
              }
            }).catch(err => {
              console.log(err)
              this.$message.success('Registration successful!')
            });
          } else {
            console.log('error submit!!');
            return false;
          }
        });
      }

    },
  }
}
</script>
<style scoped lang="scss">
.tab {
  width: 100%;
  // text-align: center;
  color: black;
  font-size: 40px;

  .activeIndex {
    color: #999797;
  }
}

.individual {
  width: 80%;
  margin-top: 20px;
}
</style>
<style src='@/assets/css/login.css' scoped></style>
