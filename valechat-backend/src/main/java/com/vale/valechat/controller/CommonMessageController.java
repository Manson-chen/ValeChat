package com.vale.valechat.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.vale.valechat.common.BaseResponse;
import com.vale.valechat.common.ErrorCode;
import com.vale.valechat.common.ResultUtils;
import com.vale.valechat.exception.BusinessException;
import com.vale.valechat.model.dto.channel.ChannelGetRequest;
import com.vale.valechat.model.dto.message.*;
import com.vale.valechat.model.dto.user.UserAvatarRequest;
import com.vale.valechat.model.entity.ChannelMessage;
import com.vale.valechat.model.entity.PrivateFile;
import com.vale.valechat.model.entity.PrivateMessage;
import com.vale.valechat.model.entity.User;
import com.vale.valechat.model.vo.*;
import com.vale.valechat.service.*;
import com.vale.valechat.util.CopyUtil;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.support.DefaultMessageSourceResolvable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.io.File;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

import static com.vale.valechat.constant.PathConstant.ROOT_PATH;

@Slf4j
@RestController
@RequestMapping("/message")
public class CommonMessageController {

    @Resource
    PrivateMessageService privateMessageService;

    @Resource
    ChannelMessageService channelMessageService;

    @Resource
    PrivateFileService privateFileService;

    @Resource
    ChannelFileService channelFileService;

    @Resource
    private SimpMessagingTemplate simpMessagingTemplate;

    @Resource
    RedisService redisService;

    @PostMapping("/send")
    public BaseResponse<CommonMessageVO> sendCommonMessage(@Valid CommonMessageRequest commonMessageRequest, BindingResult result, HttpServletRequest request) {

        if (result.hasErrors()) {
            String errorMsg = result.getAllErrors().stream().map(DefaultMessageSourceResolvable::getDefaultMessage).collect(Collectors.joining(","));
            return ResultUtils.error(ErrorCode.OPERATION_ERROR, errorMsg, "");
        }
        CommonMessageVO commonMessageVO = new CommonMessageVO();
        BeanUtils.copyProperties(commonMessageRequest, commonMessageVO);
        long workspaceId = commonMessageRequest.getWorkspaceId();
        long senderId = commonMessageRequest.getSenderId();
        long receiverId = commonMessageRequest.getReceiverId();
        int msgType = commonMessageRequest.getMsgType();
        String content = commonMessageRequest.getContent();
        MultipartFile[] files = commonMessageRequest.getFiles();

        if (StringUtils.isAnyBlank(String.valueOf(workspaceId), String.valueOf(senderId), String.valueOf(receiverId), String.valueOf(msgType))) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }

        if (content == null && files.length == 0 ){
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "Both content and files are null");
        }

        if (msgType == 0){
            long messageId = privateMessageService.saveMessage(commonMessageRequest);
            commonMessageVO.setId(messageId);
            Date createTime = privateMessageService.getById(messageId).getCreateTime();
            commonMessageVO.setCreateTime(createTime);
            if (files != null && files.length != 0){
                List<FileListVO> visibleUriList = privateFileService.saveMessageFiles(commonMessageRequest, messageId, files, request);
                commonMessageVO.setVisibleFileList(visibleUriList);
            }
//            List<FileListVO> visibleUriList = privateFileService.saveMessageFiles(commonMessageRequest, messageId, files, request);
//            commonMessageVO.setVisibleUriList(visibleUriList);
            simpMessagingTemplate.convertAndSendToUser(String.valueOf(receiverId), "/message", commonMessageVO);
            return ResultUtils.success(commonMessageVO);
        }else if (msgType == 1){
            long messageId = channelMessageService.saveMessage(commonMessageRequest);
            commonMessageVO.setId(messageId);
            Date createTime = channelMessageService.getById(messageId).getCreateTime();
            commonMessageVO.setCreateTime(createTime);
            if (files != null && files.length != 0){
                List<FileListVO> visibleUriList = channelFileService.saveMessageFiles(commonMessageRequest, messageId, files, request);
                commonMessageVO.setVisibleFileList(visibleUriList);
            }
            simpMessagingTemplate.convertAndSend("/topic/channel/" + receiverId, commonMessageVO);
            return ResultUtils.success(commonMessageVO);
        }else{
            throw new BusinessException(ErrorCode.PARAMS_ERROR, "message type is wrong");
        }
    }

    @PostMapping("/read")
    public BaseResponse<String> markChatAsRead(@RequestBody ReadMessageRequest readMessageRequest) {
        if (readMessageRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }

        int msgType = readMessageRequest.getMsgType();
        long readChatId = readMessageRequest.getReadChatId();
        long userId = readMessageRequest.getUserId();
        SimpleDateFormat dateFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        Date date = new Date();
        String dateString = dateFormat.format(date);
        Map<String, String> map = new HashMap<>();
        if(msgType == 0){
            map.put("u" + readChatId,dateString);
            redisService.setHash("user" + userId, map);
        } else{
            map.put("c" + readChatId,dateString);
            redisService.setHash("user" + userId, map);
        }
        return ResultUtils.success(dateString);
    }

    @PostMapping("/search")
    public BaseResponse<List<SearchMessageVO>> searchChatHistory(@RequestBody ChannelSearchRequest channelSearchRequest) {
        if (channelSearchRequest == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }

        long chatId = channelSearchRequest.getChatId();
        long userId = channelSearchRequest.getCurrentUserId();
        int chatType = channelSearchRequest.getChatType();
        long workspaceId = channelSearchRequest.getWorkspaceId();
        String searchWork = channelSearchRequest.getSearchWord();

        long current = channelSearchRequest.getCurrent();
        long pageSize = channelSearchRequest.getPageSize();

        if (StringUtils.isAnyBlank( String.valueOf(chatId), String.valueOf(userId), String.valueOf(chatType), String.valueOf(workspaceId), searchWork)) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        List<SearchMessageVO> searchMessageVOList;
        if(chatType == 1){
            searchMessageVOList = channelMessageService.searchChannel(chatId,workspaceId,searchWork, current, pageSize);
        }
        else{
            searchMessageVOList = privateMessageService.searchChat(userId,chatId,workspaceId,searchWork, current, pageSize);
        }
        return ResultUtils.success(searchMessageVOList);
    }

    /**
     * Get current user and receiver's all private chat history
     * @param privateHistoryRequest privateHistoryRequest
     * @param request request
     * @return
     */
    @PostMapping("/history/private")
    public BaseResponse<Page<CommonMessageVO>> getHistoryByPrivate(@RequestBody PrivateHistoryRequest privateHistoryRequest, HttpServletRequest request){
        if (privateHistoryRequest == null){
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        long senderId = privateHistoryRequest.getSenderId();
        long receiverId = privateHistoryRequest.getReceiverId();
        long workspaceId = privateHistoryRequest.getWorkspaceId();
        if(senderId <= 0 || receiverId <= 0 || workspaceId <= 0){
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }

        Page<CommonMessageVO> commonMessageVOPage = privateMessageService.getHistoryByPrivate(privateHistoryRequest, request);
        return ResultUtils.success(commonMessageVOPage);
    }


    @PostMapping("/history/channel")
    public BaseResponse<Page<CommonMessageVO>> getHistoryByChannel(@RequestBody ChannelHistoryRequest channelHistory) {
        if (channelHistory == null) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        long channelId = channelHistory.getChannelId();
        long workspaceId = channelHistory.getWorkspaceId();
        if (StringUtils.isAnyBlank( String.valueOf(channelId), String.valueOf(workspaceId))) {
            throw new BusinessException(ErrorCode.PARAMS_ERROR);
        }
        Page<CommonMessageVO> channelHistoryPage = channelMessageService.getChannelHistory(channelHistory);
        return ResultUtils.success(channelHistoryPage);
    }


}
