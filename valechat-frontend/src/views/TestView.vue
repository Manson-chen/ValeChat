<template>
  <div>
    <NavBar />
    This is a test page.
    <!-- <ChatBox /> -->
    <div class="vertical-line"></div>
    <messageEl
      type="success"
      mes="This is a message This is a message
This is a message"
    />
    <messageEl type="info" mes="This is a message" />
    <message
      mes="This is a message"
      :mesFile="this.files"
    ></message>

    <upload/>
  </div>
</template>

<script>
import NavBar from "../components/NavBar.vue";
import message from "../components/ChatBox/Messages.vue";
import upload from "../components/ChatBox/FileUpload.vue"

// import ChatBox from "../components/ChatBox.vue";
export default {
  name: "test",
  components: {
    NavBar,
    message,
    upload
    // ChatBox,
  },
  methods: {},
  // created:function(){
  //   connect(this)
  // },
  // destroyed:function(){
  //   disconnect(this)
  // },
  data() {
    return {
      send_message: null,
      user: JSON.parse(sessionStorage.getItem("CurUser")),
      files: [
          {
            id: 1,
            fileType: "1/jpeg",
            fileUrl:
              "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg",
          },
          {
            id: 1,
            fileType: "2/mp3",
            fileUrl:
              "https://www.groovydomain.com/gallery/music/ORIGINAL/Pink Floyd/The Dark Side of the Moon/09 Eclipse.mp3",
              // "http://localhost:8080/api/files/1/598c1e4f-6eeb-4092-8b52-c23538acf463/09 Eclipse.mp3",
          },
          {
            id: 1,
            fileType: "3/mp4",
            fileUrl:
              "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
          },
        ],

    };
  },
};
</script>

<style scoped>
.vertical-line {
  border-left: 1px solid black;
  height: 50px;
  margin: 0 10px;
}
</style>