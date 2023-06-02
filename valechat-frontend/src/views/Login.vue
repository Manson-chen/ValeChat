<template>
  <div id="post" style="height: 100%;">
    <el-container>
      <el-header style="height: fit-content;"><img class="logo" src="../assets/vale_logo_2.png" width="70px"></el-header>
      <el-container>
        <!-- Left side -->
        <el-aside width="50%" style="margin-left: 40px">
          <div id="intro" style="float: left;">
            <h1>Sign in to</h1>
            <h2 class="desc">Vale <br />
              Best Personal Lawyer <br /> Team For You</h2>
            <p style="line-height: 30px; font-size: 20px;">If you don’t have an account
              <br />You can
              <el-link style="color:#21a0c1; font-size: 20px;" :underline="false" @click="toRegister()">Register here
                !</el-link>
            </p>
          </div>
          <!-- <div id="pic" style="float: left;">
                    <img class="pic" src="../assets/pic.png">
                  </div> -->
        </el-aside>

        <!-- Right side -->
        <el-main width="40%" style="margin-left: 40px">

          <el-form class="login-container" :model="loginForm" :rules="rules" ref="loginForm" status-icon>
            <h2 class="login_title">Sign in</h2>

            <!-- el-form-item-email -->
            <!-- <el-form-item  prop="email">
                      <el-input v-model="loginForm.email" placeholder="Enter email address"></el-input>
                    </el-form-item> -->

            <!-- el-form-item-1 -->
            <el-form-item prop="userAccount">
              <el-input type="text" v-model="loginForm.userAccount" placeholder="Enter user account"></el-input>
            </el-form-item>
            <!-- el-form-item-2 -->
            <el-form-item prop="userPassword">
              <el-input type="password" v-model="loginForm.userPassword" placeholder="Enter password"
                show-password></el-input>
            </el-form-item>
            <!-- el-form-item-3 -->
            <el-form-item>
              <el-button class="loginButton" type="primary" @click="submitForm">Login</el-button>
            </el-form-item>

          </el-form>
          <div style="padding-top: 10px">
            <img style="width: 25px; height: 25px; padding-left: 10px; padding-right: 10px" src="../assets/google.svg" @click="oauthLogin">
            <el-link style="color:#21a0c1; font-size: 23px; padding-bottom: 15px" :underline="false" @click="oauthLogin">Continue with Google</el-link>
          </div>
        </el-main>

      </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  mounted() {
    this.startListening();
  },
  data() {
    return {
      oauthStatus: false,
      isListening: false,
      oauthUrl: "http://localhost:8080/api/oauth2/authorization/google",
      showOAuthPopup: false,
      loginForm: {
        userAccount: '',
        userPassword: '',
        // email:'',
      },
      rules: {
        userAccount: [
          { required: true, message: '*Please input user account', trigger: 'blur' }
        ],
        userPassword: [
          { required: true, message: '*Please input password', trigger: 'blur' }
        ],
        // email:[
        //   { required: true, message: 'Please input email address', trigger: 'blur' },
        //   { type: 'email', message: 'Please input valid email address', trigger: ['blur', 'change'] }
        // ]
      }
    };
  },
  methods: {
    startListening() {
      if (!this.isListening) {
        window.addEventListener('message', this.handleMessage);
        this.oauthStatus = false;
        this.isListening = true;
      }
    },
    handleMessage(event){
      let result = event.data;
      console.log(result)
      if (result.code === 200) {
        // 存储用户信息到seesion storage中
        console.log(result.data.token)
        console.log(result.data.user)
        // alert(result.data.user)
        localStorage.setItem('token', result.data.token)
        sessionStorage.setItem("CurUser", JSON.stringify(result.data.user))
        this.$message({
          message: 'Login Successfully!',
          type: 'success',
          duration: 1000
        });
        // 跳转到主界面
        var url = '/home/' + result.data.user.id + '/'
        this.$router.replace(url)
      }
      // else {
      //   this.$message({
      //     message: 'Login with OAuth failed',
      //     type: 'error'
      //   });
      // }
    },
    oauthLogin(){
      const authUrl = 'http://localhost:8080/api/oauth2/authorization/google'; // OAuth2 登录认证的 URL
      const width = 520;
      const height = 580;
      const left = (window.innerWidth - width) / 2;
      const top = (window.innerHeight - height) / 2 + 60;
      const options = `width=${width},height=${height},left=${left},top=${top}`;
      window.open(authUrl, 'OAuth2 Login', options);
      this.oauthStatus = true
      // window.addEventListener('message', (event) =>
      // {
      //   this.handleMessage(event.data)
      //   alert(1)
      //   window.removeEventListener('message', (event)=>{
      //     this.handleMessage(event.data)
      //   })
      // })
    },
    submitForm() {
      // 连接后端
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.$http.post('http://localhost:8080/api/user/login', this.loginForm).then(res => res).then(res => {
            console.log(res)
            if (res.data.code == 200) {
              // 存储用户信息到seesion storage中
              const token = res.headers['authorization'];
              localStorage.setItem('token', token)

              res = res.data;
              sessionStorage.setItem("CurUser", JSON.stringify(res.data))
              this.$message({
                message: 'Login Successfully!',
                type: 'success',
                duration: 1000
              });
              // 跳转到主界面
              var url = '/home/' + res.data.id + '/'
              this.$router.replace(url)
            } else {
              this.confirm_disabled = false
              this.$message({
                message: 'Wrong username or password!',
                type: 'error'
              });
              return false
            }
          })
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    toRegister() {
      this.$router.push({ path: '/signup' })
    }
  },
  beforeDestroy() {
    window.removeEventListener('message', this.handleMessage);
  },
}
</script>

<style src='@/assets/css/login.css' scoped></style> 