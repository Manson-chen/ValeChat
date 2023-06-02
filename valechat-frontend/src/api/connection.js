import SockJS from "sockjs-client";
import Stomp from "webstomp-client";
import { eventBus } from "./eventBus";

export function connect(comp) {
  comp.socket = new SockJS("http://localhost:8080/api/ws");
  comp.stompClient = Stomp.over(comp.socket);

  comp.stompClient.connect(
    {},
    (frame) => {
      comp.connected = true;
      console.log(frame);
      
      let allChannele;
      let channelList = comp.channelList;
      let orgChannelList = comp.orgChannelList;
    
      // combin orgchannel and normal channel
      if (orgChannelList != []) {
        allChannele =
          channelList == [] ? orgChannelList : [...channelList, ...orgChannelList];
      } else {
        allChannele = channelList == [] ? [] : channelList;
      }
    
      for (let i in allChannele) {
        const channelId =
          allChannele[i].channelType == 0
            ? allChannele[i].id
            : allChannele[i].channelId;
        console.log("subscribing channel ", channelId);
        comp.stompClient.subscribe("/topic/channel/" + channelId, (tick) => {
          console.log("tick: ", tick.body);
          const receivedMes = JSON.parse(tick.body);
          console.log("parsed: ", receivedMes);
          if (comp.$route.params.userId != receivedMes.senderId) {
            if (comp.$route.params.channelId == receivedMes.receiverId) {
              eventBus.$emit("new-mes-received", receivedMes);
            } else {
              comp.changeUnread(receivedMes.receiverId, 1, "bolder");
            }
          }
        });
      }
      for (let j in comp.userList) {
        const chatId = comp.userList[j].id;
        console.log("subscribing chat ", chatId);
        comp.stompClient.subscribe("/user/" + chatId + "/message", (tick) => {
          console.log("tick: ", tick.body);
          const receivedMes = JSON.parse(tick.body);
          console.log("parsed: ", receivedMes);
          if (
            comp.$route.params.userId == receivedMes.receiverId &&
            comp.$route.params.userId != receivedMes.senderId
          ) {
            if (comp.$route.params.chatId == receivedMes.senderId) {
              eventBus.$emit("new-mes-received", receivedMes);
            } else {
              // don't know if userIf != receiverId will also go into this function
              comp.changeUnread(receivedMes.senderId, 0, "bolder");
            }
          }
        });
      }
      console.log("stompClient: ", comp.stompClient);
      console.log("connected: ", comp.stompClient.connected);
    },
    (error) => {
      console.log(error);
      comp.connected = false;
    }
  );
}

export function disconnect(comp) {
  if (comp.stompClient) {
    comp.stompClient.disconnect();
  }
  comp.connected = false;
}

export function commonSend(comp) {
  console.log("Send message:" + comp.send_message);
  if (comp.send_message == "" && comp.fileList.length == 0) {
    comp.$message.warning("The message is empty!");
    return;
  }

  let mesType;
  let receiverId;
  if (comp.chatType == "private") {
    mesType = 0;
    receiverId = comp.chatId;
  } else if (comp.chatType == "channel") {
    mesType = 1;
    receiverId = comp.channelId;
  }

  const formData = new FormData();
  const mes = {
    workspaceId: comp.workspaceId,
    senderId: comp.userId,
    receiverId: receiverId,
    msgType: mesType,
    content: comp.send_message,
    files: comp.fileList,
  };
  console.log("mesObj: ", mes);
  for (const key in mes) {
    if (Object.hasOwnProperty.call(mes, key)) {
      if (key == "files") {
        mes[key].forEach((item) => {
          formData.append(key, item.raw);
        });
      } else {
        formData.append(key, mes[key]);
      }
    }
  }

  // Jizhi修改: 5/5/2023 14：42
  // ChatBox.vue: 现在恢复成原样了，即没有添加文件上传功能（历史消息功能+Yue的群组管理功能）
  // ChatBox2.vue: 是周五演示的时候用的暴力整合（文件上传+历史消息功能，没有Yue的群组管理功能）
  // 这里是给ChatBox2用的，不添加comp.fileList，无法将文件传到数据库
  // --------------------------------

  console.log("assigned mes: ", formData);

  comp.$http
    .post("http://localhost:8080/api/message/send", formData)
    .then((res) => {
      console.log("in commonSend: ", res.data);
      if (res.data.code == 200) {
        console.log("message sent!");
        eventBus.$emit("clear-fileUpload");
        comp.messages.push(res.data.data);
        console.log("comp.message: ", comp.messages);
      } else {
        console.log("something went wrong");
      }
      console.log("received data: ", res.data.data);
    })
    .catch((err) => {
      console.log("send failed!");
      console.log("error: ", err);
    });
}
