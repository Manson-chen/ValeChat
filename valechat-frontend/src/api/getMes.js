import request from '@/util/request';

export function getMes(data) { // 获取历史文本消息
  return request({
    url: "api/message/search",
    method: "post",
    data
  })
}

// 获取chat中的文件历史记录
export function getChatFileHis(data) {
  return request({
    url: "api/files/chat/search",
    method: "post",
    data
  })
}

export function getWorkSpaceFile(data) {
  return request({
    url: "/api/files/workspace/search",
    method: "post",
    data
  })
}

export function organization(data) { // 获取组织
  return request({
    url: "api/organization/list",
    method: "get",
    data
  })
}

export const imageObject = {
  // 图片文件
  png: "image-icon.png",
  jpg: "image-icon.png",
  jpeg: "image-icon.png",
  // word文件
  doc: "word-icon.png",
  docx: "word-icon.png",
  // pdf文件
  pdf: "pdf-icon.png",
  // ppt文件
  ppt: "ppt-icon.png",
  pptx: "ppt-icon.png",
  // excel文件
  xls: "excel-icon.png",
  xlsx: "excel-icon.png",
  // 音频文件
  mp3: "audio-icon.png",
  wav: "audio-icon.png",
  flac: "audio-icon.png",
  aac: "audio-icon.png",
  // 视频文件
  mp4: "video-icon.png",
  avi: "video-icon.png",
  mov: "video-icon.png",
  wmv: "video-icon.png",
  mkv: "video-icon.png",
  // 压缩文件
  zip: "zip-icon.png",
  "7z": "zip-icon.png",
  rar: "zip-icon.png",
  // txt文件
  txt: "txt-icon.png",
}





