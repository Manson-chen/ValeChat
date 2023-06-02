package com.vale.valechat.model.dto.message;

import lombok.Data;

import java.util.Date;

@Data
public class ReadMessageRequest {

    private Long userId;

    private Long readChatId;

    private Integer msgType;

    private static final long serialVersionUID = 1L;
}
